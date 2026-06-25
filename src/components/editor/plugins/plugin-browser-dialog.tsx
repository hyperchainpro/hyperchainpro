'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
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
import { Search, X, Download, Trash2, Sparkles, Puzzle, Star, TrendingUp, Zap, Crown } from 'lucide-react'
import { DESIGN_PLUGINS, type DesignPlugin, PLUGIN_CATEGORIES } from '@/lib/plugins-data'
import { getCategoryTheme, allTabTheme } from '@/lib/category-theme'
import { t } from '@/lib/i18n'
import { useAuthStore } from '@/store/auth-store'
import { useAppStore } from '@/store/app-store'
import { toast } from 'sonner'
import { SafeRender } from '@/components/safe-render'

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
  const autoInstallIds = useAppStore((s) => s.autoInstallPluginIds)
  const installedPluginIds = useAppStore((s) => s.installedPluginIds)
  const togglePluginInstalled = useAppStore((s) => s.togglePluginInstalled)
  const scrollRef = useRef<HTMLDivElement>(null)
  const autoAppliedRef = useRef(false)

  const installedSet = useMemo(
    () => new Set(installedPluginIds),
    [installedPluginIds],
  )

  // Apply auto-install plugins when dialog opens
  useEffect(() => {
    if (!open) {
      autoAppliedRef.current = false
      return
    }
    if (!autoInstallIds || autoInstallIds.length === 0 || autoAppliedRef.current) return
    autoAppliedRef.current = true
    const current = useAppStore.getState().installedPluginIds
    const toAdd = autoInstallIds.filter((id) => !current.includes(id))
    if (toAdd.length > 0) {
      for (const id of toAdd) {
        useAppStore.getState().togglePluginInstalled(id)
      }
      toast.success(`${toAdd.length} plugins auto-installed for this board`)
    }
    useAppStore.getState().setAutoInstallPluginIds(null)
  }, [open, autoInstallIds])

  const installedCount = installedPluginIds.length
  const totalPlugins = DESIGN_PLUGINS.length

  const handleToggleInstall = useCallback(
    (plugin: DesignPlugin) => {
      togglePluginInstalled(plugin.id)
      onInstallPlugin?.(plugin.id)
    },
    [togglePluginInstalled, onInstallPlugin],
  )

  const filteredPlugins = useMemo(() => {
    let result = Array.isArray(DESIGN_PLUGINS) ? DESIGN_PLUGINS : []

    if (activeCategory !== 'all') {
      result = result.filter((p) => p && p.category === activeCategory)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (p) =>
          p &&
          (p.name || '').toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q) ||
          (p.category || '').toLowerCase().includes(q) ||
          (p.tags || []).some((tag) => tag.toLowerCase().includes(q)) ||
          (p.author || '').toLowerCase().includes(q),
      )
    }

    return result
  }, [activeCategory, searchQuery])

  const handleCategoryChange = useCallback((cat: string) => {
    setActiveCategory(cat)
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
  }, [])

  const popularPlugins = useMemo(
    () => (Array.isArray(DESIGN_PLUGINS) ? DESIGN_PLUGINS.filter((p) => p?.isPopular) : []).slice(0, 4),
    [],
  )

  const renderPluginIcon = (iconName: string, size = 'size-5') => {
    try {
      const IconComponent = (LucideIcons as unknown as Record<string, React.ElementType>)[iconName]
      if (IconComponent && typeof IconComponent === 'function') {
        const Comp = IconComponent as React.ElementType
        return <Comp className={size} />
      }
    } catch {
      // fallback
    }
    return <Puzzle className={size} />
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex h-[85vh] max-w-6xl flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:h-[85vh] bg-background border border-border/40 shadow-2xl"
      >
        {/* ── Header ──────────────────────────────────────────── */}
        <DialogHeader className="shrink-0 border-b border-border/30 px-5 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 shadow-lg shadow-violet-500/25">
                  <Sparkles className="size-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold tracking-tight">
                    {t('plugin_marketplace', locale as 'en' | 'id' | 'ja' | 'ko' | 'zh' | null) || 'Plugin Marketplace'}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    {installedCount} of {totalPlugins} plugins installed
                  </DialogDescription>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 size-9 rounded-xl hover:bg-foreground/5"
              onClick={() => onOpenChange(false)}
            >
              <X className="size-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>

          {/* Search */}
          <div className="plugin-search-wrap mt-3">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('search_plugins', locale as 'en' | 'id' | 'ja' | 'ko' | 'zh' | null) || 'Search plugins...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 pl-10 pr-9 text-sm"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1.5 top-1/2 size-7 -translate-y-1/2 rounded-lg"
                onClick={() => setSearchQuery('')}
              >
                <X className="size-3.5" />
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* ── Category Tabs ── */}
        <div className="shrink-0 border-b border-border/20 px-3 sm:px-5">
          <ScrollArea orientation={"horizontal" as const} className="w-full">
            <div className="flex gap-1.5 py-2.5">
              <button
                onClick={() => handleCategoryChange('all')}
                className={`cat-tab ${activeCategory === 'all' ? 'active ' + allTabTheme : ''}`}
              >
                All
              </button>
              {PLUGIN_CATEGORIES.map((cat) => {
                const theme = getCategoryTheme(cat.id)
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`cat-tab ${activeCategory === cat.id ? 'active ' + theme.tabActive : ''}`}
                  >
                    <span className="mr-1 text-xs">{theme.emoji}</span>
                    {cat.label}
                  </button>
                )
              })}
            </div>
          </ScrollArea>
        </div>

        {/* ── Content Area ─────────────────────────────────────── */}
        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto neu-scroll">
          <SafeRender>
          <div className="p-4 sm:p-5 lg:p-6">
            {/* ── Featured Banner (only when showing "All" + no search) ── */}
            {activeCategory === 'all' && !searchQuery.trim() && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="featured-banner text-white mb-6"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 50%, #f97316 100%)',
                }}
              >
                <div className="relative z-10 flex items-center gap-5 flex-wrap">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30">
                    <Crown className="size-7" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold sm:text-lg">Explore 200+ Design Plugins</h3>
                    <p className="mt-0.5 text-sm text-white/80 max-w-md">
                      From shapes to AI tools — supercharge your design workflow with community-built plugins
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-4 text-sm">
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-bold">{totalPlugins}</span>
                      <span className="text-white/60 text-xs">Plugins</span>
                    </div>
                    <div className="w-px h-10 bg-white/20" />
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-bold">41</span>
                      <span className="text-white/60 text-xs">Categories</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Popular Section (only when showing "All" + no search) ── */}
            {activeCategory === 'all' && !searchQuery.trim() && popularPlugins.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="size-4 text-amber-500" />
                  <h2 className="text-sm font-bold tracking-tight">Popular Plugins</h2>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
                  {popularPlugins.map((plugin) => {
                    const theme = getCategoryTheme(plugin.category)
                    const isInstalled = installedSet.has(plugin.id)
                    return (
                      <motion.div
                        key={`popular-${plugin.id}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.25 }}
                        className="group cursor-pointer"
                        onClick={() => !isInstalled && handleToggleInstall(plugin)}
                      >
                        <div className="plugin-card">
                          <div
                            className="plugin-card-header"
                            style={{ background: theme.gradient }}
                          >
                            <div className="plugin-card-icon-wrap">
                              <div className="text-white">
                                {renderPluginIcon(plugin.icon, 'size-6')}
                              </div>
                            </div>
                            {/* Popular badge */}
                            <div className="absolute top-2.5 right-2.5 z-10">
                              <div className="flex items-center gap-1 rounded-full bg-white/20 backdrop-blur-sm px-2 py-0.5 text-[10px] font-semibold text-white border border-white/20">
                                <Star className="size-2.5 fill-current" />
                                Popular
                              </div>
                            </div>
                          </div>
                          <div className="plugin-card-body">
                            <div className="flex items-center gap-1.5 mb-1">
                              <h3 className="text-sm font-semibold leading-tight tracking-tight">
                                {plugin.name}
                              </h3>
                            </div>
                            <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground mb-3">
                              {plugin.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <Badge
                                variant="secondary"
                                className={`${theme.badgeBg} ${theme.badgeText} border-0 text-[10px] font-semibold rounded-md px-1.5 py-0 h-5`}
                              >
                                {plugin.category.replace(/-/g, ' ')}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground/60">
                                v{plugin.version}
                              </span>
                            </div>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  className={`plugin-install-btn mt-3 ${isInstalled ? 'uninstall' : 'install'}`}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleToggleInstall(plugin)
                                  }}
                                >
                                  {isInstalled ? (
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
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                {isInstalled
                                  ? `Remove ${plugin.name}`
                                  : `Add ${plugin.name} to your workspace`}
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── All Plugins Grid ── */}
            {filteredPlugins.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="size-16 rounded-2xl bg-foreground/5 flex items-center justify-center mb-4">
                  <Search className="size-7 text-muted-foreground/40" />
                </div>
                <p className="text-sm font-semibold text-muted-foreground">
                  No plugins found
                </p>
                <p className="mt-1 text-xs text-muted-foreground/60">
                  Try adjusting your search or category filter
                </p>
              </div>
            ) : (
              <>
                {(activeCategory !== 'all' || searchQuery.trim()) && (
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold tracking-tight">
                      {activeCategory !== 'all'
                        ? `${PLUGIN_CATEGORIES.find((c) => c.id === activeCategory)?.label} Plugins`
                        : 'Search Results'}
                    </h2>
                    <span className="text-xs text-muted-foreground">
                      {filteredPlugins.length} plugin{filteredPlugins.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
                  <AnimatePresence mode="popLayout">
                    {filteredPlugins.map((plugin, index) => {
                      const theme = getCategoryTheme(plugin.category)
                      const isInstalled = installedSet.has(plugin.id)
                      return (
                        <motion.div
                          key={plugin.id}
                          layout
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{
                            duration: 0.2,
                            delay: Math.min(index * 0.03, 0.3),
                          }}
                          className="group"
                        >
                          <div className="plugin-card">
                            {/* Colored gradient header with icon */}
                            <div
                              className="plugin-card-header"
                              style={{ background: theme.gradient }}
                            >
                              <div className="plugin-card-icon-wrap">
                                <div className="text-white">
                                  {renderPluginIcon(plugin.icon, 'size-5')}
                                </div>
                              </div>
                              {plugin.isPopular && (
                                <div className="absolute top-2 right-2 z-10">
                                  <div className="flex items-center gap-0.5 rounded-full bg-white/20 backdrop-blur-sm px-1.5 py-0.5 text-[9px] font-bold text-white border border-white/20">
                                    <Zap className="size-2.5 fill-current" />
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Card body */}
                            <div className="plugin-card-body">
                              <h3 className="text-[13px] font-semibold leading-tight tracking-tight mb-0.5">
                                {plugin.name}
                              </h3>
                              <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground mb-2.5">
                                {plugin.description}
                              </p>

                              {/* Meta row */}
                              <div className="flex items-center justify-between mb-2.5">
                                <Badge
                                  variant="secondary"
                                  className={`${theme.badgeBg} ${theme.badgeText} border-0 text-[10px] font-semibold rounded-md px-1.5 py-0 h-5`}
                                >
                                  {theme.emoji} {plugin.category.replace(/-/g, ' ')}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground/50">
                                  v{plugin.version} · {plugin.author}
                                </span>
                              </div>

                              {/* Install button */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    className={`plugin-install-btn ${isInstalled ? 'uninstall' : 'install'}`}
                                    onClick={() => handleToggleInstall(plugin)}
                                  >
                                    {isInstalled ? (
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
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                  {isInstalled
                                    ? `Remove ${plugin.name}`
                                    : `Add ${plugin.name} to your workspace`}
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>
          </SafeRender>
        </div>
      </DialogContent>
    </Dialog>
  )
}