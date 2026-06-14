'use client';

import { t, type Locale } from '@/lib/i18n';
import { useAuthStore } from '@/store/auth-store';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, X, Eye, Palette, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

// ─── Types ────────────────────────────────────────────────────────────────

interface AgentData {
  id?: string;
  name: string;
  description: string;
  systemPrompt: string;
  icon: string;
  color: string;
  isPublic: boolean;
}

interface AIAgentEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent?: {
    id: string;
    name: string;
    description: string | null;
    systemPrompt: string;
    icon: string | null;
    color: string;
    isPublic: boolean;
  } | null;
  onSaved: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────

const ICON_OPTIONS = [
  '🤖', '🎨', '📐', '📱', '🚀', '📊', '✏️', '🎯',
  '💡', '🔧', '🏗️', '🖥️', '📦', '🧩', '🌐', '⚡',
  '🎨', '🎭', '🎪', '🌟', '🔮', '🧠', '💎', '🏆',
];

const COLOR_OPTIONS = [
  { value: '#3B82F6', label: 'Blue' },
  { value: '#22C55E', label: 'Green' },
  { value: '#8B5CF6', label: 'Purple' },
  { value: '#F97316', label: 'Orange' },
  { value: '#EF4444', label: 'Red' },
  { value: '#EC4899', label: 'Pink' },
  { value: '#14B8A6', label: 'Teal' },
  { value: '#F59E0B', label: 'Amber' },
  { value: '#6366F1', label: 'Indigo' },
  { value: '#64748B', label: 'Slate' },
];

const EMPTY_FORM: AgentData = {
  name: '',
  description: '',
  systemPrompt: `You are a specialized UI design assistant. You create board element layouts from text descriptions.

You MUST respond with a JSON object containing an "elements" array.
Each element must have: type, x, y, width, height, rotation, content, color, name, zIndex, locked, visible, styles.

Valid types: RECTANGLE, CIRCLE, ELLIPSE, TEXT, LINE, IMAGE, FRAME, PEN_PATH, STICKY_NOTE, CONNECTOR, STAR, POLYGON

Respond ONLY with JSON: { "elements": [...] }`,
  icon: '🤖',
  color: '#8B5CF6',
  isPublic: false,
};

// ─── Component ────────────────────────────────────────────────────────────

export function AIAgentEditor({ open, onOpenChange, agent, onSaved }: AIAgentEditorProps) {
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  const [form, setForm] = useState<AgentData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (open) {
      if (agent) {
        setForm({
          id: agent.id,
          name: agent.name,
          description: agent.description || '',
          systemPrompt: agent.systemPrompt,
          icon: agent.icon || '🤖',
          color: agent.color || '#8B5CF6',
          isPublic: agent.isPublic,
        });
      } else {
        setForm({ ...EMPTY_FORM });
      }
      setError(null);
      setShowPreview(false);
    }
  }, [open, agent]);

  const updateField = <K extends keyof AgentData>(key: K, value: AgentData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError(t('ai.agentNameRequired', locale));
      return;
    }
    if (!form.systemPrompt.trim()) {
      setError(t('ai.systemPromptRequired', locale));
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const url = form.id ? `/api/ai/agents/${form.id}` : '/api/ai/agents';
      const method = form.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description || undefined,
          systemPrompt: form.systemPrompt,
          icon: form.icon,
          color: form.color,
          isPublic: form.isPublic,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || t('ai.failedToSaveAgent', locale));
      }

      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('ai.failedToSaveAgent', locale));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] gap-0 p-0 overflow-hidden max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-500 px-6 pt-6 pb-5 shrink-0">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3N2Zz4=')] opacity-50" />
          <DialogHeader className="relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-white text-lg">
                    {agent ? t('ai.editAgent', locale) : t('ai.createAgentTitle', locale)}
                  </DialogTitle>
                  <DialogDescription className="text-white/70 text-xs mt-0.5">
                    {agent ? t('ai.updateAgentDesc', locale) : t('ai.configureAgentDesc', locale)}
                  </DialogDescription>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowPreview(!showPreview)}
                className="bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                <Eye className="w-3.5 h-3.5 mr-1.5" />
                {showPreview ? t('ai.edit', locale) : t('ai.preview', locale)}
              </Button>
            </div>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {showPreview ? (
            <PreviewCard agent={form} />
          ) : (
            <div className="px-6 py-5 space-y-5">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="agent-name" className="text-sm font-medium">
                  {t("ai.agentName", locale)} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="agent-name"
                  placeholder={t('ai.agentNamePlaceholder', locale)}
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="h-9 text-sm"
                />
              </div>

              {/* {t("ai.description", locale)} */}
              <div className="space-y-2">
                <Label htmlFor="agent-desc" className="text-sm font-medium">
                  {t("ai.description", locale)}
                </Label>
                <Input
                  id="agent-desc"
                  placeholder={t('agent.descriptionPlaceholder', locale)}
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  className="h-9 text-sm"
                />
              </div>

              {/* System Prompt */}
              <div className="space-y-2">
                <Label htmlFor="agent-prompt" className="text-sm font-medium">
                  {t("ai.systemPrompt", locale)} <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="agent-prompt"
                  placeholder={t('agent.systemPromptPlaceholder', locale)}
                  className="min-h-[200px] resize-y text-sm font-mono"
                  value={form.systemPrompt}
                  onChange={(e) => updateField('systemPrompt', e.target.value)}
                />
                <p className="text-[11px] text-muted-foreground">
                  t('ai.systemPromptHint', locale)
                </p>
              </div>

              {/* Icon Picker */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  Icon
                </Label>
                <div className="flex flex-wrap gap-1.5">
                  {ICON_OPTIONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => updateField('icon', icon)}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all ${
                        form.icon === icon
                          ? 'ring-2 ring-purple-500 bg-purple-50 scale-110'
                          : 'hover:bg-muted'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Picker */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5" />
                  {t('ai.color', locale)}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => updateField('color', opt.value)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-all ${
                        form.color === opt.value
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-border hover:border-muted-foreground/30'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full"
                        style={{ backgroundColor: opt.value }}
                      />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Visibility */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => updateField('isPublic', !form.isPublic)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    form.isPublic ? 'bg-purple-600' : 'bg-muted'
                  }`}
                >
                  <motion.span
                    className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm"
                    animate={{ left: form.isPublic ? 22 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
                <Label className="text-sm cursor-pointer" onClick={() => updateField('isPublic', !form.isPublic)}>
                  {t("ai.makePublic", locale)}
                </Label>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2">
                  <p className="text-xs text-destructive">{error}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t bg-muted/30 shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            <X className="w-3.5 h-3.5 mr-1.5" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !form.name.trim() || !form.systemPrompt.trim()}
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-md shadow-purple-500/20"
          >
            {saving ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              </motion.div>
            ) : (
              <Save className="w-3.5 h-3.5 mr-1.5" />
            )}
            {agent ? t('ai.updateAgent', locale) : t('ai.createAgent', locale)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Preview Card ─────────────────────────────────────────────────────────

function PreviewCard({ agent }: { agent: AgentData }) {
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  return (
    <div className="px-6 py-8 flex items-start justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm rounded-2xl border border-border/60 bg-card p-5"
        style={{
          boxShadow: '4px 4px 8px rgba(0,0,0,0.06), -4px -4px 8px rgba(255,255,255,0.8)',
        }}
      >
        <div className="flex items-start gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{
              backgroundColor: `${agent.color}15`,
              border: `1px solid ${agent.color}30`,
            }}
          >
            {agent.icon}
          </div>
          <div className="min-w-0">
            <h4 className="font-semibold text-sm truncate">
              {agent.name || t('ai.untitledAgent', locale)}
            </h4>
            {agent.description ? (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {agent.description}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground/50 italic mt-0.5">
                {t('ai.noDescription', locale)}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Badge variant="outline" className="text-[10px]">
            {t("ai.customAgent")}
          </Badge>
          {agent.isPublic && (
            <Badge variant="secondary" className="text-[10px] ml-1">
              {t("ai.public")}
            </Badge>
          )}
        </div>

        <div className="mt-4 pt-3 border-t">
          <p className="text-[10px] text-muted-foreground font-medium mb-1.5">
            {t("ai.systemPromptPreview", locale)}
          </p>
          <div className="rounded-lg bg-muted/50 p-3 max-h-32 overflow-y-auto">
            <p className="text-[11px] text-muted-foreground font-mono leading-relaxed line-clamp-6">
              {agent.systemPrompt.slice(0, 300)}
              {agent.systemPrompt.length > 300 ? '...' : ''}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <div className="h-7 w-full rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 flex items-center justify-center text-xs text-white font-medium opacity-60">
            {t("ai.useAgent", locale)}
          </div>
        </div>
      </motion.div>
    </div>
  );
}