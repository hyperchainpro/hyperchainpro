'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  ChevronDown,
  ChevronRight,
  MousePointerClick,
  Plus,
  Link2,
  Unlink2,
  Trash2,
  Eye,
  EyeOff,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from 'lucide-react';
import { useCanvasStore } from '@/store/canvas-store';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import type {
  BoardElement,
  Fill,
  Stroke,
  ShadowEffect,
  TypographyStyles,
  AutoLayout,
  CornerRadius,
  FlexAlign,
  FlexJustify,
} from '@/lib/types';

// ─── Neumorphism helpers ──────────────────────────────────────────────────────

const neuRaised =
  'shadow-[3px_3px_6px_rgba(0,0,0,0.06),-3px_-3px_6px_rgba(255,255,255,0.7)] dark:shadow-[3px_3px_6px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(30,30,30,0.06)]';

const neuInset =
  'shadow-[inset_1px_1px_3px_rgba(0,0,0,0.06),inset_-1px_-1px_3px_rgba(255,255,255,0.7)] dark:shadow-[inset_1px_1px_3px_rgba(0,0,0,0.3),inset_-1px_-1px_3px_rgba(30,30,30,0.05)]';

// ─── Tiny number input ────────────────────────────────────────────────────────

function TinyNumInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  placeholder = '—',
}: {
  label: string;
  value: number | null;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState('');

  const display = value !== null ? String(Math.round(value * 100) / 100) : placeholder;

  const commit = useCallback(() => {
    setEditing(false);
    if (text === '') return;
    const n = parseFloat(text);
    if (isNaN(n)) return;
    const clamped = Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n));
    onChange(clamped);
  }, [text, min, max, onChange]);

  if (!editing) {
    return (
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] text-muted-foreground leading-none">{label}</span>
        <button
          className={cn(
            'h-7 w-full rounded-md border border-border/50 bg-background/50 text-xs text-center px-1',
            'transition-colors hover:border-primary/30 focus:outline-none focus:ring-1 focus:ring-primary/30',
          )}
          onClick={() => {
            setText(value !== null ? String(value) : '');
            setEditing(true);
          }}
        >
          {display}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] text-muted-foreground leading-none">{label}</span>
      <input
        autoFocus
        type="number"
        min={min}
        max={max}
        step={step}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') setEditing(false);
        }}
        className="h-7 w-full rounded-md border border-primary/50 bg-background text-xs text-center px-1 outline-none focus:ring-1 focus:ring-primary/30"
      />
    </div>
  );
}

// ─── Multi-value helper ───────────────────────────────────────────────────────

function getUniformValue<T>(
  elements: BoardElement[],
  getter: (el: BoardElement) => T,
): T | null {
  if (elements.length === 0) return null;
  const first = getter(elements[0]);
  if (elements.every((el) => getter(el) === first)) return first;
  return null;
}

function getUniformNumberValue(
  elements: BoardElement[],
  getter: (el: BoardElement) => number,
): number | null {
  if (elements.length === 0) return null;
  const first = getter(elements[0]);
  if (elements.every((el) => getter(el) === first)) return first;
  return null;
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger
        className={cn(
          'flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold',
          'transition-all hover:bg-muted/50 cursor-pointer select-none',
          neuRaised,
        )}
      >
        <span>{title}</span>
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-3 pb-3 pt-2 space-y-2.5">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ─── Main Design Panel ────────────────────────────────────────────────────────

export function DesignPanel() {
  const elements = useCanvasStore((s) => s.elements);
  const selectedIds = useCanvasStore((s) => s.selectedIds);
  const updateElement = useCanvasStore((s) => s.updateElement);
  const updateElementStyles = useCanvasStore((s) => s.updateElementStyles);
  const { toast } = useToast();

  const selectedElements = useMemo(
    () => elements.filter((el) => selectedIds.includes(el.id)),
    [elements, selectedIds],
  );

  const primary = selectedElements[0] ?? null;
  const styles = primary?.styles;

  // ── Helper to update all selected elements ──
  const updateAll = useCallback(
    (updates: Partial<BoardElement>) => {
      for (const id of selectedIds) {
        updateElement(id, updates);
      }
    },
    [selectedIds, updateElement],
  );

  const updateAllStyles = useCallback(
    (styleUpdates: Record<string, unknown>) => {
      for (const id of selectedIds) {
        updateElementStyles(id, styleUpdates);
      }
    },
    [selectedIds, updateElementStyles],
  );

  // ── Empty state ──
  if (selectedElements.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/50">
          <MousePointerClick className="h-6 w-6 text-muted-foreground/60" />
        </div>
        <p className="text-sm text-muted-foreground">
          Select an element to edit its properties
        </p>
      </div>
    );
  }

  const isText = primary?.type === 'TEXT';
  const isFrame = primary?.type === 'FRAME';
  const isRect = primary?.type === 'RECTANGLE';
  const showCornerRadius = isRect || isFrame;

  return (
    <ScrollArea className="h-full">
      <div className="space-y-1 p-2">
        {/* ── Section 1: Position & Size ────────────────────────────────── */}
        <Section title="Position & Size">
          <div className="grid grid-cols-2 gap-2">
            <TinyNumInput
              label="X"
              value={getUniformNumberValue(selectedElements, (el) => el.x)}
              onChange={(v) => updateAll({ x: v })}
            />
            <TinyNumInput
              label="Y"
              value={getUniformNumberValue(selectedElements, (el) => el.y)}
              onChange={(v) => updateAll({ y: v })}
            />
            <TinyNumInput
              label="W"
              value={getUniformNumberValue(selectedElements, (el) => el.width)}
              onChange={(v) => updateAll({ width: v })}
              min={1}
            />
            <TinyNumInput
              label="H"
              value={getUniformNumberValue(selectedElements, (el) => el.height)}
              onChange={(v) => updateAll({ height: v })}
              min={1}
            />
          </div>
          <div>
            <TinyNumInput
              label="Rotation"
              value={getUniformNumberValue(selectedElements, (el) => el.rotation)}
              onChange={(v) => updateAll({ rotation: v })}
              min={0}
              max={360}
            />
          </div>

          {/* Frame-specific: Clip Content & Device */}
          {isFrame && (
            <>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Clip Content</Label>
                <button
                  className={cn(
                    'relative h-5 w-9 rounded-full transition-colors',
                    styles?.frameClip ? 'bg-primary' : 'bg-muted',
                  )}
                  onClick={() => updateAllStyles({ frameClip: !styles?.frameClip })}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
                      styles?.frameClip && 'translate-x-4',
                    )}
                  />
                </button>
              </div>
              {styles?.frameDevice && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground">Device:</span>
                  <span className="text-xs font-medium">{styles.frameDevice}</span>
                </div>
              )}
            </>
          )}
        </Section>

        <Separator />

        {/* ── Section 2: Fill ───────────────────────────────────────────── */}
        <Section title="Fill">
          {isText ? (
            <TextFillSection
              primary={primary}
              selectedIds={selectedIds}
              updateAllStyles={updateAllStyles}
            />
          ) : (
            <ShapeFillSection
              primary={primary}
              selectedIds={selectedIds}
              updateAllStyles={updateAllStyles}
              toast={toast}
            />
          )}
        </Section>

        <Separator />

        {/* ── Section 3: Stroke ─────────────────────────────────────────── */}
        <Section title="Stroke">
          <StrokeSection
            primary={primary}
            selectedIds={selectedIds}
            updateAllStyles={updateAllStyles}
            toast={toast}
          />
        </Section>

        <Separator />

        {/* ── Section 4: Effects ────────────────────────────────────────── */}
        <Section title="Effects" defaultOpen={false}>
          <EffectsSection
            primary={primary}
            selectedIds={selectedIds}
            updateAllStyles={updateAllStyles}
          />
        </Section>

        <Separator />

        {/* ── Section 5: Typography (TEXT only) ──────────────────────────── */}
        {isText && (
          <>
            <Section title="Typography">
              <TypographySection
                primary={primary}
                selectedIds={selectedIds}
                updateAllStyles={updateAllStyles}
              />
            </Section>
            <Separator />
          </>
        )}

        {/* ── Section 6: Auto Layout (FRAME only) ───────────────────────── */}
        {isFrame && (
          <>
            <Section title="Layout" defaultOpen={false}>
              <AutoLayoutSection
                primary={primary}
                selectedIds={selectedIds}
                updateAllStyles={updateAllStyles}
              />
            </Section>
            <Separator />
          </>
        )}

        {/* ── Section 7: Corner Radius (RECTANGLE / FRAME) ──────────────── */}
        {showCornerRadius && (
          <Section title="Corner Radius">
            <CornerRadiusSection
              primary={primary}
              selectedIds={selectedIds}
              updateAllStyles={updateAllStyles}
            />
          </Section>
        )}
      </div>
    </ScrollArea>
  );
}

// ─── Fill Section (Shape) ─────────────────────────────────────────────────────

function ShapeFillSection({
  primary,
  selectedIds,
  updateAllStyles,
  toast,
}: {
  primary: BoardElement;
  selectedIds: string[];
  updateAllStyles: (s: Record<string, unknown>) => void;
  toast: (opts: { title: string; description?: string }) => void;
}) {
  const styles = primary.styles;
  const fills: Fill[] = (styles?.fills as Fill[]) ?? [];

  const primaryFill = fills[0];
  const fillColor = primaryFill?.color ?? primary.color ?? '#FFFFFF';
  const fillOpacity = primaryFill?.opacity ?? 1;

  const setFillColor = (color: string) => {
    const current = (styles?.fills as Fill[]) ?? [];
    if (current.length > 0) {
      updateAllStyles({
        fills: current.map((f, i) =>
          i === 0 ? { ...f, color } : f,
        ),
      });
    } else {
      updateAllStyles({
        fills: [{ id: `fill-${Date.now()}`, type: 'solid' as const, color, opacity: 1 }],
      });
    }
  };

  const setFillOpacity = (opacity: number) => {
    const current = (styles?.fills as Fill[]) ?? [];
    if (current.length > 0) {
      updateAllStyles({
        fills: current.map((f, i) =>
          i === 0 ? { ...f, opacity } : f,
        ),
      });
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            type="color"
            value={fillColor}
            onChange={(e) => setFillColor(e.target.value)}
            className="h-7 w-7 cursor-pointer rounded-md border border-border/50 bg-transparent p-0.5"
          />
        </div>
        <input
          type="text"
          value={fillColor}
          onChange={(e) => {
            if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value) || e.target.value === '') {
              setFillColor(e.target.value || '#000000');
            }
          }}
          className={cn(
            'h-7 flex-1 rounded-md border border-border/50 bg-background/50 px-2 text-xs font-mono',
            'focus:outline-none focus:ring-1 focus:ring-primary/30',
          )}
          placeholder="#FFFFFF"
        />
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">Opacity</span>
          <span className="text-[10px] text-muted-foreground">
            {Math.round(fillOpacity * 100)}%
          </span>
        </div>
        <Slider
          min={0}
          max={1}
          step={0.01}
          value={[fillOpacity]}
          onValueChange={([v]) => setFillOpacity(v)}
          className="h-2"
        />
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-full text-xs gap-1"
        onClick={() =>
          toast({ title: 'Coming soon', description: 'Gradient fills coming soon' })
        }
      >
        <Plus className="h-3 w-3" />
        Add Fill
      </Button>
    </div>
  );
}

// ─── Fill Section (Text) ──────────────────────────────────────────────────────

function TextFillSection({
  primary,
  selectedIds,
  updateAllStyles,
}: {
  primary: BoardElement;
  selectedIds: string[];
  updateAllStyles: (s: Record<string, unknown>) => void;
}) {
  const typography = primary.styles?.typography as TypographyStyles | undefined;
  const color = typography?.color ?? '#1F2937';

  const setTypographyColor = (c: string) => {
    const current = primary.styles?.typography as TypographyStyles | undefined;
    updateAllStyles({
      typography: { ...(current ?? {}), color: c } as TypographyStyles,
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={color}
          onChange={(e) => setTypographyColor(e.target.value)}
          className="h-7 w-7 cursor-pointer rounded-md border border-border/50 bg-transparent p-0.5"
        />
        <input
          type="text"
          value={color}
          onChange={(e) => {
            if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value) || e.target.value === '') {
              setTypographyColor(e.target.value || '#000000');
            }
          }}
          className={cn(
            'h-7 flex-1 rounded-md border border-border/50 bg-background/50 px-2 text-xs font-mono',
            'focus:outline-none focus:ring-1 focus:ring-primary/30',
          )}
          placeholder="#1F2937"
        />
      </div>
    </div>
  );
}

// ─── Stroke Section ───────────────────────────────────────────────────────────

function StrokeSection({
  primary,
  selectedIds,
  updateAllStyles,
  toast,
}: {
  primary: BoardElement;
  selectedIds: string[];
  updateAllStyles: (s: Record<string, unknown>) => void;
  toast: (opts: { title: string; description?: string }) => void;
}) {
  const styles = primary.styles;
  const strokes: Stroke[] = (styles?.strokes as Stroke[]) ?? [];
  const primaryStroke = strokes[0];

  const strokeColor = primaryStroke?.color ?? styles?.borderColor ?? '#000000';
  const strokeWidth = primaryStroke?.width ?? styles?.borderWidth ?? 0;
  const strokeStyle = primaryStroke?.style ?? styles?.borderStyle ?? 'solid';

  const updateStroke = (updates: Partial<Stroke>) => {
    const current = (styles?.strokes as Stroke[]) ?? [];
    if (current.length > 0) {
      updateAllStyles({
        strokes: current.map((s, i) => (i === 0 ? { ...s, ...updates } : s)),
      });
    } else {
      updateAllStyles({
        strokes: [
          {
            id: `stroke-${Date.now()}`,
            color: strokeColor,
            width: strokeWidth,
            style: 'solid' as const,
            align: 'center' as const,
            cap: 'butt' as const,
            join: 'miter' as const,
            ...updates,
          },
        ],
      });
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={strokeColor}
          onChange={(e) => updateStroke({ color: e.target.value })}
          className="h-7 w-7 cursor-pointer rounded-md border border-border/50 bg-transparent p-0.5"
        />
        <input
          type="text"
          value={strokeColor}
          onChange={(e) => {
            if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value) || e.target.value === '') {
              updateStroke({ color: e.target.value || '#000000' });
            }
          }}
          className={cn(
            'h-7 flex-1 rounded-md border border-border/50 bg-background/50 px-2 text-xs font-mono',
            'focus:outline-none focus:ring-1 focus:ring-primary/30',
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-muted-foreground">Width</span>
          <TinyNumInput
            label=""
            value={strokeWidth}
            onChange={(v) => updateStroke({ width: v })}
            min={0}
            max={20}
          />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-muted-foreground">Style</span>
          <Select
            value={strokeStyle}
            onValueChange={(v) =>
              updateStroke({ style: v as Stroke['style'] })
            }
          >
            <SelectTrigger size="sm" className="h-7 w-full text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solid">Solid</SelectItem>
              <SelectItem value="dashed">Dashed</SelectItem>
              <SelectItem value="dotted">Dotted</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-full text-xs gap-1"
        onClick={() =>
          toast({ title: 'Coming soon', description: 'Multiple strokes coming soon' })
        }
      >
        <Plus className="h-3 w-3" />
        Add Stroke
      </Button>
    </div>
  );
}

// ─── Effects Section (Shadow & Blur) ──────────────────────────────────────────

function EffectsSection({
  primary,
  selectedIds,
  updateAllStyles,
}: {
  primary: BoardElement;
  selectedIds: string[];
  updateAllStyles: (s: Record<string, unknown>) => void;
}) {
  const styles = primary.styles;
  const shadows: ShadowEffect[] = (styles?.shadows as ShadowEffect[]) ?? [];
  const layerBlur = (styles?.blurs as { id: string; type: string; value: number; visible: boolean }[] ?? []).find(
    (b) => b.type === 'layer-blur',
  );

  const addShadow = () => {
    const current = (styles?.shadows as ShadowEffect[]) ?? [];
    const newShadow: ShadowEffect = {
      id: `shadow-${Date.now()}`,
      type: 'drop-shadow',
      color: '#00000033',
      offsetX: 0,
      offsetY: 4,
      blur: 10,
      spread: 0,
      visible: true,
    };
    updateAllStyles({ shadows: [...current, newShadow] });
  };

  const removeShadow = (id: string) => {
    const current = (styles?.shadows as ShadowEffect[]) ?? [];
    updateAllStyles({ shadows: current.filter((s) => s.id !== id) });
  };

  const updateShadow = (id: string, updates: Partial<ShadowEffect>) => {
    const current = (styles?.shadows as ShadowEffect[]) ?? [];
    updateAllStyles({
      shadows: current.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    });
  };

  return (
    <div className="space-y-3">
      {/* Shadows */}
      {shadows.map((shadow) => (
        <div key={shadow.id} className="space-y-2 rounded-md border border-border/30 p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => updateShadow(shadow.id, { visible: !shadow.visible })}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {shadow.visible ? (
                  <Eye className="h-3.5 w-3.5" />
                ) : (
                  <EyeOff className="h-3.5 w-3.5" />
                )}
              </button>
              <span className="text-[10px] font-medium">
                {shadow.type === 'drop-shadow' ? 'Drop Shadow' : 'Inner Shadow'}
              </span>
            </div>
            <button
              onClick={() => removeShadow(shadow.id)}
              className="text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <div className="flex items-center gap-1">
              <input
                type="color"
                value={shadow.color.slice(0, 7)}
                onChange={(e) => updateShadow(shadow.id, { color: e.target.value + '33' })}
                className="h-5 w-5 cursor-pointer rounded border border-border/50 bg-transparent p-0"
              />
              <input
                type="text"
                value={shadow.color.slice(0, 7)}
                onChange={(e) => updateShadow(shadow.id, { color: e.target.value + '33' })}
                className="h-5 flex-1 rounded border border-border/50 bg-transparent px-1 text-[10px] font-mono focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1">
            <TinyNumInput
              label="X"
              value={shadow.offsetX}
              onChange={(v) => updateShadow(shadow.id, { offsetX: v })}
            />
            <TinyNumInput
              label="Y"
              value={shadow.offsetY}
              onChange={(v) => updateShadow(shadow.id, { offsetY: v })}
            />
            <TinyNumInput
              label="Blur"
              value={shadow.blur}
              onChange={(v) => updateShadow(shadow.id, { blur: v })}
              min={0}
            />
            <TinyNumInput
              label="Spread"
              value={shadow.spread}
              onChange={(v) => updateShadow(shadow.id, { spread: v })}
            />
          </div>

          <Select
            value={shadow.type}
            onValueChange={(v) => updateShadow(shadow.id, { type: v as ShadowEffect['type'] })}
          >
            <SelectTrigger size="sm" className="h-6 w-full text-[10px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="drop-shadow">Drop Shadow</SelectItem>
              <SelectItem value="inner-shadow">Inner Shadow</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ))}

      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-full text-xs gap-1"
        onClick={addShadow}
      >
        <Plus className="h-3 w-3" />
        Add Effect
      </Button>

      <Separator />

      {/* Layer Blur */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium">Layer Blur</span>
          <span className="text-[10px] text-muted-foreground">
            {layerBlur?.value ?? 0}
          </span>
        </div>
        <Slider
          min={0}
          max={100}
          step={1}
          value={[layerBlur?.value ?? 0]}
          onValueChange={([v]) => {
            const blurs = (styles?.blurs as { id: string; type: string; value: number; visible: boolean }[]) ?? [];
            const existing = blurs.find((b) => b.type === 'layer-blur');
            if (existing) {
              updateAllStyles({
                blurs: blurs.map((b) =>
                  b.type === 'layer-blur' ? { ...b, value: v } : b,
                ),
              });
            } else {
              updateAllStyles({
                blurs: [
                  ...blurs,
                  { id: `blur-${Date.now()}`, type: 'layer-blur', value: v, visible: true },
                ],
              });
            }
          }}
          className="h-2"
        />
      </div>
    </div>
  );
}

// ─── Typography Section ───────────────────────────────────────────────────────

const FONT_FAMILIES = [
  'Inter, system-ui, sans-serif',
  'System UI, sans-serif',
  'Georgia, serif',
  'Times New Roman, serif',
  'Courier New, monospace',
  'Arial, sans-serif',
  'Helvetica, sans-serif',
];

const FONT_WEIGHTS = [
  { value: '100', label: '100 (Thin)' },
  { value: '200', label: '200 (Extra Light)' },
  { value: '300', label: '300 (Light)' },
  { value: '400', label: '400 (Regular)' },
  { value: '500', label: '500 (Medium)' },
  { value: '600', label: '600 (Semi Bold)' },
  { value: '700', label: '700 (Bold)' },
  { value: '800', label: '800 (Extra Bold)' },
  { value: '900', label: '900 (Black)' },
];

function TypographySection({
  primary,
  selectedIds,
  updateAllStyles,
}: {
  primary: BoardElement;
  selectedIds: string[];
  updateAllStyles: (s: Record<string, unknown>) => void;
}) {
  const typography = primary.styles?.typography as TypographyStyles | undefined;
  const t = typography ?? {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 16,
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: 0,
    textDecoration: 'none' as const,
    color: '#1F2937',
    textAlign: 'left' as const,
    fontStyle: 'normal' as const,
    textCase: 'none' as const,
  };

  const updateTypography = (updates: Partial<TypographyStyles>) => {
    updateAllStyles({ typography: { ...t, ...updates } as TypographyStyles });
  };

  const textAlignOptions = [
    { value: 'left', icon: AlignLeft },
    { value: 'center', icon: AlignCenter },
    { value: 'right', icon: AlignRight },
    { value: 'justify', icon: AlignJustify },
  ] as const;

  return (
    <div className="space-y-2.5">
      {/* Font Family */}
      <Select
        value={t.fontFamily}
        onValueChange={(v) => updateTypography({ fontFamily: v })}
      >
        <SelectTrigger size="sm" className="h-7 w-full text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FONT_FAMILIES.map((f) => (
            <SelectItem key={f} value={f}>
              {f.split(',')[0]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Font Size + Weight row */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-muted-foreground">Size</span>
          <TinyNumInput
            label=""
            value={t.fontSize}
            onChange={(v) => updateTypography({ fontSize: v })}
            min={1}
            max={200}
          />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-muted-foreground">Weight</span>
          <Select
            value={String(t.fontWeight)}
            onValueChange={(v) => updateTypography({ fontWeight: parseInt(v, 10) })}
          >
            <SelectTrigger size="sm" className="h-7 w-full text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_WEIGHTS.map((fw) => (
                <SelectItem key={fw.value} value={fw.value}>
                  {fw.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Line Height + Letter Spacing row */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-muted-foreground">Line Height</span>
          <TinyNumInput
            label=""
            value={t.lineHeight}
            onChange={(v) => updateTypography({ lineHeight: v })}
            min={0.5}
            max={3}
            step={0.1}
          />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-muted-foreground">Letter Spacing</span>
          <TinyNumInput
            label=""
            value={t.letterSpacing}
            onChange={(v) => updateTypography({ letterSpacing: v })}
            min={-5}
            max={20}
            step={0.5}
          />
        </div>
      </div>

      {/* Text Align */}
      <div className="space-y-1">
        <span className="text-[10px] text-muted-foreground">Align</span>
        <div className="flex gap-0.5">
          {textAlignOptions.map((opt) => (
            <button
              key={opt.value}
              className={cn(
                'h-7 flex-1 flex items-center justify-center rounded-md border transition-colors',
                t.textAlign === opt.value
                  ? 'border-primary/50 bg-primary/10 text-primary'
                  : 'border-border/50 hover:bg-muted/50 text-muted-foreground',
              )}
              onClick={() => updateTypography({ textAlign: opt.value })}
            >
              <opt.icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
      </div>

      {/* Text Case + Text Decoration row */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-muted-foreground">Case</span>
          <Select
            value={t.textCase}
            onValueChange={(v) => updateTypography({ textCase: v as TypographyStyles['textCase'] })}
          >
            <SelectTrigger size="sm" className="h-7 w-full text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="uppercase">Uppercase</SelectItem>
              <SelectItem value="lowercase">Lowercase</SelectItem>
              <SelectItem value="capitalize">Capitalize</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-muted-foreground">Decoration</span>
          <Select
            value={t.textDecoration}
            onValueChange={(v) => updateTypography({ textDecoration: v as TypographyStyles['textDecoration'] })}
          >
            <SelectTrigger size="sm" className="h-7 w-full text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="underline">Underline</SelectItem>
              <SelectItem value="line-through">Line-through</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Font Style toggle */}
      <div className="flex items-center justify-between">
        <span className="text-xs">Style</span>
        <div className="flex gap-0.5">
          <button
            className={cn(
              'h-7 px-3 rounded-md border text-xs font-medium transition-colors',
              t.fontStyle === 'normal'
                ? 'border-primary/50 bg-primary/10 text-primary'
                : 'border-border/50 hover:bg-muted/50 text-muted-foreground',
            )}
            onClick={() => updateTypography({ fontStyle: 'normal' })}
          >
            Normal
          </button>
          <button
            className={cn(
              'h-7 px-3 rounded-md border text-xs italic transition-colors',
              t.fontStyle === 'italic'
                ? 'border-primary/50 bg-primary/10 text-primary'
                : 'border-border/50 hover:bg-muted/50 text-muted-foreground',
            )}
            onClick={() => updateTypography({ fontStyle: 'italic' })}
          >
            Italic
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Auto Layout Section ──────────────────────────────────────────────────────

function AutoLayoutSection({
  primary,
  selectedIds,
  updateAllStyles,
}: {
  primary: BoardElement;
  selectedIds: string[];
  updateAllStyles: (s: Record<string, unknown>) => void;
}) {
  const layout = primary.styles?.autoLayout as AutoLayout | undefined;
  const enabled = layout?.enabled ?? false;

  const defaultLayout: AutoLayout = {
    enabled: true,
    direction: 'vertical',
    gap: 0,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    alignItems: 'start',
    justifyContent: 'start',
    wrap: false,
  };

  const updateLayout = (updates: Partial<AutoLayout>) => {
    const current = layout ?? defaultLayout;
    updateAllStyles({ autoLayout: { ...current, ...updates } as AutoLayout });
  };

  return (
    <div className="space-y-2.5">
      {/* Toggle */}
      <div className="flex items-center justify-between">
        <Label className="text-xs">Auto Layout</Label>
        <button
          className={cn(
            'relative h-5 w-9 rounded-full transition-colors',
            enabled ? 'bg-primary' : 'bg-muted',
          )}
          onClick={() => updateLayout({ enabled: !enabled })}
        >
          <span
            className={cn(
              'absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
              enabled && 'translate-x-4',
            )}
          />
        </button>
      </div>

      {enabled && (
        <>
          {/* Direction */}
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground">Direction</span>
            <div className="flex gap-0.5">
              <button
                className={cn(
                  'h-7 flex-1 rounded-md border text-xs font-medium transition-colors',
                  layout?.direction === 'horizontal'
                    ? 'border-primary/50 bg-primary/10 text-primary'
                    : 'border-border/50 hover:bg-muted/50 text-muted-foreground',
                )}
                onClick={() => updateLayout({ direction: 'horizontal' })}
              >
                Horizontal
              </button>
              <button
                className={cn(
                  'h-7 flex-1 rounded-md border text-xs font-medium transition-colors',
                  layout?.direction === 'vertical'
                    ? 'border-primary/50 bg-primary/10 text-primary'
                    : 'border-border/50 hover:bg-muted/50 text-muted-foreground',
                )}
                onClick={() => updateLayout({ direction: 'vertical' })}
              >
                Vertical
              </button>
            </div>
          </div>

          {/* Gap */}
          <TinyNumInput
            label="Gap"
            value={layout?.gap ?? 0}
            onChange={(v) => updateLayout({ gap: v })}
            min={0}
            max={100}
          />

          {/* Padding (T, R, B, L) */}
          <div className="grid grid-cols-2 gap-1.5">
            <TinyNumInput
              label="Top"
              value={layout?.paddingTop ?? 0}
              onChange={(v) => updateLayout({ paddingTop: v })}
              min={0}
              max={100}
            />
            <TinyNumInput
              label="Right"
              value={layout?.paddingRight ?? 0}
              onChange={(v) => updateLayout({ paddingRight: v })}
              min={0}
              max={100}
            />
            <TinyNumInput
              label="Bottom"
              value={layout?.paddingBottom ?? 0}
              onChange={(v) => updateLayout({ paddingBottom: v })}
              min={0}
              max={100}
            />
            <TinyNumInput
              label="Left"
              value={layout?.paddingLeft ?? 0}
              onChange={(v) => updateLayout({ paddingLeft: v })}
              min={0}
              max={100}
            />
          </div>

          {/* Align Items */}
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground">Align Items</span>
            <Select
              value={layout?.alignItems ?? 'start'}
              onValueChange={(v) => updateLayout({ alignItems: v as FlexAlign })}
            >
              <SelectTrigger size="sm" className="h-7 w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="start">Start</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="end">End</SelectItem>
                <SelectItem value="stretch">Stretch</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Justify Content */}
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground">Justify Content</span>
            <Select
              value={layout?.justifyContent ?? 'start'}
              onValueChange={(v) => updateLayout({ justifyContent: v as FlexJustify })}
            >
              <SelectTrigger size="sm" className="h-7 w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="start">Start</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="end">End</SelectItem>
                <SelectItem value="space-between">Space Between</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Corner Radius Section ────────────────────────────────────────────────────

function CornerRadiusSection({
  primary,
  selectedIds,
  updateAllStyles,
}: {
  primary: BoardElement;
  selectedIds: string[];
  updateAllStyles: (s: Record<string, unknown>) => void;
}) {
  const cr = primary.styles?.cornerRadius as CornerRadius | undefined;
  const [linked, setLinked] = useState(() => {
    if (!cr) return true;
    const { topLeft, topRight, bottomRight, bottomLeft } = cr;
    return topLeft === topRight && topRight === bottomRight && bottomRight === bottomLeft;
  });

  const setAllCorners = (v: number) => {
    updateAllStyles({
      cornerRadius: { topLeft: v, topRight: v, bottomRight: v, bottomLeft: v } as CornerRadius,
    });
    setLinked(true);
  };

  const setCorner = (key: keyof CornerRadius, v: number) => {
    const current = cr ?? { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0 };
    updateAllStyles({
      cornerRadius: { ...current, [key]: v } as CornerRadius,
    });
  };

  if (linked) {
    const val = cr?.topLeft ?? 0;
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => setLinked(false)}
          className="text-muted-foreground hover:text-foreground transition-colors"
          title="Unlink corners"
        >
          <Link2 className="h-3.5 w-3.5" />
        </button>
        <div className="flex-1">
          <TinyNumInput
            label="All"
            value={val}
            onChange={setAllCorners}
            min={0}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">Individual Corners</span>
        <button
          onClick={() => {
            setLinked(true);
            const avg = Math.round(
              ((cr?.topLeft ?? 0) + (cr?.topRight ?? 0) + (cr?.bottomRight ?? 0) + (cr?.bottomLeft ?? 0)) / 4,
            );
            setAllCorners(avg);
          }}
          className="text-muted-foreground hover:text-foreground transition-colors"
          title="Link corners"
        >
          <Unlink2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <TinyNumInput
          label="TL"
          value={cr?.topLeft ?? 0}
          onChange={(v) => setCorner('topLeft', v)}
          min={0}
        />
        <TinyNumInput
          label="TR"
          value={cr?.topRight ?? 0}
          onChange={(v) => setCorner('topRight', v)}
          min={0}
        />
        <TinyNumInput
          label="BR"
          value={cr?.bottomRight ?? 0}
          onChange={(v) => setCorner('bottomRight', v)}
          min={0}
        />
        <TinyNumInput
          label="BL"
          value={cr?.bottomLeft ?? 0}
          onChange={(v) => setCorner('bottomLeft', v)}
          min={0}
        />
      </div>
    </div>
  );
}