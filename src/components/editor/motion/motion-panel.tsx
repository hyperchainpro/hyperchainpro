'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  Film,
  Trash2,
  Clock,
  Gauge,
  Repeat,
  ArrowRightLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useMotionStore } from '@/store/motion-store';
import {
  MOTION_PRESETS,
  PRESET_CATEGORIES,
  getPresetByName,
} from '@/lib/motion-presets';
import { MotionPreviewBox } from './motion-preview';
import type { EasingType, AnimationDirection } from '@/lib/motion-types';

interface MotionPanelProps {
  selectedElementId: string | null;
}

const EASING_OPTIONS: { value: EasingType; label: string }[] = [
  { value: 'linear', label: 'Linear' },
  { value: 'easeIn', label: 'Ease In' },
  { value: 'easeOut', label: 'Ease Out' },
  { value: 'easeInOut', label: 'Ease In Out' },
  { value: 'spring', label: 'Spring' },
  { value: 'elastic', label: 'Elastic' },
  { value: 'bounce', label: 'Bounce' },
  { value: 'backOut', label: 'Back Out' },
  { value: 'circOut', label: 'Circular' },
];

const DIRECTION_OPTIONS: { value: AnimationDirection; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'reverse', label: 'Reverse' },
  { value: 'alternate', label: 'Alternate' },
  { value: 'alternate-reverse', label: 'Alt. Reverse' },
];

export function MotionPanel({ selectedElementId }: MotionPanelProps) {
  const {
    animations,
    isPlaying,
    activeTab,
    addAnimation,
    removeAnimation,
    setDuration,
    setDelay,
    setEasing,
    setLoop,
    setDirection,
    playAll,
    pauseAll,
    resetAll,
    setActiveTab,
  } = useMotionStore();

  const currentAnimation = selectedElementId ? animations[selectedElementId] : null;

  const presets = useMemo(() => {
    if (activeTab === 'all') return MOTION_PRESETS;
    return MOTION_PRESETS.filter((p) => p.category === activeTab);
  }, [activeTab]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Film className="size-4 text-primary" />
          <span className="text-sm font-semibold">Motion</span>
        </div>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={isPlaying ? pauseAll : playAll}
              >
                {isPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isPlaying ? 'Pause All' : 'Play All'}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="size-7" onClick={resetAll}>
                <RotateCcw className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset All</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {/* Preset Selection */}
          <div>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="w-full h-8 p-0.5 bg-muted/50">
                <TabsTrigger value="all" className="text-xs flex-1 h-7">
                  All
                </TabsTrigger>
                {PRESET_CATEGORIES.map((cat) => (
                  <TabsTrigger
                    key={cat.key}
                    value={cat.key}
                    className="text-xs flex-1 h-7"
                  >
                    {cat.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {PRESET_CATEGORIES.map((cat) => (
                <TabsContent key={cat.key} value={cat.key} className="mt-3">
                  <div className="grid grid-cols-4 gap-2">
                    {getPresetsByCategory(cat.key).map((preset) => (
                      <PresetCard
                        key={preset.name}
                        preset={preset}
                        isSelected={currentAnimation?.presetName === preset.name}
                        onApply={() =>
                          selectedElementId && addAnimation(selectedElementId, preset)
                        }
                        onRemove={() =>
                          selectedElementId && removeAnimation(selectedElementId)
                        }
                        canRemove={currentAnimation?.presetName === preset.name}
                      />
                    ))}
                  </div>
                </TabsContent>
              ))}
              <TabsContent value="all" className="mt-3">
                <div className="grid grid-cols-4 gap-2">
                  {presets.map((preset) => (
                    <PresetCard
                      key={preset.name}
                      preset={preset}
                      isSelected={currentAnimation?.presetName === preset.name}
                      onApply={() =>
                        selectedElementId && addAnimation(selectedElementId, preset)
                      }
                      onRemove={() =>
                        selectedElementId && removeAnimation(selectedElementId)
                      }
                      canRemove={currentAnimation?.presetName === preset.name}
                    />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Animation Controls */}
          <AnimatePresence>
            {currentAnimation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Separator className="my-3" />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      Settings
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs text-destructive hover:text-destructive"
                      onClick={() =>
                        selectedElementId && removeAnimation(selectedElementId)
                      }
                    >
                      <Trash2 className="size-3 mr-1" />
                      Remove
                    </Button>
                  </div>

                  {/* Duration */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="size-3" />
                        Duration
                      </span>
                      <span className="font-mono tabular-nums">
                        {(currentAnimation.duration / 1000).toFixed(1)}s
                      </span>
                    </div>
                    <Slider
                      value={[currentAnimation.duration]}
                      min={100}
                      max={5000}
                      step={50}
                      onValueChange={([v]) =>
                        selectedElementId && setDuration(selectedElementId, v)
                      }
                      className="w-full"
                    />
                  </div>

                  {/* Delay */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Gauge className="size-3" />
                        Delay
                      </span>
                      <span className="font-mono tabular-nums">
                        {(currentAnimation.delay / 1000).toFixed(1)}s
                      </span>
                    </div>
                    <Slider
                      value={[currentAnimation.delay]}
                      min={0}
                      max={3000}
                      step={50}
                      onValueChange={([v]) =>
                        selectedElementId && setDelay(selectedElementId, v)
                      }
                      className="w-full"
                    />
                  </div>

                  {/* Easing */}
                  <div className="space-y-1.5">
                    <span className="text-xs text-muted-foreground">Easing</span>
                    <Select
                      value={currentAnimation.easing}
                      onValueChange={(v) =>
                        selectedElementId &&
                        setEasing(selectedElementId, v as EasingType)
                      }
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EASING_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value} className="text-xs">
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Direction */}
                  <div className="space-y-1.5">
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <ArrowRightLeft className="size-3" />
                      Direction
                    </span>
                    <Select
                      value={currentAnimation.direction}
                      onValueChange={(v) =>
                        selectedElementId &&
                        setDirection(selectedElementId, v as AnimationDirection)
                      }
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DIRECTION_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value} className="text-xs">
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Loop */}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Repeat className="size-3" />
                      Loop
                    </span>
                    <Switch
                      checked={currentAnimation.loop}
                      onCheckedChange={(checked) =>
                        selectedElementId && setLoop(selectedElementId, checked)
                      }
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* No selection hint */}
          {!selectedElementId && (
            <p className="text-xs text-center text-muted-foreground py-6">
              Select an element to apply motion
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// ─── Preset Card ──────────────────────────────────────────────────────────

function PresetCard({
  preset,
  isSelected,
  onApply,
  onRemove,
  canRemove,
}: {
  preset: AnimationPreset;
  isSelected: boolean;
  onApply: () => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const fullPreset = getPresetByName(preset.name) ?? preset;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          className={cn(
            'flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all hover:border-primary/50 hover:bg-accent/50',
            isSelected
              ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
              : 'border-border/50 bg-background'
          )}
          onClick={canRemove ? onRemove : onApply}
        >
          <MotionPreviewBox preset={fullPreset} size={32} />
          <span className="text-[10px] leading-tight text-center truncate w-full">
            {preset.label}
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {canRemove ? `Remove ${preset.label}` : `Apply ${preset.label}`}
      </TooltipContent>
    </Tooltip>
  );
}