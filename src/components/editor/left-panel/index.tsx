'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Package, Puzzle, Wand2 } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { useAuthStore } from '@/store/auth-store';
import { useIsMobile } from '@/hooks/use-mobile';
import { t, type Locale } from '@/lib/i18n';
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet';
import { LayersPanel } from './layers-panel';
import { AssetsPanel } from './assets-panel';
import { PluginsPanel } from './plugins-panel';
import { AiPromptPanel } from '@/components/editor/ai-prompt/ai-prompt-panel';
import { cn } from '@/lib/utils';
import type { LeftPanelTab } from '@/lib/types';

// ─── Neumorphism constants ────────────────────────────────────────────────────

const NEU_TAB_ACTIVE =
  'shadow-[inset_2px_2px_4px_rgba(0,0,0,0.06),inset_-2px_-2px_4px_rgba(255,255,255,0.7)] dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-2px_-2px_4px_rgba(30,30,30,0.05)]';

const NEU_TAB_INACTIVE =
  'shadow-[4px_4px_8px_rgba(0,0,0,0.06),-4px_-4px_8px_rgba(255,255,255,0.8)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.35),-4px_-4px_8px_rgba(30,30,30,0.08)]';

const PANEL_WIDTH = 240;

// ─── Tab button ───────────────────────────────────────────────────────────────

function TabButton({
  tab,
  currentTab,
  onClick,
  icon: Icon,
  label,
  activeGradient,
}: {
  tab: LeftPanelTab;
  currentTab: LeftPanelTab;
  onClick: (tab: LeftPanelTab) => void;
  icon: React.ElementType;
  label: string;
  activeGradient?: string;
}) {
  const isActive = currentTab === tab;

  return (
    <button
      onClick={() => onClick(tab)}
      className={cn(
        'flex-1 flex items-center justify-center gap-1.5 min-h-8 px-1 rounded-xl text-[11px] font-medium border-0 outline-none cursor-pointer',
        'transition-all duration-200 ease-out',
        isActive
          ? activeGradient
            ? 'text-white shadow-lg'
            : cn('bg-accent text-foreground', NEU_TAB_ACTIVE)
          : cn(
              'bg-background text-muted-foreground hover:text-foreground',
              NEU_TAB_INACTIVE,
            ),
      )}
      style={isActive && activeGradient ? { background: activeGradient, boxShadow: `0 4px 12px ${tab === 'plugins' ? 'rgba(124, 58, 237, 0.35)' : 'rgba(0,0,0,0.15)'}` } : undefined}
    >
      <Icon className="size-3.5" />
      <span className="hidden sm:inline truncate max-w-[48px]">{label}</span>
    </button>
  );
}

// ─── Tab bar (shared) ────────────────────────────────────────────────────────

function TabBar({ currentTab, onTabChange }: { currentTab: LeftPanelTab; onTabChange: (tab: LeftPanelTab) => void }) {
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  return (
    <div className="flex items-center gap-1 px-2.5 py-2 border-b border-border/40">
      <TabButton
        tab="layers"
        currentTab={currentTab}
        onClick={onTabChange}
        icon={Layers}
        label={t('leftPanel.layers', locale)}
      />
      <TabButton
        tab="assets"
        currentTab={currentTab}
        onClick={onTabChange}
        icon={Package}
        label={t('leftPanel.assets', locale)}
      />
      <TabButton
        tab="plugins"
        currentTab={currentTab}
        onClick={onTabChange}
        icon={Puzzle}
        label={t('leftPanel.plugins', locale)}
        activeGradient="linear-gradient(135deg, #7c3aed, #ec4899)"
      />
      <TabButton
        tab="ai"
        currentTab={currentTab}
        onClick={onTabChange}
        icon={Wand2}
        label={t('aiPrompt.title', locale)}
        activeGradient="linear-gradient(135deg, #f59e0b, #f97316)"
      />
    </div>
  );
}

// ─── Panel content (shared between desktop and mobile) ────────────────────────

function PanelContent({ tab }: { tab: LeftPanelTab }) {
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  const sectionLabels: Record<LeftPanelTab, string> = {
    layers: t('leftPanel.layers', locale),
    assets: t('leftPanel.assets', locale),
    plugins: t('leftPanel.plugins', locale),
    ai: t('aiPrompt.title', locale),
  };
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Section header - hidden for AI panel since it has its own header */}
      {tab !== 'ai' && (
        <div className="flex items-center justify-between px-3 py-2 border-b border-border/30">
          <h3 className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">{sectionLabels[tab]}</h3>
        </div>
      )}
      <div className="flex-1 min-h-0">
        {tab === 'layers' ? (
          <LayersPanel />
        ) : tab === 'plugins' ? (
          <PluginsPanel />
        ) : tab === 'ai' ? (
          <AiPromptPanel />
        ) : (
          <AssetsPanel />
        )}
      </div>
    </div>
  );
}

// ─── Desktop sidebar ──────────────────────────────────────────────────────────

function DesktopLeftPanel() {
  const leftPanelOpen = useAppStore((s) => s.leftPanelOpen);
  const leftPanelTab = useAppStore((s) => s.leftPanelTab);
  const setLeftPanelTab = useAppStore((s) => s.setLeftPanelTab);

  return (
    <AnimatePresence initial={false}>
      {leftPanelOpen && (
        <motion.div
          className="h-full border-r border-border/60 bg-background flex flex-col overflow-hidden shrink-0"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: PANEL_WIDTH, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          style={{ minWidth: 0 }}
        >
          <TabBar currentTab={leftPanelTab} onTabChange={setLeftPanelTab} />
          <div className="flex-1 min-h-0">
            <PanelContent tab={leftPanelTab} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Mobile sheet ─────────────────────────────────────────────────────────────

function MobileLeftPanel() {
  const leftPanelOpen = useAppStore((s) => s.leftPanelOpen);
  const leftPanelTab = useAppStore((s) => s.leftPanelTab);
  const setLeftPanelTab = useAppStore((s) => s.setLeftPanelTab);
  const setLeftPanelOpen = useAppStore((s) => s.setLeftPanelOpen);

  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';

  const getSheetTitle = () => {
    switch (leftPanelTab) {
      case 'layers': return t('leftPanel.layers', locale);
      case 'assets': return t('leftPanel.assets', locale);
      case 'plugins': return t('leftPanel.plugins', locale);
      case 'ai': return t('aiPrompt.title', locale);
      default: return '';
    }
  };

  return (
    <Sheet open={leftPanelOpen} onOpenChange={setLeftPanelOpen}>
      <SheetContent side="left" className="w-[280px] p-0">
        <SheetTitle className="sr-only">
          {getSheetTitle()}
        </SheetTitle>

        {/* Header with title */}
        <div className="flex items-center px-4 pt-4 pb-2">
          <h3 className="text-xs font-semibold text-muted-foreground">{getSheetTitle()}</h3>
        </div>

        <TabBar currentTab={leftPanelTab} onTabChange={setLeftPanelTab} />
        <div className="flex-1 min-h-0 h-[calc(100vh-120px)]">
          <PanelContent tab={leftPanelTab} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Exported component ───────────────────────────────────────────────────────

export function LeftPanel() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileLeftPanel />;
  }

  return <DesktopLeftPanel />;
}