'use client';

import { t, type Locale } from '@/lib/i18n';
import { useAuthStore } from '@/store/auth-store';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Palette,
  Grid3X3,
  Library,
  Download,
  Sparkles,
  Layout,
  Brush,
  Film,
  Search,
  Plus,
  Package,
} from 'lucide-react';
import { toast } from 'sonner';
import type { BuiltInPlugin } from '@/lib/types';

const NEU_RAISED =
  'shadow-[4px_4px_8px_rgba(0,0,0,0.06),-4px_-4px_8px_rgba(255,255,255,0.8)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.35),-4px_-4px_8px_rgba(30,30,30,0.08)]';

const NEU_INSET =
  'shadow-[inset_2px_2px_4px_rgba(0,0,0,0.06),inset_-2px_-2px_4px_rgba(255,255,255,0.7)] dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-2px_-2px_4px_rgba(30,30,30,0.05)]';

const INITIAL_PLUGINS: BuiltInPlugin[] = [
  {
    manifest: {
      id: 'color-palette',
      name: 'Color Palette',
      version: '1.0.0',
      description: 'Extract and manage color palettes from your designs',
      author: 'Built-in',
      icon: 'palette',
      permissions: ['canvas:read', 'ui:panel'],
      menuItems: [{ label: 'Extract Colors', action: 'extract-colors' }],
    },
    enabled: true,
  },
  {
    manifest: {
      id: 'grid-maker',
      name: 'Grid Maker',
      version: '1.0.0',
      description: 'Generate custom grid layouts quickly',
      author: 'Built-in',
      icon: 'grid',
      permissions: ['canvas:write'],
      menuItems: [{ label: 'Create Grid', action: 'create-grid' }],
    },
    enabled: true,
  },
  {
    manifest: {
      id: 'icon-library',
      name: 'Icon Library',
      version: '1.0.0',
      description: 'Browse and insert icons (lucide-react set)',
      author: 'Built-in',
      icon: 'library',
      permissions: ['canvas:write', 'ui:panel'],
      menuItems: [{ label: 'Browse Icons', action: 'browse-icons' }],
    },
    enabled: true,
  },
  {
    manifest: {
      id: 'export',
      name: 'Export',
      version: '1.0.0',
      description: 'Export frames and elements as PNG/SVG',
      author: 'Built-in',
      icon: 'download',
      permissions: ['canvas:read', 'export'],
      menuItems: [
        { label: 'Export as PNG', action: 'export-png' },
        { label: 'Export as SVG', action: 'export-svg' },
      ],
    },
    enabled: true,
  },
  {
    manifest: {
      id: 'ai-layout',
      name: 'AI Layout',
      version: '1.0.0',
      description: 'Generate layouts with AI assistance',
      author: 'Built-in',
      icon: 'sparkles',
      permissions: ['canvas:write', 'network'],
      menuItems: [{ label: 'Generate Layout', action: 'generate-layout' }],
    },
    enabled: false,
  },
  {
    manifest: {
      id: 'wireframe-kit',
      name: 'Wireframe Kit',
      version: '1.0.0',
      description: 'Pre-built wireframe components for rapid prototyping',
      author: 'Built-in',
      icon: 'layout',
      permissions: ['canvas:write', 'ui:panel'],
      menuItems: [{ label: 'Browse Wireframes', action: 'browse-wireframes' }],
    },
    enabled: true,
  },
  {
    manifest: {
      id: 'design-tokens',
      name: 'Design Tokens',
      version: '1.0.0',
      description: 'Manage and apply design tokens (colors, spacing, typography)',
      author: 'Built-in',
      icon: 'brush',
      permissions: ['canvas:read', 'canvas:write'],
      menuItems: [{ label: 'Apply Tokens', action: 'apply-tokens' }],
    },
    enabled: false,
  },
  {
    manifest: {
      id: 'content-reel',
      name: 'Content Reel',
      version: '1.0.0',
      description: 'Fill frames with realistic placeholder content',
      author: 'Built-in',
      icon: 'reel',
      permissions: ['canvas:write'],
      menuItems: [{ label: 'Fill Content', action: 'fill-content' }],
    },
    enabled: false,
  },
];

const PLUGIN_ICONS: Record<string, React.ElementType> = {
  palette: Palette,
  grid: Grid3X3,
  library: Library,
  download: Download,
  sparkles: Sparkles,
  layout: Layout,
  brush: Brush,
  reel: Film,
};

export function PluginManager({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  const [search, setSearch] = useState('');
  const [plugins, setPlugins] = useState<BuiltInPlugin[]>(INITIAL_PLUGINS);

  const filtered = plugins.filter(
    (p) =>
      p.manifest.name.toLowerCase().includes(search.toLowerCase()) ||
      p.manifest.description.toLowerCase().includes(search.toLowerCase()),
  );

  const togglePlugin = (id: string) => {
    setPlugins((prev) =>
      prev.map((p) =>
        p.manifest.id === id ? { ...p, enabled: !p.enabled } : p,
      ),
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`sm:max-w-[560px] ${NEU_RAISED} border-neutral-200/60 dark:border-neutral-700/40`}
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5" />
            {t('plugin.title', locale)}
          </DialogTitle>
          <DialogDescription>
            {t('plugin.description', locale)}
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("plugin.searchPlugins", locale)}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`pl-9 ${NEU_INSET} border-neutral-200/40 dark:border-neutral-700/30`}
          />
        </div>

        {/* Plugin List */}
        <ScrollArea className="h-[340px] pr-1">
          <div className="space-y-2">
            {filtered.map((plugin) => {
              const IconComponent =
                PLUGIN_ICONS[plugin.manifest.icon ?? ''] ?? Package;
              return (
                <div
                  key={plugin.manifest.id}
                  className={`flex items-center gap-3 rounded-lg border border-neutral-200/40 dark:border-neutral-700/30 p-3 transition-all ${
                    plugin.enabled
                      ? NEU_RAISED
                      : 'bg-muted/40 opacity-70'
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <IconComponent className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">
                        {plugin.manifest.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        v{plugin.manifest.version}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {plugin.manifest.description}
                    </p>
                  </div>
                  <Switch
                    checked={plugin.enabled}
                    onCheckedChange={() => togglePlugin(plugin.manifest.id)}
                  />
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Search className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm">{t("plugin.noPlugins", locale)}</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-200/40 dark:border-neutral-700/30">
          <p className="text-xs text-muted-foreground">
            {t('plugin.activeCount', locale, { active: plugins.filter((p) => p.enabled).length, total: plugins.length })}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info(t('plugin.marketplaceComingSoon', locale))}
            className={NEU_RAISED}
          >
            <Plus className="h-4 w-4" />
            {t('plugin.installFromUrl', locale)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
