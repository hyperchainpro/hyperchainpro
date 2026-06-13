'use client';

import { useAppStore } from '@/store/app-store';
import { DashboardView } from '@/components/dashboard/dashboard-view';
import EditorView from '@/components/layout/editor-view';
import { ErrorBoundary } from '@/components/error-boundary';
import { AnimatePresence, motion } from 'framer-motion';

export default function HomePage() {
  const { viewMode } = useAppStore();

  return (
    <ErrorBoundary>
      <AnimatePresence mode="wait">
        {viewMode === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <DashboardView />
          </motion.div>
        )}
        {viewMode === 'editor' && (
          <motion.div
            key="editor"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <EditorView />
          </motion.div>
        )}
      </AnimatePresence>
    </ErrorBoundary>
  );
}