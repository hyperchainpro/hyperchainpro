'use client';

import { useState } from 'react';
import {
  Code,
  Play,
  Copy,
  FileCode,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useCodeLayerStore } from '@/store/code-layer-store';
import { CODE_TEMPLATES, TEMPLATE_CATEGORIES, DEFAULT_CODE_LAYER } from '@/lib/code-layer-types';
import { cn } from '@/lib/utils';

interface CodeLayerPanelProps {
  selectedElementId: string | null;
  onInsertCodeLayer?: (template?: typeof CODE_TEMPLATES[0]) => void;
  onEditCodeLayer?: () => void;
}

export function CodeLayerPanel({
  selectedElementId,
  onInsertCodeLayer,
  onEditCodeLayer,
}: CodeLayerPanelProps) {
  const { templateFilter, setTemplateFilter } = useCodeLayerStore();
  const [copiedName, setCopiedName] = useState<string | null>(null);

  const templates = CODE_TEMPLATES.filter(
    (t) => templateFilter === 'all' || t.category === templateFilter
  );

  const handleCopy = async (name: string) => {
    try {
      await navigator.clipboard.writeText(name);
      setCopiedName(name);
      setTimeout(() => setCopiedName(null), 1500);
    } catch { /* noop */ }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/50">
        <FileCode className="size-4 text-primary" />
        <span className="text-sm font-semibold">Code Layers</span>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {/* Insert button */}
          <Button
            className="w-full gap-2"
            variant="outline"
            onClick={() => onInsertCodeLayer?.()}
            disabled={!selectedElementId}
          >
            <Code className="size-4" />
            Add Code Layer
          </Button>

          {/* Edit existing */}
          {selectedElementId && useCodeLayerStore.getState().codeLayers[selectedElementId] && (
            <Button
              className="w-full gap-2"
              variant="default"
              onClick={onEditCodeLayer}
            >
              <Play className="size-4" />
              Edit Current Layer
            </Button>
          )}

          {/* Category filter */}
          <Tabs value={templateFilter} onValueChange={setTemplateFilter} className="w-full">
            <TabsList className="w-full h-7 p-0.5 bg-muted/50">
              {TEMPLATE_CATEGORIES.map((cat) => (
                <TabsTrigger
                  key={cat.key}
                  value={cat.key}
                  className="text-[10px] flex-1 h-6 px-1"
                >
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={templateFilter} className="mt-3">
              <div className="space-y-2">
                {templates.map((template) => (
                  <Tooltip key={template.name}>
                    <TooltipTrigger asChild>
                      <button
                        className="w-full flex items-center gap-3 p-2.5 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-accent/50 transition-all text-left group"
                        onClick={() => onInsertCodeLayer?.(template)}
                      >
                        <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                          <div
                            className="w-6 h-6 rounded bg-gradient-to-br from-primary/60 to-primary/20"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate">
                            {template.name}
                          </div>
                          <div className="text-[10px] text-muted-foreground truncate">
                            {template.description}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(template.name);
                            }}
                          >
                            <Copy className="size-3" />
                          </Button>
                        </div>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      {template.category} · {template.defaultWidth}×{template.defaultHeight}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
}