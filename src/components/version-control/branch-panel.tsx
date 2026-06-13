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
import { useVersionStore } from '@/store/version-store';
import { useAppStore } from '@/store/app-store';

export function BranchDialog() {
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
      setError('Branch name is required');
      return;
    }
    if (!/^[a-zA-Z0-9._-]+$/.test(trimmed)) {
      setError('Only letters, numbers, dots, hyphens, and underscores allowed');
      return;
    }
    if (branches.some((b) => b.name === trimmed)) {
      setError('A branch with this name already exists');
      return;
    }
    if (!currentBoardId) {
      setError('No board selected');
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
      setError('Failed to create branch. Please try again.');
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
            Create Branch
          </DialogTitle>
          <DialogDescription>
            Create a new branch to work on changes independently.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label htmlFor="branch-name" className="text-sm font-medium">
              Branch name <span className="text-destructive">*</span>
            </label>
            <Input
              id="branch-name"
              placeholder="e.g. feature/new-layout"
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
            <span>Based on:</span>
            <Badge variant="outline" className="font-mono">main</Badge>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!name.trim() || isCreating}
            className="gap-1.5"
          >
            {isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
            Create Branch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}