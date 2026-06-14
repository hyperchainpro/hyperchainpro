'use client';

import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { t, type Locale } from '@/lib/i18n';
import { useAuthStore } from '@/store/auth-store';
import { useVersionStore } from '@/store/version-store';
import { useCanvasStore } from '@/store/canvas-store';
import { useAppStore } from '@/store/app-store';

export function CommitDialog() {
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  const [message, setMessage] = useState('');
  const [tag, setTag] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const commitDialogOpen = useVersionStore((s) => s.commitDialogOpen);
  const setCommitDialogOpen = useVersionStore((s) => s.setCommitDialogOpen);
  const isCommitting = useVersionStore((s) => s.isCommitting);
  const setIsCommitting = useVersionStore((s) => s.setIsCommitting);
  const addCommit = useVersionStore((s) => s.addCommit);
  const currentBranchId = useVersionStore((s) => s.currentBranchId);
  const branches = useVersionStore((s) => s.branches);
  const elements = useCanvasStore((s) => s.elements);
  const currentBoardId = useAppStore((s) => s.currentBoardId);

  const currentBranch = branches.find((b) => b.id === currentBranchId);
  const changeCount = elements.length;

  const handleClose = useCallback(() => {
    setCommitDialogOpen(false);
    setMessage('');
    setTag('');
    setError('');
  }, [setCommitDialogOpen]);

  const handleGenerateMessage = useCallback(async () => {
    if (elements.length === 0) {
      setError(t('vc.noElementsToGenerate', locale));
      return;
    }
    setIsGenerating(true);
    setError('');
    try {
      const res = await fetch('/api/ai/commit-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          elements,
          boardName: 'Board',
        }),
      });
      if (!res.ok) throw new Error('Failed to generate message');
      const data = await res.json();
      setMessage(data.message || '');
    } catch {
      setError(t('vc.failedToGenerateCommitMessage', locale));
    } finally {
      setIsGenerating(false);
    }
  }, [elements]);

  const handleCommit = useCallback(async () => {
    if (message.trim().length < 3) {
      setError(t('vc.commitMinChars', locale));
      return;
    }
    if (!currentBoardId || !currentBranchId) {
      setError(t('vc.noBoardOrBranch', locale));
      return;
    }
    setIsCommitting(true);
    setError('');
    try {
      const res = await fetch('/api/commits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boardId: currentBoardId,
          branchId: currentBranchId,
          message: message.trim(),
          tag: tag.trim() || undefined,
          snapshot: JSON.stringify(elements),
        }),
      });
      if (!res.ok) throw new Error('Failed to create commit');
      const commit = await res.json();
      addCommit(commit);
      handleClose();
    } catch {
      setError(t('vc.failedToCreateCommitRetry', locale));
      setIsCommitting(false);
    }
  }, [message, tag, currentBoardId, currentBranchId, elements, addCommit, handleClose, setIsCommitting]);

  const canCommit = message.trim().length >= 3 && !isCommitting && !isGenerating;

  return (
    <Dialog open={commitDialogOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{t("vc.createCommit", locale)}</DialogTitle>
          <DialogDescription>
            {t("vc.saveDesc", locale)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Branch & changes info */}
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">{t("vc.branchLabel", locale)}</span>
              <Badge variant="outline" className="font-mono">
                {currentBranch?.name ?? t('vc.noAuthor', locale)}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">{t("vc.changes", locale)}</span>
              <Badge variant="secondary">{changeCount} {t("vc.elements", locale)}</Badge>
            </div>
          </div>

          {/* Commit message */}
          <div className="space-y-2">
            <label htmlFor="commit-message" className="text-sm font-medium">
              {t("vc.commitMessage", locale)} <span className="text-destructive">*</span>
            </label>
            <Textarea
              id="commit-message"
              placeholder={t("vc.commitPlaceholder", locale)}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (error) setError('');
              }}
              className={cn('min-h-[100px] resize-none', error && 'border-destructive')}
              disabled={isCommitting || isGenerating}
              autoFocus
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {message.length < 3 ? t('vc.minChars', locale, { n: message.length }) : t('vc.charCount', locale, { n: message.length })}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleGenerateMessage}
                disabled={isGenerating || isCommitting || elements.length === 0}
                className="gap-1.5 text-xs"
              >
                {isGenerating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                {t('vc.generateWithAI', locale)}
              </Button>
            </div>
          </div>

          {/* Tag */}
          <div className="space-y-2">
            <label htmlFor="commit-tag" className="text-sm font-medium">
              {t('commit.tag', locale)} <span className="text-muted-foreground">{t('vc.optional', locale)}</span>
            </label>
            <Input
              id="commit-tag"
              placeholder={t('vc.tagPlaceholder', locale)}
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              disabled={isCommitting || isGenerating}
              className="max-w-[240px]"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isCommitting}
          >
            {t('common.cancel', locale)}
          </Button>
          <Button
            onClick={handleCommit}
            disabled={!canCommit}
            className="gap-1.5"
          >
            {isCommitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            {t('commit.create', locale)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}