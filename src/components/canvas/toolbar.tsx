'use client';

import React, { useCallback, useState, useRef } from 'react';
import {
  MousePointer2,
  Hand,
  StickyNote,
  Square,
  Circle,
  Minus,
  Type,
  ArrowRight,
  Image as ImageIcon,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize,
  Sparkles,
  Loader2,
  LayoutGrid,
  AlignHorizontalSpaceAround,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { t, type Locale } from '@/lib/i18n';
import { useAuthStore } from '@/store/auth-store';
import { useCanvasStore } from '@/store/canvas-store';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { STICKY_COLORS, type StickyColor, type CanvasTool, type ElementType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface ToolItem {
  id: CanvasTool;
  icon: React.ReactNode;
  labelKey: string;
  shortcut: string;
}
const TOOLS: ToolItem[] = [
  { id: 'SELECT', icon: <MousePointer2 className="h-4 w-4" />, labelKey: 'toolbar.select', shortcut: 'V' },
  { id: 'HAND', icon: <Hand className="h-4 w-4" />, labelKey: 'toolbar.handPan', shortcut: 'H' },
];
const SHAPE_TOOLS: ToolItem[] = [
  { id: 'STICKY_NOTE', icon: <StickyNote className="h-4 w-4" />, labelKey: 'toolbar.stickyNote', shortcut: 'S' },
  { id: 'RECTANGLE', icon: <Square className="h-4 w-4" />, labelKey: 'toolbar.rectangle', shortcut: 'R' },
  { id: 'CIRCLE', icon: <Circle className="h-4 w-4" />, labelKey: 'toolbar.ellipse', shortcut: 'C' },
  { id: 'LINE', icon: <Minus className="h-4 w-4" />, labelKey: 'toolbar.line', shortcut: 'L' },
  { id: 'TEXT', icon: <Type className="h-4 w-4" />, labelKey: 'toolbar.text', shortcut: 'T' },
  { id: 'CONNECTOR', icon: <ArrowRight className="h-4 w-4" />, labelKey: 'toolbar.connector', shortcut: '' },
  { id: 'IMAGE', icon: <ImageIcon className="h-4 w-4" />, labelKey: 'toolbar.image', shortcut: 'I' },
];

const STICKY_COLOR_OPTIONS: { color: StickyColor; bg: string; label: string }[] = [
  { color: 'yellow', bg: '#fef08a', label: 'Yellow' },
  { color: 'green', bg: '#bbf7d0', label: 'Green' },
  { color: 'blue', bg: '#bfdbfe', label: 'Blue' },
  { color: 'pink', bg: '#fecdd3', label: 'Pink' },
  { color: 'purple', bg: '#e9d5ff', label: 'Purple' },
  { color: 'orange', bg: '#fed7aa', label: 'Orange' },
];

export default function Toolbar() {
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  const store = useCanvasStore();
  const { toast } = useToast();
  const [stickyOpen, setStickyOpen] = useState(false);
  const [connectorOpen, setConnectorOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const popoverRefs = useRef<Map<string, HTMLButtonElement | null>>(new Map());

  const {
    activeTool,
    zoom,
    stickyColor,
    connectorStyle,
    history,
    historyIndex,
    selectedIds,
    elements,
  } = store;

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  const hasSelection = selectedIds.length > 0;

  const setRef = useCallback((id: string) => (el: HTMLButtonElement | null) => {
    popoverRefs.current.set(id, el);
  }, []);

  const handleToolClick = useCallback(
    (tool: CanvasTool) => {
      setStickyOpen(false);
      setConnectorOpen(false);
      store.setTool(tool);
    },
    [store],
  );

  const handleStickyColorSelect = useCallback(
    (color: StickyColor) => {
      store.setStickyColor(color);
      store.setTool('STICKY_NOTE');
      setStickyOpen(false);
    },
    [store],
  );

  const handleConnectorStyleSelect = useCallback(
    (style: 'straight' | 'curve') => {
      store.setConnectorStyle(style);
      setConnectorOpen(false);
    },
    [store],
  );

  const handleGenerateLayout = useCallback(async () => {
    setAiLoading('generate');
    setAiOpen(false);
    try {
      const res = await fetch('/api/ai/generate-layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boardName: 'Board' }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        toast({ title: t('toolbar.aiError', locale), description: data.error || t('toolbar.failedToGenerateLayout', locale), variant: 'destructive' });
        return;
      }
      const generatedElements = data.elements as Array<{
        type: string;
        x: number;
        y: number;
        width?: number;
        height?: number;
        content: string;
        color: string;
      }>;
      // Add each generated element to the canvas
      for (const el of generatedElements) {
        const validTypes: ElementType[] = ['STICKY_NOTE', 'RECTANGLE', 'CIRCLE', 'LINE', 'TEXT', 'CONNECTOR'];
        const elType = validTypes.includes(el.type as ElementType) ? (el.type as ElementType) : 'TEXT';
        store.addElement(elType, el.x, el.y, {
          content: el.content,
          color: el.color,
          width: el.width,
          height: el.height,
        });
      }
      toast({ title: t('toolbar.layoutGenerated', locale), description: t('toolbar.addedElements', locale, { n: generatedElements.length }) });
    } catch {
      toast({ title: t('toolbar.error', locale), description: t('toolbar.failedToConnectAI', locale), variant: 'destructive' });
    } finally {
      setAiLoading(null);
    }
  }, [store, toast]);

  const handleAutoArrange = useCallback(() => {
    setAiOpen(false);
    if (elements.length === 0) {
      toast({ title: t('toolbar.nothingToArrange', locale), description: t('toolbar.addSomeElements', locale) });
      return;
    }
    // Grid-based auto-arrange
    const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
    const cols = Math.ceil(Math.sqrt(sorted.length));
    const cellW = 260;
    const cellH = 220;
    const startX = 100;
    const startY = 100;
    const updates = sorted.map((el, i) => ({
      id: el.id,
      x: startX + (i % cols) * cellW,
      y: startY + Math.floor(i / cols) * cellH,
    }));
    for (const u of updates) {
      store.moveElement(u.id, u.x, u.y);
    }
    store.pushHistory();
    toast({ title: t('toolbar.autoArranged', locale), description: t('toolbar.arrangedElements', locale, { n: sorted.length }) });
  }, [elements, store, toast]);

  const handleSummarizeBoard = useCallback(async () => {
    setAiLoading('summarize');
    setAiOpen(false);
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ elements, boardName: 'Board' }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        toast({ title: t('toolbar.aiError', locale), description: data.error || t('toolbar.failedToSummarize', locale), variant: 'destructive' });
        return;
      }
      toast({ title: t('toolbar.boardSummary', locale), description: data.summary });
    } catch {
      toast({ title: t('toolbar.error', locale), description: t('toolbar.failedToConnectAI', locale), variant: 'destructive' });
    } finally {
      setAiLoading(null);
    }
  }, [elements, toast]);

  return (
    <div className="relative z-50 flex h-full w-12 sm:w-14 flex-col items-center border-r bg-card/95 py-2 sm:py-3 shadow-sm backdrop-blur-sm">
      {/* Basic Tools */}
      <div className="flex flex-col items-center gap-1">
        {TOOLS.map((tool) => (
          <Tooltip key={tool.id}>
            <TooltipTrigger asChild>
              <button
                ref={setRef(tool.id)}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  activeTool === tool.id && 'bg-accent text-accent-foreground shadow-sm',
                )}
                onClick={() => handleToolClick(tool.id)}
              >
                {tool.icon}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              <span className="font-medium">{t(tool.labelKey, locale)}</span>
              {tool.shortcut && (
                <kbd className="ml-2 rounded border bg-muted px-1 py-0.5 text-[10px] font-mono">
                  {tool.shortcut}
                </kbd>
              )}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      <Separator orientation="horizontal" className="my-2 w-8" />

      {/* Shape Tools */}
      <div className="flex flex-col items-center gap-1">
        {SHAPE_TOOLS.map((tool) => {
          if (tool.id === 'STICKY_NOTE') {
            return (
              <Popover key={tool.id} open={stickyOpen} onOpenChange={setStickyOpen}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <button
                        ref={setRef(tool.id)}
                        className={cn(
                          'relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
                          'hover:bg-accent hover:text-accent-foreground',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          activeTool === tool.id &&
                            'bg-accent text-accent-foreground shadow-sm',
                        )}
                        onClick={() => {
                          if (activeTool === 'STICKY_NOTE') {
                            setStickyOpen(!stickyOpen);
                          } else {
                            store.setTool('STICKY_NOTE');
                          }
                        }}
                      >
                        <div
                          className="absolute bottom-1 left-1 h-2 w-2 rounded-sm"
                          style={{ backgroundColor: STICKY_COLORS[stickyColor] }}
                        />
                        {tool.icon}
                      </button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={8}>
                    <span className="font-medium">{t(tool.labelKey, locale)}</span>
                    <kbd className="ml-2 rounded border bg-muted px-1 py-0.5 text-[10px] font-mono">
                      {tool.shortcut}
                    </kbd>
                  </TooltipContent>
                </Tooltip>
                <PopoverContent side="right" sideOffset={8} className="w-auto p-2" align="start">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">{t('toolbar.noteColor', locale)}</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {STICKY_COLOR_OPTIONS.map((opt) => (
                      <button
                        key={opt.color}
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-md transition-all hover:scale-110',
                          stickyColor === opt.color && 'ring-2 ring-primary ring-offset-2',
                        )}
                        style={{ backgroundColor: opt.bg }}
                        onClick={() => handleStickyColorSelect(opt.color)}
                        title={opt.label}
                      />
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            );
          }

          if (tool.id === 'CONNECTOR') {
            return (
              <Popover key={tool.id} open={connectorOpen} onOpenChange={setConnectorOpen}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <button
                        ref={setRef(tool.id)}
                        className={cn(
                          'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
                          'hover:bg-accent hover:text-accent-foreground',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          activeTool === tool.id &&
                            'bg-accent text-accent-foreground shadow-sm',
                        )}
                        onClick={() => {
                          if (activeTool === 'CONNECTOR') {
                            setConnectorOpen(!connectorOpen);
                          } else {
                            store.setTool('CONNECTOR');
                          }
                        }}
                      >
                        {tool.icon}
                      </button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={8}>
                    <span className="font-medium">{t(tool.labelKey, locale)}</span>
                  </TooltipContent>
                </Tooltip>
                <PopoverContent side="right" sideOffset={8} className="w-auto p-2" align="start">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">{t('toolbar.connectorStyle', locale)}</p>
                  <div className="flex flex-col gap-1">
                    <button
                      className={cn(
                        'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent',
                        connectorStyle === 'curve' && 'bg-accent',
                      )}
                      onClick={() => handleConnectorStyleSelect('curve')}
                    >
                      <svg width="40" height="16" viewBox="0 0 40 16">
                        <path
                          d="M 2 14 C 12 14, 28 2, 38 2"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <polygon points="38,2 32,0 34,6" fill="currentColor" />
                      </svg>
                      Curve
                    </button>
                    <button
                      className={cn(
                        'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent',
                        connectorStyle === 'straight' && 'bg-accent',
                      )}
                      onClick={() => handleConnectorStyleSelect('straight')}
                    >
                      <svg width="40" height="16" viewBox="0 0 40 16">
                        <line x1="2" y1="14" x2="38" y2="2" stroke="currentColor" strokeWidth="2" />
                        <polygon points="38,2 32,0 34,6" fill="currentColor" />
                      </svg>
                      Straight
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            );
          }

          return (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <button
                  ref={setRef(tool.id)}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    activeTool === tool.id &&
                      'bg-accent text-accent-foreground shadow-sm',
                  )}
                  onClick={() => handleToolClick(tool.id)}
                >
                  {tool.icon}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                <span className="font-medium">{t(tool.labelKey, locale)}</span>
                {tool.shortcut && (
                  <kbd className="ml-2 rounded border bg-muted px-1 py-0.5 text-[10px] font-mono">
                    {tool.shortcut}
                  </kbd>
                )}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      <Separator orientation="horizontal" className="my-2 w-8" />

      {/* Undo / Redo */}
      <div className="flex flex-col items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                !canUndo && 'opacity-30 pointer-events-none',
              )}
              onClick={() => store.undo()}
              disabled={!canUndo}
            >
              <Undo2 className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            <span className="font-medium">{t('toolbar.undo', locale)}</span>
            <kbd className="ml-2 rounded border bg-muted px-1 py-0.5 text-[10px] font-mono">
              Ctrl+Z
            </kbd>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                !canRedo && 'opacity-30 pointer-events-none',
              )}
              onClick={() => store.redo()}
              disabled={!canRedo}
            >
              <Redo2 className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            <span className="font-medium">{t('toolbar.redo', locale)}</span>
            <kbd className="ml-2 rounded border bg-muted px-1 py-0.5 text-[10px] font-mono">
              Ctrl+Y
            </kbd>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* AI Assist Button */}
      <div className="flex flex-col items-center gap-1 mb-1 sm:mb-2">
        <Popover open={aiOpen} onOpenChange={setAiOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    'relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    aiLoading && 'opacity-70 pointer-events-none',
                  )}
                  disabled={!!aiLoading}
                >
                  {aiLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                </button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              <span className="font-medium">AI Assist</span>
            </TooltipContent>
          </Tooltip>
          <PopoverContent side="right" sideOffset={8} className="w-52 p-1" align="start">
            <p className="mb-1.5 px-2 text-xs font-medium text-muted-foreground">AI Assist</p>
            <button
              className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors hover:bg-accent text-left"
              onClick={handleGenerateLayout}
              disabled={!!aiLoading}
            >
              <LayoutGrid className="h-4 w-4 shrink-0 text-amber-500" />
              <span>{t('toolbar.generateLayout', locale)}</span>
            </button>
            <button
              className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors hover:bg-accent text-left"
              onClick={handleAutoArrange}
              disabled={!!aiLoading}
            >
              <AlignHorizontalSpaceAround className="h-4 w-4 shrink-0 text-emerald-500" />
              <span>{t('toolbar.autoArrange', locale)}</span>
            </button>
            <button
              className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors hover:bg-accent text-left"
              onClick={handleSummarizeBoard}
              disabled={!!aiLoading || elements.length === 0}
            >
              <FileText className="h-4 w-4 shrink-0 text-sky-500" />
              <span className={cn(elements.length === 0 && 'opacity-40')}>{t('toolbar.summarizeBoard', locale)}</span>
            </button>
          </PopoverContent>
        </Popover>
      </div>

      {/* Bottom: Zoom Controls */}
      <div className="flex flex-col items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground"
              onClick={() => store.zoomIn()}
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            <span className="font-medium">{t('toolbar.zoomIn', locale)}</span>
            <kbd className="ml-2 rounded border bg-muted px-1 py-0.5 text-[10px] font-mono">
              Ctrl+Scroll
            </kbd>
          </TooltipContent>
        </Tooltip>

        {/* Zoom level display */}
        <button
          className="flex h-8 w-12 items-center justify-center rounded-md border bg-background text-[11px] font-mono text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          onClick={() => store.zoomToFit()}
          title={t('toolbar.clickToZoom', locale)}
        >
          {Math.round(zoom * 100)}%
        </button>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground"
              onClick={() => store.zoomOut()}
            >
              <ZoomOut className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            <span className="font-medium">{t('toolbar.zoomOut', locale)}</span>
            <kbd className="ml-2 rounded border bg-muted px-1 py-0.5 text-[10px] font-mono">
              Ctrl+Scroll
            </kbd>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground"
              onClick={() => store.zoomToFit()}
            >
              <Maximize className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            <span className="font-medium">{t('toolbar.zoomToFit', locale)}</span>
          </TooltipContent>
        </Tooltip>

        {/* Minimap toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                store.showMinimap && 'bg-accent text-accent-foreground',
              )}
              onClick={() => store.toggleMinimap()}
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="1" y="1" width="14" height="14" rx="2" />
                <rect x="3" y="3" width="5" height="4" rx="0.5" fill="currentColor" opacity="0.3" />
                <rect x="9" y="8" width="4" height="5" rx="0.5" fill="currentColor" opacity="0.3" />
                <rect x="3" y="9" width="4" height="4" rx="0.5" fill="currentColor" opacity="0.3" />
              </svg>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            <span className="font-medium">{t('toolbar.minimap', locale)}</span>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}