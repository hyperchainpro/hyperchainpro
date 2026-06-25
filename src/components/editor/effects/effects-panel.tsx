'use client';

import {
  Sparkles,
  Palette,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useEffectsStore } from '@/store/effects-store';
import { EFFECT_PRESETS, EFFECT_CATEGORIES } from '@/lib/effects-presets';
import { cn } from '@/lib/utils';

interface EffectsPanelProps {
  selectedElementId: string | null;
}

export function EffectsPanel({ selectedElementId }: EffectsPanelProps) {
  const {
    elementEffects,
    elementFills,
    activeTab,
    applyPreset,
    clearEffects,
    setActiveTab,
  } = useEffectsStore();

  const currentEffects = selectedElementId ? elementEffects[selectedElementId] || [] : [];
  const hasEffects = currentEffects.length > 0;

  const presets = EFFECT_PRESETS.filter(
    (p) => activeTab === 'all' || p.category === activeTab
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <span className="text-sm font-semibold">Effects</span>
        </div>
        {hasEffects && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-destructive hover:text-destructive"
                onClick={() => selectedElementId && clearEffects(selectedElementId)}
              >
                <RotateCcw className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Clear All</TooltipContent>
          </Tooltip>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {/* Preset Grid */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full h-8 p-0.5 bg-muted/50">
              <TabsTrigger value="all" className="text-xs flex-1 h-7">
                All
              </TabsTrigger>
              {EFFECT_CATEGORIES.map((cat) => (
                <TabsTrigger
                  key={cat.key}
                  value={cat.key}
                  className="text-xs flex-1 h-7"
                >
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all" className="mt-3">
              <PresetGrid presets={presets} selectedElementId={selectedElementId} />
            </TabsContent>
            {EFFECT_CATEGORIES.map((cat) => (
              <TabsContent key={cat.key} value={cat.key} className="mt-3">
                <PresetGrid
                  presets={EFFECT_PRESETS.filter((p) => p.category === cat.key)}
                  selectedElementId={selectedElementId}
                />
              </TabsContent>
            ))}
          </Tabs>

          {/* Active Effects */}
          {hasEffects && (
            <>
              <Separator />
              <div className="space-y-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Active Effects
                </span>
                {currentEffects.map((effect) => (
                  <div
                    key={effect.id}
                    className="flex items-center justify-between px-2 py-1.5 rounded-md bg-muted/50 text-xs"
                  >
                    <span className="capitalize">{effect.type.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="text-muted-foreground font-mono">
                      {Object.entries(effect.params)
                        .map(([k, v]) => `${k}:${v}`)
                        .join(', ')}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {!selectedElementId && (
            <p className="text-xs text-center text-muted-foreground py-6">
              Select an element to apply effects
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// ─── Preset Grid ──────────────────────────────────────────────────────────

function PresetGrid({
  presets,
  selectedElementId,
}: {
  presets: typeof EFFECT_PRESETS;
  selectedElementId: string | null;
}) {
  const { applyPreset, elementEffects, elementFills } = useEffectsStore();
  const currentEffects = selectedElementId ? elementEffects[selectedElementId] || [] : [];
  const currentFill = selectedElementId ? elementFills[selectedElementId] : null;

  return (
    <div className="grid grid-cols-3 gap-2">
      {presets.map((preset) => {
        const isApplied =
          currentEffects.length === preset.effects.length &&
          currentEffects.every((e, i) => e.type === preset.effects[i]?.type);

        return (
          <Tooltip key={preset.name}>
            <TooltipTrigger asChild>
              <button
                className={cn(
                  'flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all hover:border-primary/50 hover:bg-accent/50 text-center',
                  isApplied
                    ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
                    : 'border-border/50 bg-background'
                )}
                onClick={() => selectedElementId && applyPreset(selectedElementId, preset)}
              >
                <div
                  className="w-full h-8 rounded-md bg-muted-foreground/20"
                  style={{ ...parseInlineStyle(preset.preview) }}
                />
                <span className="text-[10px] leading-tight truncate w-full capitalize">
                  {preset.name.replace(/-/g, ' ')}
                </span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs max-w-[180px]">
              {preset.description}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}

function parseInlineStyle(preview: string): React.CSSProperties {
  const styles: Record<string, string> = {};
  const pairs = preview.split(';').filter(Boolean);
  for (const pair of pairs) {
    const [key, ...valueParts] = pair.split(':');
    if (key && valueParts.length) {
      const cssKey = key.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      styles[cssKey] = valueParts.join(':').trim();
    }
  }
  return styles as React.CSSProperties;
}