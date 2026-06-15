'use client';

import { t, type Locale } from '@/lib/i18n';
import { useAuthStore } from '@/store/auth-store';
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Wand2, Palette, Loader2, Send } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { BoardElement } from '@/lib/types';

// ─── Types ────────────────────────────────────────────────────────────────

interface AIDesignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerated: (elements: BoardElement[]) => void;
  agentId?: string;
  agentName?: string;
  initialPrompt?: string;
}

const STYLE_OPTIONS = [
  { value: 'Modern', label: 'Modern', icon: '✨' },
  { value: 'Minimalist', label: 'Minimalist', icon: '◻️' },
  { value: 'Playful', label: 'Playful', icon: '🎉' },
  { value: 'Corporate', label: 'Corporate', icon: '💼' },
  { value: 'Dark Mode', label: 'Dark Mode', icon: '🌙' },
];

const COLOR_OPTIONS = [
  { value: 'Blue', label: 'Blue', swatch: '#3B82F6' },
  { value: 'Green', label: 'Green', swatch: '#22C55E' },
  { value: 'Purple', label: 'Purple', swatch: '#8B5CF6' },
  { value: 'Orange', label: 'Orange', swatch: '#F97316' },
  { value: 'Monochrome', label: 'Mono', swatch: '#1E293B' },
];

const PROMPT_SUGGESTIONS = [
  'A SaaS dashboard with sidebar navigation, KPI cards, and a chart area',
  'A mobile app login screen with email/password fields and social login buttons',
  'A landing page for a productivity app with hero section, features grid, and pricing',
  'An e-commerce product page with image gallery, product details, and reviews',
  'A settings page with profile section, toggle switches, and form fields',
  'A social media feed with post cards, avatars, like/comment buttons',
];

// ─── Hook ─────────────────────────────────────────────────────────────────

export function useAIDesign() {
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  const [dialogOpen, setDialogOpen] = useState(false);
  const [agentId, setAgentId] = useState<string | undefined>();
  const [agentName, setAgentName] = useState<string | undefined>();
  const [initialPrompt, setInitialPrompt] = useState<string | undefined>();

  const openForAgent = useCallback((id: string, name: string, prompt?: string) => {
    setAgentId(id);
    setAgentName(name);
    setInitialPrompt(prompt);
    setDialogOpen(true);
  }, []);

  const openGeneric = useCallback((prompt?: string) => {
    setAgentId(undefined);
    setAgentName(undefined);
    setInitialPrompt(prompt);
    setDialogOpen(true);
  }, []);

  return {
    dialogOpen,
    setDialogOpen,
    openForAgent,
    openGeneric,
    agentId,
    agentName,
    initialPrompt,
  };
}

// ─── Generating Animation ─────────────────────────────────────────────────

function GeneratingAnimation() {
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-4">
      <motion.div
        className="relative"
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
      </motion.div>
      <div className="text-center space-y-2">
        <p className="text-sm font-semibold text-foreground">
          {t('ai.generatingDesign', locale)}
        </p>
        <motion.div
          className="flex gap-1 justify-center"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
        >
          <motion.span
            className="w-1.5 h-1.5 rounded-full bg-purple-500"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
          />
          <motion.span
            className="w-1.5 h-1.5 rounded-full bg-purple-400"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
          />
          <motion.span
            className="w-1.5 h-1.5 rounded-full bg-purple-300"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
          />
        </motion.div>
        <p className="text-xs text-muted-foreground">
          t('ai.craftingElements', locale)
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────

export function AIDesignDialog({
  open,
  onOpenChange,
  onGenerated,
  agentId,
  agentName,
  initialPrompt,
}: AIDesignDialogProps) {
  const [prompt, setPrompt] = useState(initialPrompt || '');
  const [style, setStyle] = useState<string>('');
  const [colorScheme, setColorScheme] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';

  // Reset prompt when dialog opens with new initial prompt
  React.useEffect(() => {
    if (open && initialPrompt !== undefined) {
      setPrompt(initialPrompt);
    }
  }, [open, initialPrompt]);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setError(null);

    try {
      const body: Record<string, unknown> = { prompt: prompt.trim() };
      if (agentId) body.agentId = agentId;
      if (style) body.style = style;
      if (colorScheme) body.colorScheme = colorScheme;

      const res = await fetch('/api/ai/generate-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      if (data.elements && Array.isArray(data.elements) && data.elements.length > 0) {
        onGenerated(data.elements);
        onOpenChange(false);
        setPrompt('');
        setStyle('');
        setColorScheme('');
      } else {
        throw new Error(t('ai.noElementsGenerated', locale));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error', locale));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] gap-0 p-0 overflow-hidden">
        {/* Gradient Header */}
        <div className="relative bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-500 px-6 pt-6 pb-8">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3N2Zz4=')] opacity-50" />
          <DialogHeader className="relative">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                {agentName ? (
                  <Wand2 className="w-5 h-5 text-white" />
                ) : (
                  <Sparkles className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <DialogTitle className="text-white text-lg">
                  {agentName ? `AI Design: ${agentName}` : t('ai.designGenerator', locale)}
                </DialogTitle>
                <DialogDescription className="text-white/70 text-xs mt-0.5">
                  {t('ai.describeAndGenerate', locale)}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          {agentName && (
            <Badge className="absolute top-6 right-6 bg-white/20 text-white border-white/30 backdrop-blur-sm text-xs">
              {t('ai.agent', locale)} Mode
            </Badge>
          )}
        </div>

        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div
              key="generating"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="px-6 py-4"
            >
              <GeneratingAnimation />
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="px-6 pb-6 space-y-4"
            >
              {/* Prompt Input */}
              <div className="space-y-2">
                <Label htmlFor="ai-prompt" className="text-sm font-medium">
                  {t('ai.describeDesign', locale)}
                </Label>
                <Textarea
                  id="ai-prompt"
                  placeholder={t('ai.promptPlaceholder', locale)}
                  className="min-h-[100px] resize-none text-sm"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isGenerating}
                />
                <p className="text-[11px] text-muted-foreground">
                  <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">⌘+Enter</kbd> {t("ai.pressKeyToGenerate", locale)}
                </p>
              </div>

              {/* Suggestions */}
              {!agentId && prompt.trim().length === 0 && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">{t("ai.quickSuggestions", locale)}</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {PROMPT_SUGGESTIONS.slice(0, 3).map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSuggestionClick(s)}
                        className="text-[11px] px-2.5 py-1.5 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-left max-w-[240px] truncate border border-border/50"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Style & Color Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Wand2 className="w-3 h-3" />
                    t('ai.stylePreset', locale)
                  </Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger className="w-full h-9 text-sm">
                      <SelectValue placeholder={t('ai.auto', locale)} />
                    </SelectTrigger>
                    <SelectContent>
                      {STYLE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <span className="flex items-center gap-2">
                            <span>{opt.icon}</span>
                            {opt.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Palette className="w-3 h-3" />
                    Color Scheme
                  </Label>
                  <Select value={colorScheme} onValueChange={setColorScheme}>
                    <SelectTrigger className="w-full h-9 text-sm">
                      <SelectValue placeholder={t('ai.auto', locale)} />
                    </SelectTrigger>
                    <SelectContent>
                      {COLOR_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <span className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full inline-block border border-border"
                              style={{ backgroundColor: opt.swatch }}
                            />
                            {opt.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2"
                  >
                    <p className="text-xs text-destructive">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Generate Button */}
              <DialogFooter className="pt-2">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isGenerating}
                  className="mr-2"
                >
                  {t('common.cancel', locale)}
                </Button>
                <Button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-md shadow-purple-500/20"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  {isGenerating ? t('ai.generating', locale) : t('ai.generateDesign', locale)}
                </Button>
              </DialogFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}