'use client';

import { useAppStore } from '@/store/app-store';
import { DashboardView } from '@/components/dashboard/dashboard-view';
import EditorView from '@/components/layout/editor-view';

export default function HomePage() {
  const { viewMode } = useAppStore();

  return (
    <>
      {viewMode === 'dashboard' && <DashboardView />}
      {viewMode === 'editor' && <EditorView />}
    </>
  );
}