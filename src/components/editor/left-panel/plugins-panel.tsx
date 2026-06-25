'use client';

import { useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/store/app-store';
import { useAuthStore } from '@/store/auth-store';
import { DESIGN_PLUGINS, PLUGIN_CATEGORIES, type DesignPlugin } from '@/lib/plugins-data';
import { Puzzle, Sparkles } from 'lucide-react';
import { executePluginAction } from '@/lib/plugin-actions';
import { t, type Locale } from '@/lib/i18n';
import { getCategoryTheme } from '@/lib/category-theme';

function PluginIcon({ name, size = 'size-3.5' }: { name: string; size?: string }) {
  let IconComponent: React.ElementType | null = null;
  try {
    const maybeIcon = (LucideIcons as unknown as Record<string, React.ElementType>)[name];
    if (maybeIcon && typeof maybeIcon === 'function') {
      IconComponent = maybeIcon;
    }
  } catch { /* fallback */ }
  const FinalIcon = IconComponent ?? Puzzle;
  return <FinalIcon className={size} />;
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
        <div className="size-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 mb-4">
          <Puzzle className="size-7 text-violet-400" />
        </div>
        <p className="text-xs font-semibold text-foreground mb-1">
          {t('plugins.noPlugins', locale)}
        </p>
        <p className="text-[11px] text-muted-foreground text-center leading-relaxed mb-4 max-w-[160px]">
          {t('plugins.noPluginsHint', locale)}
        </p>
        <button
          onClick={() => setPluginDialogOpen(true)}
          className="flex items-center gap-1.5 text-xs font-semibold text-white bg-gradient-to-r from-violet-500 to-pink-500 rounded-xl px-4 py-2 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 transition-all duration-200 hover:-translate-y-0.5 border-0 cursor-pointer"
        >
          <Sparkles className="size-3" />
          {t('plugins.browseAll', locale)}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2.5">
          {PLUGIN_CATEGORIES.filter((cat) => grouped.has(cat.id)).map((cat) => {
            const plugins = grouped.get(cat.id)!;
            const theme = getCategoryTheme(cat.id);
            return (
              <div key={cat.id}>
                {/* Category header */}
                <div className="flex items-center gap-1.5 px-1 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {cat.label}
                  </span>
                  <div
                    className="cat-count-badge text-white"
                    style={{ background: theme.gradient }}
                  >
                    {plugins.length}
                  </div>
                </div>
                {/* Plugin list */}
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
      <div className="shrink-0 p-2">
        <button
          onClick={() => setPluginDialogOpen(true)}
          className="w-full flex items-center justify-center gap-2 h-10 rounded-xl text-xs font-semibold text-white cursor-pointer border-0 transition-all duration-200 hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
            boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)',
          }}
        >
          <Sparkles className="size-3.5" />
          {t('plugins.browseAll', locale)}
        </button>
      </div>
    </div>
  );
}

function PluginItem({ plugin, locale }: { plugin: DesignPlugin; locale: Locale }) {
  const theme = getCategoryTheme(plugin.category);

  const handleUsePlugin = () => {
    executePluginAction(plugin);
  };

  return (
    <button
      onClick={handleUsePlugin}
      className="plugin-sidebar-item group"
    >
      <div
        className="plugin-sidebar-icon text-white"
        style={{ background: theme.gradient }}
      >
        <PluginIcon name={plugin.icon} size="size-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold leading-tight truncate">{plugin.name}</p>
        <p className="text-[10px] text-muted-foreground truncate leading-tight mt-0.5">
          {plugin.description}
        </p>
      </div>
    </button>
  );
}