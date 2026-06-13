'use client';

import React, { useCallback, useRef, useState } from 'react';
import {
  MousePointer2,
  Hand,
  Layout,
  Square,
  Circle,
  Minus,
  Star,
  Pentagon,
  PenTool,
  Type,
  Image as ImageIcon,
  StickyNote,
  ArrowRight,
  Play,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Grid3X3,
  Map,
  Smartphone,
  Tablet,
  Monitor,
  Presentation,
  Frame,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCanvasStore } from '@/store/canvas-store';
import { useAppStore } from '@/store/app-store';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DEVICE_TEMPLATES,
  createFrameFromDevice,
} from '@/lib/device-templates';
import type { CanvasTool, ElementType, DeviceTemplate } from '@/lib/types';

// ─── Helper: compute viewport center in canvas coordinates ─────────────────────

function getViewportCenter() {
  const { panX, panY, zoom } = useCanvasStore.getState();
  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;
  return {
    cx: (viewportW / 2 - panX) / zoom,
    cy: (viewportH / 2 - panY) / zoom,
  };
}

function addFrameAtCenter(template?: DeviceTemplate) {
  const { cx, cy } = getViewportCenter();
  const { addElement, setTool } = useCanvasStore.getState();

  if (template) {
    const overrides = createFrameFromDevice(template, cx - template.width / 2, cy - template.height / 2);
    addElement('FRAME', cx - template.width / 2, cy - template.height / 2, overrides);
  } else {
    // Custom / default frame
    const w = 375;
    const h = 812;
    addElement('FRAME', cx - w / 2, cy - h / 2, {
      width: w,
      height: h,
      name: 'Frame',
    });
  }
  setTool('SELECT');
}

function addShapeAtCenter(type: ElementType, overrides?: Record<string, unknown>) {
  const { cx, cy } = getViewportCenter();
  const { addElement, setTool } = useCanvasStore.getState();
  const defaults = { STAR: { width: 120, height: 120 }, POLYGON: { width: 120, height: 120 } };
  const w = (defaults as Record<string, { width: number; height: number }>)[type]?.width ?? 120;
  const h = (defaults as Record<string, { width: number; height: number }>)[type]?.height ?? 120;
  addElement(type, cx - w / 2, cy - h / 2, {
    width: w,
    height: h,
    ...overrides,
  });
  setTool('SELECT');
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ToolDef {
  id: CanvasTool;
  icon: React.ReactNode;
  label: string;
  shortcut: string;
  popover?: 'frame' | 'star' | 'polygon';
}

// ─── Device Categories for Frame Popover ───────────────────────────────────────

interface DeviceCategory {
  label: string;
  icon: React.ReactNode;
  category: DeviceTemplate['category'] | 'custom';
  template?: DeviceTemplate;
}

const DEVICE_CATEGORIES: DeviceCategory[] = [
  { label: 'iPhone 15 Pro', icon: <Smartphone className="h-5 w-5" />, category: 'phone', template: DEVICE_TEMPLATES[0] },
  { label: 'iPad Pro 11"', icon: <Tablet className="h-5 w-5" />, category: 'tablet', template: DEVICE_TEMPLATES[7] },
  { label: 'Desktop 1920×1080', icon: <Monitor className="h-5 w-5" />, category: 'desktop', template: DEVICE_TEMPLATES[9] },
  { label: '16:9', icon: <Presentation className="h-5 w-5" />, category: 'presentation', template: DEVICE_TEMPLATES[13] },
  { label: 'Custom', icon: <Frame className="h-5 w-5" />, category: 'custom' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function ToolButton({
  tool,
  isActive,
  onClick,
  children,
}: {
  tool: ToolDef;
  isActive: boolean;
  onClick: (tool: ToolDef) => void;
  children?: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          className={cn(
            'flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-lg transition-colors',
            'hover:bg-accent/50',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            isActive && 'bg-accent text-accent-foreground',
          )}
          onClick={() => onClick(tool)}
        >
          {children ?? <span className="h-4 w-4">{tool.icon}</span>}
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        <span className="font-medium">{tool.label}</span>
        {tool.shortcut && (
          <kbd className="ml-2 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-mono">
            {tool.shortcut}
          </kbd>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

function FramePopover({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
  return (
    <div className="w-48 p-2 space-y-1">
      <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Device Frame</p>
      {DEVICE_CATEGORIES.map((cat) => (
        <button
          key={cat.category}
          className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors hover:bg-accent text-left"
          onClick={() => {
            if (cat.template) {
              addFrameAtCenter(cat.template);
            } else {
              addFrameAtCenter();
            }
            onOpenChange(false);
          }}
        >
          {cat.icon}
          <span>{cat.label}</span>
        </button>
      ))}
    </div>
  );
}

function StarPopover({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
  const [points, setPoints] = useState(5);

  const handleApply = () => {
    addShapeAtCenter('STAR', { styles: { pointCount: points } });
    onOpenChange(false);
  };

  return (
    <div className="w-52 p-3 space-y-3">
      <Label className="text-xs font-medium text-muted-foreground">Star Points</Label>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={3}
          max={12}
          value={points}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (!isNaN(v)) setPoints(Math.min(12, Math.max(3, v)));
          }}
          className="h-8 w-16 text-center text-sm"
        />
        <span className="text-xs text-muted-foreground">3–12</span>
      </div>
      <Button size="sm" className="w-full" onClick={handleApply}>
        Apply
      </Button>
    </div>
  );
}

function PolygonPopover({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
  const [sides, setSides] = useState(6);

  const handleApply = () => {
    addShapeAtCenter('POLYGON', { styles: { pointCount: sides } });
    onOpenChange(false);
  };

  return (
    <div className="w-52 p-3 space-y-3">
      <Label className="text-xs font-medium text-muted-foreground">Polygon Sides</Label>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={3}
          max={12}
          value={sides}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (!isNaN(v)) setSides(Math.min(12, Math.max(3, v)));
          }}
          className="h-8 w-16 text-center text-sm"
        />
        <span className="text-xs text-muted-foreground">3–12</span>
      </div>
      <Button size="sm" className="w-full" onClick={handleApply}>
        Apply
      </Button>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  shortcut,
  disabled,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  disabled?: boolean;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          className={cn(
            'flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-lg transition-colors',
            'hover:bg-accent/50',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            disabled && 'opacity-30 pointer-events-none',
            active && 'bg-accent text-accent-foreground',
          )}
          onClick={onClick}
          disabled={disabled}
        >
          {icon}
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        <span className="font-medium">{label}</span>
        {shortcut && (
          <kbd className="ml-2 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-mono">
            {shortcut}
          </kbd>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

// ─── Tool Definitions ─────────────────────────────────────────────────────────

const SELECTION_TOOLS: ToolDef[] = [
  { id: 'SELECT', icon: <MousePointer2 className="h-4 w-4" />, label: 'Move / Select', shortcut: 'V' },
  { id: 'HAND', icon: <Hand className="h-4 w-4" />, label: 'Hand / Pan', shortcut: 'H' },
];

const FRAME_SHAPE_TOOLS: ToolDef[] = [
  { id: 'FRAME', icon: <Layout className="h-4 w-4" />, label: 'Frame', shortcut: 'F', popover: 'frame' },
  { id: 'RECTANGLE', icon: <Square className="h-4 w-4" />, label: 'Rectangle', shortcut: 'R' },
  { id: 'ELLIPSE', icon: <Circle className="h-4 w-4" />, label: 'Ellipse', shortcut: 'O' },
  { id: 'LINE', icon: <Minus className="h-4 w-4" />, label: 'Line', shortcut: 'L' },
  { id: 'STAR', icon: <Star className="h-4 w-4" />, label: 'Star', shortcut: '', popover: 'star' },
  { id: 'POLYGON', icon: <Pentagon className="h-4 w-4" />, label: 'Polygon', shortcut: '', popover: 'polygon' },
];

const PEN_TOOLS: ToolDef[] = [
  { id: 'PEN_TOOL', icon: <PenTool className="h-4 w-4" />, label: 'Pen Tool', shortcut: 'P' },
];

const CONTENT_TOOLS: ToolDef[] = [
  { id: 'TEXT', icon: <Type className="h-4 w-4" />, label: 'Text', shortcut: 'T' },
  { id: 'IMAGE', icon: <ImageIcon className="h-4 w-4" />, label: 'Image', shortcut: 'I' },
  { id: 'STICKY_NOTE', icon: <StickyNote className="h-4 w-4" />, label: 'Sticky Note', shortcut: 'S' },
];

const CONNECTOR_TOOLS: ToolDef[] = [
  { id: 'CONNECTOR', icon: <ArrowRight className="h-4 w-4" />, label: 'Connector', shortcut: '' },
];

// ─── Popover Tool Wrapper ─────────────────────────────────────────────────────

function PopoverToolButton({
  tool,
  isActive,
  onToolSelect,
  children,
}: {
  tool: ToolDef;
  isActive: boolean;
  onToolSelect: (tool: ToolDef) => void;
  children: (onOpenChange: (open: boolean) => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              className={cn(
                'flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-lg transition-colors',
                'hover:bg-accent/50',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isActive && 'bg-accent text-accent-foreground',
              )}
              onClick={() => {
                if (isActive) {
                  setOpen(true);
                } else {
                  onToolSelect(tool);
                  setOpen(true);
                }
              }}
            >
              {tool.icon}
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          <span className="font-medium">{tool.label}</span>
          {tool.shortcut && (
            <kbd className="ml-2 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-mono">
              {tool.shortcut}
            </kbd>
          )}
        </TooltipContent>
      </Tooltip>
      <PopoverContent side="right" sideOffset={8} className="w-auto p-0" align="start">
        {children((o) => setOpen(o))}
      </PopoverContent>
    </Popover>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EnhancedToolbar() {
  const { activeTool, snapToGrid, showMinimap, history, historyIndex, setTool, undo, redo, zoomIn, zoomOut, setSnapToGrid, toggleMinimap } = useCanvasStore();
  const { editorMode, setEditorMode } = useAppStore();
  const pendingAIDesign = useAppStore((s) => s.pendingAIDesign);
  const prevPendingRef = useRef(pendingAIDesign);

  // Auto-open AI dialog when flagged from dashboard (triggered outside effect)
  if (pendingAIDesign && !prevPendingRef.current) {
    prevPendingRef.current = pendingAIDesign;
    useAppStore.getState().setPendingAIDesign(false);
    useAppStore.getState().setAIDesignDialogOpen(true);
  } else if (!pendingAIDesign) {
    prevPendingRef.current = false;
  }

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleToolClick = useCallback(
    (tool: ToolDef) => {
      setTool(tool.id);
    },
    [setTool],
  );

  const renderToolSection = (tools: ToolDef[]) =>
    tools.map((tool) => {
      if (tool.popover === 'frame') {
        return (
          <PopoverToolButton
            key={tool.id}
            tool={tool}
            isActive={activeTool === tool.id}
            onToolSelect={handleToolClick}
          >
            {(onOpenChange) => <FramePopover onOpenChange={onOpenChange} />}
          </PopoverToolButton>
        );
      }
      if (tool.popover === 'star') {
        return (
          <PopoverToolButton
            key={tool.id}
            tool={tool}
            isActive={activeTool === tool.id}
            onToolSelect={handleToolClick}
          >
            {(onOpenChange) => <StarPopover onOpenChange={onOpenChange} />}
          </PopoverToolButton>
        );
      }
      if (tool.popover === 'polygon') {
        return (
          <PopoverToolButton
            key={tool.id}
            tool={tool}
            isActive={activeTool === tool.id}
            onToolSelect={handleToolClick}
          >
            {(onOpenChange) => <PolygonPopover onOpenChange={onOpenChange} />}
          </PopoverToolButton>
        );
      }
      return (
        <ToolButton
          key={tool.id}
          tool={tool}
          isActive={activeTool === tool.id}
          onClick={handleToolClick}
        />
      );
    });

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={cn(
          'relative z-50 flex h-full w-11 md:w-12 flex-col items-center overflow-y-auto',
          'bg-background/80 backdrop-blur-sm',
          'border-r',
          'shadow-[3px_0px_12px_rgba(0,0,0,0.06),_-1px_0px_0px_rgba(255,255,255,0.04)_inset,1px_0px_0px_rgba(255,255,255,0.08)_inset]',
          'py-2',
          '[&::-webkit-scrollbar]:w-0',
        )}
      >
        {/* ── Top: Design / Prototype Mode Toggle ─────────────────────────── */}
        <div className="flex flex-col items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className={cn(
                  'flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-lg transition-colors',
                  'hover:bg-accent/50',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  editorMode === 'design' && 'bg-accent text-accent-foreground',
                )}
                onClick={() => setEditorMode('design')}
              >
                <MousePointer2 className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              <span className="font-medium">Design</span>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className={cn(
                  'flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-lg transition-colors',
                  'hover:bg-accent/50',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  editorMode === 'prototype' && 'bg-accent text-accent-foreground',
                )}
                onClick={() => setEditorMode('prototype')}
              >
                <Play className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              <span className="font-medium">Prototype</span>
            </TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="horizontal" className="my-1.5 w-8" />

        {/* ── Selection & Navigation ─────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-0.5">
          {renderToolSection(SELECTION_TOOLS)}
        </div>

        <Separator orientation="horizontal" className="my-1.5 w-8" />

        {/* ── Frame & Shape Tools ────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-0.5">
          {renderToolSection(FRAME_SHAPE_TOOLS)}
        </div>

        <Separator orientation="horizontal" className="my-1.5 w-8" />

        {/* ── Drawing & Pen ──────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-0.5">
          {renderToolSection(PEN_TOOLS)}
        </div>

        <Separator orientation="horizontal" className="my-1.5 w-8" />

        {/* ── Content Tools ──────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-0.5">
          {renderToolSection(CONTENT_TOOLS)}
        </div>

        <Separator orientation="horizontal" className="my-1.5 w-8" />

        {/* ── Connector ──────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-0.5">
          {renderToolSection(CONNECTOR_TOOLS)}
        </div>

        {/* ── Spacer ─────────────────────────────────────────────────────── */}
        <div className="flex-1" />

        {/* ── Bottom: Actions ────────────────────────────────────────────── */}
        <Separator orientation="horizontal" className="mb-1.5 w-8" />

        {/* Undo / Redo */}
        <div className="flex flex-col items-center gap-0.5">
          <ActionButton
            icon={<Undo2 className="h-4 w-4" />}
            label="Undo"
            shortcut="Ctrl+Z"
            disabled={!canUndo}
            onClick={undo}
          />
          <ActionButton
            icon={<Redo2 className="h-4 w-4" />}
            label="Redo"
            shortcut="Ctrl+Y"
            disabled={!canRedo}
            onClick={redo}
          />
        </div>

        <Separator orientation="horizontal" className="my-1.5 w-8" />

        {/* Zoom */}
        <div className="flex flex-col items-center gap-0.5">
          <ActionButton
            icon={<ZoomIn className="h-4 w-4" />}
            label="Zoom In"
            shortcut="Ctrl++"
            onClick={zoomIn}
          />
          <ActionButton
            icon={<ZoomOut className="h-4 w-4" />}
            label="Zoom Out"
            shortcut="Ctrl+−"
            onClick={zoomOut}
          />
        </div>

        <Separator orientation="horizontal" className="my-1.5 w-8" />

        {/* Grid / Minimap toggles */}
        <div className="flex flex-col items-center gap-0.5 mb-2">
          <ActionButton
            icon={<Grid3X3 className="h-4 w-4" />}
            label="Snap to Grid"
            active={snapToGrid}
            onClick={() => setSnapToGrid(!snapToGrid)}
          />
          <ActionButton
            icon={<Map className="h-4 w-4" />}
            label="Minimap"
            active={showMinimap}
            onClick={toggleMinimap}
          />
        </div>
      </div>

    </TooltipProvider>
  );
}