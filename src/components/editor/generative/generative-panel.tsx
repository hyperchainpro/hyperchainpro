'use client';

import { useState, useCallback } from 'react';
import {
  Wand2,
  Sparkles,
  LayoutGrid,
  BarChart3,
  Shapes,
  Abstract,
  Grip,
  Loader2,
  Plus,
  RotateCcw,
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useGenerativeStore } from '@/store/generative-store';

interface GenerativePanelProps {
  selectedElementId: string | null;
  onAddToCanvas?: (elements: Array<{
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
    content: string;
    color: string;
    rotation?: number;
    opacity?: number;
  }>) => void;
}

const PATTERN_TYPES = [
  { value: 'geometric', label: 'Geometric', icon: Shapes },
  { value: 'organic', label: 'Organic', icon: Sparkles },
  { value: 'data-viz', label: 'Data Viz', icon: BarChart3 },
  { value: 'abstract', label: 'Abstract', icon: Abstract },
  { value: 'mosaic', label: 'Mosaic', icon: Grip },
];

const STYLES = [
  { value: 'minimal', label: 'Minimal' },
  { value: 'bold', label: 'Bold' },
  { value: 'playful', label: 'Playful' },
  { value: 'elegant', label: 'Elegant' },
  { value: 'retro', label: 'Retro' },
  { value: 'futuristic', label: 'Futuristic' },
];

export function GenerativePanel({ onAddToCanvas }: GenerativePanelProps) {
  const {
    patternType,
    style,
    color1,
    color2,
    color3,
    density,
    isGenerating,
    generatedSvg,
    generatedElements,
    error,
    setPatternType,
    setStyle,
    setColor1,
    setColor2,
    setColor3,
    setDensity,
    reset,
  } = useGenerativeStore();

  const [previewLoading, setPreviewLoading] = useState(false);

  const generate = useCallback(async () => {
    setPreviewLoading(true);
    try {
      const res = await fetch('/api/ai/generate-pattern', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: patternType,
          style,
          colors: [color1, color2, color3],
          count: density,
          canvasWidth: 320,
          canvasHeight: 240,
        }),
      });
      const data = await res.json();
      if (data.svg) {
        useGenerativeStore.getState().setGeneratedSvg(data.svg);
        useGenerativeStore.getState().setGeneratedElements(data.elements);
        useGenerativeStore.getState().setError(null);
      } else if (data.error) {
        useGenerativeStore.getState().setError(data.error);
      }
    } catch {
      useGenerativeStore.getState().setError('Generation failed');
    } finally {
      setPreviewLoading(false);
    }
  }, [patternType, style, color1, color2, color3, density]);

  const handleAddToCanvas = () => {
    if (generatedElements && onAddToCanvas) {
      onAddToCanvas(generatedElements);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/50">
        <Wand2 className="size-4 text-primary" />
        <span className="text-sm font-semibold">Generate</span>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {/* Pattern Type */}
          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground">Pattern Type</span>
            <div className="grid grid-cols-3 gap-1.5">
              {PATTERN_TYPES.map((pt) => {
                const Icon = pt.icon;
                return (
                  <button
                    key={pt.value}
                    className={cn(
                      'flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-all',
                      patternType === pt.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border/50 hover:border-primary/50 hover:bg-accent/50'
                    )}
                    onClick={() => setPatternType(pt.value)}
                  >
                    <Icon className="size-4" />
                    {pt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Style */}
          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground">Style</span>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STYLES.map((s) => (
                  <SelectItem key={s.value} value={s.value} className="text-xs">
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Colors */}
          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground">Colors</span>
            <div className="flex items-center gap-2">
              {[
                { value: color1, onChange: setColor1, label: '1' },
                { value: color2, onChange: setColor2, label: '2' },
                { value: color3, onChange: setColor3, label: '3' },
              ].map((c) => (
                <div key={c.label} className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={c.value}
                    onChange={(e) => c.onChange(e.target.value)}
                    className="size-7 rounded border border-border cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Density */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Density</span>
              <span className="font-mono tabular-nums">{density}</span>
            </div>
            <Slider
              value={[density]}
              min={3}
              max={30}
              step={1}
              onValueChange={([v]) => setDensity(v)}
              className="w-full"
            />
          </div>

          {/* Generate button */}
          <Button
            className="w-full gap-2"
            onClick={generate}
            disabled={previewLoading}
          >
            {previewLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {previewLoading ? 'Generating...' : 'Generate Pattern'}
          </Button>

          {/* Error */}
          {error && (
            <p className="text-xs text-destructive text-center">{error}</p>
          )}

          {/* Preview */}
          {generatedSvg && (
            <>
              <Separator />
              <div className="space-y-2">
                <span className="text-xs text-muted-foreground">Preview</span>
                <div
                  className="rounded-lg border border-border/50 overflow-hidden bg-background"
                  dangerouslySetInnerHTML={{ __html: generatedSvg }}
                  style={{ maxHeight: 200 }}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  className="flex-1 gap-2"
                  size="sm"
                  onClick={handleAddToCanvas}
                  disabled={!generatedElements}
                >
                  <Plus className="size-3.5" />
                  Add to Canvas
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    reset();
                  }}
                >
                  <RotateCcw className="size-3.5" />
                </Button>
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}