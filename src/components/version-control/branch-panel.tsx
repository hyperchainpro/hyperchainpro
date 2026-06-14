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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GitBranch, Loader2 } from 'lucide-react';
import { t, type Locale } from '@/lib/i18n';
import { useAuthStore } from '@/store/auth-store';
import { useVersionStore } from '@/store/version-store';
import { useAppStore } from '@/store/app-store';

export function BranchDialog() {
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const branchDialogOpen = useVersionStore((s) => s.branchDialogOpen);
  const setBranchDialogOpen = useVersionStore((s) => s.setBranchDialogOpen);
  const createBranch = useVersionStore((s) => s.createBranch);
  const currentBoardId = useAppStore((s) => s.currentBoardId);
  const branches = useVersionStore((s) => s.branches);

  const handleClose = useCallback(() => {
    setBranchDialogOpen(false);
    setName('');
    setError('');
  }, [setBranchDialogOpen]);

  const handleCreate = useCallback(async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError(t('vc.branchNameRequired', locale));
      return;
    }
    if (!/^[a-zA-Z0-9._-]+$/.test(trimmed)) {
      setError(t('vc.branchNameInvalid', locale));
      return;
    }
    if (branches.some((b) => b.name === trimmed)) {
      setError(t('vc.branchNameExists', locale));
      return;
    }
    if (!currentBoardId) {
      setError(t('vc.noBoardSelected', locale));
      return;
    }

    setIsCreating(true);
    setError('');
    try {
      const res = await fetch('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boardId: currentBoardId,
          name: trimmed,
        }),
      });
      if (!res.ok) throw new Error('Failed to create branch');
      const branch = await res.json();
      createBranch(branch);
      handleClose();
    } catch {
      setError(t('vc.failedToCreateBranchRetry', locale));
    } finally {
      setIsCreating(false);
    }
  }, [name, currentBoardId, branches, createBranch, handleClose]);

  return (
    <Dialog open={branchDialogOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            {t('branch.create', locale)}
          </DialogTitle>
          <DialogDescription>
            {t('vc.createBranchDesc', locale)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label htmlFor="branch-name" className="text-sm font-medium">
              {t('vc.branchName', locale)} <span className="text-destructive">*</span>
            </label>
            <Input
              id="branch-name"
              placeholder={t('vc.branchNamePlaceholder', locale)}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              className={error ? 'border-destructive' : ''}
              disabled={isCreating}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
              }}
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{t("vc.basedOn", locale)}</span>
            <Badge variant="outline" className="font-mono">main</Badge>
          </div>
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
            disabled={!name.trim() || isCreating}
            className="gap-1.5"
          >
            {isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
            {t('branch.create', locale)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}