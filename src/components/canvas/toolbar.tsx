'use client';

import React, { useCallback, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCanvasStore } from '@/store/canvas-store';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { STICKY_COLORS, type StickyColor, type CanvasTool } from '@/lib/types';

interface ToolItem {
  id: CanvasTool;
  icon: React.ReactNode;
  label: string;
  shortcut: string;
}

const TOOLS: ToolItem[] = [
  { id: 'SELECT', icon: <MousePointer2 className="h-4 w-4" />, label: 'Select', shortcut: 'V' },
  { id: 'HAND', icon: <Hand className="h-4 w-4" />, label: 'Hand / Pan', shortcut: 'H' },
];

const SHAPE_TOOLS: ToolItem[] = [
  { id: 'STICKY_NOTE', icon: <StickyNote className="h-4 w-4" />, label: 'Sticky Note', shortcut: 'S' },
  { id: 'RECTANGLE', icon: <Square className="h-4 w-4" />, label: 'Rectangle', shortcut: 'R' },
  { id: 'CIRCLE', icon: <Circle className="h-4 w-4" />, label: 'Circle', shortcut: 'C' },
  { id: 'LINE', icon: <Minus className="h-4 w-4" />, label: 'Line', shortcut: 'L' },
  { id: 'TEXT', icon: <Type className="h-4 w-4" />, label: 'Text', shortcut: 'T' },
  { id: 'CONNECTOR', icon: <ArrowRight className="h-4 w-4" />, label: 'Connector', shortcut: '' },
  { id: 'IMAGE', icon: <ImageIcon className="h-4 w-4" />, label: 'Image', shortcut: 'I' },
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
  const store = useCanvasStore();
  const [stickyOpen, setStickyOpen] = useState(false);
  const [connectorOpen, setConnectorOpen] = useState(false);
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

  return (
    <div className="relative z-50 flex h-full w-14 flex-col items-center border-r bg-card/95 py-3 shadow-sm backdrop-blur-sm">
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
              <span className="font-medium">{tool.label}</span>
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
                    <span className="font-medium">{tool.label}</span>
                    <kbd className="ml-2 rounded border bg-muted px-1 py-0.5 text-[10px] font-mono">
                      {tool.shortcut}
                    </kbd>
                  </TooltipContent>
                </Tooltip>
                <PopoverContent side="right" sideOffset={8} className="w-auto p-2" align="start">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Note Color</p>
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
                    <span className="font-medium">{tool.label}</span>
                  </TooltipContent>
                </Tooltip>
                <PopoverContent side="right" sideOffset={8} className="w-auto p-2" align="start">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Connector Style</p>
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
                <span className="font-medium">{tool.label}</span>
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
            <span className="font-medium">Undo</span>
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
            <span className="font-medium">Redo</span>
            <kbd className="ml-2 rounded border bg-muted px-1 py-0.5 text-[10px] font-mono">
              Ctrl+Y
            </kbd>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

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
            <span className="font-medium">Zoom In</span>
            <kbd className="ml-2 rounded border bg-muted px-1 py-0.5 text-[10px] font-mono">
              Ctrl+Scroll
            </kbd>
          </TooltipContent>
        </Tooltip>

        {/* Zoom level display */}
        <button
          className="flex h-8 w-12 items-center justify-center rounded-md border bg-background text-[11px] font-mono text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          onClick={() => store.zoomToFit()}
          title="Click to zoom to fit"
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
            <span className="font-medium">Zoom Out</span>
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
            <span className="font-medium">Zoom to Fit</span>
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
            <span className="font-medium">Minimap</span>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}