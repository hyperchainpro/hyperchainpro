'use client';

import { useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/app-store';
import { useAuthStore } from '@/store/auth-store';
import { DESIGN_PLUGINS, PLUGIN_CATEGORIES, type DesignPlugin } from '@/lib/plugins-data';
import { Puzzle } from 'lucide-react';
import { executePluginAction } from '@/lib/plugin-actions';
import { t, type Locale } from '@/lib/i18n';

function PluginIcon({ name }: { name: string }) {
  let IconComponent: React.ElementType | null = null;
  try {
    const maybeIcon = LucideIcons[name as keyof typeof LucideIcons];
    if (maybeIcon && typeof maybeIcon === 'function') {
      IconComponent = maybeIcon;
    }
  } catch { /* fallback */ }
  const FinalIcon = IconComponent ?? Puzzle;
  return <FinalIcon className="size-4" />;
}

export function PluginsPanel() {
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  const installedIds = useAppStore((s) => s.installedPluginIds);
  const setPluginDialogOpen = useAppStore((s) => s.setPluginDialogOpen);
  const installedSet = useMemo(() => new Set(installedIds), [installedIds]);

  // Group installed plugins by category
  const grouped = useMemo(() => {
    const map = new Map<string, DesignPlugin[]>();
    for (const p of DESIGN_PLUGINS) {
      if (!installedSet.has(p.id)) continue;
      const list = map.get(p.category) ?? [];
      list.push(p);
      map.set(p.category, list);
    }
    return map;
  }, [installedSet]);

  const totalInstalled = installedIds.length;

  if (totalInstalled === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 px-6 py-12">
        <div className="size-14 flex items-center justify-center rounded-2xl bg-background mb-4 shadow-[3px_3px_6px_rgba(0,0,0,0.06),-3px_-3px_6px_rgba(255,255,255,0.7)] dark:shadow-[3px_3px_6px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(30,30,30,0.05)]">
          <Puzzle className="size-7 text-muted-foreground/40" />
        </div>
        <p className="text-xs font-medium text-muted-foreground mb-1">
          {t('plugins.noPlugins', locale)}
        </p>
        <p className="text-[11px] text-muted-foreground/60 text-center leading-relaxed mb-4">
          {t('plugins.noPluginsHint', locale)}
        </p>
        <button
          onClick={() => setPluginDialogOpen(true)}
          className="text-xs font-medium text-primary hover:text-primary/80 transition-colors border-0 bg-transparent cursor-pointer"
        >
          {t('plugins.browseAll', locale)}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-3">
          {PLUGIN_CATEGORIES.filter((cat) => grouped.has(cat.id)).map((cat) => {
            const plugins = grouped.get(cat.id)!;
            return (
              <div key={cat.id}>
                <div className="flex items-center gap-1.5 px-1 mb-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {cat.label}
                  </span>
                  <Badge variant="secondary" className="h-4 min-w-4 px-1 text-[10px] leading-4 rounded-full border-0 bg-foreground/5 text-muted-foreground">
                    {plugins.length}
                  </Badge>
                </div>
                <div className="space-y-0.5">
                  {plugins.map((plugin) => (
                    <PluginItem key={plugin.id} plugin={plugin} locale={locale} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer: open marketplace */}
      <div className="shrink-0 border-t border-border/40 p-2">
        <button
          onClick={() => setPluginDialogOpen(true)}
          className="w-full flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground transition-all duration-200 border-0 bg-transparent cursor-pointer neu-flat"
        >
          <Puzzle className="size-3.5" />
          {t('plugins.browseAll', locale)}
        </button>
      </div>
    </div>
  );
}

function PluginItem({ plugin, locale }: { plugin: DesignPlugin; locale: Locale }) {
  const handleUsePlugin = () => {
    executePluginAction(plugin);
  };

  return (
    <button
      onClick={handleUsePlugin}
      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs hover:bg-accent/50 transition-all duration-200 border-0 bg-transparent cursor-pointer group min-h-[36px]"
    >
      <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-foreground/5 text-foreground group-hover:bg-foreground/10 transition-colors">
        <PluginIcon name={plugin.icon} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium leading-tight truncate">{plugin.name}</p>
        <p className="text-[10px] text-muted-foreground truncate leading-tight mt-0.5">
          {plugin.description}
        </p>
      </div>
    </button>
  );
}