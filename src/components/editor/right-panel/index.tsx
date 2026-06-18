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
  Palette,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { t, type Locale } from '@/lib/i18n';
import { useAuthStore } from '@/store/auth-store';
import { useAppStore } from '@/store/app-store';
import { useVersionStore } from '@/store/version-store';
import { useIsMobile } from '@/hooks/use-mobile';
import type { RightPanelTab, MergeStatus } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet';

import { DesignPanel } from './design-panel';
import { PrototypePanel } from './prototype-panel';
import { VariablesPanel } from './variables-panel';
import { VariantsPanel } from './variants-panel';
import { HistoryTimeline } from '@/components/version-control/history-timeline';

// ─── Neumorphism helpers ──────────────────────────────────────────────────────

const neuTabActive =
  'shadow-[inset_2px_2px_4px_rgba(0,0,0,0.06),inset_-2px_-2px_4px_rgba(255,255,255,0.7)] dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-2px_-2px_4px_rgba(30,30,30,0.05)]';

// ─── Tab config ───────────────────────────────────────────────────────────────

const DESIGN_TABS: { value: 'design' | 'prototype'; i18nKey: string; icon: React.ReactNode }[] = [
  { value: 'design', i18nKey: 'toolbar.design', icon: <PenTool className="h-3.5 w-3.5 shrink-0" /> },
  { value: 'prototype', i18nKey: 'toolbar.prototype', icon: <Play className="h-3.5 w-3.5 shrink-0" /> },
];

const ASSET_TABS: { value: 'variables' | 'variants'; i18nKey: string; icon: React.ReactNode }[] = [
  { value: 'variables', i18nKey: 'tokens.title', icon: <Palette className="h-3.5 w-3.5 shrink-0" /> },
  { value: 'variants', i18nKey: 'variants.title', icon: <Layers className="h-3.5 w-3.5 shrink-0" /> },
];

const VC_TABS: { value: 'history' | 'branches' | 'merges'; i18nKey: string; icon: React.ReactNode }[] = [
  { value: 'history', i18nKey: 'editor.history', icon: <History className="h-3.5 w-3.5 shrink-0" /> },
  { value: 'branches', i18nKey: 'vc.branches', icon: <GitBranch className="h-3.5 w-3.5 shrink-0" /> },
  { value: 'merges', i18nKey: 'vc.mergeRequests', icon: <GitMerge className="h-3.5 w-3.5 shrink-0" /> },
];

const STATUS_BADGE: Record<MergeStatus, { i18nKey: string; className: string }> = {
  OPEN: { i18nKey: 'merge.open', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  APPROVED: { i18nKey: 'vc.statusApproved', className: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' },
  REJECTED: { i18nKey: 'vc.statusRejected', className: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
  MERGED: { i18nKey: 'vc.statusMerged', className: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
  CONFLICT: { i18nKey: 'vc.statusConflict', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
};

// ─── Branches Tab (inline) ────────────────────────────────────────────────────

function BranchesTab() {
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  const branches = useVersionStore((s) => s.branches);
  const currentBranchId = useVersionStore((s) => s.currentBranchId);
  const switchBranch = useVersionStore((s) => s.switchBranch);
  const setBranchDialogOpen = useVersionStore((s) => s.setBranchDialogOpen);

  return (
    <ScrollArea className="h-full">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">{t("vc.branches", locale)}</h3>
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
          {t('vc.new', locale)}
        </Button>
      </div>
      <div className="p-3 space-y-1">
        {branches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <GitBranch className="mb-2 h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">{t("vc.noBranches", locale)}</p>
            <p className="text-xs text-muted-foreground">
              {t('vc.createBranchToStart', locale)}
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
                      ? t('vc.defaultBranch', locale)
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
                  {t('vc.switchTo', locale)}
                </Button>
              ) : (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 h-5"
                >
                  {t('vc.active', locale)}
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
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  const mergeRequests = useVersionStore((s) => s.mergeRequests);

  return (
    <ScrollArea className="h-full">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">{t("vc.mergeRequests", locale)}</h3>
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
          {t('vc.new', locale)}
        </Button>
      </div>
      <div className="p-3 space-y-1">
        {mergeRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <GitMerge className="mb-2 h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">{t("vc.noMergeRequests", locale)}</p>
            <p className="text-xs text-muted-foreground">
              {t('vc.createMergeRequestToPropose', locale)}
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
                    {t(status.i18nKey, locale)}
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

// ─── Animated Tab Button ──────────────────────────────────────────────────────

function TabButton({
  value,
  icon,
  label,
  isActive,
  onClick,
}: {
  value: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        'relative flex items-center gap-1.5 min-h-8 px-3 rounded-lg text-xs font-medium transition-colors duration-200',
        isActive
          ? 'text-foreground'
          : 'text-muted-foreground hover:text-foreground',
      )}
      onClick={onClick}
    >
      {/* Animated background indicator */}
      {isActive && (
        <motion.div
          layoutId="right-panel-tab-bg"
          className="absolute inset-0 rounded-lg bg-muted"
          style={{ zIndex: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        />
      )}
      {/* Neumorphic inset shadow for active tab */}
      {isActive && (
        <motion.div
          layoutId="right-panel-tab-shadow"
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{ zIndex: 0, boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.06), inset -2px -2px 4px rgba(255,255,255,0.7)' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-1.5">
        {icon}
        <span className="truncate">{label}</span>
      </span>
    </button>
  );
}

// ─── Panel Content ────────────────────────────────────────────────────────────

function PanelContent() {
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  const rightPanelTab = useAppStore((s) => s.rightPanelTab);
  const setRightPanelTab = useAppStore((s) => s.setRightPanelTab);

  const renderTab = () => {
    switch (rightPanelTab) {
      case 'design':
        return <DesignPanel />;
      case 'prototype':
        return <PrototypePanel />;
      case 'variables':
        return <VariablesPanel />;
      case 'variants':
        return <VariantsPanel />;
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
      <div className="shrink-0 border-b px-2.5 py-2">
        <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-none">
          {/* Design & Prototype tabs */}
          {DESIGN_TABS.map((tab) => (
            <TabButton
              key={tab.value}
              value={tab.value}
              icon={tab.icon}
              label={t(tab.i18nKey, locale)}
              isActive={rightPanelTab === tab.value}
              onClick={() => setRightPanelTab(tab.value)}
            />
          ))}

          {/* Separator */}
          <Separator orientation="vertical" className="mx-1 h-5 shrink-0" />

          {/* Tokens (Assets) tabs */}
          {ASSET_TABS.map((tab) => (
            <TabButton
              key={tab.value}
              value={tab.value}
              icon={tab.icon}
              label={t(tab.i18nKey, locale)}
              isActive={rightPanelTab === tab.value}
              onClick={() => setRightPanelTab(tab.value)}
            />
          ))}

          {/* Separator before Version Control */}
          <Separator orientation="vertical" className="mx-1 h-5 shrink-0" />

          {/* Version Control tabs */}
          {VC_TABS.map((tab) => (
            <TabButton
              key={tab.value}
              value={tab.value}
              icon={tab.icon}
              label={t(tab.i18nKey, locale)}
              isActive={rightPanelTab === tab.value}
              onClick={() => setRightPanelTab(tab.value)}
            />
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">{renderTab()}</div>
    </div>
  );
}

// ─── Desktop Right Panel ──────────────────────────────────────────────────────

function DesktopRightPanel() {
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  const rightPanelOpen = useAppStore((s) => s.rightPanelOpen);
  const setRightPanelOpen = useAppStore((s) => s.setRightPanelOpen);

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
          <div className="hidden md:flex justify-end px-3 pt-2.5 pb-1 shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full bg-background/80 backdrop-blur-sm hover:bg-accent hover:shadow-[0_0_8px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_0_8px_rgba(0,0,0,0.3)] transition-all duration-200"
                  onClick={() => setRightPanelOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" sideOffset={8}>
                <span className="font-medium">{t('toolbar.closePanel', locale)}</span>
              </TooltipContent>
            </Tooltip>
          </div>

          <PanelContent />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Mobile Right Panel (Sheet overlay) ───────────────────────────────────────

function MobileRightPanel() {
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  const rightPanelOpen = useAppStore((s) => s.rightPanelOpen);
  const setRightPanelOpen = useAppStore((s) => s.setRightPanelOpen);

  return (
    <Sheet open={rightPanelOpen} onOpenChange={setRightPanelOpen}>
      <SheetContent side="right" className="w-[85vw] max-w-[300px] p-0">
        <SheetTitle className="sr-only">{t("vc.propertiesPanel", locale)}</SheetTitle>
        {/* Header — Sheet's own built-in close button (top-right) is used, no custom one needed */}
        <div className="flex items-center px-4 pt-4 pb-2">
          <h3 className="text-sm font-semibold text-muted-foreground">{t("vc.propertiesPanel", locale)}</h3>
        </div>
        <div className="h-[calc(100vh-100px)]">
          <PanelContent />
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Main Right Panel ─────────────────────────────────────────────────────────

export function RightPanel() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileRightPanel />;
  }

  return <DesktopRightPanel />;
}