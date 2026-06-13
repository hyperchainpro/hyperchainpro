'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  PenTool,
  Play,
  History,
  GitBranch,
  GitMerge,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/app-store';
import { useVersionStore } from '@/store/version-store';
import { useIsMobile } from '@/hooks/use-mobile';
import type { RightPanelTab, MergeStatus } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet';

import { DesignPanel } from './design-panel';
import { PrototypePanel } from './prototype-panel';
import { HistoryTimeline } from '@/components/version-control/history-timeline';

// ─── Neumorphism helpers ──────────────────────────────────────────────────────

const neuTabActive =
  'shadow-[inset_2px_2px_4px_rgba(0,0,0,0.06),inset_-2px_-2px_4px_rgba(255,255,255,0.7)] dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-2px_-2px_4px_rgba(30,30,30,0.05)]';

const neuTabInactive =
  'shadow-[2px_2px_4px_rgba(0,0,0,0.04),-2px_-2px_4px_rgba(255,255,255,0.6)] dark:shadow-[2px_2px_4px_rgba(0,0,0,0.25),-2px_-2px_4px_rgba(30,30,30,0.04)]';

// ─── Tab config ───────────────────────────────────────────────────────────────

const DESIGN_TABS: { value: 'design' | 'prototype'; label: string; icon: React.ReactNode }[] = [
  { value: 'design', label: 'Design', icon: <PenTool className="h-3.5 w-3.5" /> },
  { value: 'prototype', label: 'Prototype', icon: <Play className="h-3.5 w-3.5" /> },
];

const VC_TABS: { value: 'history' | 'branches' | 'merges'; label: string; icon: React.ReactNode }[] = [
  { value: 'history', label: 'History', icon: <History className="h-3.5 w-3.5" /> },
  { value: 'branches', label: 'Branches', icon: <GitBranch className="h-3.5 w-3.5" /> },
  { value: 'merges', label: 'Merges', icon: <GitMerge className="h-3.5 w-3.5" /> },
];

const STATUS_BADGE: Record<MergeStatus, { label: string; className: string }> = {
  OPEN: { label: 'Open', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  APPROVED: { label: 'Approved', className: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' },
  REJECTED: { label: 'Rejected', className: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
  MERGED: { label: 'Merged', className: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
  CONFLICT: { label: 'Conflict', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
};

// ─── Branches Tab (inline) ────────────────────────────────────────────────────

function BranchesTab() {
  const branches = useVersionStore((s) => s.branches);
  const currentBranchId = useVersionStore((s) => s.currentBranchId);
  const switchBranch = useVersionStore((s) => s.switchBranch);
  const setBranchDialogOpen = useVersionStore((s) => s.setBranchDialogOpen);

  return (
    <ScrollArea className="h-full">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">Branches</h3>
          <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
            {branches.length}
          </Badge>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setBranchDialogOpen(true)}
          className="h-7 gap-1 px-2 text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          New
        </Button>
      </div>
      <div className="p-3 space-y-1">
        {branches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <GitBranch className="mb-2 h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No branches yet</p>
            <p className="text-xs text-muted-foreground">
              Create a branch to start working
            </p>
          </div>
        ) : (
          branches.map((branch) => (
            <div
              key={branch.id}
              className={cn(
                'flex items-center justify-between rounded-md px-3 py-2.5 transition-colors hover:bg-muted/50',
                branch.id === currentBranchId && 'bg-primary/5 border border-primary/20',
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                <GitBranch
                  className={cn(
                    'h-3.5 w-3.5 shrink-0',
                    branch.id === currentBranchId
                      ? 'text-primary'
                      : 'text-muted-foreground',
                  )}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{branch.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {branch.isDefault
                      ? 'Default branch'
                      : `Created ${new Date(branch.createdAt).toLocaleDateString()}`}
                  </p>
                </div>
              </div>
              {branch.id !== currentBranchId ? (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-[10px]"
                  onClick={() => switchBranch(branch.id)}
                >
                  Switch
                </Button>
              ) : (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 h-5"
                >
                  Active
                </Badge>
              )}
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );
}

// ─── Merges Tab (inline) ──────────────────────────────────────────────────────

function MergesTab() {
  const mergeRequests = useVersionStore((s) => s.mergeRequests);

  return (
    <ScrollArea className="h-full">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">Merge Requests</h3>
          <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
            {mergeRequests.length}
          </Badge>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => useVersionStore.getState().setMergeDialogOpen(true)}
          className="h-7 gap-1 px-2 text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          New
        </Button>
      </div>
      <div className="p-3 space-y-1">
        {mergeRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <GitMerge className="mb-2 h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No merge requests</p>
            <p className="text-xs text-muted-foreground">
              Create a merge request to propose changes
            </p>
          </div>
        ) : (
          mergeRequests.map((mr) => {
            const status = STATUS_BADGE[mr.status];
            return (
              <div
                key={mr.id}
                className="rounded-md px-3 py-2.5 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium">{mr.title}</p>
                  <Badge
                    className={cn(
                      'shrink-0 text-[10px] px-1.5 py-0 h-5',
                      status.className,
                    )}
                  >
                    {status.label}
                  </Badge>
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="font-mono">
                    {mr.sourceBranch?.name ?? '?'}
                  </span>
                  <span>&rarr;</span>
                  <span className="font-mono">
                    {mr.targetBranch?.name ?? '?'}
                  </span>
                </div>
                <div className="mt-1 text-[10px] text-muted-foreground">
                  {new Date(mr.createdAt).toLocaleDateString()}
                </div>
              </div>
            );
          })
        )}
      </div>
    </ScrollArea>
  );
}

// ─── Panel Content ────────────────────────────────────────────────────────────

function PanelContent() {
  const rightPanelTab = useAppStore((s) => s.rightPanelTab);
  const setRightPanelTab = useAppStore((s) => s.setRightPanelTab);

  const renderTab = () => {
    switch (rightPanelTab) {
      case 'design':
        return <DesignPanel />;
      case 'prototype':
        return <PrototypePanel />;
      case 'history':
        return <HistoryTimeline />;
      case 'branches':
        return <BranchesTab />;
      case 'merges':
        return <MergesTab />;
      default:
        return <DesignPanel />;
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Tab bar */}
      <div className="shrink-0 border-b px-2 pt-2 pb-1.5">
        <div className="flex items-center gap-1">
          {/* Design & Prototype tabs */}
          {DESIGN_TABS.map((tab) => (
            <button
              key={tab.value}
              className={cn(
                'flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all',
                rightPanelTab === tab.value
                  ? cn('bg-muted text-foreground', neuTabActive)
                  : cn('text-muted-foreground hover:text-foreground hover:bg-muted/50', neuTabInactive),
              )}
              onClick={() => setRightPanelTab(tab.value)}
            >
              {tab.icon}
              <span className="hidden lg:inline">{tab.label}</span>
            </button>
          ))}

          {/* Separator */}
          <Separator orientation="vertical" className="mx-1 h-5" />

          {/* Version control tabs */}
          {VC_TABS.map((tab) => (
            <button
              key={tab.value}
              className={cn(
                'flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all',
                rightPanelTab === tab.value
                  ? cn('bg-muted text-foreground', neuTabActive)
                  : cn('text-muted-foreground hover:text-foreground hover:bg-muted/50', neuTabInactive),
              )}
              onClick={() => setRightPanelTab(tab.value)}
            >
              {tab.icon}
              <span className="hidden lg:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">{renderTab()}</div>
    </div>
  );
}

// ─── Main Right Panel ─────────────────────────────────────────────────────────

export function RightPanel() {
  const rightPanelOpen = useAppStore((s) => s.rightPanelOpen);
  const setRightPanelOpen = useAppStore((s) => s.setRightPanelOpen);
  const isMobile = useIsMobile();

  // ── Mobile: Sheet overlay ──
  if (isMobile) {
    return (
      <Sheet open={rightPanelOpen} onOpenChange={setRightPanelOpen}>
        <SheetContent side="right" className="w-[280px] p-0">
          <SheetTitle className="sr-only">Properties Panel</SheetTitle>
          <PanelContent />
        </SheetContent>
      </Sheet>
    );
  }

  // ── Desktop: animated sidebar ──
  return (
    <AnimatePresence>
      {rightPanelOpen && (
        <motion.div
          key="editor-right-panel"
          initial={{ x: 280, opacity: 0.8 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 280, opacity: 0.8 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative flex h-full w-[280px] shrink-0 flex-col border-l bg-background shadow-xl"
        >
          {/* Close button */}
          <div className="absolute right-2 top-2 z-10">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full bg-background/80 backdrop-blur-sm"
              onClick={() => setRightPanelOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <PanelContent />
        </motion.div>
      )}
    </AnimatePresence>
  );
}