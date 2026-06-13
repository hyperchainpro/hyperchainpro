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
  ChevronDown,
  GripVertical,
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
import type { BoardElement, ElementType } from '@/lib/types';

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
      className="h-5 w-full px-1 py-0 text-xs leading-tight rounded border-primary/40"
      onClick={(e) => e.stopPropagation()}
    />
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
  const { element, depth, isFrame, childCount, typeIndex } = item;
  const { selectedIds, selectElement, updateElement, toggleLock } =
    useCanvasStore();

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
        let targetId: string | null = null;
        rows.forEach((row) => {
          const rect = row.getBoundingClientRect();
          if (me.clientY >= rect.top && me.clientY <= rect.bottom) {
            targetId = row.getAttribute('data-layer-id');
          }
        });
        // Visual indicator could be added here
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
        'group/layer flex items-center h-8 gap-1.5 px-2 cursor-pointer text-xs transition-colors select-none',
        'hover:bg-accent/50',
        isSelected && 'bg-accent',
        isHidden && 'opacity-40',
      )}
      style={{ paddingLeft: `${depth * 16 + 8}px` }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onPointerDown={handlePointerDown}
    >
      {/* Expand/collapse chevron for frames */}
      {isFrame && childCount > 0 && (
        <button
          className="shrink-0 p-0.5 rounded hover:bg-accent/80 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand();
          }}
        >
          {isExpanded ? (
            <ChevronDown className="size-3 text-muted-foreground" />
          ) : (
            <ChevronRight className="size-3 text-muted-foreground" />
          )}
        </button>
      )}
      {!isFrame && <span className="w-4 shrink-0" />}

      {/* Drag grip */}
      <span
        data-grip
        className="shrink-0 p-0.5 rounded cursor-grab opacity-0 group-hover/layer:opacity-60 hover:!opacity-100 transition-opacity"
      >
        <GripVertical className="size-3 text-muted-foreground" />
      </span>

      {/* Type icon */}
      <Icon
        className={cn(
          'size-3.5 shrink-0',
          element.type === 'ELLIPSE' && 'scale-x-125',
          'text-muted-foreground',
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
          <span className="truncate block">{displayName}</span>
        )}
      </span>

      {/* Visibility toggle */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={cn(
              'shrink-0 p-0.5 rounded hover:bg-accent/80 transition-colors',
              isHidden && 'text-muted-foreground/60',
              !isHidden && 'opacity-0 group-hover/layer:opacity-100',
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
          {isHidden ? 'Show' : 'Hide'}
        </TooltipContent>
      </Tooltip>

      {/* Lock toggle */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={cn(
              'shrink-0 p-0.5 rounded hover:bg-accent/80 transition-colors',
              isLocked && 'text-amber-500',
              !isLocked && 'opacity-0 group-hover/layer:opacity-100',
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
          {isLocked ? 'Unlock' : 'Lock'}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

// ─── Main Layers Panel ───────────────────────────────────────────────────────

export function LayersPanel() {
  const elements = useCanvasStore((s) => s.elements);
  const [expandedFrames, setExpandedFrames] = useState<Set<string>>(new Set());
  const [renamingId, setRenamingId] = useState<string | null>(null);

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

  if (elements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-xs text-muted-foreground gap-2">
        <Layers className="size-6 opacity-40" />
        <span>No layers yet</span>
        <span className="text-[10px] opacity-60">
          Add elements to the canvas
        </span>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="py-1">
        {visibleLayers.map((item) => (
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
        ))}
      </div>
    </ScrollArea>
  );
}

// Need Layers icon for empty state
function Layers({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
      <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
    </svg>
  );
}