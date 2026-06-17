'use client';

import { useMemo } from 'react';
import { AlignStartHorizontal, AlignCenterHorizontal, AlignEndHorizontal, AlignStartVertical, AlignCenterVertical, AlignEndVertical, MoveHorizontal, MoveVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useCanvasStore } from '@/store/canvas-store';
import { t } from '@/lib/i18n';
import { useAuthStore } from '@/store/auth-store';
import { cn } from '@/lib/utils';

const ALIGN_BUTTONS = [
  { key: 'alignLeft', icon: AlignStartHorizontal, action: 'alignLeft' as const },
  { key: 'alignCenterH', icon: AlignCenterHorizontal, action: 'alignCenterH' as const },
  { key: 'alignRight', icon: AlignEndHorizontal, action: 'alignRight' as const },
  { key: 'alignTop', icon: AlignStartVertical, action: 'alignTop' as const },
  { key: 'alignCenterV', icon: AlignCenterVertical, action: 'alignCenterV' as const },
  { key: 'alignBottom', icon: AlignEndVertical, action: 'alignBottom' as const },
  { key: 'distributeH', icon: MoveHorizontal, action: 'distributeH' as const },
  { key: 'distributeV', icon: MoveVertical, action: 'distributeV' as const },
];

export function AlignmentToolbar() {
  const locale = useAuthStore((s) => s.user?.language) ?? 'en';
  const selectedIds = useCanvasStore((s) => s.selectedIds);
  const elements = useCanvasStore((s) => s.elements);
  const updateElement = useCanvasStore((s) => s.updateElement);

  const selectedElements = useMemo(
    () => elements.filter((e) => selectedIds.includes(e.id)),
    [elements, selectedIds],
  );

  if (selectedElements.length < 2) return null;

  const handleAction = (action: string) => {
    const els = selectedElements;
    if (els.length < 2) return;

    // Calculate bounding box
    const minX = Math.min(...els.map((e) => e.x));
    const maxX = Math.max(...els.map((e) => e.x + (e.width || 0)));
    const minY = Math.min(...els.map((e) => e.y));
    const maxY = Math.max(...els.map((e) => e.y + (e.height || 0)));
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const updates: Record<string, { x?: number; y?: number }> = {};

    switch (action) {
      case 'alignLeft':
        els.forEach((e) => { updates[e.id] = { x: minX }; });
        break;
      case 'alignRight':
        els.forEach((e) => { updates[e.id] = { x: maxX - (e.width || 0) }; });
        break;
      case 'alignCenterH':
        els.forEach((e) => { updates[e.id] = { x: centerX - (e.width || 0) / 2 }; });
        break;
      case 'alignTop':
        els.forEach((e) => { updates[e.id] = { y: minY }; });
        break;
      case 'alignBottom':
        els.forEach((e) => { updates[e.id] = { y: maxY - (e.height || 0) }; });
        break;
      case 'alignCenterV':
        els.forEach((e) => { updates[e.id] = { y: centerY - (e.height || 0) / 2 }; });
        break;
      case 'distributeH': {
        if (els.length < 3) break;
        const sorted = [...els].sort((a, b) => a.x - b.x);
        const totalW = sorted.reduce((s, e) => s + (e.width || 0), 0);
        const gap = (maxX - minX - totalW) / (sorted.length - 1);
        let cx = minX;
        sorted.forEach((e) => { updates[e.id] = { x: cx }; cx += (e.width || 0) + gap; });
        break;
      }
      case 'distributeV': {
        if (els.length < 3) break;
        const sorted = [...els].sort((a, b) => a.y - b.y);
        const totalH = sorted.reduce((s, e) => s + (e.height || 0), 0);
        const gap = (maxY - minY - totalH) / (sorted.length - 1);
        let cy = minY;
        sorted.forEach((e) => { updates[e.id] = { y: cy }; cy += (e.height || 0) + gap; });
        break;
      }
    }

    Object.entries(updates).forEach(([id, data]) => {
      const el = els.find((e) => e.id === id);
      if (el) updateElement(id, { ...el, ...data });
    });
  };

  return (
    <div className="flex items-center gap-0.5 px-1">
      {ALIGN_BUTTONS.map((btn) => {
        const Icon = btn.icon;
        const disabled = (btn.action === 'distributeH' || btn.action === 'distributeV') && selectedElements.length < 3;
        return (
          <Tooltip key={btn.key}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn('size-7 neu-icon-btn', disabled && 'opacity-30 pointer-events-none')}
                onClick={() => handleAction(btn.action)}
                disabled={disabled}
              >
                <Icon className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t(`alignment.${btn.key}`, locale)}</TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}