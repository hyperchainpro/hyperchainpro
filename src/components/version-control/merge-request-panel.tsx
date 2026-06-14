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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GitMerge, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { t, type Locale } from '@/lib/i18n';
import { useAuthStore } from '@/store/auth-store';
import { useVersionStore } from '@/store/version-store';
import { useAppStore } from '@/store/app-store';

export function MergeRequestDialog() {
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetBranchId, setTargetBranchId] = useState('');
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const mergeDialogOpen = useVersionStore((s) => s.mergeDialogOpen);
  const setMergeDialogOpen = useVersionStore((s) => s.setMergeDialogOpen);
  const createMergeRequest = useVersionStore((s) => s.createMergeRequest);
  const currentBoardId = useAppStore((s) => s.currentBoardId);
  const currentBranchId = useVersionStore((s) => s.currentBranchId);
  const branches = useVersionStore((s) => s.branches);

  const otherBranches = branches.filter((b) => b.id !== currentBranchId);
  const currentBranch = branches.find((b) => b.id === currentBranchId);

  const handleClose = useCallback(() => {
    setMergeDialogOpen(false);
    setTitle('');
    setDescription('');
    setTargetBranchId('');
    setError('');
  }, [setMergeDialogOpen]);

  const handleCreate = useCallback(async () => {
    if (!title.trim()) {
      setError(t('vc.titleRequired', locale));
      return;
    }
    if (!targetBranchId) {
      setError(t('vc.selectTargetBranch', locale));
      return;
    }
    if (!currentBoardId || !currentBranchId) {
      setError(t('vc.noBoardOrBranch', locale));
      return;
    }

    setIsCreating(true);
    setError('');
    try {
      const res = await fetch('/api/merge-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boardId: currentBoardId,
          sourceBranchId: currentBranchId,
          targetBranchId,
          title: title.trim(),
          description: description.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error('Failed to create merge request');
      const mr = await res.json();
      createMergeRequest(mr);
      handleClose();
    } catch {
      setError(t('vc.failedToCreateMRRetry', locale));
    } finally {
      setIsCreating(false);
    }
  }, [title, description, targetBranchId, currentBoardId, currentBranchId, createMergeRequest, handleClose]);

  return (
    <Dialog open={mergeDialogOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitMerge className="h-5 w-5" />
            {t('merge.create', locale)}
          </DialogTitle>
          <DialogDescription>
            {t('vc.createMRDesc', locale)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">{t("vc.source", locale)}</span>
            <span className="font-mono text-foreground">
              {currentBranch?.name ?? t('vc.noBranch', locale)}
            </span>
            <span className="text-muted-foreground">&rarr;</span>
            <Select value={targetBranchId} onValueChange={(v) => { setTargetBranchId(v); if (error) setError(''); }}>
              <SelectTrigger className="w-[180px] h-8 text-sm">
                <SelectValue placeholder={t('vc.selectTarget', locale)} />
              </SelectTrigger>
              <SelectContent>
                {otherBranches.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="mr-title" className="text-sm font-medium">
              {t('vc.title', locale)} <span className="text-destructive">*</span>
            </label>
            <Input
              id="mr-title"
              placeholder={t('vc.mrTitlePlaceholder', locale)}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              className={error ? 'border-destructive' : ''}
              disabled={isCreating}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="mr-desc" className="text-sm font-medium">
              {t('commit.tag', locale)} <span className="text-muted-foreground">{t('vc.optional', locale)}</span>
            </label>
            <Textarea
              id="mr-desc"
              placeholder={t('vc.mrPlaceholder', locale)}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isCreating}
              className="min-h-[80px] resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isCreating}
          >
            {t('common.cancel', locale)}
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!title.trim() || !targetBranchId || isCreating}
            className="gap-1.5"
          >
            {isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
            {t('merge.create', locale)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}