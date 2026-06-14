'use client';

import React, { useCallback } from 'react';
import { Smartphone, Tablet, Monitor, Presentation, Package, Palette, Type as TypeIcon } from 'lucide-react';
import { useCanvasStore } from '@/store/canvas-store';
import { useComponentStore } from '@/store/component-store';
import { DEVICE_TEMPLATES, getDevicesByCategory, createFrameFromDevice } from '@/lib/device-templates';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { t, type Locale } from '@/lib/i18n';
import { useAuthStore } from '@/store/auth-store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { DeviceTemplate, ElementType } from '@/lib/types';

// ─── Neumorphism constants ────────────────────────────────────────────────────

const NEU_CARD =
  'shadow-[4px_4px_8px_rgba(0,0,0,0.06),-4px_-4px_8px_rgba(255,255,255,0.8)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.35),-4px_-4px_8px_rgba(30,30,30,0.08)]';

const NEU_HEADER =
  'shadow-[3px_3px_6px_rgba(0,0,0,0.05),-3px_-3px_6px_rgba(255,255,255,0.7)] dark:shadow-[3px_3px_6px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(30,30,30,0.06)]';

// ─── Preset colors ───────────────────────────────────────────────────────────

const PRESET_COLORS = [
  '#1F2937', '#374151', '#6B7280', '#9CA3AF', '#D1D5DB', '#F9FAFB',
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E',
  '#14B8A6', '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7',
  '#D946EF', '#EC4899', '#F43F5E', '#FB7185', '#FCA5A5', '#FDE68A',
  '#FFFFFF', '#000000', 'transparent',
];

// ─── Text style presets ───────────────────────────────────────────────────────

const TEXT_STYLE_PRESETS = [
  { name: 'Heading 1', fontFamily: 'Inter, system-ui, sans-serif', fontSize: 32, fontWeight: 700, lineHeight: 1.2 },
  { name: 'Heading 2', fontFamily: 'Inter, system-ui, sans-serif', fontSize: 24, fontWeight: 600, lineHeight: 1.3 },
  { name: 'Heading 3', fontFamily: 'Inter, system-ui, sans-serif', fontSize: 20, fontWeight: 600, lineHeight: 1.4 },
  { name: 'Body', fontFamily: 'Inter, system-ui, sans-serif', fontSize: 16, fontWeight: 400, lineHeight: 1.5 },
  { name: 'Body Small', fontFamily: 'Inter, system-ui, sans-serif', fontSize: 14, fontWeight: 400, lineHeight: 1.5 },
  { name: 'Caption', fontFamily: 'Inter, system-ui, sans-serif', fontSize: 12, fontWeight: 400, lineHeight: 1.4 },
  { name: 'Button', fontFamily: 'Inter, system-ui, sans-serif', fontSize: 14, fontWeight: 600, lineHeight: 1 },
  { name: 'Monospace', fontFamily: 'JetBrains Mono, monospace', fontSize: 14, fontWeight: 400, lineHeight: 1.6 },
];

// ─── Device category config ───────────────────────────────────────────────────

const CATEGORY_CONFIG: {
  key: DeviceTemplate['category'];
  i18nKey: string;
  icon: React.ElementType;
}[] = [
  { key: 'phone', i18nKey: 'assets.phone', icon: Smartphone },
  { key: 'tablet', i18nKey: 'assets.tablet', icon: Tablet },
  { key: 'desktop', i18nKey: 'assets.desktop', icon: Monitor },
  { key: 'presentation', i18nKey: 'assets.presentation', icon: Presentation },
];

// ─── Helper: add frame at viewport center ─────────────────────────────────────

function addFrameAtCenter(template: DeviceTemplate) {
  const { panX, panY, zoom } = useCanvasStore.getState();
  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;
  // Convert viewport center to canvas coordinates
  const canvasCenterX = (viewportW / 2 - panX) / zoom - template.width / 2;
  const canvasCenterY = (viewportH / 2 - panY) / zoom - template.height / 2;
  const frameOverrides = createFrameFromDevice(template, canvasCenterX, canvasCenterY);
  useCanvasStore.getState().addElement('FRAME', canvasCenterX, canvasCenterY, {
    ...frameOverrides,
    width: template.width,
    height: template.height,
  });
}

// ─── Components Tab ───────────────────────────────────────────────────────────

function ComponentsTab() {
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  const components = useComponentStore((s) => s.components);

  if (components.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-xs text-muted-foreground gap-2 px-4">
        <Package className="size-6 opacity-40" />
        <span className="text-center">{t('assets.noComponents', locale)}</span>
        <span className="text-[10px] opacity-60 text-center">
          {t('assets.createComponentHint', locale)}
        </span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 p-2">
      {components.map((comp) => (
        <button
          key={comp.id}
          className={cn(
            'flex flex-col items-center gap-1.5 p-2.5 rounded-xl border border-border/50',
            'hover:bg-accent/50 transition-colors text-center group',
          )}
          onClick={() => {
            // Add component instance to canvas center
            const { panX, panY, zoom } = useCanvasStore.getState();
            const viewportW = window.innerWidth;
            const viewportH = window.innerHeight;
            const canvasCenterX = (viewportW / 2 - panX) / zoom - 100;
            const canvasCenterY = (viewportH / 2 - panY) / zoom - 50;
            useCanvasStore.getState().addElement('RECTANGLE', canvasCenterX, canvasCenterY, {
              name: comp.name,
              componentId: comp.id,
            });
          }}
        >
          {/* Thumbnail placeholder */}
          <div
            className={cn(
              'w-full aspect-[4/3] rounded-lg bg-muted/60 border border-border/40',
              'flex items-center justify-center',
              NEU_CARD,
            )}
          >
            <span className="text-lg text-muted-foreground/50 group-hover:text-muted-foreground transition-colors">
              {comp.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="text-[11px] truncate w-full text-muted-foreground">
            {comp.name}
          </span>
        </button>
      ))}
    </div>
  );
}

// ─── Frames Tab ───────────────────────────────────────────────────────────────

function FramesTab() {
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  return (
    <ScrollArea className="h-full">
      <div className="p-2 flex flex-col gap-4">
        {CATEGORY_CONFIG.map(({ key, i18nKey, icon: CategoryIcon }) => {
          const devices = getDevicesByCategory(key);
          if (devices.length === 0) return null;
          return (
            <div key={key}>
              <div className="flex items-center gap-1.5 px-1 mb-2">
                <CategoryIcon className="size-3.5 text-muted-foreground" />
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {t(i18nKey, locale)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {devices.map((device) => (
                  <button
                    key={device.id}
                    className={cn(
                      'flex flex-col items-center gap-1 p-2.5 rounded-xl border border-border/50',
                      'hover:bg-accent/50 transition-colors text-center group cursor-pointer',
                    )}
                    onClick={() => addFrameAtCenter(device)}
                  >
                    {/* Device thumbnail */}
                    <div
                      className={cn(
                        'w-full rounded-lg bg-muted/40 border border-border/30 flex items-center justify-center overflow-hidden',
                        NEU_CARD,
                      )}
                      style={{
                        aspectRatio: `${device.width} / ${device.height}`,
                        maxHeight: 64,
                      }}
                    >
                      <div className="w-[80%] h-[80%] rounded-sm bg-background/60 border border-border/20" />
                    </div>
                    <span className="text-[10px] truncate w-full text-muted-foreground leading-tight">
                      {device.name}
                    </span>
                    <span className="text-[9px] text-muted-foreground/60">
                      {device.width}×{device.height}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

// ─── Styles Tab ───────────────────────────────────────────────────────────────

function StylesTab() {
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  const addTextElement = useCallback((preset: (typeof TEXT_STYLE_PRESETS)[number]) => {
    const { panX, panY, zoom } = useCanvasStore.getState();
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    const canvasCenterX = (viewportW / 2 - panX) / zoom - 100;
    const canvasCenterY = (viewportH / 2 - panY) / zoom - 20;

    useCanvasStore.getState().addElement('TEXT', canvasCenterX, canvasCenterY, {
      content: preset.name,
      styles: {
        typography: {
          fontFamily: preset.fontFamily,
          fontSize: preset.fontSize,
          fontWeight: preset.fontWeight,
          lineHeight: preset.lineHeight,
          letterSpacing: 0,
          textDecoration: 'none',
          color: '#1F2937',
          textAlign: 'left' as const,
          fontStyle: 'normal' as const,
          textCase: 'none' as const,
        },
      },
      name: preset.name,
    });
  }, []);

  const applyColorToSelected = useCallback((color: string) => {
    const state = useCanvasStore.getState();
    if (state.selectedIds.length === 0) return;

    for (const id of state.selectedIds) {
      const el = state.elements.find((e) => e.id === id);
      if (!el) continue;

      if (color === 'transparent') {
        state.updateElementStyles(id, {
          fills: [{ id: `fill-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`, type: 'none' as const }],
        });
      } else if (el.type === 'TEXT') {
        state.updateElementStyles(id, {
          typography: { ...(el.styles?.typography as unknown as Record<string, unknown>), color },
        });
      } else {
        state.updateElementStyles(id, {
          fills: [{ id: `fill-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`, type: 'solid' as const, color, opacity: 1 }],
        });
      }
    }
  }, []);

  return (
    <ScrollArea className="h-full">
      <div className="p-2 flex flex-col gap-4">
        {/* Color Swatches */}
        <div>
          <div className="flex items-center gap-1.5 px-1 mb-2">
            <Palette className="size-3.5 text-muted-foreground" />
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              {t('assets.colors', locale)}
            </span>
          </div>
          <div className="grid grid-cols-6 gap-1.5">
            {PRESET_COLORS.map((color, i) => (
              <button
                key={`${color}-${i}`}
                className={cn(
                  'aspect-square rounded-lg border border-border/40 transition-transform hover:scale-110 cursor-pointer',
                  NEU_CARD,
                )}
                style={{
                  backgroundColor: color === 'transparent' ? undefined : color,
                  backgroundImage:
                    color === 'transparent'
                      ? 'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%)'
                      : undefined,
                  backgroundSize: color === 'transparent' ? '6px 6px' : undefined,
                  backgroundPosition:
                    color === 'transparent' ? '0 0, 3px 3px' : undefined,
                }}
                onClick={() => applyColorToSelected(color)}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* Text Style Presets */}
        <div>
          <div className="flex items-center gap-1.5 px-1 mb-2">
            <TypeIcon className="size-3.5 text-muted-foreground" />
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              {t('assets.textStyles', locale)}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            {TEXT_STYLE_PRESETS.map((preset) => (
              <button
                key={preset.name}
                className={cn(
                  'flex flex-col gap-0.5 px-3 py-2 rounded-xl border border-border/50',
                  'hover:bg-accent/50 transition-colors text-left group cursor-pointer',
                )}
                onClick={() => addTextElement(preset)}
              >
                <span
                  className="truncate text-foreground"
                  style={{
                    fontFamily: preset.fontFamily,
                    fontSize: Math.min(preset.fontSize, 16),
                    fontWeight: preset.fontWeight,
                    lineHeight: preset.lineHeight,
                  }}
                >
                  {preset.name}
                </span>
                <span className="text-[9px] text-muted-foreground/60">
                  {preset.fontFamily.split(',')[0].trim()} · {preset.fontSize}px · {preset.fontWeight}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}

// ─── Main Assets Panel ────────────────────────────────────────────────────────

export function AssetsPanel() {
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  return (
    <div className="flex flex-col h-full">
      {/* Neumorphic tab header */}
      <div className={cn('px-3 pt-2 pb-1')}>
        <div
          className={cn(
            'rounded-xl bg-background p-1',
            NEU_HEADER,
          )}
        >
          <Tabs defaultValue="components" className="w-full">
            <TabsList className="w-full h-8 bg-transparent p-0 gap-0">
              <TabsTrigger
                value="components"
                className="flex-1 h-7 text-[11px] rounded-lg data-[state=active]:bg-accent data-[state=active]:shadow-sm"
              >
                {t('assets.components', locale)}
              </TabsTrigger>
              <TabsTrigger
                value="frames"
                className="flex-1 h-7 text-[11px] rounded-lg data-[state=active]:bg-accent data-[state=active]:shadow-sm"
              >
                {t('assets.frames', locale)}
              </TabsTrigger>
              <TabsTrigger
                value="styles"
                className="flex-1 h-7 text-[11px] rounded-lg data-[state=active]:bg-accent data-[state=active]:shadow-sm"
              >
                {t('assets.styles', locale)}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="components" className="flex-1 mt-1">
              <ScrollArea className="h-[calc(100vh-180px)]">
                <ComponentsTab />
              </ScrollArea>
            </TabsContent>

            <TabsContent value="frames" className="flex-1 mt-1">
              <FramesTab />
            </TabsContent>

            <TabsContent value="styles" className="flex-1 mt-1">
              <StylesTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}