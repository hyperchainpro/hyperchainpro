'use client';
import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/app-store';
import { useAuthStore } from '@/store/auth-store';
import { DashboardView } from '@/components/dashboard/dashboard-view';
import EditorView from '@/components/layout/editor-view';
import { ErrorBoundary } from '@/components/error-boundary';
import AuthView from '@/components/auth/auth-view';
import { SettingsDialog } from '@/components/settings/settings-dialog';
import { ShareDialog } from '@/components/stitch/share-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { CommunityBrowse } from '@/components/community';
import { AIDesignPage } from '@/components/ai-design/ai-design-page';
import AdminLayout from '@/components/admin/admin-layout';

export default function HomePage() {
  const { viewMode } = useAppStore();
  const { isAuthenticated, isLoading, initialize } = useAuthStore();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initialize();
    setMounted(true);
  }, [initialize]);

  if (!mounted || isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4">
          <div className="neu-card flex items-center gap-3 px-5 py-3">
            <span className="text-lg font-semibold tracking-tight">BranchBoard</span>
          </div>
          <div className="neu-pressed flex gap-2 px-4 py-2.5 rounded-full">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthView />;
  }

  return (
    <ErrorBoundary>
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <ShareDialog open={shareOpen} onOpenChange={setShareOpen} boardId={useAppStore.getState().currentBoardId ?? ''} boardName="" />
      <AnimatePresence mode="wait">
        {viewMode === 'dashboard' && (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <DashboardView onOpenSettings={() => setSettingsOpen(true)} onOpenShare={() => setShareOpen(true)} />
          </motion.div>
        )}
        {viewMode === 'editor' && (
          <motion.div key="editor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <EditorView />
          </motion.div>
        )}
        {viewMode === 'community' && (
          <motion.div key="community" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <CommunityBrowse onBack={() => useAppStore.getState().setViewMode('dashboard')} />
          </motion.div>
        )}
        {viewMode === 'ai-design' && (
          <motion.div key="ai-design" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <AIDesignPage onBack={() => useAppStore.getState().setViewMode('dashboard')} />
          </motion.div>
        )}
        {viewMode === 'admin' && (
          <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <AdminLayout />
          </motion.div>
        )}
      </AnimatePresence>
    </ErrorBoundary>
  );
}
