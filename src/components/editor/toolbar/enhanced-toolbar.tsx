'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  MousePointer2,
  Puzzle,
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
  Grid2x2,
  Map,
  Ruler,
  Smartphone,
  Tablet,
  Monitor,
  Presentation,
  Frame,
  Globe,
  Trash2,
  Scissors,
  CirclePlus,
  SquareMinus,
  Diamond,
  Split,
  Maximize2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { t, type Locale } from '@/lib/i18n';
import { useCanvasStore } from '@/store/canvas-store';
import { useAppStore } from '@/store/app-store';
import { useAuthStore } from '@/store/auth-store';
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

// ─── Neumorphic styles for toolbar buttons ─────────────────────────────────────

const neuToolBase =
  'shadow-[1px_1px_3px_rgba(0,0,0,0.05),-1px_-1px_3px_rgba(255,255,255,0.5)] ' +
  'dark:shadow-[1px_1px_3px_rgba(0,0,0,0.22),-1px_-1px_3px_rgba(30,30,30,0.04)]';

const neuToolActive =
  'shadow-[inset_2px_2px_5px_rgba(0,0,0,0.08),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] ' +
  'dark:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.3),inset_-2px_-2px_5px_rgba(30,30,30,0.06)] ' +
  'bg-accent text-accent-foreground';

const neuToolHover =
  'hover:shadow-[0_0_10px_rgba(0,0,0,0.04),1px_1px_3px_rgba(0,0,0,0.05),-1px_-1px_3px_rgba(255,255,255,0.5)] ' +
  'hover:bg-accent/40 ' +
  'dark:hover:shadow-[0_0_10px_rgba(0,0,0,0.2),1px_1px_3px_rgba(0,0,0,0.22),-1px_-1px_3px_rgba(30,30,30,0.04)]';

const toolButtonBase = cn(
  'flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200',
  neuToolBase,
  neuToolHover,
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
);

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
  subItems?: DeviceTemplate[];
}

function getDeviceCategories(locale: Locale): DeviceCategory[] {
  return [
    { label: 'iPhone 16 Pro', icon: <Smartphone className="h-4 w-4" />, category: 'phone', template: DEVICE_TEMPLATES[0] },
    { label: 'Galaxy S24 Ultra', icon: <Smartphone className="h-4 w-4" />, category: 'phone', template: DEVICE_TEMPLATES.find(d => d.id === 'galaxy-s24-ultra') },
    { label: 'Pixel 9 Pro', icon: <Smartphone className="h-4 w-4" />, category: 'phone', template: DEVICE_TEMPLATES.find(d => d.id === 'pixel-9-pro') },
    { label: 'iPad Pro 11"', icon: <Tablet className="h-4 w-4" />, category: 'tablet', template: DEVICE_TEMPLATES.find(d => d.id === 'ipad-pro-11-m4') },
    { label: 'Desktop 1920×1080', icon: <Monitor className="h-4 w-4" />, category: 'desktop', template: DEVICE_TEMPLATES.find(d => d.id === 'desktop-1920') },
    { label: 'Website 1440×900', icon: <Globe className="h-4 w-4" />, category: 'desktop', template: DEVICE_TEMPLATES.find(d => d.id === 'desktop-1440') },
    { label: 'Presentation 16:9', icon: <Presentation className="h-4 w-4" />, category: 'presentation', template: DEVICE_TEMPLATES.find(d => d.id === 'presentation-169') },
    { label: t('toolbar.custom', locale), icon: <Frame className="h-4 w-4" />, category: 'custom' },
  ];
}

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
            toolButtonBase,
            isActive && neuToolActive,
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

function FramePopover({ locale, onOpenChange }: { locale: Locale; onOpenChange: (open: boolean) => void }) {
  return (
    <div className="w-48 p-2 space-y-1">
      <p className="px-2 py-1 text-xs font-medium text-muted-foreground">{t('toolbar.deviceFrame', locale)}</p>
      {getDeviceCategories(locale).map((cat) => (
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

function StarPopover({ locale, onOpenChange }: { locale: Locale; onOpenChange: (open: boolean) => void }) {
  const [points, setPoints] = useState(5);

  const handleApply = () => {
    addShapeAtCenter('STAR', { styles: { pointCount: points } });
    onOpenChange(false);
  };

  return (
    <div className="w-52 p-3 space-y-3">
      <Label className="text-xs font-medium text-muted-foreground">{t('toolbar.starPoints', locale)}</Label>
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
        <span className="text-xs text-muted-foreground">{t('toolbar.rangeHint', locale)}</span>
      </div>
      <Button size="sm" className="w-full" onClick={handleApply}>
        {t('toolbar.apply', locale)}
      </Button>
    </div>
  );
}

function PolygonPopover({ locale, onOpenChange }: { locale: Locale; onOpenChange: (open: boolean) => void }) {
  const [sides, setSides] = useState(6);

  const handleApply = () => {
    addShapeAtCenter('POLYGON', { styles: { pointCount: sides } });
    onOpenChange(false);
  };

  return (
    <div className="w-52 p-3 space-y-3">
      <Label className="text-xs font-medium text-muted-foreground">{t('toolbar.polygonSides', locale)}</Label>
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
        <span className="text-xs text-muted-foreground">{t('toolbar.rangeHint', locale)}</span>
      </div>
      <Button size="sm" className="w-full" onClick={handleApply}>
        {t('toolbar.apply', locale)}
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
            toolButtonBase,
            disabled && 'opacity-30 pointer-events-none',
            active && neuToolActive,
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

// ─── Zoom Controls ────────────────────────────────────────────────────────────

function ZoomControls({ locale }: { locale: Locale }) {
  const zoom = useCanvasStore((s) => s.zoom);
  const zoomIn = useCanvasStore((s) => s.zoomIn);
  const zoomOut = useCanvasStore((s) => s.zoomOut);
  const zoomToFit = useCanvasStore((s) => s.zoomToFit);
  const setZoom = useCanvasStore((s) => s.setZoom);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.select();
    }
  }, [editing]);

  const handleZoomClick = () => {
    setEditValue(Math.round(zoom * 100).toString());
    setEditing(true);
  };

  const handleZoomSubmit = () => {
    const val = parseInt(editValue, 10);
    if (!isNaN(val) && val >= 10 && val <= 500) {
      setZoom(val / 100);
    }
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleZoomSubmit();
    if (e.key === 'Escape') setEditing(false);
  };

  return (
    <div className="flex flex-col items-center gap-0.5">
      <ActionButton
        icon={<ZoomIn className="h-4 w-4" />}
        label={t('toolbar.zoomIn', locale)}
        shortcut="Ctrl++"
        onClick={zoomIn}
      />
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleZoomClick}
            className={cn(
              'flex h-7 w-full items-center justify-center rounded-md text-[10px] font-mono font-medium',
              'text-muted-foreground transition-all duration-200',
              neuToolBase,
              'hover:bg-accent/40 hover:shadow-[0_0_10px_rgba(0,0,0,0.04)]',
              'dark:hover:shadow-[0_0_10px_rgba(0,0,0,0.2)]',
            )}
          >
            {editing ? (
              <input
                ref={inputRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleZoomSubmit}
                onKeyDown={handleKeyDown}
                className="w-full h-full text-center text-[10px] font-mono bg-transparent outline-none"
                autoFocus
              />
            ) : (
              `${Math.round(zoom * 100)}%`
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          <span className="font-medium">{Math.round(zoom * 100)}%</span>
          <span className="ml-1.5 text-[10px] text-muted-foreground">{t('toolbar.clickToEdit', locale)}</span>
        </TooltipContent>
      </Tooltip>
      <ActionButton
        icon={<ZoomOut className="h-4 w-4" />}
        label={t('toolbar.zoomOut', locale)}
        shortcut="Ctrl+−"
        onClick={zoomOut}
      />
      <ActionButton
        icon={<Maximize2 className="h-4 w-4" />}
        label={t('toolbar.zoomToFit', locale)}
        shortcut="Ctrl+0"
        onClick={zoomToFit}
      />
    </div>
  );
}

// ─── Tool Definitions ─────────────────────────────────────────────────────────

function getSelectionTools(locale: Locale): ToolDef[] {
  return [
    { id: 'SELECT', icon: <MousePointer2 className="h-4 w-4" />, label: t('toolbar.moveSelect', locale), shortcut: 'V' },
    { id: 'HAND', icon: <Hand className="h-4 w-4" />, label: t('toolbar.handPan', locale), shortcut: 'H' },
  ];
}

function getShapeTools(locale: Locale): ToolDef[] {
  return [
    { id: 'RECTANGLE', icon: <Square className="h-4 w-4" />, label: t('toolbar.rectangle', locale), shortcut: 'R' },
    { id: 'ELLIPSE', icon: <Circle className="h-4 w-4" />, label: t('toolbar.ellipse', locale), shortcut: 'O' },
    { id: 'STAR', icon: <Star className="h-4 w-4" />, label: t('toolbar.star', locale), shortcut: '', popover: 'star' },
    { id: 'POLYGON', icon: <Pentagon className="h-4 w-4" />, label: t('toolbar.polygon', locale), shortcut: '', popover: 'polygon' },
  ];
}

function getDrawingTools(locale: Locale): ToolDef[] {
  return [
    { id: 'LINE', icon: <Minus className="h-4 w-4" />, label: t('toolbar.line', locale), shortcut: 'L' },
    { id: 'PEN_TOOL', icon: <PenTool className="h-4 w-4" />, label: t('toolbar.penTool', locale), shortcut: 'P' },
  ];
}

function getContentTools(locale: Locale): ToolDef[] {
  return [
    { id: 'FRAME', icon: <Layout className="h-4 w-4" />, label: t('toolbar.frame', locale), shortcut: 'F', popover: 'frame' },
    { id: 'TEXT', icon: <Type className="h-4 w-4" />, label: t('toolbar.text', locale), shortcut: 'T' },
    { id: 'STICKY_NOTE', icon: <StickyNote className="h-4 w-4" />, label: t('toolbar.stickyNote', locale), shortcut: 'S' },
    { id: 'IMAGE', icon: <ImageIcon className="h-4 w-4" />, label: t('toolbar.image', locale), shortcut: 'I' },
    { id: 'CONNECTOR', icon: <ArrowRight className="h-4 w-4" />, label: t('toolbar.connector', locale), shortcut: '' },
  ];
}

function getUtilityTools(locale: Locale): ToolDef[] {
  return [
    { id: 'SLICE', icon: <Scissors className="h-4 w-4" />, label: t('toolbar.slice', locale), shortcut: 'K' },
  ];
}

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
                toolButtonBase,
                isActive && neuToolActive,
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
  const activeTool = useCanvasStore((s) => s.activeTool);
  const snapToGrid = useCanvasStore((s) => s.snapToGrid);
  const showMinimap = useCanvasStore((s) => s.showMinimap);
  const showMeasureLines = useCanvasStore((s) => s.showMeasureLines);
  const showGuides = useCanvasStore((s) => s.showGuides);
  const history = useCanvasStore((s) => s.history);
  const historyIndex = useCanvasStore((s) => s.historyIndex);
  const selectedIds = useCanvasStore((s) => s.selectedIds);
  const setTool = useCanvasStore((s) => s.setTool);
  const undo = useCanvasStore((s) => s.undo);
  const redo = useCanvasStore((s) => s.redo);
  const deleteElements = useCanvasStore((s) => s.deleteElements);
  const setSnapToGrid = useCanvasStore((s) => s.setSnapToGrid);
  const toggleMinimap = useCanvasStore((s) => s.toggleMinimap);
  const toggleMeasureLines = useCanvasStore((s) => s.toggleMeasureLines);
  const toggleGuides = useCanvasStore((s) => s.toggleGuides);
  const booleanOperation = useCanvasStore((s) => s.booleanOperation);
  const editorMode = useAppStore((s) => s.editorMode);
  const setEditorMode = useAppStore((s) => s.setEditorMode);
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
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
      if (tool.id === 'SLICE') {
        // One-click: add slice region at viewport center, then switch back to SELECT
        const { panX, panY, zoom } = useCanvasStore.getState();
        const viewportW = window.innerWidth;
        const viewportH = window.innerHeight;
        const cx = (viewportW / 2 - panX) / zoom;
        const cy = (viewportH / 2 - panY) / zoom;
        const sliceW = 200;
        const sliceH = 200;
        const sliceId = `slice-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const sliceCount = useCanvasStore.getState().sliceRegions.length + 1;
        useCanvasStore.getState().addSliceRegion({
          id: sliceId,
          x: Math.round(cx - sliceW / 2),
          y: Math.round(cy - sliceH / 2),
          width: sliceW,
          height: sliceH,
          name: `${t('slice.name', locale)} ${sliceCount}`,
        });
        return;
      }
      setTool(tool.id);
    },
    [setTool, locale],
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
            {(onOpenChange) => <FramePopover locale={locale} onOpenChange={onOpenChange} />}
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
            {(onOpenChange) => <StarPopover locale={locale} onOpenChange={onOpenChange} />}
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
            {(onOpenChange) => <PolygonPopover locale={locale} onOpenChange={onOpenChange} />}
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
          'relative z-50 flex h-full w-11 flex-col items-center overflow-y-auto',
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
                  toolButtonBase,
                  editorMode === 'design' && neuToolActive,
                )}
                onClick={() => setEditorMode('design')}
              >
                <MousePointer2 className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              <span className="font-medium">{t('toolbar.design', locale)}</span>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className={cn(
                  toolButtonBase,
                  editorMode === 'prototype' && neuToolActive,
                )}
                onClick={() => setEditorMode('prototype')}
              >
                <Play className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              <span className="font-medium">{t('toolbar.prototype', locale)}</span>
            </TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="horizontal" className="my-1.5 w-7" />

        {/* ── Selection ───────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-0.5">
          {renderToolSection(getSelectionTools(locale))}
        </div>

        <Separator orientation="horizontal" className="my-1.5 w-7" />

        {/* ── Shapes ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-0.5">
          {renderToolSection(getShapeTools(locale))}
        </div>

        <Separator orientation="horizontal" className="my-1.5 w-7" />

        {/* ── Drawing ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-0.5">
          {renderToolSection(getDrawingTools(locale))}
        </div>

        <Separator orientation="horizontal" className="my-1.5 w-7" />

        {/* ── Content ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-0.5">
          {renderToolSection(getContentTools(locale))}
        </div>

        <Separator orientation="horizontal" className="my-1.5 w-7" />

        {/* ── Utility ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-0.5">
          {renderToolSection(getUtilityTools(locale))}
          <ActionButton
            icon={<Ruler className="h-4 w-4" />}
            label={t('toolbar.measure', locale)}
            shortcut="M"
            active={showMeasureLines}
            onClick={toggleMeasureLines}
          />
          <ActionButton
            icon={<Grid3X3 className="h-4 w-4" />}
            label={t('toolbar.guides', locale)}
            active={showGuides}
            onClick={toggleGuides}
          />
        </div>

        <Separator orientation="horizontal" className="my-1.5 w-7" />

        {/* ── Boolean Operations ─────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[9px] font-medium text-muted-foreground leading-none mb-0.5">
            {t('boolean.title', locale).charAt(0)}
          </span>
          <ActionButton
            icon={<CirclePlus className="h-4 w-4" />}
            label={t('boolean.union', locale)}
            disabled={selectedIds.length < 2}
            onClick={() => booleanOperation('union')}
          />
          <ActionButton
            icon={<SquareMinus className="h-4 w-4" />}
            label={t('boolean.subtract', locale)}
            disabled={selectedIds.length < 2}
            onClick={() => booleanOperation('subtract')}
          />
          <ActionButton
            icon={<Diamond className="h-4 w-4" />}
            label={t('boolean.intersect', locale)}
            disabled={selectedIds.length < 2}
            onClick={() => booleanOperation('intersect')}
          />
          <ActionButton
            icon={<Split className="h-4 w-4" />}
            label={t('boolean.exclude', locale)}
            disabled={selectedIds.length < 2}
            onClick={() => booleanOperation('exclude')}
          />
        </div>

        {/* ── Spacer ─────────────────────────────────────────────────────── */}
        <div className="flex-1" />

        {/* ── Bottom: Actions ────────────────────────────────────────────── */}
        <Separator orientation="horizontal" className="mb-1.5 w-7" />

        {/* Delete */}
        <div className="flex flex-col items-center mb-1.5">
          <ActionButton
            icon={<Trash2 className="h-4 w-4" />}
            label={t('toolbar.delete', locale)}
            shortcut="Del"
            disabled={selectedIds.length === 0}
            onClick={() => deleteElements()}
          />
        </div>

        <Separator orientation="horizontal" className="mb-1.5 w-7" />

        {/* Undo / Redo */}
        <div className="flex flex-col items-center gap-0.5">
          <ActionButton
            icon={<Undo2 className="h-4 w-4" />}
            label={t('toolbar.undo', locale)}
            shortcut="Ctrl+Z"
            disabled={!canUndo}
            onClick={undo}
          />
          <ActionButton
            icon={<Redo2 className="h-4 w-4" />}
            label={t('toolbar.redo', locale)}
            shortcut="Ctrl+Y"
            disabled={!canRedo}
            onClick={redo}
          />
        </div>

        <Separator orientation="horizontal" className="my-1.5 w-7" />

        {/* Zoom Controls */}
        <ZoomControls locale={locale} />

        <Separator orientation="horizontal" className="my-1.5 w-7" />

        {/* Grid / Minimap toggles */}
        <div className="flex flex-col items-center gap-0.5 mb-2">
          <ActionButton
            icon={<Grid2x2 className="h-4 w-4" />}
            label={t('toolbar.snapToGrid', locale)}
            active={snapToGrid}
            onClick={() => setSnapToGrid(!snapToGrid)}
          />
          <ActionButton
            icon={<Map className="h-4 w-4" />}
            label={t('toolbar.minimap', locale)}
            active={showMinimap}
            onClick={toggleMinimap}
          />
        </div>

        <Separator orientation="horizontal" className="my-1.5 w-7" />

        {/* Plugins */}
        <div className="flex flex-col items-center mb-2">
          <ActionButton
            icon={<Puzzle className="h-4 w-4" />}
            label={t('toolbar.plugins', locale)}
            onClick={() => useAppStore.getState().setPluginDialogOpen(true)}
          />
        </div>
      </div>

    </TooltipProvider>
  );
}