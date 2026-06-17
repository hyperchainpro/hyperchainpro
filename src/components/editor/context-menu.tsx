'use client';

import { create } from 'zustand';
import { useEffect, useCallback, useRef, type LucideIcon } from 'react';
import {
  Scissors,
  Copy,
  ClipboardPaste,
  CopyPlus,
  Trash2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  ArrowUpToLine,
  ArrowDownToLine,
  Group,
  Ungroup,
  SquareDashedMousePointer,
  Maximize2,
  Frame,
  Grid3X3,
  Ruler,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCanvasStore } from '@/store/canvas-store';
import { t } from '@/lib/i18n';
import { useAuthStore } from '@/store/auth-store';
import type { Locale } from '@/lib/i18n';
import { Separator } from '@/components/ui/separator';

// ─── Context menu state store ─────────────────────────────────────────────────

interface ContextMenuState {
  x: number;
  y: number;
  elementId: string | null;
  visible: boolean;
}

interface ContextMenuActions {
  show: (x: number, y: number, elementId: string | null) => void;
  hide: () => void;
}

const useContextMenuStore = create<ContextMenuState & ContextMenuActions>((set) => ({
  x: 0,
  y: 0,
  elementId: null,
  visible: false,
  show: (x, y, elementId) => set({ x, y, elementId, visible: true }),
  hide: () => set({ visible: false }),
}));

export function showContextMenu(x: number, y: number, elementId: string | null) {
  useContextMenuStore.getState().show(x, y, elementId);
}

// ─── Menu item type ───────────────────────────────────────────────────────────

interface MenuItem {
  key: string;
  icon?: LucideIcon;
  label: string;
  disabled?: boolean;
  separator?: boolean;
  action?: () => void;
}

// ─── Context Menu Overlay ─────────────────────────────────────────────────────

export function ContextMenuOverlay() {
  const { x, y, elementId, visible } = useContextMenuStore();
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  const ref = useRef<HTMLDivElement>(null);
  const hide = useContextMenuStore((s) => s.hide);

  const selectedIds = useCanvasStore((s) => s.selectedIds);
  const elements = useCanvasStore((s) => s.elements);
  const clipboard = useCanvasStore((s) => s.clipboard);
  const snapToGrid = useCanvasStore((s) => s.snapToGrid);
  const copySelected = useCanvasStore((s) => s.copySelected);
  const pasteClipboard = useCanvasStore((s) => s.pasteClipboard);
  const deleteElements = useCanvasStore((s) => s.deleteElements);
  const toggleLock = useCanvasStore((s) => s.toggleLock);
  const bringToFront = useCanvasStore((s) => s.bringToFront);
  const sendToBack = useCanvasStore((s) => s.sendToBack);
  const groupElements = useCanvasStore((s) => s.groupElements);
  const ungroupElements = useCanvasStore((s) => s.ungroupElements);
  const selectAll = useCanvasStore((s) => s.selectAll);
  const zoomToFit = useCanvasStore((s) => s.zoomToFit);
  const setSnapToGrid = useCanvasStore((s) => s.setSnapToGrid);
  const addElement = useCanvasStore((s) => s.addElement);
  const updateElement = useCanvasStore((s) => s.updateElement);

  // Close on click outside or Escape
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      hide();
    }
  }, [hide]);

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') hide();
  }, [hide]);

  useEffect(() => {
    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [visible, handleClickOutside, handleEscape]);

  if (!visible) return null;

  // Cut = copy + delete
  const handleCut = () => {
    if (selectedIds.length > 0) {
      copySelected();
      deleteElements(selectedIds);
    }
  };

  // Duplicate = copy + paste
  const handleDuplicate = () => {
    if (selectedIds.length > 0) {
      copySelected();
      pasteClipboard();
    }
  };

  // Toggle visibility
  const handleToggleVisibility = () => {
    const targetIds = elementId ? [elementId] : selectedIds;
    targetIds.forEach((id) => {
      const el = elements.find((e) => e.id === id);
      if (el) updateElement(id, { visible: !el.visible });
    });
  };

  const isElementContext = !!elementId;
  const firstSelected = elementId
    ? elements.find((e) => e.id === elementId)
    : selectedIds.length > 0
      ? elements.find((e) => e.id === selectedIds[0])
      : null;
  const isLocked = firstSelected?.locked ?? false;
  const isVisible = firstSelected?.visible !== false;
  const hasGroup = firstSelected?.groupId;
  const canGroup = selectedIds.length >= 2 && !hasGroup;

  // Element context items
  const elementItems: MenuItem[] = [
    { key: 'cut', icon: Scissors, label: t('context.cut', locale), action: handleCut, disabled: selectedIds.length === 0 },
    { key: 'copy', icon: Copy, label: t('context.copy', locale), action: copySelected, disabled: selectedIds.length === 0 },
    { key: 'duplicate', icon: CopyPlus, label: t('context.duplicate', locale), action: handleDuplicate, disabled: selectedIds.length === 0 },
    { key: 'delete', icon: Trash2, label: t('context.delete', locale), action: () => deleteElements(), disabled: selectedIds.length === 0 },
    { key: 'sep1', separator: true },
    { key: 'lock', icon: isLocked ? Unlock : Lock, label: isLocked ? t('context.unlock', locale) : t('context.lock', locale), action: () => selectedIds.forEach(toggleLock), disabled: selectedIds.length === 0 },
    { key: 'visibility', icon: isVisible ? EyeOff : Eye, label: isVisible ? t('context.hide', locale) : t('context.show', locale), action: handleToggleVisibility, disabled: selectedIds.length === 0 },
    { key: 'sep2', separator: true },
    { key: 'bringFront', icon: ArrowUpToLine, label: t('context.bringFront', locale), action: () => { if (elementId) bringToFront(elementId); else selectedIds.forEach(bringToFront); }, disabled: selectedIds.length === 0 },
    { key: 'sendBack', icon: ArrowDownToLine, label: t('context.sendBack', locale), action: () => { if (elementId) sendToBack(elementId); else selectedIds.forEach(sendToBack); }, disabled: selectedIds.length === 0 },
    { key: 'sep3', separator: true },
    ...(canGroup
      ? [{ key: 'group' as const, icon: Group, label: t('context.group', locale), action: () => groupElements(selectedIds) }]
      : []),
    ...(hasGroup
      ? [{ key: 'ungroup' as const, icon: Ungroup, label: t('context.ungroup', locale), action: () => ungroupElements(firstSelected!.groupId!) }]
      : []),
  ];

  // Canvas context items
  const canvasItems: MenuItem[] = [
    { key: 'paste', icon: ClipboardPaste, label: t('context.paste', locale), action: pasteClipboard, disabled: clipboard.length === 0 },
    { key: 'sep0', separator: true },
    { key: 'selectAll', icon: SquareDashedMousePointer, label: t('context.selectAll', locale), action: selectAll },
    { key: 'zoomFit', icon: Maximize2, label: t('context.zoomFit', locale), action: zoomToFit },
    { key: 'sep4', separator: true },
    { key: 'addFrame', icon: Frame, label: t('context.addFrame', locale), action: () => addElement('FRAME', 100, 100) },
    { key: 'toggleGrid', icon: Grid3X3, label: t('context.toggleGrid', locale), action: () => setSnapToGrid(!snapToGrid) },
    { key: 'toggleRulers', icon: Ruler, label: t('context.toggleRulers', locale), action: () => {} },
  ];

  const items = isElementContext ? elementItems : canvasItems;

  return (
    <div
      className="fixed inset-0 z-[9999]"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        ref={ref}
        className={cn(
          'absolute neu-card rounded-lg py-1 min-w-[180px] shadow-lg',
          'animate-in fade-in-0 zoom-in-95',
        )}
        style={{
          left: Math.min(x, window.innerWidth - 200),
          top: Math.min(y, window.innerHeight - items.length * 32 - 20),
        }}
      >
        {items.map((item) => {
          if (item.separator) {
            return <Separator key={item.key} className="my-1" />;
          }
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              className={cn(
                'flex w-full items-center gap-2.5 px-3 py-1.5 text-sm transition-colors',
                'hover:bg-muted/80',
                item.disabled && 'opacity-40 pointer-events-none',
              )}
              onClick={() => {
                item.action?.();
                hide();
              }}
              disabled={item.disabled}
            >
              {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}