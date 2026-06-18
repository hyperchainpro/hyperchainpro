'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  ChevronDown,
  MousePointerClick,
  Plus,
  Link2,
  Unlink2,
  Trash2,
  Eye,
  EyeOff,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from 'lucide-react';
import { useCanvasStore } from '@/store/canvas-store';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { t, type Locale } from '@/lib/i18n';
import { useAuthStore } from '@/store/auth-store';
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

const neuSubtle =
  'shadow-[1px_1px_3px_rgba(0,0,0,0.04),-1px_-1px_3px_rgba(255,255,255,0.6)] dark:shadow-[1px_1px_3px_rgba(0,0,0,0.2),-1px_-1px_3px_rgba(30,30,30,0.04)]';

const checkerStyle: React.CSSProperties = {
  backgroundImage: 'linear-gradient(45deg, #e0e0e0 25%, transparent 25%), linear-gradient(-45deg, #e0e0e0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e0e0e0 75%), linear-gradient(-45deg, transparent 75%, #e0e0e0 75%)',
  backgroundSize: '6px 6px',
  backgroundPosition: '0 0, 0 3px, 3px -3px, -3px 0px',
};

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
      <div className="flex flex-col gap-1 min-h-[40px] justify-center">
        {label && (
          <span className="text-[10px] text-muted-foreground leading-none font-medium">{label}</span>
        )}
        <button
          className={cn(
            'h-8 w-full rounded-lg border border-border/40 bg-background/80 text-xs font-medium text-center px-1.5',
            'transition-all duration-150 hover:border-primary/30 hover:bg-background',
            'focus:outline-none focus:ring-1 focus:ring-primary/30 focus:ring-offset-0',
            neuSubtle,
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
    <div className="flex flex-col gap-1 min-h-[40px] justify-center">
      {label && (
        <span className="text-[10px] text-muted-foreground leading-none font-medium">{label}</span>
      )}
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
        className={cn(
          'h-8 w-full rounded-lg border border-primary/40 bg-background text-xs font-medium text-center px-1.5',
          'outline-none focus:ring-1 focus:ring-primary/30 focus:ring-offset-0',
          'transition-all duration-150',
          neuSubtle,
        )}
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
          'flex w-full items-center justify-between rounded-lg px-3 py-2.5',
          'text-[11px] font-semibold uppercase tracking-wider text-foreground/80',
          'transition-all duration-200 cursor-pointer select-none',
          'hover:bg-foreground/[0.04] active:bg-foreground/[0.06]',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/30',
        )}
      >
        <span>{title}</span>
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 text-muted-foreground/70 transition-transform duration-200 ease-out',
            open ? 'rotate-0' : '-rotate-90',
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-3 pb-3 pt-1.5 space-y-3">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ─── Main Design Panel ────────────────────────────────────────────────────────

export function DesignPanel() {
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
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
      <div className="flex h-full items-center justify-center p-4">
        <div
          className={cn(
            'flex flex-col items-center gap-4 rounded-2xl p-6 text-center max-w-[200px]',
            neuRaised,
          )}
        >
          <div
            className={cn(
              'flex h-14 w-14 items-center justify-center rounded-xl bg-foreground/[0.03]',
              neuInset,
            )}
          >
            <MousePointerClick className="h-6 w-6 text-muted-foreground/50" />
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-foreground/70">
              No Selection
            </p>
            <p className="text-[11px] leading-relaxed text-muted-foreground/70">
              Select an element to edit its properties
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isText = primary?.type === 'TEXT';
  const isFrame = primary?.type === 'FRAME';
  const isRect = primary?.type === 'RECTANGLE';
  const showCornerRadius = isRect || isFrame;

  return (
    <ScrollArea className="h-full">
      <div className="space-y-1 p-2.5">
        {/* ── Section 1: Position & Size ────────────────────────────────── */}
        <Section title={t('design.positionSize', locale)}>
          <div className="grid grid-cols-2 gap-2.5">
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
              label={t('design.rotation', locale)}
              value={getUniformNumberValue(selectedElements, (el) => el.rotation)}
              onChange={(v) => updateAll({ rotation: v })}
              min={0}
              max={360}
            />
          </div>

          {/* Frame-specific: Clip Content & Device */}
          {isFrame && (
            <>
              <div className="flex items-center justify-between min-h-[32px]">
                <Label className="text-xs font-medium text-foreground/70">{t("design.clipContent", locale)}</Label>
                <button
                  className={cn(
                    'relative h-5 w-9 rounded-full transition-all duration-200',
                    styles?.frameClip ? 'bg-primary shadow-sm' : 'bg-muted',
                    styles?.frameClip ? '' : neuSubtle,
                  )}
                  onClick={() => updateAllStyles({ frameClip: !styles?.frameClip })}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out',
                      styles?.frameClip && 'translate-x-4',
                    )}
                  />
                </button>
              </div>
              {styles?.frameDevice && (
                <div className="flex items-center gap-2 min-h-[28px]">
                  <span className="text-[10px] text-muted-foreground font-medium">{t("design.device", locale)}</span>
                  <span className="text-xs font-medium text-foreground/80">{styles.frameDevice}</span>
                </div>
              )}
            </>
          )}
        </Section>

        <Separator />

        {/* ── Section 2: Fill ───────────────────────────────────────────── */}
        <Section title={t('design.fill', locale)}>
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
        <Section title={t('design.stroke', locale)}>
          <StrokeSection
            primary={primary}
            selectedIds={selectedIds}
            updateAllStyles={updateAllStyles}
            toast={toast}
          />
        </Section>

        <Separator />

        {/* ── Section 4: Effects ────────────────────────────────────────── */}
        <Section title={t('design.effects', locale)} defaultOpen={false}>
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
            <Section title={t('design.typography', locale)}>
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
            <Section title={t('design.layout', locale)} defaultOpen={false}>
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
          <Section title={t('design.cornerRadius', locale)}>
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
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
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
    <div className="space-y-3">
      <div className="flex items-center gap-2.5">
        {/* Color swatch with checkerboard background for opacity preview */}
        <div className="relative shrink-0">
          <div
            className="h-8 w-8 rounded-lg border border-border/40"
            style={checkerStyle}
          />
          <div
            className="absolute inset-0 rounded-lg border border-border/30"
            style={{ backgroundColor: fillColor, opacity: fillOpacity }}
          />
          <input
            type="color"
            value={fillColor}
            onChange={(e) => setFillColor(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer rounded-lg opacity-0"
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
            'h-8 flex-1 rounded-lg border border-border/40 bg-background/80 px-2.5 text-xs font-mono font-medium',
            'focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all duration-150',
            neuSubtle,
          )}
          placeholder="#FFFFFF"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground font-medium">{t("design.opacity", locale)}</span>
          <span className="text-[10px] text-muted-foreground font-medium tabular-nums">
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
        className="h-8 w-full text-xs gap-1.5 font-medium"
        onClick={() =>
          toast({ title: t('design.comingSoon', locale), description: t('design.gradientFillsComingSoon', locale) })
        }
      >
        <Plus className="h-3 w-3" />
        {t('design.addFill', locale)}
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
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  const typography = primary.styles?.typography as TypographyStyles | undefined;
  const color = typography?.color ?? '#1F2937';

  const setTypographyColor = (c: string) => {
    const current = primary.styles?.typography as TypographyStyles | undefined;
    updateAllStyles({
      typography: { ...(current ?? {}), color: c } as TypographyStyles,
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2.5">
        {/* Color swatch */}
        <div className="relative shrink-0">
          <div
            className="h-8 w-8 rounded-lg border border-border/40"
            style={{ backgroundColor: color }}
          />
          <input
            type="color"
            value={color}
            onChange={(e) => setTypographyColor(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer rounded-lg opacity-0"
          />
        </div>
        <input
          type="text"
          value={color}
          onChange={(e) => {
            if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value) || e.target.value === '') {
              setTypographyColor(e.target.value || '#000000');
            }
          }}
          className={cn(
            'h-8 flex-1 rounded-lg border border-border/40 bg-background/80 px-2.5 text-xs font-mono font-medium',
            'focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all duration-150',
            neuSubtle,
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
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
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
    <div className="space-y-3">
      <div className="flex items-center gap-2.5">
        {/* Color swatch */}
        <div className="relative shrink-0">
          <div
            className="h-8 w-8 rounded-lg border border-border/40"
            style={{ backgroundColor: strokeColor }}
          />
          <input
            type="color"
            value={strokeColor}
            onChange={(e) => updateStroke({ color: e.target.value })}
            className="absolute inset-0 h-full w-full cursor-pointer rounded-lg opacity-0"
          />
        </div>
        <input
          type="text"
          value={strokeColor}
          onChange={(e) => {
            if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value) || e.target.value === '') {
              updateStroke({ color: e.target.value || '#000000' });
            }
          }}
          className={cn(
            'h-8 flex-1 rounded-lg border border-border/40 bg-background/80 px-2.5 text-xs font-mono font-medium',
            'focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all duration-150',
            neuSubtle,
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-muted-foreground font-medium">{t("design.width", locale)}</span>
          <TinyNumInput
            label=""
            value={strokeWidth}
            onChange={(v) => updateStroke({ width: v })}
            min={0}
            max={20}
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-muted-foreground font-medium">{t("design.style", locale)}</span>
          <Select
            value={strokeStyle}
            onValueChange={(v) =>
              updateStroke({ style: v as Stroke['style'] })
            }
          >
            <SelectTrigger size="sm" className="h-8 w-full text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solid">{t('design.solid', locale)}</SelectItem>
              <SelectItem value="dashed">{t('design.dashed', locale)}</SelectItem>
              <SelectItem value="dotted">{t('design.dotted', locale)}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-full text-xs gap-1.5 font-medium"
        onClick={() =>
          toast({ title: t('design.comingSoon', locale), description: t('design.multipleStrokesComingSoon', locale) })
        }
      >
        <Plus className="h-3 w-3" />
        {t('design.addStroke', locale)}
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
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
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
        <div key={shadow.id} className={cn("space-y-2.5 rounded-lg border border-border/30 p-3", neuSubtle)}>
          <div className="flex items-center justify-between min-h-[24px]">
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateShadow(shadow.id, { visible: !shadow.visible })}
                className="text-muted-foreground/60 hover:text-foreground transition-colors duration-150"
              >
                {shadow.visible ? (
                  <Eye className="h-3.5 w-3.5" />
                ) : (
                  <EyeOff className="h-3.5 w-3.5" />
                )}
              </button>
              <span className="text-[11px] font-medium text-foreground/70">
                {shadow.type === 'drop-shadow' ? t('design.dropShadow', locale) : t('design.innerShadow', locale)}
              </span>
            </div>
            <button
              onClick={() => removeShadow(shadow.id)}
              className="text-muted-foreground/50 hover:text-destructive transition-colors duration-150"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Shadow color swatch */}
            <div className="relative shrink-0">
              <div
                className="h-7 w-7 rounded-md border border-border/40"
                style={{ backgroundColor: shadow.color.slice(0, 7) }}
              />
              <input
                type="color"
                value={shadow.color.slice(0, 7)}
                onChange={(e) => updateShadow(shadow.id, { color: e.target.value + '33' })}
                className="absolute inset-0 h-full w-full cursor-pointer rounded-md opacity-0"
              />
            </div>
            <input
              type="text"
              value={shadow.color.slice(0, 7)}
              onChange={(e) => updateShadow(shadow.id, { color: e.target.value + '33' })}
              className={cn(
                'h-7 flex-1 rounded-md border border-border/40 bg-background/80 px-2 text-[11px] font-mono font-medium',
                'focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all duration-150',
              )}
            />
          </div>

          <div className="grid grid-cols-4 gap-2">
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
              label={t('design.blur', locale)}
              value={shadow.blur}
              onChange={(v) => updateShadow(shadow.id, { blur: v })}
              min={0}
            />
            <TinyNumInput
              label={t('design.spread', locale)}
              value={shadow.spread}
              onChange={(v) => updateShadow(shadow.id, { spread: v })}
            />
          </div>

          <Select
            value={shadow.type}
            onValueChange={(v) => updateShadow(shadow.id, { type: v as ShadowEffect['type'] })}
          >
            <SelectTrigger size="sm" className="h-8 w-full text-[11px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="drop-shadow">{t('design.dropShadow', locale)}</SelectItem>
              <SelectItem value="inner-shadow">{t('design.innerShadow', locale)}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ))}

      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-full text-xs gap-1.5 font-medium"
        onClick={addShadow}
      >
        <Plus className="h-3 w-3" />
        {t('design.addEffect', locale)}
      </Button>

      <Separator />

      {/* Layer Blur */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-foreground/70">{t("design.layerBlur", locale)}</span>
          <span className="text-[11px] text-muted-foreground font-medium tabular-nums">
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
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  const typ = primary.styles?.typography as TypographyStyles | undefined;
  const typo = typ ?? {
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
    updateAllStyles({ typography: { ...typo, ...updates } as TypographyStyles });
  };

  const textAlignOptions = [
    { value: 'left', icon: AlignLeft },
    { value: 'center', icon: AlignCenter },
    { value: 'right', icon: AlignRight },
    { value: 'justify', icon: AlignJustify },
  ] as const;

  return (
    <div className="space-y-3">
      {/* Font Family */}
      <Select
        value={typo.fontFamily}
        onValueChange={(v) => updateTypography({ fontFamily: v })}
      >
        <SelectTrigger size="sm" className="h-8 w-full text-xs">
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
      <div className="grid grid-cols-2 gap-2.5">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-muted-foreground font-medium">{t("design.size", locale)}</span>
          <TinyNumInput
            label=""
            value={typo.fontSize}
            onChange={(v) => updateTypography({ fontSize: v })}
            min={1}
            max={200}
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-muted-foreground font-medium">{t("design.weight", locale)}</span>
          <Select
            value={String(typo.fontWeight)}
            onValueChange={(v) => updateTypography({ fontWeight: parseInt(v, 10) })}
          >
            <SelectTrigger size="sm" className="h-8 w-full text-xs">
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
      <div className="grid grid-cols-2 gap-2.5">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-muted-foreground font-medium">{t("design.lineHeight", locale)}</span>
          <TinyNumInput
            label=""
            value={typo.lineHeight}
            onChange={(v) => updateTypography({ lineHeight: v })}
            min={0.5}
            max={3}
            step={0.1}
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-muted-foreground font-medium">{t("design.letterSpacing", locale)}</span>
          <TinyNumInput
            label=""
            value={typo.letterSpacing}
            onChange={(v) => updateTypography({ letterSpacing: v })}
            min={-5}
            max={20}
            step={0.5}
          />
        </div>
      </div>

      {/* Text Align */}
      <div className="space-y-1.5">
        <span className="text-[10px] text-muted-foreground font-medium">{t("design.align", locale)}</span>
        <div className="flex gap-1">
          {textAlignOptions.map((opt) => (
            <button
              key={opt.value}
              className={cn(
                'h-8 flex-1 flex items-center justify-center rounded-lg transition-all duration-150',
                typo.textAlign === opt.value
                  ? cn('text-primary', neuInset, 'bg-primary/10')
                  : cn('text-muted-foreground hover:text-foreground/70', neuSubtle, 'hover:bg-foreground/[0.02]'),
              )}
              onClick={() => updateTypography({ textAlign: opt.value })}
            >
              <opt.icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
      </div>

      {/* Text Case + Text Decoration row */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-muted-foreground font-medium">{t("design.case", locale)}</span>
          <Select
            value={typo.textCase}
            onValueChange={(v) => updateTypography({ textCase: v as TypographyStyles['textCase'] })}
          >
            <SelectTrigger size="sm" className="h-8 w-full text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{t('design.none', locale)}</SelectItem>
              <SelectItem value="uppercase">{t('design.uppercase', locale)}</SelectItem>
              <SelectItem value="lowercase">{t('design.lowercase', locale)}</SelectItem>
              <SelectItem value="capitalize">{t('design.capitalize', locale)}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-muted-foreground font-medium">{t('design.decoration', locale)}</span>
          <Select
            value={typo.textDecoration}
            onValueChange={(v) => updateTypography({ textDecoration: v as TypographyStyles['textDecoration'] })}
          >
            <SelectTrigger size="sm" className="h-8 w-full text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{t('design.none', locale)}</SelectItem>
              <SelectItem value="underline">{t('design.underline', locale)}</SelectItem>
              <SelectItem value="line-through">{t('design.lineThrough', locale)}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Font Style toggle */}
      <div className="flex items-center justify-between min-h-[32px]">
        <span className="text-xs font-medium text-foreground/70">{t("design.style", locale)}</span>
        <div className="flex gap-1">
          <button
            className={cn(
              'h-8 px-3.5 rounded-lg text-xs font-medium transition-all duration-150',
              typo.fontStyle === 'normal'
                ? cn('text-primary', neuInset, 'bg-primary/10')
                : cn('text-muted-foreground hover:text-foreground/70', neuSubtle, 'hover:bg-foreground/[0.02]'),
            )}
            onClick={() => updateTypography({ fontStyle: 'normal' })}
          >
            {t('design.normal', locale)}
          </button>
          <button
            className={cn(
              'h-8 px-3.5 rounded-lg text-xs italic transition-all duration-150',
              typo.fontStyle === 'italic'
                ? cn('text-primary font-medium', neuInset, 'bg-primary/10')
                : cn('text-muted-foreground hover:text-foreground/70', neuSubtle, 'hover:bg-foreground/[0.02]'),
            )}
            onClick={() => updateTypography({ fontStyle: 'italic' })}
          >
            {t('design.italic', locale)}
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
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
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
    <div className="space-y-3">
      {/* Toggle */}
      <div className="flex items-center justify-between min-h-[32px]">
        <Label className="text-xs font-medium text-foreground/70">{t('design.autoLayout', locale)}</Label>
        <button
          className={cn(
            'relative h-5 w-9 rounded-full transition-all duration-200',
            enabled ? 'bg-primary shadow-sm' : 'bg-muted',
            !enabled ? neuSubtle : '',
          )}
          onClick={() => updateLayout({ enabled: !enabled })}
        >
          <span
            className={cn(
              'absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out',
              enabled && 'translate-x-4',
            )}
          />
        </button>
      </div>

      {enabled && (
        <>
          {/* Direction */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-muted-foreground font-medium">{t('design.direction', locale)}</span>
            <div className="flex gap-1">
              <button
                className={cn(
                  'h-8 flex-1 rounded-lg text-xs font-medium transition-all duration-150',
                  layout?.direction === 'horizontal'
                    ? cn('text-primary', neuInset, 'bg-primary/10')
                    : cn('text-muted-foreground hover:text-foreground/70', neuSubtle, 'hover:bg-foreground/[0.02]'),
                )}
                onClick={() => updateLayout({ direction: 'horizontal' })}
              >
                {t('design.horizontal', locale)}
              </button>
              <button
                className={cn(
                  'h-8 flex-1 rounded-lg text-xs font-medium transition-all duration-150',
                  layout?.direction === 'vertical'
                    ? cn('text-primary', neuInset, 'bg-primary/10')
                    : cn('text-muted-foreground hover:text-foreground/70', neuSubtle, 'hover:bg-foreground/[0.02]'),
                )}
                onClick={() => updateLayout({ direction: 'vertical' })}
              >
                {t('design.vertical', locale)}
              </button>
            </div>
          </div>

          {/* Gap */}
          <TinyNumInput
            label={t('design.gap', locale)}
            value={layout?.gap ?? 0}
            onChange={(v) => updateLayout({ gap: v })}
            min={0}
            max={100}
          />

          {/* Padding (T, R, B, L) */}
          <div className="grid grid-cols-2 gap-2">
            <TinyNumInput
              label={t('design.top', locale)}
              value={layout?.paddingTop ?? 0}
              onChange={(v) => updateLayout({ paddingTop: v })}
              min={0}
              max={100}
            />
            <TinyNumInput
              label={t('design.right', locale)}
              value={layout?.paddingRight ?? 0}
              onChange={(v) => updateLayout({ paddingRight: v })}
              min={0}
              max={100}
            />
            <TinyNumInput
              label={t('design.bottom', locale)}
              value={layout?.paddingBottom ?? 0}
              onChange={(v) => updateLayout({ paddingBottom: v })}
              min={0}
              max={100}
            />
            <TinyNumInput
              label={t('design.left', locale)}
              value={layout?.paddingLeft ?? 0}
              onChange={(v) => updateLayout({ paddingLeft: v })}
              min={0}
              max={100}
            />
          </div>

          {/* Align Items */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-muted-foreground font-medium">{t('design.alignItems', locale)}</span>
            <Select
              value={layout?.alignItems ?? 'start'}
              onValueChange={(v) => updateLayout({ alignItems: v as FlexAlign })}
            >
              <SelectTrigger size="sm" className="h-8 w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="start">{t('design.start', locale)}</SelectItem>
                <SelectItem value="center">{t('design.center', locale)}</SelectItem>
                <SelectItem value="end">{t('design.end', locale)}</SelectItem>
                <SelectItem value="stretch">{t('design.stretch', locale)}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Justify Content */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-muted-foreground font-medium">{t('design.justifyContent', locale)}</span>
            <Select
              value={layout?.justifyContent ?? 'start'}
              onValueChange={(v) => updateLayout({ justifyContent: v as FlexJustify })}
            >
              <SelectTrigger size="sm" className="h-8 w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="start">{t('design.start', locale)}</SelectItem>
                <SelectItem value="center">{t('design.center', locale)}</SelectItem>
                <SelectItem value="end">{t('design.end', locale)}</SelectItem>
                <SelectItem value="space-between">{t('design.spaceBetween', locale)}</SelectItem>
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
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
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
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => setLinked(false)}
          className="text-muted-foreground/60 hover:text-foreground transition-colors duration-150"
          title={t("design.unlinkCorners", locale)}
        >
          <Link2 className="h-3.5 w-3.5" />
        </button>
        <div className="flex-1">
          <TinyNumInput
            label={t('design.all', locale)}

            value={val}
            onChange={setAllCorners}
            min={0}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground font-medium">{t('design.individualCorners', locale)}</span>
        <button
          onClick={() => {
            setLinked(true);
            const avg = Math.round(
              ((cr?.topLeft ?? 0) + (cr?.topRight ?? 0) + (cr?.bottomRight ?? 0) + (cr?.bottomLeft ?? 0)) / 4,
            );
            setAllCorners(avg);
          }}
          className="text-muted-foreground/60 hover:text-foreground transition-colors duration-150"
          title={t("design.linkCorners", locale)}
        >
          <Unlink2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
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