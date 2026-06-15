'use client'

import { useState, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as LucideIcons from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Search, X, Download, Trash2, Sparkles, Puzzle } from 'lucide-react'
import { DESIGN_PLUGINS, type DesignPlugin, PLUGIN_CATEGORIES } from '@/lib/plugins-data'
import { t } from '@/lib/i18n'
import { useAuthStore } from '@/store/auth-store'

const iconBgColors: Record<string, string> = {
  shapes: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  charts: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  icons: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  layout: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  wireframe: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
  diagrams: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  text: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  images: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  colors: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
  export: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
  templates: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  'ai-tools': 'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400',
  collaboration: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  accessibility: 'bg-lime-500/10 text-lime-600 dark:text-lime-400',
  math: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  typography: 'bg-red-500/10 text-red-600 dark:text-red-400',
  branding: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  animation: 'bg-cyan-600/10 text-cyan-700 dark:text-cyan-300',
  prototyping: 'bg-emerald-600/10 text-emerald-700 dark:text-emerald-300',
  '3d': 'bg-violet-600/10 text-violet-700 dark:text-violet-300',
  illustration: 'bg-pink-600/10 text-pink-700 dark:text-pink-300',
  'photo-editing': 'bg-orange-600/10 text-orange-700 dark:text-orange-300',
  responsive: 'bg-teal-600/10 text-teal-700 dark:text-teal-300',
  'code-gen': 'bg-blue-600/10 text-blue-700 dark:text-blue-300',
  handoff: 'bg-amber-600/10 text-amber-700 dark:text-amber-300',
}

const categoryBadgeColors: Record<string, string> = {
  shapes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  charts: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  icons: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  layout: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  wireframe: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
  diagrams: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  text: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  images: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  colors: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  export: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  templates: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  'ai-tools': 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-400',
  collaboration: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  accessibility: 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400',
  math: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  typography: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  branding: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  animation: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  prototyping: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  '3d': 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  illustration: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  'photo-editing': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  responsive: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  'code-gen': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  handoff: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
}

interface PluginBrowserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInstallPlugin?: (pluginId: string) => void
}

export function PluginBrowserDialog({
  open,
  onOpenChange,
  onInstallPlugin,
}: PluginBrowserDialogProps) {
  const locale = useAuthStore((s) => s.user?.language ?? 'en')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [installedMap, setInstalledMap] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {}
    for (const p of DESIGN_PLUGINS) {
      map[p.id] = p.isInstalled
    }
    return map
  })
  const scrollRef = useRef<HTMLDivElement>(null)

  const installedCount = Object.values(installedMap).filter(Boolean).length
  const totalPlugins = DESIGN_PLUGINS.length

  const handleToggleInstall = useCallback(
    (plugin: DesignPlugin) => {
      setInstalledMap((prev) => ({ ...prev, [plugin.id]: !prev[plugin.id] }))
      onInstallPlugin?.(plugin.id)
    },
    [onInstallPlugin],
  )

  const filteredPlugins = useMemo(() => {
    let result = DESIGN_PLUGINS

    if (activeCategory !== 'all') {
      result = result.filter((p) => p.category === activeCategory)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some((tag) => tag.toLowerCase().includes(q)) ||
          p.author.toLowerCase().includes(q),
      )
    }

    return result
  }, [activeCategory, searchQuery])

  const handleCategoryChange = useCallback((cat: string) => {
    setActiveCategory(cat)
    // Scroll to top of plugin grid
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
  }, [])

  const renderPluginIcon = (iconName: string) => {
    try {
      const IconComponent = LucideIcons[iconName as keyof typeof LucideIcons]
      if (IconComponent && typeof IconComponent === 'function') {
        return <IconComponent className="size-4" />
      }
    } catch {
      // fallback
    }
    return <Puzzle className="size-4" />
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[85vh] max-w-5xl flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:h-[80vh] neu-raised bg-background border-0">
        {/* ── Header ──────────────────────────────────────────── */}
        <DialogHeader className="shrink-0 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
                <Sparkles className="size-5 text-amber-500" />
                {t('plugin_marketplace', locale) || 'Plugin Marketplace'}
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-sm text-muted-foreground">
                {installedCount} of {totalPlugins} plugins installed
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 neu-icon-btn"
              onClick={() => onOpenChange(false)}
            >
              <X className="size-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>

          {/* Search */}
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('search_plugins', locale) || 'Search plugins...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 pl-9 pr-9 neu-input border-0"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 size-7 -translate-y-1/2"
                onClick={() => setSearchQuery('')}
              >
                <X className="size-3.5" />
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* ── Category Tabs (simple buttons, no nested Tabs) ── */}
        <div className="shrink-0 border-b border-border/30 px-2 sm:px-4">
          <ScrollArea orientation="horizontal" className="w-full">
            <div className="flex gap-1 py-2">
              <button
                onClick={() => handleCategoryChange('all')}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 sm:px-4 sm:text-sm border-0 ${
                  activeCategory === 'all'
                    ? 'neu-pressed text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                All
              </button>
              {PLUGIN_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-all duration-200 sm:px-4 sm:text-sm border-0 ${
                    activeCategory === cat.id
                      ? 'neu-pressed text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* ── Plugin Grid ─────────────────────────────────────── */}
        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto neu-scroll">
          <div className="p-3 sm:p-4 lg:p-6">
            {filteredPlugins.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Search className="mb-3 size-10 text-muted-foreground/50" />
                <p className="text-sm font-medium text-muted-foreground">
                  No plugins found
                </p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  Try adjusting your search or category filter
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
                {filteredPlugins.map((plugin) => (
                  <motion.div
                    key={plugin.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="group"
                  >
                    <div className="flex h-full flex-col rounded-xl neu-card bg-background p-3 transition-all duration-200 sm:p-4">
                      {/* Top row: icon + badges */}
                      <div className="flex items-start justify-between gap-2">
                        <div
                          className={`flex size-9 shrink-0 items-center justify-center rounded-full sm:size-10 ${iconBgColors[plugin.category] ?? 'bg-muted text-muted-foreground'}`}
                        >
                          {renderPluginIcon(plugin.icon)}
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          {plugin.isPopular && (
                            <Badge
                              variant="secondary"
                              className="gap-1 rounded-full px-1.5 py-0 text-[10px] font-semibold leading-4 text-amber-700 dark:text-amber-400 neu-badge border-0"
                            >
                              <Sparkles className="size-2.5" />
                              Popular
                            </Badge>
                          )}
                          <Badge
                            variant="secondary"
                            className={`rounded-full px-1.5 py-0 text-[10px] font-medium capitalize leading-4 border-0 neu-badge ${categoryBadgeColors[plugin.category] ?? 'bg-muted text-muted-foreground'}`}
                          >
                            {plugin.category.replace(/-/g, ' ')}
                          </Badge>
                        </div>
                      </div>

                      {/* Name */}
                      <h3 className="mt-2.5 text-sm font-semibold leading-tight tracking-tight">
                        {plugin.name}
                      </h3>

                      {/* Description */}
                      <p className="mt-1 line-clamp-2 flex-1 text-xs leading-relaxed text-muted-foreground sm:text-[13px]">
                        {plugin.description}
                      </p>

                      {/* Meta */}
                      <p className="mt-2 text-[10px] leading-none text-muted-foreground/60 sm:text-xs">
                        v{plugin.version} &middot; {plugin.author}
                      </p>

                      {/* Install button */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={installedMap[plugin.id] ? 'secondary' : 'default'}
                            size="sm"
                            className={`mt-2.5 h-9 min-h-[44px] w-full gap-1.5 text-xs font-medium sm:text-sm border-0 ${
                              installedMap[plugin.id] ? 'btn-neu' : 'btn-neu-primary'
                            }`}
                            onClick={() => handleToggleInstall(plugin)}
                          >
                            {installedMap[plugin.id] ? (
                              <>
                                <Trash2 className="size-3.5" />
                                Uninstall
                              </>
                            ) : (
                              <>
                                <Download className="size-3.5" />
                                Install
                              </>
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          {installedMap[plugin.id]
                            ? `Remove ${plugin.name}`
                            : `Add ${plugin.name} to your workspace`}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}