'use client';

import { t, type Locale } from '@/lib/i18n';
import { useAuthStore } from '@/store/auth-store';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Plus,
  Trash2,
  Zap,
  ArrowRight,
  Sparkles,
  Shield,
  MoreHorizontal,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AIDesignDialog, useAIDesign } from './ai-design-dialog';
import { AIAgentEditor } from './ai-agent-editor';
import type { BoardElement } from '@/lib/types';

// ─── Types ────────────────────────────────────────────────────────────────

interface AIAgent {
  id: string;
  name: string;
  description: string | null;
  userId: string;
  systemPrompt: string;
  icon: string | null;
  color: string;
  isPublic: boolean;
  isBuiltIn: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

interface AIAgentManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerated: (elements: BoardElement[]) => void;
}

// ─── Component ────────────────────────────────────────────────────────────

export function AIAgentManager({ open, onOpenChange, onGenerated }: AIAgentManagerProps) {
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [loading, setLoading] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AIAgent | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AIAgent | null>(null);

  const {
    dialogOpen: designDialogOpen,
    setDialogOpen: setDesignDialogOpen,
    openForAgent,
    agentId: designAgentId,
    agentName: designAgentName,
    initialPrompt: designInitialPrompt,
  } = useAIDesign();

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/agents');
      const data = await res.json();
      if (res.ok && data.agents) {
        setAgents(data.agents);
      }
    } catch (err) {
      console.error('Failed to fetch agents:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) fetchAgents();
  }, [open, fetchAgents]);

  const handleCreateAgent = () => {
    setEditingAgent(null);
    setEditorOpen(true);
  };

  const handleEditAgent = (agent: AIAgent) => {
    setEditingAgent(agent);
    setEditorOpen(true);
  };

  const handleDeleteAgent = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/ai/agents/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setAgents((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      }
    } catch (err) {
      console.error('Failed to delete agent:', err);
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleUseAgent = (agent: AIAgent) => {
    openForAgent(agent.id, agent.name);
  };

  const handleEditorSaved = () => {
    setEditorOpen(false);
    setEditingAgent(null);
    fetchAgents();
  };

  const handleDesignGenerated = (elements: BoardElement[]) => {
    setDesignDialogOpen(false);
    onGenerated(elements);
  };

  const builtInAgents = agents.filter((a) => a.isBuiltIn);
  const customAgents = agents.filter((a) => !a.isBuiltIn);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[680px] gap-0 p-0 overflow-hidden max-h-[85vh] flex flex-col">
          {/* Header */}
          <div className="relative bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-500 px-6 pt-6 pb-6 shrink-0">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3N2Zz4=')] opacity-50" />
            <DialogHeader className="relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-white text-lg">{t('ai.agents', locale)}</DialogTitle>
                    <DialogDescription className="text-white/70 text-xs mt-0.5">
                      {t('ai.chooseAgentDesc', locale)}
                    </DialogDescription>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={handleCreateAgent}
                  className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30 hover:text-white shadow-[4px_4px_8px_rgba(0,0,0,0.06),-4px_-4px_8px_rgba(255,255,255,0.8)]"
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  {t('ai.createAgentTitle', locale)}
                </Button>
              </div>
            </DialogHeader>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-purple-500"
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.12 }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* {t('ai.builtIn')} Agents */}
                {builtInAgents.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t('ai.builtIn', locale)} Agents
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {builtInAgents.map((agent, index) => (
                        <AgentCard
                          key={agent.id}
                          agent={agent}
                          index={index}
                          onUse={() => handleUseAgent(agent)}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Custom Agents */}
                {customAgents.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t('ai.customAgents', locale)}
                      </h3>
                      <Badge variant="secondary" className="ml-1 text-[10px] px-1.5">
                        {customAgents.length}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {customAgents.map((agent, index) => (
                        <AgentCard
                          key={agent.id}
                          agent={agent}
                          index={index}
                          onUse={() => handleUseAgent(agent)}
                          onEdit={() => handleEditAgent(agent)}
                          onDelete={() => setDeleteTarget(agent)}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {agents.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Bot className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">{t("ai.noAgentsFound", locale)}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={handleCreateAgent}
                    >
                      <Plus className="w-3.5 h-3.5 mr-1.5" />
                      {t('ai.createAgentTitle', locale)}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Design Dialog (triggered by "Use Agent") */}
      <AIDesignDialog
        open={designDialogOpen}
        onOpenChange={setDesignDialogOpen}
        onGenerated={handleDesignGenerated}
        agentId={designAgentId}
        agentName={designAgentName}
        initialPrompt={designInitialPrompt}
      />

      {/* Agent Editor Dialog */}
      <AIAgentEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        agent={editingAgent}
        onSaved={handleEditorSaved}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('agent.deleteConfirm', locale, { name: deleteTarget?.name ?? '' })}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('ai.deleteConfirmDesc', locale)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel', locale)}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAgent} className="bg-destructive text-white hover:bg-destructive/90">
              {t("common.delete", locale)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─── Agent Card ───────────────────────────────────────────────────────────

function AgentCard({
  agent,
  index,
  onUse,
  onEdit,
  onDelete,
}: {
  agent: AIAgent;
  index: number;
  onUse: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  const isCustom = !agent.isBuiltIn;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.25 }}
      className="group relative rounded-xl border border-border/60 bg-card p-4 transition-all hover:shadow-md hover:border-border hover:-translate-y-0.5"
      style={{
        boxShadow: '4px 4px 8px rgba(0,0,0,0.04), -4px -4px 8px rgba(255,255,255,0.6)',
      }}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
          style={{
            backgroundColor: `${agent.color}15`,
            border: `1px solid ${agent.color}30`,
          }}
        >
          {agent.icon || '🤖'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className="text-sm font-semibold truncate">{agent.name}</h4>
            {agent.isBuiltIn && (
              <Badge
                variant="outline"
                className="text-[9px] px-1.5 py-0 h-4 shrink-0 border-purple-300 text-purple-600"
              >
                {t('ai.builtIn', locale)}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {agent.description || t('ai.noDescription', locale)}
          </p>

          {/* Usage Count */}
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Zap className="w-2.5 h-2.5" />
              {agent.usageCount} {t('ai.uses', locale)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          {isCustom && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                {onEdit && (
                  <DropdownMenuItem onClick={onEdit}>{t('agent.edit', locale)}</DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={onDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-2" />
                    {t("common.delete", locale)}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button
            size="sm"
            onClick={onUse}
            className="h-7 px-2.5 text-xs bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-sm shadow-purple-500/20"
          >
            <ArrowRight className="w-3 h-3 mr-1" />
            {t("ai.use", locale)}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}