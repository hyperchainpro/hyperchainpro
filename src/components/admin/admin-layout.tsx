'use client';

import { useState, useCallback } from 'react';
import {
  LayoutDashboard,
  Users,
  FileCode2,
  LayoutGrid,
  Puzzle,
  BarChart3,
  Settings,
  ArrowLeft,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/app-store';
import { AdminDashboard } from './admin-dashboard';
import { AdminUsers } from './admin-users';
import { AdminAdScripts } from './admin-ad-scripts';
import { AdminBoards } from './admin-boards';
import { AdminPlugins } from './admin-plugins';
import { AdminAnalytics } from './admin-analytics';
import { AdminSettings } from './admin-settings';

type AdminSection = 'dashboard' | 'users' | 'ad-scripts' | 'boards' | 'plugins' | 'analytics' | 'settings';

const sidebarItems: { id: AdminSection; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'ad-scripts', label: 'Ad Scripts', icon: FileCode2 },
  { id: 'boards', label: 'Boards', icon: LayoutGrid },
  { id: 'plugins', label: 'Plugins', icon: Puzzle },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

function SidebarNav({
  active,
  onSelect,
  onBack,
}: {
  active: AdminSection;
  onSelect: (id: AdminSection) => void;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Back button */}
      <div className="p-4 pb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground border-0"
        >
          <ArrowLeft className="size-4" />
          Back to App
        </Button>
      </div>

      <Separator className="opacity-50" />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-3">
        <nav className="flex flex-col gap-1" role="navigation" aria-label="Admin navigation">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 w-full text-left border-0 cursor-pointer',
                active === item.id
                  ? 'neu-pressed text-foreground'
                  : 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <item.icon className="size-4 shrink-0" />
              {item.label}
            </button>
          ))}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <Separator className="opacity-50" />
      <div className="p-4">
        <p className="text-xs text-muted-foreground text-center">
          BranchBoard Admin v1.0
        </p>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const setViewMode = useAppStore((s) => s.setViewMode);

  const handleBack = useCallback(() => {
    setViewMode('dashboard');
  }, [setViewMode]);

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <AdminDashboard onNavigate={setActiveSection} />;
      case 'users':
        return <AdminUsers />;
      case 'ad-scripts':
        return <AdminAdScripts />;
      case 'boards':
        return <AdminBoards />;
      case 'plugins':
        return <AdminPlugins />;
      case 'analytics':
        return <AdminAnalytics />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <AdminDashboard onNavigate={setActiveSection} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border/40 bg-background">
        <SidebarNav active={activeSection} onSelect={setActiveSection} onBack={handleBack} />
      </aside>

      {/* Mobile sidebar via Sheet */}
      <div className="lg:hidden fixed top-0 left-0 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed top-3 left-3 z-50 neu-raised !rounded-lg"
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
            <SidebarNav active={activeSection} onSelect={(id) => { setActiveSection(id); }} onBack={handleBack} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main content area */}
      <main className="flex-1 flex flex-col min-h-screen">
        <div className="flex-1 p-4 lg:p-6 lg:pl-6 pt-16 lg:pt-6">
          <div className="max-w-7xl mx-auto w-full">
            {renderContent()}
          </div>
        </div>

        {/* Sticky footer */}
        <footer className="mt-auto border-t border-border/40 bg-background px-4 py-3 lg:px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-muted-foreground">
            <span>BranchBoard Admin Dashboard</span>
            <span className="hidden sm:inline">© {new Date().getFullYear()} BranchBoard</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
