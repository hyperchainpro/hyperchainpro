'use client';

import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  Layout,
  Square,
  Circle,
  Type,
  Minus,
  ArrowRight,
  ImageIcon,
  StickyNote,
  Star,
  Pentagon,
  PenTool,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ChevronRight,
  GripVertical,
  Trash2,
  Copy,
  X,
  Search,
  Layers,
} from 'lucide-react';
import { useCanvasStore } from '@/store/canvas-store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { t, type Locale } from '@/lib/i18n';
import { useAuthStore } from '@/store/auth-store';
import type { BoardElement, ElementType } from '@/lib/types';

// ─── Neumorphism helpers ───────────────────────────────────────────────────

const neuLayerSelected =
  'shadow-[inset_3px_3px_6px_rgba(0,0,0,0.07),inset_-3px_-3px_6px_rgba(255,255,255,0.7)] dark:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.3),inset_-3px_-3px_6px_rgba(30,30,30,0.05)] bg-background/80';

const neuLayerParent =
  'bg-foreground/[0.015]';

const neuSearch =
  'shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,0.6)] dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.25),inset_-2px_-2px_4px_rgba(30,30,30,0.04)] border-transparent';

// ─── Type → Icon mapping ─────────────────────────────────────────────────────

const TYPE_ICON_MAP: Record<ElementType, React.ElementType> = {
  FRAME: Layout,
  RECTANGLE: Square,
  CIRCLE: Circle,
  ELLIPSE: Circle,
  TEXT: Type,
  LINE: Minus,
  CONNECTOR: ArrowRight,
  IMAGE: ImageIcon,
  STICKY_NOTE: StickyNote,
  STAR: Star,
  POLYGON: Pentagon,
  PEN_PATH: PenTool,
};

// ─── Default name generation ─────────────────────────────────────────────────

const TYPE_NAMES: Record<ElementType, string> = {
  FRAME: 'Frame',
  RECTANGLE: 'Rectangle',
  CIRCLE: 'Circle',
  ELLIPSE: 'Ellipse',
  TEXT: 'Text',
  LINE: 'Line',
  CONNECTOR: 'Connector',
  IMAGE: 'Image',
  STICKY_NOTE: 'Sticky Note',
  STAR: 'Star',
  POLYGON: 'Polygon',
  PEN_PATH: 'Path',
};

function getDefaultName(type: ElementType, index: number): string {
  return `${TYPE_NAMES[type] || 'Element'} ${index + 1}`;
}

// ─── Layer tree helpers ──────────────────────────────────────────────────────

interface FlatLayerItem {
  element: BoardElement;
  depth: number;
  isFrame: boolean;
  childCount: number;
  /** Index of this type seen so far (for default name generation) */
  typeIndex: number;
}

function buildFlatLayerList(elements: BoardElement[]): FlatLayerItem[] {
  // Sort by zIndex descending (highest first, like Figma)
  const sorted = [...elements].sort((a, b) => b.zIndex - a.zIndex);

  // Build a map of parentId → children for frame nesting
  const childrenMap = new Map<string, BoardElement[]>();
  const frameIds = new Set<string>();
  for (const el of sorted) {
    if (el.type === 'FRAME') {
      frameIds.add(el.id);
    }
    if (el.parentId && frameIds.has(el.parentId)) {
      const existing = childrenMap.get(el.parentId) || [];
      existing.push(el);
      childrenMap.set(el.parentId, existing);
    }
  }

  // Sort children within each frame by zIndex descending too
  for (const [, children] of childrenMap) {
    children.sort((a, b) => b.zIndex - a.zIndex);
  }

  // Track type counters for name generation
  const typeCounters: Record<string, number> = {};
  const result: FlatLayerItem[] = [];

  for (const el of sorted) {
    // Skip children that are nested inside frames — they'll be added when we process the frame
    if (el.parentId && frameIds.has(el.parentId)) continue;

    typeCounters[el.type] = (typeCounters[el.type] || 0) + 1;

    const isFrame = el.type === 'FRAME';
    const children = childrenMap.get(el.id) || [];

    result.push({
      element: el,
      depth: 0,
      isFrame,
      childCount: children.length,
      typeIndex: typeCounters[el.type] - 1,
    });

    // Add frame children indented
    for (const child of children) {
      typeCounters[child.type] = (typeCounters[child.type] || 0) + 1;
      result.push({
        element: child,
        depth: 1,
        isFrame: child.type === 'FRAME',
        childCount: 0,
        typeIndex: typeCounters[child.type] - 1,
      });
    }
  }

  return result;
}

// ─── Inline rename input ─────────────────────────────────────────────────────

function RenameInput({
  initialName,
  onCommit,
  onCancel,
}: {
  initialName: string;
  onCommit: (name: string) => void;
  onCancel: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(initialName);

  React.useEffect(() => {
    // Focus and select all text on mount
    const el = inputRef.current;
    if (el) {
      el.focus();
      el.select();
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onCommit(value.trim() || initialName);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    },
    [value, initialName, onCommit, onCancel],
  );

  const handleBlur = useCallback(() => {
    onCommit(value.trim() || initialName);
  }, [value, initialName, onCommit]);

  return (
    <Input
      ref={inputRef}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      className="h-6 w-full px-1.5 py-0 text-xs leading-tight rounded-md border-primary/40 bg-background"
      onClick={(e) => e.stopPropagation()}
    />
  );
}

// ─── Action button (hover-revealed) ──────────────────────────────────────────

function LayerActionBtn({
  icon: Icon,
  tooltip,
  onClick,
  danger,
}: {
  icon: React.ElementType;
  tooltip: string;
  onClick: (e: React.MouseEvent) => void;
  danger?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          className={cn(
            'shrink-0 size-6 flex items-center justify-center rounded-md',
            'transition-all duration-200 ease-out',
            'hover:bg-accent',
            danger
              ? 'text-muted-foreground hover:text-destructive'
              : 'text-muted-foreground hover:text-foreground',
          )}
          onClick={onClick}
        >
          <Icon className="size-3" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

// ─── Single layer row ────────────────────────────────────────────────────────

function LayerRow({
  item,
  isExpanded,
  onToggleExpand,
  isRenaming,
  onStartRename,
  onRenameCommit,
  onRenameCancel,
}: {
  item: FlatLayerItem;
  isExpanded: boolean;
  onToggleExpand: () => void;
  isRenaming: boolean;
  onStartRename: () => void;
  onRenameCommit: (name: string) => void;
  onRenameCancel: () => void;
}) {
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  const { element, depth, isFrame, childCount, typeIndex } = item;
  const selectedIds = useCanvasStore((s) => s.selectedIds);
  const selectElement = useCanvasStore((s) => s.selectElement);
  const updateElement = useCanvasStore((s) => s.updateElement);
  const toggleLock = useCanvasStore((s) => s.toggleLock);

  const isSelected = selectedIds.includes(element.id);
  const Icon = TYPE_ICON_MAP[element.type] || Square;
  const displayName =
    element.name || getDefaultName(element.type, typeIndex);
  const isHidden = element.visible === false;
  const isLocked = element.locked;

  // ── Click / shift-click ────────────────────────────────────────
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (isRenaming) return;
      e.stopPropagation();
      selectElement(element.id, e.shiftKey);
    },
    [element.id, isRenaming, selectElement],
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      onStartRename();
    },
    [onStartRename],
  );

  // ── Visibility toggle ──────────────────────────────────────────
  const handleToggleVisibility = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      updateElement(element.id, { visible: !isHidden });
    },
    [element.id, isHidden, updateElement],
  );

  // ── Lock toggle ────────────────────────────────────────────────
  const handleToggleLock = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      toggleLock(element.id);
    },
    [element.id, toggleLock],
  );

  // ── Delete ─────────────────────────────────────────────────────
  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      useCanvasStore.getState().deleteElements([element.id]);
    },
    [element.id],
  );

  // ── Duplicate ──────────────────────────────────────────────────
  const handleDuplicate = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      const state = useCanvasStore.getState();
      const el = state.elements.find((x) => x.id === element.id);
      if (!el) return;
      // Destructure to remove id so createDefaultElement generates a new one
      const { id: _oldId, zIndex: _oldZ, ...rest } = el;
      // Add a new element with the same properties offset by 20px
      state.addElement(el.type, el.x + 20, el.y + 20, {
        ...rest,
        name: `${el.name || getDefaultName(el.type, 0)} copy`,
      });
    },
    [element.id],
  );

  // ── Drag reorder (simple pointer events) ───────────────────────
  const dragRef = useRef<{ startY: number; itemId: string } | null>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Only start drag from the grip icon
      if (!(e.target as HTMLElement).closest('[data-grip]')) return;
      e.stopPropagation();
      dragRef.current = { startY: e.clientY, itemId: element.id };

      const handlePointerMove = (me: PointerEvent) => {
        if (!dragRef.current) return;
        const dy = me.clientY - dragRef.current.startY;
        if (Math.abs(dy) < 4) return;

        // Find the layer row elements and compute drop target
        const rows = document.querySelectorAll('[data-layer-id]');
        rows.forEach((row) => {
          const rect = row.getBoundingClientRect();
          if (me.clientY >= rect.top && me.clientY <= rect.bottom) {
            // Visual indicator could be added here
          }
        });
      };

      const handlePointerUp = (me: PointerEvent) => {
        if (!dragRef.current) return;
        const dy = me.clientY - dragRef.current.startY;
        if (Math.abs(dy) >= 4) {
          // Find drop target row
          const rows = document.querySelectorAll('[data-layer-id]');
          let targetId: string | null = null;
          rows.forEach((row) => {
            const rect = row.getBoundingClientRect();
            if (me.clientY >= rect.top && me.clientY <= rect.bottom) {
              targetId = row.getAttribute('data-layer-id');
            }
          });

          if (targetId && targetId !== dragRef.current.itemId) {
            // Reorder by swapping zIndex values
            const currentElements = useCanvasStore.getState().elements;
            const dragEl = currentElements.find(
              (el) => el.id === dragRef.current!.itemId,
            );
            const targetEl = currentElements.find(
              (el) => el.id === targetId,
            );
            if (dragEl && targetEl) {
              const tmpZ = dragEl.zIndex;
              useCanvasStore.getState().setElementZIndex(
                dragEl.id,
                targetEl.zIndex,
              );
              useCanvasStore.getState().setElementZIndex(
                targetEl.id,
                tmpZ,
              );
            }
          }
        }
        dragRef.current = null;
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    },
    [element.id],
  );

  return (
    <div
      data-layer-id={element.id}
      className={cn(
        // Base layout
        'group/layer flex items-center min-h-9 gap-1.5 px-2 cursor-pointer text-xs select-none',
        // Transitions
        'transition-all duration-200 ease-out',
        // Hover state
        'hover:bg-foreground/[0.04]',
        // Selected state — neumorphic pressed
        isSelected && cn(neuLayerSelected, 'text-foreground'),
        // Hidden layer opacity
        isHidden && 'opacity-40',
        // Parent frame background shade
        isFrame && depth === 0 && !isSelected && neuLayerParent,
        // Rounded corners
        'rounded-md mx-1',
      )}
      style={{ paddingLeft: `${depth * 16 + 8}px` }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onPointerDown={handlePointerDown}
    >
      {/* Expand/collapse chevron for frames — smooth rotation */}
      {isFrame && childCount > 0 ? (
        <button
          className="shrink-0 size-5 flex items-center justify-center rounded-md hover:bg-accent transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand();
          }}
        >
          <ChevronRight
            className={cn(
              'size-3 text-muted-foreground transition-transform duration-200 ease-out',
              isExpanded && 'rotate-90',
            )}
          />
        </button>
      ) : (
        <span className="w-5 shrink-0" />
      )}

      {/* Drag grip */}
      <span
        data-grip
        className="shrink-0 size-5 flex items-center justify-center rounded-md cursor-grab opacity-0 group-hover/layer:opacity-50 hover:!opacity-100 transition-opacity duration-200"
      >
        <GripVertical className="size-3 text-muted-foreground" />
      </span>

      {/* Type icon */}
      <Icon
        className={cn(
          'size-3.5 shrink-0 text-muted-foreground',
          element.type === 'ELLIPSE' && 'scale-x-125',
        )}
      />

      {/* Name / rename input */}
      <span className="flex-1 truncate min-w-0">
        {isRenaming ? (
          <RenameInput
            initialName={displayName}
            onCommit={onRenameCommit}
            onCancel={onRenameCancel}
          />
        ) : (
          <span
            className={cn(
              'truncate block transition-colors duration-150',
              isSelected ? 'text-foreground font-medium' : 'text-foreground/80',
            )}
          >
            {displayName}
          </span>
        )}
      </span>

      {/* Hover-revealed action buttons (delete, duplicate) */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover/layer:opacity-100 transition-opacity duration-200">
        <LayerActionBtn
          icon={Copy}
          tooltip={t('layers.duplicate', locale)}
          onClick={handleDuplicate}
        />
        <LayerActionBtn
          icon={Trash2}
          tooltip={t('layers.delete', locale)}
          onClick={handleDelete}
          danger
        />
      </div>

      {/* Visibility toggle — smooth opacity transition */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={cn(
              'shrink-0 size-5 flex items-center justify-center rounded-md',
              'transition-all duration-200 ease-out',
              'hover:bg-accent',
              isHidden
                ? 'text-muted-foreground/60 opacity-100'
                : 'text-muted-foreground opacity-0 group-hover/layer:opacity-100',
            )}
            onClick={handleToggleVisibility}
          >
            {isHidden ? (
              <EyeOff className="size-3" />
            ) : (
              <Eye className="size-3" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {isHidden ? t('layers.show', locale) : t('layers.hide', locale)}
        </TooltipContent>
      </Tooltip>

      {/* Lock toggle — clear visual state */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={cn(
              'shrink-0 size-5 flex items-center justify-center rounded-md',
              'transition-all duration-200 ease-out',
              'hover:bg-accent',
              isLocked
                ? 'text-amber-500 opacity-100'
                : 'text-muted-foreground opacity-0 group-hover/layer:opacity-100',
            )}
            onClick={handleToggleLock}
          >
            {isLocked ? (
              <Lock className="size-3" />
            ) : (
              <Unlock className="size-3" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {isLocked ? t('layers.unlock', locale) : t('layers.lock', locale)}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

// ─── Search input ────────────────────────────────────────────────────────────

function LayerSearchInput({
  value,
  onChange,
  locale,
}: {
  value: string;
  onChange: (val: string) => void;
  locale: Locale;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative px-2 pt-1.5 pb-1">
      <Search className="absolute left-[18px] top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/60 pointer-events-none" />
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('layers.searchLayers', locale)}
        className={cn(
          'h-8 w-full pl-8 pr-7 text-xs rounded-lg bg-background',
          neuSearch,
        )}
      />
      {value.length > 0 && (
        <button
          className="absolute right-[18px] top-1/2 -translate-y-1/2 size-4 flex items-center justify-center rounded-sm text-muted-foreground/60 hover:text-muted-foreground transition-colors"
          onClick={() => {
            onChange('');
            inputRef.current?.focus();
          }}
        >
          <X className="size-3" />
        </button>
      )}
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function LayersEmptyState({ locale }: { locale: Locale }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-12">
      <div className="size-14 flex items-center justify-center rounded-2xl bg-background mb-4 shadow-[3px_3px_6px_rgba(0,0,0,0.06),-3px_-3px_6px_rgba(255,255,255,0.7)] dark:shadow-[3px_3px_6px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(30,30,30,0.05)]">
        <Layers className="size-7 text-muted-foreground/40" />
      </div>
      <p className="text-xs font-medium text-muted-foreground mb-1">
        {t('layers.noLayers', locale)}
      </p>
      <p className="text-[11px] text-muted-foreground/60 text-center leading-relaxed">
        {t('layers.addElementsHint', locale)}
      </p>
    </div>
  );
}

// ─── Main Layers Panel ───────────────────────────────────────────────────────

export function LayersPanel() {
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  const elements = useCanvasStore((s) => s.elements);
  const [expandedFrames, setExpandedFrames] = useState<Set<string>>(new Set());
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const flatLayers = useMemo(() => buildFlatLayerList(elements), [elements]);

  // Default: expand all frames
  React.useEffect(() => {
    const frameIds = new Set<string>();
    for (const el of elements) {
      if (el.type === 'FRAME') frameIds.add(el.id);
    }
    setExpandedFrames((prev) => {
      // Add any new frames, keep existing collapses
      const next = new Set(prev);
      for (const id of frameIds) {
        if (!next.has(id)) next.add(id);
      }
      return next;
    });
  }, [elements.length]); // Only re-run when element count changes

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedFrames((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleRenameCommit = useCallback(
    (id: string, name: string) => {
      if (name.trim()) {
        useCanvasStore.getState().updateElement(id, { name: name.trim() });
      }
      setRenamingId(null);
    },
    [],
  );

  // Filter layers: if a frame is collapsed, hide its children
  const visibleLayers = useMemo(() => {
    return flatLayers.filter((item) => {
      if (item.depth === 0) return true;
      // depth > 0 means it's a child; show only if parent is expanded
      const parentEl = elements.find(
        (e) => e.id === item.element.parentId,
      );
      if (parentEl && parentEl.type === 'FRAME') {
        return expandedFrames.has(parentEl.id);
      }
      return true;
    });
  }, [flatLayers, expandedFrames, elements]);

  // Apply search filter
  const filteredLayers = useMemo(() => {
    if (!searchQuery.trim()) return visibleLayers;
    const q = searchQuery.toLowerCase().trim();
    return visibleLayers.filter((item) => {
      const name = item.element.name || getDefaultName(item.element.type, item.typeIndex);
      return name.toLowerCase().includes(q);
    });
  }, [visibleLayers, searchQuery]);

  if (elements.length === 0) {
    return <LayersEmptyState locale={locale} />;
  }

  return (
    <div className="flex flex-col h-full">
      <LayerSearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        locale={locale}
      />

      <ScrollArea className="flex-1">
        <div className="py-0.5 pb-2">
          {filteredLayers.length === 0 && searchQuery.trim() ? (
            <div className="flex items-center justify-center py-8 text-xs text-muted-foreground/60">
              {t('layers.noResults', locale)}
            </div>
          ) : (
            filteredLayers.map((item) => (
              <LayerRow
                key={item.element.id}
                item={item}
                isExpanded={
                  item.isFrame ? expandedFrames.has(item.element.id) : false
                }
                onToggleExpand={() => handleToggleExpand(item.element.id)}
                isRenaming={renamingId === item.element.id}
                onStartRename={() => setRenamingId(item.element.id)}
                onRenameCommit={(name) => handleRenameCommit(item.element.id, name)}
                onRenameCancel={() => setRenamingId(null)}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}