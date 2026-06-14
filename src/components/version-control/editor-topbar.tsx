'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  ArrowLeft,
  GitBranch,
  GitCommitHorizontal,
  Save,
  Share2,
  Download,
  FileImage,
  FileCode2,
  FileJson,
  Settings,
  PanelRight,
  Plus,
  Check,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { t, type Locale } from '@/lib/i18n';
import { useAuthStore } from '@/store/auth-store';
import { useAppStore } from '@/store/app-store';
import { useVersionStore } from '@/store/version-store';
import { useCanvasStore } from '@/store/canvas-store';
import { usePresenceStore } from '@/store/presence-store';
import { CommitDialog } from './commit-dialog';
import type { Board } from '@/lib/types';

// ─── Helpers ────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  'bg-rose-500',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-cyan-500',
  'bg-violet-500',
  'bg-pink-500',
  'bg-teal-500',
  'bg-orange-500',
];

function getAvatarColor(id: string): string {
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// ─── Editable Board Name ────────────────────────────────────────────────────

function EditableBoardName({ board }: { board: Board | null }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  const displayName = draftName ?? board?.name ?? t('vc.untitledBoard', locale);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = useCallback(() => {
    setIsEditing(false);
    // In a real app, this would call an API to rename the board
    // Keep draftName as-is so it persists the edited value
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSave();
      if (e.key === 'Escape') {
        setDraftName(null);
        setIsEditing(false);
      }
    },
    [handleSave, board?.name],
  );

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={displayName}
        onChange={(e) => setDraftName(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="h-7 w-48 text-sm font-semibold border-primary"
      />
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="rounded-md px-1.5 py-0.5 text-sm font-semibold hover:bg-muted transition-colors text-left max-w-[200px] truncate"
      title={t('vc.clickToEditName', locale)}
    >
      {displayName}
    </button>
  );
}

// ─── Branch Selector ─────────────────────────────────────────────────────────

function BranchSelector() {
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  const [open, setOpen] = useState(false);
  const branches = useVersionStore((s) => s.branches);
  const currentBranchId = useVersionStore((s) => s.currentBranchId);
  const switchBranch = useVersionStore((s) => s.switchBranch);
  const setCommitDialogOpen = useVersionStore((s) => s.setCommitDialogOpen);
  const currentBoardId = useAppStore((s) => s.currentBoardId);

  const currentBranch = branches.find((b) => b.id === currentBranchId);

  const handleSwitch = useCallback(
    (branchId: string) => {
      if (branchId === currentBranchId) return;
      const branch = branches.find((b) => b.id === branchId);
      if (!branch?.headCommit?.id) {
        switchBranch(branchId);
        setOpen(false);
        return;
      }

      // Load the branch head snapshot
      if (currentBoardId && branch.headCommit.id) {
        fetch(`/api/commits?boardId=${currentBoardId}&commitId=${branch.headCommit.id}`)
          .then((res) => {
            if (!res.ok) throw new Error('Failed');
            return res.json();
          })
          .then((data) => {
            if (data.snapshot) {
              const { loadElements } = useCanvasStore.getState();
              try {
                const elements = JSON.parse(data.snapshot);
                loadElements(elements);
              } catch {
                // ignore parse errors
              }
            }
            switchBranch(branchId);
            setOpen(false);
          })
          .catch(() => {
            switchBranch(branchId);
            setOpen(false);
          });
      }
    },
    [branches, currentBranchId, currentBoardId, switchBranch],
  );

  const handleCreateBranch = useCallback(() => {
    const name = prompt(t('vc.enterBranchName', locale));
    if (!name || !currentBoardId) return;

    fetch('/api/branches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ boardId: currentBoardId, name }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed');
        return res.json();
      })
      .then((branch) => {
        useVersionStore.getState().createBranch(branch);
        setOpen(false);
      })
      .catch(() => {
        // silently fail
      });
  }, [currentBoardId]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs font-mono"
        >
          <GitBranch className="h-3.5 w-3.5" />
          {currentBranch?.name ?? t('vc.noBranch', locale)}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px]">
        <DropdownMenuItem onClick={handleCreateBranch} className="gap-2">
          <Plus className="h-3.5 w-3.5" />
          {t('vc.createNewBranch', locale)}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {branches.map((branch) => {
          const isCurrent = branch.id === currentBranchId;
          return (
            <DropdownMenuItem
              key={branch.id}
              onClick={() => handleSwitch(branch.id)}
              className="gap-2"
            >
              {isCurrent ? (
                <Check className="h-3.5 w-3.5 text-primary" />
              ) : (
                <span className="w-3.5" />
              )}
              <span className={cn('font-mono text-xs', isCurrent && 'font-semibold')}>
                {branch.name}
              </span>
              {branch.isDefault && (
                <Badge variant="secondary" className="ml-auto h-4 px-1 text-[9px]">
                  {t('vc.defaultBadge', locale)}
                </Badge>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Export Dropdown ─────────────────────────────────────────────────────────

function ExportDropdown() {
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  const elements = useCanvasStore((s) => s.elements);

  const handleExport = useCallback(
    (format: 'png' | 'svg' | 'json') => {
      if (format === 'json') {
        const data = JSON.stringify(elements, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'board-export.json';
        a.click();
        URL.revokeObjectURL(url);
        return;
      }

      // For PNG and SVG, in a real app we'd use html-to-canvas or similar
      // For now, show a placeholder
      const data = JSON.stringify(elements, null, 2);
      const blob = new Blob([data], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `board-export.${format === 'svg' ? 'svg.txt' : 'png.txt'}`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [elements],
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Download className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>{t("vc.export", locale)}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('png')} className="gap-2">
          <FileImage className="h-4 w-4" />
          {t('vc.exportAsPNG', locale)}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('svg')} className="gap-2">
          <FileCode2 className="h-4 w-4" />
          {t('vc.exportAsSVG', locale)}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport('json')} className="gap-2">
          <FileJson className="h-4 w-4" />
          {t('vc.exportAsJSON', locale)}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Presence Indicators ─────────────────────────────────────────────────────

function PresenceIndicators() {
  const users = usePresenceStore((s) => s.users);
  const displayUsers = users.slice(0, 4);
  const remaining = users.length - 4;

  if (users.length === 0) return null;

  return (
    <div className="flex items-center -space-x-2">
      {displayUsers.map((user) => (
        <TooltipProvider key={user.id} delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar className="h-7 w-7 border-2 border-background ring-1 ring-border">
                {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                <AvatarFallback
                  className={cn('text-[10px] text-white', getAvatarColor(user.id))}
                >
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>{user.name}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
      {remaining > 0 && (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-medium ring-1 ring-border">
                +{remaining}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {users.slice(4).map((u) => u.name).join(', ')}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}

// ─── Main Topbar ─────────────────────────────────────────────────────────────

export function EditorTopbar({ board }: { board: Board | null }) {
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  const toggleRightPanel = useAppStore((s) => s.toggleRightPanel);
  const rightPanelOpen = useAppStore((s) => s.rightPanelOpen);
  const closeBoard = useAppStore((s) => s.closeBoard);
  const setCommitDialogOpen = useVersionStore((s) => s.setCommitDialogOpen);
  const mergeRequests = useVersionStore((s) => s.mergeRequests);
  const elements = useCanvasStore((s) => s.elements);

  const openMRCount = mergeRequests.filter(
    (mr) => mr.status === 'OPEN' || mr.status === 'CONFLICT',
  ).length;

  const handleCommit = useCallback(() => {
    if (elements.length === 0) return;
    setCommitDialogOpen(true);
  }, [elements.length, setCommitDialogOpen]);

  return (
    <>
      <header className="relative z-20 flex h-12 items-center justify-between border-b bg-background/95 backdrop-blur-sm px-3 gap-3">
        {/* Left section */}
        <div className="flex items-center gap-2 min-w-0">
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={closeBoard}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("editor.backToDashboard", locale)}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="min-w-0 flex items-center gap-2">
            <EditableBoardName board={board} />
            {board?.description && (
              <span className="hidden md:inline text-xs text-muted-foreground truncate max-w-[200px]">
                {board.description}
              </span>
            )}
          </div>
        </div>

        {/* Center section */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
          <BranchSelector />
          {openMRCount > 0 && (
            <Badge variant="secondary" className="h-5 px-1.5 text-[10px] gap-1">
              <GitCommitHorizontal className="h-3 w-3" />
              {t('vc.mrCount', locale, { n: openMRCount })}
            </Badge>
          )}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-1.5">
          <PresenceIndicators />

          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleCommit}
                  disabled={elements.length === 0}
                  className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t("editor.commit", locale)}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("vc.commitChanges", locale)}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <ExportDropdown />

          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Share2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("vc.shareBoard", locale)}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("vc.boardSettings", locale)}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn('h-8 w-8', rightPanelOpen && 'bg-muted')}
                  onClick={toggleRightPanel}
                >
                  <PanelRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("vc.togglePanel", locale)}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </header>

      <CommitDialog />
    </>
  );
}