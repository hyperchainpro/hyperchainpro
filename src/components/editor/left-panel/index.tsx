'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Package, Puzzle } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet';
import { LayersPanel } from './layers-panel';
import { AssetsPanel } from './assets-panel';
import { PluginsPanel } from './plugins-panel';
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
}: {
  tab: LeftPanelTab;
  currentTab: LeftPanelTab;
  onClick: (tab: LeftPanelTab) => void;
  icon: React.ElementType;
  label: string;
}) {
  const isActive = currentTab === tab;

  return (
    <button
      onClick={() => onClick(tab)}
      className={cn(
        'flex-1 flex items-center justify-center gap-1.5 h-8 rounded-xl text-[11px] font-medium transition-all border-0 outline-none cursor-pointer',
        isActive
          ? cn('bg-accent text-foreground', NEU_TAB_ACTIVE)
          : cn(
              'bg-background text-muted-foreground hover:text-foreground',
              NEU_TAB_INACTIVE,
            ),
      )}
    >
      <Icon className="size-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

// ─── Tab bar (shared) ────────────────────────────────────────────────────────

function TabBar({ currentTab, onTabChange }: { currentTab: LeftPanelTab; onTabChange: (tab: LeftPanelTab) => void }) {
  return (
    <div className="flex items-center gap-1.5 px-2 py-2 border-b border-border/40">
      <TabButton
        tab="layers"
        currentTab={currentTab}
        onClick={onTabChange}
        icon={Layers}
        label="Layers"
      />
      <TabButton
        tab="assets"
        currentTab={currentTab}
        onClick={onTabChange}
        icon={Package}
        label="Assets"
      />
      <TabButton
        tab="plugins"
        currentTab={currentTab}
        onClick={onTabChange}
        icon={Puzzle}
        label="Plugins"
      />
    </div>
  );
}

// ─── Panel content (shared between desktop and mobile) ────────────────────────

function PanelContent({ tab }: { tab: LeftPanelTab }) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 min-h-0">
        {tab === 'layers' ? <LayersPanel /> : tab === 'plugins' ? <PluginsPanel /> : <AssetsPanel />}
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

  return (
    <Sheet open={leftPanelOpen} onOpenChange={setLeftPanelOpen}>
      <SheetContent side="left" className="w-[280px] p-0">
        <SheetTitle className="sr-only">
          {leftPanelTab === 'layers' ? 'Layers' : leftPanelTab === 'plugins' ? 'Plugins' : 'Assets'}
        </SheetTitle>

        <TabBar currentTab={leftPanelTab} onTabChange={setLeftPanelTab} />
        <div className="flex-1 min-h-0 h-[calc(100vh-56px)]">
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