'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Sparkles,
  Wand2,
  Palette,
  Loader2,
  Send,
  Check,
  Bot,
  User as UserIcon,
  Search,
  Plus,
  ChevronRight,
  Layers,
  Type,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAppStore } from '@/store/app-store';
import { useAuthStore } from '@/store/auth-store';
import { t, type Locale } from '@/lib/i18n';
import { toast } from 'sonner';
import type { BoardElement } from '@/lib/types';

// ─── Types ────────────────────────────────────────────────────────────────

interface AIAgent {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  isBuiltIn: boolean;
  usageCount: number;
}

interface AIDesignPageProps {
  onBack: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────

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
  { text: 'A SaaS dashboard with sidebar navigation, KPI cards, and a chart area', category: 'Dashboard' },
  { text: 'A mobile app login screen with email/password fields and social login buttons', category: 'Mobile' },
  { text: 'A landing page for a productivity app with hero section, features grid, and pricing', category: 'Landing' },
  { text: 'An e-commerce product page with image gallery, product details, and reviews', category: 'E-commerce' },
  { text: 'A settings page with profile section, toggle switches, and form fields', category: 'Settings' },
  { text: 'A social media feed with post cards, avatars, like/comment buttons', category: 'Social' },
];

// ─── Generating Animation ─────────────────────────────────────────────────

function GeneratingAnimation({ agentName, locale }: { agentName?: string; locale: Locale }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center py-16 gap-6"
    >
      <motion.div
        className="relative"
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      >
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center shadow-2xl shadow-purple-500/30">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
      </motion.div>
      <div className="text-center space-y-3">
        <p className="text-lg font-semibold text-foreground">
          {t('ai.generatingDesign', locale)}
        </p>
        <p className="text-sm text-muted-foreground">
          {agentName
            ? `${agentName} ${t('ai.craftingElements', locale)}`
            : `AI ${t('ai.craftingElements', locale)}`}
        </p>
        <motion.div
          className="flex gap-1.5 justify-center"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
        >
          <motion.span
            className="w-2 h-2 rounded-full bg-purple-500"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
          />
          <motion.span
            className="w-2 h-2 rounded-full bg-purple-400"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
          />
          <motion.span
            className="w-2 h-2 rounded-full bg-purple-300"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── Summary View (after generation) ──────────────────────────────────────

function GenerationSummary({
  elements,
  boardName,
  agentName,
  onOpenInEditor,
  onStartOver,
}: {
  elements: BoardElement[];
  boardName: string;
  agentName?: string;
  onOpenInEditor: () => void;
  onStartOver: () => void;
}) {
  const locale = (useAuthStore(s => s.user)?.language as Locale) ?? 'en';

  const typeCounts: Record<string, number> = {};
  for (const el of elements) {
    typeCounts[el.type] = (typeCounts[el.type] || 0) + 1;
  }

  const totalElements = elements.length;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-12 gap-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
        className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center"
      >
        <Check className="w-8 h-8 text-emerald-500" />
      </motion.div>

      <div className="text-center space-y-2 max-w-md">
        <h3 className="text-xl font-bold text-foreground">
          {t('ai.designGenerated', locale) || 'Design Generated!'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {boardName} — {totalElements} {t('ai.elementsCreated', locale)}{agentName ? ` ${t('ai.withAgent', locale, { name: agentName })}` : ''}
        </p>
      </div>

      {/* Element breakdown */}
      <div className="flex flex-wrap justify-center gap-2 max-w-sm">
        {Object.entries(typeCounts).map(([type, count]) => (
          <Badge key={type} variant="secondary" className="gap-1.5 text-xs">
            {type}
            <span className="font-mono text-muted-foreground">{count}</span>
          </Badge>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onStartOver}>
          {t('ai.startOver', locale)}
        </Button>
        <Button
          onClick={onOpenInEditor}
          className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-purple-500/20"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {t('ai.openInEditor', locale)}
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Agent Card ───────────────────────────────────────────────────────────

function AgentCard({
  agent,
  isSelected,
  onSelect,
  locale,
}: {
  agent: AIAgent;
  isSelected: boolean;
  onSelect: () => void;
  locale: Locale;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onSelect}
      className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
        isSelected
          ? 'border-violet-500/50 bg-violet-500/5 shadow-sm shadow-violet-500/10'
          : 'border-border/50 bg-card hover:border-border hover:bg-accent/50'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
          style={{ backgroundColor: `${agent.color}15` }}
        >
          {agent.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold truncate">{agent.name}</span>
            {agent.isBuiltIn && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {t('ai.builtIn', locale)}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {agent.description}
          </p>
          {agent.usageCount > 0 && (
            <p className="text-[10px] text-muted-foreground/70 mt-1">
              {agent.usageCount} {t('ai.uses', locale)}
            </p>
          )}
        </div>
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center shrink-0 mt-1"
          >
            <Check className="w-3 h-3 text-white" />
          </motion.div>
        )}
      </div>
    </motion.button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────

export function AIDesignPage({ onBack }: AIDesignPageProps) {
  const locale = (useAuthStore(s => s.user)?.language as Locale) ?? 'en';
  const user = useAuthStore(s => s.user);

  // State
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<string>('');
  const [colorScheme, setColorScheme] = useState<string>('');
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [agentsLoading, setAgentsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedElements, setGeneratedElements] = useState<BoardElement[] | null>(null);
  const [generatedBoardId, setGeneratedBoardId] = useState<string | null>(null);
  const [agentSearch, setAgentSearch] = useState('');

  // Fetch agents on mount
  useEffect(() => {
    async function fetchAgents() {
      try {
        setAgentsLoading(true);
        const res = await fetch('/api/ai/agents');
        if (res.ok) {
          const data = await res.json();
          setAgents(data.agents || []);
        }
      } catch {
        // Silently fail - agents are optional
      } finally {
        setAgentsLoading(false);
      }
    }
    fetchAgents();
  }, []);

  const filteredAgents = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(agentSearch.toLowerCase()) ||
      a.description.toLowerCase().includes(agentSearch.toLowerCase()),
  );

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedElements(null);

    try {
      // Step 1: Call AI generate endpoint
      const body: Record<string, unknown> = { prompt: prompt.trim() };
      if (selectedAgent) body.agentId = selectedAgent.id;
      if (style) body.style = style;
      if (colorScheme) body.colorScheme = colorScheme;

      const genRes = await fetch('/api/ai/generate-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const genData = await genRes.json();

      if (!genRes.ok) {
        throw new Error(genData.error || 'Generation failed');
      }

      if (!genData.elements || !Array.isArray(genData.elements) || genData.elements.length === 0) {
        throw new Error('No elements were generated');
      }

      // Step 2: Create a new board
      const boardName = prompt.trim().slice(0, 50) + (prompt.trim().length > 50 ? '...' : '');
      const boardRes = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: boardName,
          description: `AI generated: ${prompt.trim()}`,
        }),
      });

      if (!boardRes.ok) throw new Error('Failed to create board');
      const boardData = await boardRes.json();

      // Step 3: Save elements to the board's initial commit
      // The elements will be loaded when the editor opens
      setGeneratedElements(genData.elements);
      setGeneratedBoardId(boardData.board.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, isGenerating, selectedAgent, style, colorScheme]);

  const handleOpenInEditor = useCallback(() => {
    if (!generatedBoardId || !generatedElements) return;

    const store = useAppStore.getState();
    store.openBoard(generatedBoardId);

    // Set elements on the canvas store after a short delay to ensure the editor is mounted
    setTimeout(() => {
      // We need to import canvas-store dynamically to avoid circular deps
      import('@/store/canvas-store').then(({ useCanvasStore }) => {
        useCanvasStore.getState().loadElements(generatedElements);
      });
    }, 500);
  }, [generatedBoardId, generatedElements]);

  const handleStartOver = useCallback(() => {
    setGeneratedElements(null);
    setGeneratedBoardId(null);
    setPrompt('');
    setStyle('');
    setColorScheme('');
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 md:px-6 h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-1.5"
        >
          <ArrowLeft className="size-4" />
          <span className="hidden sm:inline">{t('common.back', locale)}</span>
        </Button>

        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold leading-none">
              {t('ai.aiDesign', locale)}
            </h1>
            <p className="text-[11px] text-muted-foreground mt-0.5 hidden sm:block">
              {t('ai.describeAndGenerate', locale)}
            </p>
          </div>
        </div>

        <div className="ml-auto">
          {selectedAgent && (
            <Badge variant="secondary" className="gap-1.5">
              <Bot className="w-3 h-3" />
              {selectedAgent.name}
            </Badge>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Panel - Agent Selection (desktop) */}
        <aside className="hidden md:flex w-72 lg:w-80 border-r flex-col shrink-0 bg-muted/20">
          <div className="p-4 pb-3">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Bot className="w-4 h-4 text-muted-foreground" />
              {t('ai.agents', locale)}
            </h2>
          </div>

          {/* Search agents */}
          <div className="px-4 pb-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder={t('ai.searchAgents', locale)}
                value={agentSearch}
                onChange={(e) => setAgentSearch(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-sm bg-background border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          {/* Agent List */}
          <ScrollArea className="flex-1 px-4 pb-4">
            {agentsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {/* Default agent option */}
                <AgentCard
                  agent={{
                    id: '',
                    name: t('ai.defaultAI', locale),
                    description: t('ai.defaultAIDesc', locale),
                    icon: '🤖',
                    color: '#8B5CF6',
                    isBuiltIn: true,
                    usageCount: 0,
                  }}
                  isSelected={selectedAgent === null}
                  onSelect={() => setSelectedAgent(null)}
                  locale={locale}
                />

                {filteredAgents.map((agent) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    isSelected={selectedAgent?.id === agent.id}
                    onSelect={() => setSelectedAgent(agent)}
                    locale={locale}
                  />
                ))}

                {filteredAgents.length === 0 && agentSearch && (
                  <div className="flex flex-col items-center py-8 text-muted-foreground">
                    <Search className="w-6 h-6 mb-2 opacity-40" />
                    <p className="text-xs">No agents found</p>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </aside>

        {/* Center - Prompt & Controls */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto w-full px-4 md:px-8 py-8 md:py-12">
              <AnimatePresence mode="wait">
                {generatedElements ? (
                  <GenerationSummary
                    elements={generatedElements}
                    boardName={prompt.trim().slice(0, 40)}
                    agentName={selectedAgent?.name}
                    onOpenInEditor={handleOpenInEditor}
                    onStartOver={handleStartOver}
                    locale={locale}
                  />
                ) : isGenerating ? (
                  <GeneratingAnimation agentName={selectedAgent?.name} locale={locale} />
                ) : (
                  <motion.div
                    key="prompt-form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    {/* Mobile Agent Selector */}
                    <div className="md:hidden">
                      <Label className="text-sm font-medium mb-2 block flex items-center gap-1.5">
                        <Bot className="w-3.5 h-3.5 text-muted-foreground" />
                        {t('ai.agent', locale)}
                      </Label>
                      <Select
                        value={selectedAgent?.id || '__default__'}
                        onValueChange={(v) => {
                          if (v === '__default__') {
                            setSelectedAgent(null);
                          } else {
                            const found = agents.find((a) => a.id === v);
                            if (found) setSelectedAgent(found);
                          }
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t('ai.defaultAI', locale)} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__default__">🤖 {t('ai.defaultAI', locale)}</SelectItem>
                          {agents.map((agent) => (
                            <SelectItem key={agent.id} value={agent.id}>
                              <span className="flex items-center gap-2">
                                <span>{agent.icon}</span>
                                {agent.name}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Prompt Input */}
                    <div className="space-y-2">
                      <Label htmlFor="ai-prompt-main" className="text-sm font-medium flex items-center gap-1.5">
                        <Wand2 className="w-3.5 h-3.5 text-muted-foreground" />
                        {t('ai.describeDesign', locale)}
                      </Label>
                      <Textarea
                        id="ai-prompt-main"
                        placeholder={t('ai.promptPlaceholder', locale)}
                        className="min-h-[140px] resize-none text-sm leading-relaxed"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isGenerating}
                      />
                      <p className="text-[11px] text-muted-foreground">
                        {t('ai.pressKeyToGenerate', locale)}
                      </p>
                    </div>

                    {/* Suggestions */}
                    {prompt.trim().length === 0 && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Zap className="w-3 h-3" />
                          {t('ai.quickSuggestions', locale)}
                        </Label>
                        <div className="flex flex-col gap-1.5">
                          {PROMPT_SUGGESTIONS.map((s) => (
                            <button
                              key={s.text}
                              onClick={() => handleSuggestionClick(s.text)}
                              className="group text-left text-xs px-3 py-2.5 rounded-lg bg-muted/40 hover:bg-muted border border-border/40 hover:border-border transition-all"
                            >
                              <div className="flex items-start gap-2">
                                <Badge variant="outline" className="text-[10px] shrink-0 mt-0.5">
                                  {s.category}
                                </Badge>
                                <span className="text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
                                  {s.text}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Style & Color Row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Wand2 className="w-3 h-3" />
                          {t('ai.stylePreset', locale)}
                        </Label>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            onClick={() => setStyle('')}
                            className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                              !style
                                ? 'border-primary bg-primary/10 text-primary font-medium'
                                : 'border-border hover:border-border bg-card text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            {t('ai.auto', locale)}
                          </button>
                          {STYLE_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => setStyle(style === opt.value ? '' : opt.value)}
                              className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                                style === opt.value
                                  ? 'border-primary bg-primary/10 text-primary font-medium'
                                  : 'border-border hover:border-border bg-card text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              <span className="mr-1">{opt.icon}</span>
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Palette className="w-3 h-3" />
                          {t('ai.colorScheme', locale)}
                        </Label>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            onClick={() => setColorScheme('')}
                            className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                              !colorScheme
                                ? 'border-primary bg-primary/10 text-primary font-medium'
                                : 'border-border hover:border-border bg-card text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            {t('ai.auto', locale)}
                          </button>
                          {COLOR_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => setColorScheme(colorScheme === opt.value ? '' : opt.value)}
                              className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                                colorScheme === opt.value
                                  ? 'border-primary bg-primary/10 text-primary font-medium'
                                  : 'border-border hover:border-border bg-card text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              <span
                                className="w-3 h-3 rounded-full inline-block border border-border"
                                style={{ backgroundColor: opt.swatch }}
                              />
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Error */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3"
                        >
                          <p className="text-sm text-destructive">{error}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Fixed Bottom Bar with Generate Button */}
          {!generatedElements && (
            <div className="shrink-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-8 py-4">
              <div className="max-w-3xl mx-auto flex items-center gap-3">
                <div className="flex-1 text-xs text-muted-foreground hidden sm:block truncate">
                  {prompt.trim()
                    ? prompt.trim().slice(0, 80) + (prompt.trim().length > 80 ? '...' : '')
                    : t('ai.enterPromptToStart', locale)}
                </div>
                <Button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                  size="lg"
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-purple-500/20 disabled:opacity-50 min-w-[160px]"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('ai.generating', locale)}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      {t('ai.generateDesign', locale)}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </main>

        {/* Right Panel - Preview / Info (desktop only) */}
        <aside className="hidden lg:flex w-72 border-l flex-col shrink-0 bg-muted/20">
          <div className="p-4 pb-3">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Layers className="w-4 h-4 text-muted-foreground" />
              {t('ai.designInfo', locale)}
            </h2>
          </div>

          <ScrollArea className="flex-1 px-4 pb-4">
            <div className="space-y-4">
              {/* Selected Agent Info */}
              <div className="rounded-xl border bg-card p-4 space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t('ai.activeAgent', locale)}
                </h3>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                    style={{
                      backgroundColor: `${selectedAgent?.color || '#8B5CF6'}15`,
                    }}
                  >
                    {selectedAgent?.icon || '🤖'}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {selectedAgent?.name || t('ai.defaultAI', locale)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {selectedAgent?.description || t('ai.standardAIDesc', locale)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Style Settings Summary */}
              {(style || colorScheme) && (
                <div className="rounded-xl border bg-card p-4 space-y-3">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t('ai.settings', locale)}
                  </h3>
                  {style && (
                    <div className="flex items-center gap-2 text-sm">
                      <Wand2 className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">{t('ai.style', locale)}</span>
                      <span className="font-medium">{style}</span>
                    </div>
                  )}
                  {colorScheme && (
                    <div className="flex items-center gap-2 text-sm">
                      <Palette className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">{t('ai.colors', locale)}</span>
                      <span className="flex items-center gap-1.5 font-medium">
                        <span
                          className="w-3 h-3 rounded-full inline-block"
                          style={{
                            backgroundColor:
                              COLOR_OPTIONS.find((c) => c.value === colorScheme)?.swatch,
                          }}
                        />
                        {colorScheme}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Tips */}
              <div className="rounded-xl border bg-card p-4 space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t('ai.tips', locale)}
                </h3>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Type className="w-3.5 h-3.5 mt-0.5 shrink-0 text-violet-500" />
                    {t('ai.tip1', locale)}
                  </li>
                  <li className="flex items-start gap-2">
                    <Layers className="w-3.5 h-3.5 mt-0.5 shrink-0 text-violet-500" />
                    {t('ai.tip2', locale)}
                  </li>
                  <li className="flex items-start gap-2">
                    <Palette className="w-3.5 h-3.5 mt-0.5 shrink-0 text-violet-500" />
                    {t('ai.tip3', locale)}
                  </li>
                  <li className="flex items-start gap-2">
                    <Bot className="w-3.5 h-3.5 mt-0.5 shrink-0 text-violet-500" />
                    {t('ai.tip4', locale)}
                  </li>
                </ul>
              </div>
            </div>
          </ScrollArea>
        </aside>
      </div>
    </div>
  );
}