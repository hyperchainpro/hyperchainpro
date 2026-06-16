'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Plus,
  LayoutDashboard,
  Star,
  Clock,
  Users,
  Bell,
  ChevronDown,
  Grid,
  List,
  SlidersHorizontal,
  GitBranch,
  ChevronRight,
  Sparkles,
  FilePlus,
  Settings,
  Moon,
  Sun,
  Monitor,
  LogOut,
  Share2,
  Menu,
  Home,
  User,
  Upload,
  Wand2,
  Puzzle,
  Shield,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import {
  BoardCard,
  type BoardCardData,
} from '@/components/dashboard/board-card'
import {
  CreateBoardDialog,
} from '@/components/dashboard/create-board-dialog'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/app-store'
import { useAuthStore } from '@/store/auth-store'
import { PluginBrowserDialog } from '@/components/editor/plugins/plugin-browser-dialog'
import { UploadDesignDialog } from '@/components/community/upload-design-dialog'
import { t, LOCALES, type Locale } from '@/lib/i18n'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
import { useIsMobile } from '@/hooks/use-mobile'
import { getAutoInstallPlugins } from '@/lib/auto-install-plugins'

type FilterTab = 'all' | 'recent' | 'starred'
type SortOption = 'lastModified' | 'name' | 'created'
type SidebarSection = 'my-boards' | 'shared' | 'starred' | 'recent'

// ── Demo data ──────────────────────────────────────────────────────────────

const demoBoards: BoardCardData[] = [
  {
    id: 'b1',
    name: 'Product Roadmap Q4',
    description: 'High-level product roadmap for Q4 with key milestones and deliverables.',
    members: [
      { id: 'u1', name: 'Alex Chen' },
      { id: 'u2', name: 'Sarah Kim' },
      { id: 'u3', name: 'Jordan Lee' },
      { id: 'u4', name: 'Mike Wu' },
      { id: 'u5', name: 'Nora Patel' },
    ],
    branchCount: 5,
    commitCount: 42,
    isStarred: true,
    updatedAt: new Date(Date.now() - 1000 * 60 * 30),
    isPublic: false,
  },
  {
    id: 'b2',
    name: 'User Research Synthesis',
    description: 'Mapping user interview findings and insights from Q3 research.',
    members: [
      { id: 'u6', name: 'Emily Zhang' },
      { id: 'u2', name: 'Sarah Kim' },
    ],
    branchCount: 3,
    commitCount: 18,
    isStarred: false,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
    isPublic: true,
  },
  {
    id: 'b3',
    name: 'Architecture Decision Records',
    description: 'ADR board for tracking technical architecture decisions.',
    members: [
      { id: 'u1', name: 'Alex Chen' },
      { id: 'u7', name: 'Dev Sharma' },
      { id: 'u8', name: 'Chris Park' },
    ],
    branchCount: 8,
    commitCount: 67,
    isStarred: true,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    isPublic: false,
  },
  {
    id: 'b4',
    name: 'Sprint Planning Board',
    description: 'Weekly sprint planning with tasks, stories, and blockers.',
    members: [
      { id: 'u3', name: 'Jordan Lee' },
      { id: 'u4', name: 'Mike Wu' },
      { id: 'u9', name: 'Rina Takahashi' },
      { id: 'u10', name: 'Luis Garcia' },
    ],
    branchCount: 12,
    commitCount: 156,
    isStarred: false,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
    isPublic: false,
  },
  {
    id: 'b5',
    name: 'Brand Identity Exploration',
    description: 'Visual mood boards and brand exploration for the new identity.',
    members: [
      { id: 'u5', name: 'Nora Patel' },
    ],
    branchCount: 2,
    commitCount: 9,
    isStarred: true,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    isPublic: true,
  },
  {
    id: 'b6',
    name: 'API Design Workshop',
    description: 'Collaborative API endpoint design and data model diagrams.',
    members: [
      { id: 'u1', name: 'Alex Chen' },
      { id: 'u7', name: 'Dev Sharma' },
      { id: 'u2', name: 'Sarah Kim' },
      { id: 'u6', name: 'Emily Zhang' },
      { id: 'u3', name: 'Jordan Lee' },
      { id: 'u4', name: 'Mike Wu' },
    ],
    branchCount: 6,
    commitCount: 34,
    isStarred: false,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    isPublic: false,
  },
  {
    id: 'b7',
    name: 'Customer Journey Map',
    description: 'End-to-end customer experience mapping for the onboarding flow.',
    members: [
      { id: 'u8', name: 'Chris Park' },
      { id: 'u9', name: 'Rina Takahashi' },
    ],
    branchCount: 1,
    commitCount: 5,
    isStarred: false,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    isPublic: true,
  },
  {
    id: 'b8',
    name: 'Design System Components',
    description: 'Shared component library documentation and usage guidelines.',
    members: [
      { id: 'u5', name: 'Nora Patel' },
      { id: 'u10', name: 'Luis Garcia' },
      { id: 'u6', name: 'Emily Zhang' },
    ],
    branchCount: 15,
    commitCount: 203,
    isStarred: true,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    isPublic: true,
  },
]

const sidebarSectionsTemplate = [
  { id: 'my-boards' as SidebarSection, labelKey: 'dashboard.myBoards', icon: LayoutDashboard },
  { id: 'shared' as SidebarSection, labelKey: 'dashboard.sharedWithMe', icon: Users },
  { id: 'starred' as SidebarSection, labelKey: 'dashboard.starred', icon: Star },
  { id: 'recent' as SidebarSection, labelKey: 'dashboard.recent', icon: Clock },
]

// ── Animation variants ──────────────────────────────────────────────────────

const boardContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const boardItemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
}

// ── Small helper components ──────────────────────────────────────────────

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const user = useAuthStore((s) => s.user)
  const locale = (user?.language as Locale) ?? 'en'

  const cycleTheme = () => {
    const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'
    setTheme(next)
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" className="neu-icon-btn" onClick={cycleTheme}>
          {theme === 'dark' ? <Moon className="size-4" /> : theme === 'light' ? <Sun className="size-4" /> : <Monitor className="size-4" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{t('settings.theme.mode', locale)}: {theme === 'light' ? t('settings.light', locale) : theme === 'dark' ? t('settings.dark', locale) : t('settings.system', locale)}</TooltipContent>
    </Tooltip>
  )
}

function LanguageSwitcher() {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const currentLocale = (user?.language as Locale) ?? 'en'
  const current = LOCALES.find(l => l.code === currentLocale)

  const handleCycle = () => {
    const idx = LOCALES.findIndex(l => l.code === currentLocale)
    const next = LOCALES[(idx + 1) % LOCALES.length]
    if (user) {
      setUser({ ...user, language: next.code })
      // Persist to API
      fetch('/api/user/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, language: next.code }),
      }).catch(() => {})
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-8 px-2" onClick={handleCycle}>
          <span className="text-base leading-none">{current?.flag ?? '🌐'}</span>
          <span className="hidden sm:inline">{current?.name ?? 'English'}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{t('settings.tabs.language', currentLocale)}</TooltipContent>
    </Tooltip>
  )
}

// ── Sidebar content (shared between desktop aside & mobile Sheet) ──────────

function SidebarContent({
  sidebarSections,
  activeSidebar,
  setActiveSidebar,
  setActiveFilter,
  onCreateBoard,
  userName,
  userInitials,
  locale,
  boards,
  onOpenBoard,
}: {
  sidebarSections: { id: SidebarSection; labelKey: string; icon: React.ElementType; count: number }[]
  activeSidebar: SidebarSection | null
  setActiveSidebar: (v: SidebarSection | null) => void
  setActiveFilter: (v: FilterTab) => void
  onCreateBoard: () => void
  userName: string
  userInitials: string
  locale: Locale
  boards: BoardCardData[]
  onOpenBoard: (boardId: string) => void
}) {
  return (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4">
        <div className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background shadow-sm">
          <GitBranch className="size-4" />
        </div>
        <span className="text-base font-bold tracking-tight">BranchBoard</span>
      </div>

      <div className="neu-divider" />

      {/* New Board button */}
      <div className="p-3">
        <Button
          onClick={onCreateBoard}
          className="btn-neu w-full gap-2 text-foreground font-medium"
        >
          <Plus className="size-4" />
          {t('dashboard.newBoard', locale)}
        </Button>
      </div>

      <div className="neu-divider" />

      {/* Navigation sections */}
      <ScrollArea className="flex-1 px-2 py-1">
        <nav className="flex flex-col gap-0.5" aria-label={t('dashboard.boardNavigation', locale)}>
          {sidebarSections.map((section) => {
            const Icon = section.icon
            const isActive = activeSidebar === section.id

            return (
              <Collapsible
                key={section.id}
                open={isActive}
                onOpenChange={(open) => {
                  if (open) {
                    setActiveSidebar(section.id)
                    setActiveFilter('all')
                  } else {
                    setActiveSidebar(null)
                  }
                }}
              >
                <CollapsibleTrigger asChild>
                  <button
                    className={cn(
                      'flex w-full items-center gap-2.5 px-3 py-2 text-sm font-medium transition-all duration-200 border-0',
                      isActive
                        ? 'neu-pressed !rounded-lg text-foreground'
                        : 'bg-transparent text-muted-foreground hover:shadow-[4px_4px_8px_rgba(0,0,0,0.07),-4px_-4px_8px_rgba(255,255,255,0.85)] dark:hover:shadow-[4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(50,50,60,0.1)] hover:text-foreground'
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="flex-1 text-left">{t(section.labelKey, locale)}</span>
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0 h-5 font-normal border-0"
                    >
                      {section.count}
                    </Badge>
                    <ChevronDown
                      className={cn(
                        'size-3.5 shrink-0 transition-transform duration-200',
                        isActive && 'rotate-180'
                      )}
                    />
                  </button>
                </CollapsibleTrigger>
                <AnimatePresence>
                  {isActive && (
                    <CollapsibleContent forceMount>
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="ml-4 mt-0.5 flex flex-col gap-0.5 pb-1">
                          {(() => {
                            let filteredBoards: BoardCardData[] = []
                            if (section.id === 'my-boards') {
                              filteredBoards = boards.slice(0, 8)
                            } else if (section.id === 'shared') {
                              filteredBoards = boards.filter(b => b.isPublic).slice(0, 8)
                            } else if (section.id === 'starred') {
                              filteredBoards = boards.filter(b => b.isStarred).slice(0, 8)
                            } else if (section.id === 'recent') {
                              filteredBoards = [...boards]
                                .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                                .slice(0, 8)
                            }
                            if (filteredBoards.length === 0) {
                              return (
                                <span className="text-[11px] text-muted-foreground px-2 py-1">
                                  {t('dashboard.noBoardsYet', locale)}
                                </span>
                              )
                            }
                            return filteredBoards.map((board) => (
                              <SidebarItem
                                key={board.id}
                                name={board.name}
                                boardId={board.id}
                                onClick={() => onOpenBoard(board.id)}
                              />
                            ))
                          })()}
                        </div>
                      </motion.div>
                    </CollapsibleContent>
                  )}
                </AnimatePresence>
              </Collapsible>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Sidebar footer */}
      <div className="neu-divider" />
      <div className="p-3">
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-muted-foreground">
          <Avatar className="size-6 neu-avatar">
            <AvatarFallback className="bg-foreground text-[10px] text-background font-medium">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs font-medium truncate">{userName}</span>
        </div>
      </div>
    </>
  )
}

// ── Component ──────────────────────────────────────────────────────────────

interface DashboardViewProps {
  onOpenSettings?: () => void
  onOpenShare?: () => void
}

export function DashboardView({ onOpenSettings, onOpenShare }: DashboardViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all')
  const [sortOption, setSortOption] = useState<SortOption>('lastModified')
  const [activeSidebar, setActiveSidebar] = useState<SidebarSection | null>('my-boards')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [boards, setBoards] = useState<BoardCardData[]>([])
  const [loading, setLoading] = useState(true)

  const isMobile = useIsMobile()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const locale = (user?.language as Locale) ?? 'en'
  const handleLogout = () => { logout() }

  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'
  const userName = user?.name ?? 'Alex Chen'

  useEffect(() => {
    fetch('/api/boards')
      .then(r => r.json())
      .then(data => {
        const apiBoards: BoardCardData[] = (data.boards || []).map((b: Record<string, unknown>) => ({
          id: b.id as string,
          name: b.name as string,
          description: b.description as string | undefined,
          members: [{ id: 'u1', name: 'Demo User' }],
          branchCount: (b.branchCount as number) || 0,
          commitCount: (b.commitCount as number) || 0,
          isStarred: false,
          updatedAt: b.updatedAt as string,
          isPublic: b.isPublic as boolean,
          deviceType: (b.deviceType as string) || null,
          deviceId: (b.deviceId as string) || null,
        }))
        setBoards(apiBoards)
      })
      .catch(() => { /* keep empty */ })
      .finally(() => setLoading(false))
  }, [])

  const sidebarSections = useMemo(() => [
    { ...sidebarSectionsTemplate[0], count: boards.length },
    { ...sidebarSectionsTemplate[1], count: boards.filter(b => b.isPublic).length },
    { ...sidebarSectionsTemplate[2], count: boards.filter(b => b.isStarred).length },
    { ...sidebarSectionsTemplate[3], count: boards.length },
  ], [boards])

  const filteredBoards = useMemo(() => {
    let items = [...boards]

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      items = items.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.description?.toLowerCase().includes(q)
      )
    }

    // Filter
    if (activeFilter === 'starred') {
      items = items.filter((b) => b.isStarred)
    } else if (activeFilter === 'recent') {
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
      items = items.filter((b) => new Date(b.updatedAt).getTime() > oneWeekAgo)
    }

    // Sidebar filter
    if (activeSidebar === 'starred') {
      items = items.filter((b) => b.isStarred)
    } else if (activeSidebar === 'shared') {
      items = items.filter((b) => b.isPublic)
    } else if (activeSidebar === 'recent') {
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
      items = items.filter((b) => new Date(b.updatedAt).getTime() > oneWeekAgo)
    }

    // Sort
    items.sort((a, b) => {
      switch (sortOption) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'created':
          return 0
        case 'lastModified':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      }
    })

    return items
  }, [searchQuery, activeFilter, sortOption, activeSidebar, boards])

  const handleCreateBoard = async (data: { name: string; description?: string; isPublic: boolean; templateId?: string; deviceType?: string; deviceId?: string }) => {
    try {
      const res = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          description: data.description || undefined,
          isPublic: data.isPublic,
          templateId: data.templateId,
          deviceType: data.deviceType,
          deviceId: data.deviceId,
        }),
      });
      if (!res.ok) throw new Error('Failed to create board');
      // Refresh the board list
      const listRes = await fetch('/api/boards');
      const listData = await listRes.json();
      const apiBoards: BoardCardData[] = (listData.boards || []).map((b: Record<string, unknown>) => ({
        id: b.id as string,
        name: b.name as string,
        description: b.description as string | undefined,
        members: [{ id: 'u1', name: 'Demo User' }],
        branchCount: (b.branchCount as number) || 0,
        commitCount: (b.commitCount as number) || 0,
        isStarred: false,
        updatedAt: b.updatedAt as string,
        isPublic: b.isPublic as boolean,
        deviceType: (b.deviceType as string) || null,
        deviceId: (b.deviceId as string) || null,
      }));
      setBoards(apiBoards);

      // Auto-install relevant plugins based on device type
      const autoIds = getAutoInstallPlugins(data.deviceType);
      if (autoIds.length > 0) {
        useAppStore.getState().setAutoInstallPluginIds(autoIds);
      }

      toast.success(t('dashboard.boardCreated', locale))
      setMobileSidebarOpen(false)
    } catch (err) {
      console.error('Failed to create board:', err)
      toast.error(t('dashboard.boardCreatedFailed', locale))
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ─── Desktop Sidebar ────────────────────────────────────────────── */}
      <aside className="hidden md:flex w-64 flex-col border-0 bg-background shadow-[6px_6px_14px_rgba(0,0,0,0.07),-6px_-6px_14px_rgba(255,255,255,0.85)] dark:shadow-[6px_6px_14px_rgba(0,0,0,0.4),-6px_-6px_14px_rgba(50,50,60,0.1)]">
        <SidebarContent
          sidebarSections={sidebarSections}
          activeSidebar={activeSidebar}
          setActiveSidebar={setActiveSidebar}
          setActiveFilter={setActiveFilter}
          onCreateBoard={() => setCreateDialogOpen(true)}
          userName={userName}
          userInitials={userInitials}
          locale={locale}
          boards={boards}
          onOpenBoard={(boardId) => useAppStore.getState().openBoard(boardId)}
        />
      </aside>

      {/* ─── Mobile Sidebar (Sheet) ─────────────────────────────────────── */}
      {isMobile && (
        <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <SheetContent side="left" className="w-72 p-0 !bg-background !border-0 shadow-[6px_6px_14px_rgba(0,0,0,0.07),-6px_-6px_14px_rgba(255,255,255,0.85)] dark:shadow-[6px_6px_14px_rgba(0,0,0,0.4),-6px_-6px_14px_rgba(50,50,60,0.1)]">
            <SheetTitle className="sr-only">{t('dashboard.navMenu', locale)}</SheetTitle>
            <div className="flex h-full flex-col">
              <SidebarContent
                sidebarSections={sidebarSections}
                activeSidebar={activeSidebar}
                setActiveSidebar={(v) => {
                  setActiveSidebar(v)
                  setMobileSidebarOpen(false)
                }}
                setActiveFilter={setActiveFilter}
                onCreateBoard={() => {
                  setCreateDialogOpen(true)
                  setMobileSidebarOpen(false)
                }}
                userName={userName}
                userInitials={userInitials}
                locale={locale}
                boards={boards}
                onOpenBoard={(boardId) => {
                  useAppStore.getState().openBoard(boardId)
                  setMobileSidebarOpen(false)
                }}
              />
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* ─── Main content ──────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between gap-4 border-0 bg-background neu-flat !rounded-none px-4 py-3 lg:px-6">
          {/* Hamburger menu (mobile) */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden shrink-0 neu-icon-btn"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label={t('dashboard.openMenu', locale)}
          >
            <Menu className="size-5" />
          </Button>

          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 md:hidden">
            <div className="flex size-7 items-center justify-center rounded-lg bg-foreground text-background">
              <GitBranch className="size-3.5" />
            </div>
            <span className="text-sm font-bold tracking-tight">BranchBoard</span>
          </div>

          {/* Search bar */}
          <div className="relative flex-1 max-w-md hidden md:block">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('dashboard.search', locale)}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="neu-input !pl-9 h-9 border-0"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile new board button */}
            <Button
              variant="default"
              size="sm"
              className="md:hidden gap-1.5 btn-neu"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="size-4" />
              {t('dashboard.newBoard', locale).split(' ').pop()}
            </Button>

            {/* AI Design button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => useAppStore.getState().setViewMode('ai-design')}
                  className="hidden md:flex gap-1.5 rounded-lg btn-neu bg-background border-0"
                >
                  <Wand2 className="size-3.5" />
                  {t('dashboard.aiDesign', locale)}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('dashboard.aiDesign', locale)}</TooltipContent>
            </Tooltip>

            {/* Plugins button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => useAppStore.getState().setPluginDialogOpen(true)}
                  className="rounded-lg neu-icon-btn bg-background border-0"
                  aria-label={t('toolbar.plugins', locale)}
                >
                  <Puzzle className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('toolbar.plugins', locale)}</TooltipContent>
            </Tooltip>

            {/* Community button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => useAppStore.getState().setViewMode('community')}
                  className="hidden md:flex gap-1.5 rounded-lg btn-neu bg-background border-0"
                >
                  <Users className="size-3.5" />
                  {t('dashboard.community', locale)}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('dashboard.exploreCommunity', locale)}</TooltipContent>
            </Tooltip>

            {/* Upload Design button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUploadDialogOpen(true)}
                  className="hidden md:flex gap-1.5 rounded-lg btn-neu bg-background border-0"
                >
                  <Upload className="size-3.5" />
                  {t('dashboard.upload', locale)}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('dashboard.shareYourDesign', locale)}</TooltipContent>
            </Tooltip>

            {/* Theme toggle */}
            <ThemeToggle />

            {/* Language switcher (flag only on mobile) */}
            <LanguageSwitcher />

            {/* Settings - hidden on mobile */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => onOpenSettings?.()} className="hidden md:flex neu-icon-btn">
                  <Settings className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('settings.title', locale)}</TooltipContent>
            </Tooltip>

            {/* Notification bell - hidden on mobile */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hidden md:flex neu-icon-btn">
                  <Bell className="size-4" />
                  <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-rose-500 ring-2 ring-background" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('dashboard.notifications', locale)}</TooltipContent>
            </Tooltip>

            {/* User avatar / Logout */}
            <div className="flex items-center gap-1">
              {/* Admin Panel button - only for ADMIN users */}
              {user?.role === 'ADMIN' && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 hidden md:flex neu-icon-btn"
                      onClick={() => useAppStore.getState().setViewMode('admin')}
                    >
                      <Shield className="size-4 text-emerald-600" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Admin Panel</TooltipContent>
                </Tooltip>
              )}
              <Avatar className="size-8 neu-avatar cursor-pointer" onClick={() => onOpenSettings?.()}>
                <AvatarFallback className="bg-foreground text-xs text-background font-medium">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              {/* Logout - hidden on mobile */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8 hidden md:flex neu-icon-btn" onClick={handleLogout}>
                    <LogOut className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t('settings.account.logout', locale)}</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </header>

        {/* Mobile search bar (below header, above filter bar) */}
        <div className="md:hidden border-0 bg-background px-4 py-2">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('dashboard.search', locale)}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="neu-input !pl-9 h-9 border-0"
            />
          </div>
        </div>

        {/* Filter / Sort bar */}
        <div className="flex items-center justify-between gap-3 border-0 px-4 py-2.5 lg:px-6 bg-background">
          <div className="flex items-center gap-1 flex-1 md:flex-none justify-center md:justify-start">
            {(
              [
                { key: 'all', label: t('dashboard.all', locale) },
                { key: 'recent', label: t('dashboard.recent', locale) },
                { key: 'starred', label: t('dashboard.starred', locale) },
              ] as const
            ).map((tab) => (
              <Button
                key={tab.key}
                variant={activeFilter === tab.key ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setActiveFilter(tab.key)}
                className={cn(
                  'text-xs h-8 px-3 rounded-full border-0 transition-all duration-200',
                  activeFilter === tab.key
                    ? 'neu-pressed !rounded-full font-semibold text-foreground'
                    : 'bg-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.key === 'starred' && (
                  <Star className={cn('size-3 mr-1', activeFilter === tab.key && 'fill-current')} />
                )}
                {tab.key === 'recent' && (
                  <Clock className="size-3 mr-1" />
                )}
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Sort controls - hidden on mobile */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {t('dashboard.sortBy', locale)}
            </span>
            <div className="flex items-center bg-background rounded-lg p-0.5 neu-flat !rounded-lg border-0">
              <Button
                variant={sortOption === 'lastModified' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setSortOption('lastModified')}
                className={cn('text-xs h-7 px-2.5 rounded-md border-0 transition-all duration-200', sortOption === 'lastModified' ? 'neu-pressed !rounded-md bg-transparent' : 'bg-transparent')}
              >
                {t('dashboard.lastModified', locale)}
              </Button>
              <Button
                variant={sortOption === 'name' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setSortOption('name')}
                className={cn('text-xs h-7 px-2.5 rounded-md border-0 transition-all duration-200', sortOption === 'name' ? 'neu-pressed !rounded-md bg-transparent' : 'bg-transparent')}
              >
                {t('dashboard.nameSort', locale)}
              </Button>
              <Button
                variant={sortOption === 'created' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setSortOption('created')}
                className={cn('text-xs h-7 px-2.5 rounded-md border-0 transition-all duration-200', sortOption === 'created' ? 'neu-pressed !rounded-md bg-transparent' : 'bg-transparent')}
              >
                {t('dashboard.createdSort', locale)}
              </Button>
            </div>

            <div className="neu-divider--vertical h-5 hidden sm:block" />

            {/* Grid/List toggle */}
            <div className="hidden sm:flex items-center bg-background rounded-lg p-0.5 neu-flat !rounded-lg border-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="secondary" size="sm" className="text-xs h-7 px-2 rounded-md neu-pressed !rounded-md border-0 bg-transparent">
                    <Grid className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t('dashboard.gridView', locale)}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-xs h-7 px-2 rounded-md bg-transparent border-0">
                    <List className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t('dashboard.listView', locale)}</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Board grid */}
        <ScrollArea className="flex-1">
          <main className="p-3 sm:p-4 lg:p-6 pb-16 md:pb-0">
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <div className="size-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <p className="text-sm">{t('dashboard.loadingBoards', locale)}</p>
                </div>
              </div>
            ) : filteredBoards.length > 0 ? (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5"
                variants={boardContainerVariants}
                initial="hidden"
                animate="show"
                key={`${activeFilter}-${sortOption}-${searchQuery}`}
              >
                <AnimatePresence mode="popLayout">
                  {filteredBoards.map((board) => (
                    <motion.div key={board.id} variants={boardItemVariants} layout>
                      <BoardCard board={board} onOpen={(id) => useAppStore.getState().openBoard(id)} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <EmptyState onCreateBoard={() => setCreateDialogOpen(true)} searchQuery={searchQuery} locale={locale} />
            )}
          </main>
        </ScrollArea>

        {/* Footer */}
        <footer className="mt-auto shrink-0 flex items-center justify-center border-0 bg-background px-4 py-2 pb-safe shadow-[0px_-4px_8px_rgba(0,0,0,0.06),0px_4px_8px_rgba(255,255,255,0.7)] dark:shadow-[0px_-4px_8px_rgba(0,0,0,0.35),0px_4px_8px_rgba(50,50,60,0.06)]">
          <p className="text-xs text-muted-foreground">{t('dashboard.footer', locale)}</p>
        </footer>
      </div>

      {/* ─── Mobile Bottom Navigation Bar ───────────────────────────────── */}
      {isMobile && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-40 bg-background border-0 neu-raised !rounded-none"
          style={{ height: 'calc(60px + env(safe-area-inset-bottom, 0px))', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
          aria-label={t('dashboard.mobileNav', locale)}
        >
          <div className="flex items-center justify-around h-[60px]">
            {/* Boards tab */}
            <button
              onClick={() => {
                setActiveFilter('all')
                setActiveSidebar('my-boards')
                setMobileSidebarOpen(false)
              }}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-lg transition-all duration-200 min-w-[56px] border-0',
                activeFilter === 'all' && activeSidebar !== 'starred'
                  ? 'neu-pressed !rounded-lg text-primary'
                  : 'bg-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <LayoutDashboard className="size-5" />
              <span className="text-[10px] font-medium">{t('dashboard.boards', locale)}</span>
            </button>

            {/* Starred tab */}
            <button
              onClick={() => {
                setActiveFilter('starred')
                setActiveSidebar(null)
              }}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-lg transition-all duration-200 min-w-[56px] border-0',
                activeFilter === 'starred'
                  ? 'neu-pressed !rounded-lg text-primary'
                  : 'bg-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <Star className={cn('size-5', activeFilter === 'starred' && 'fill-current')} />
              <span className="text-[10px] font-medium">{t('dashboard.starred', locale)}</span>
            </button>

            {/* New board FAB */}
            <button
              onClick={() => setCreateDialogOpen(true)}
              className="flex flex-col items-center justify-center gap-0.5 px-3 py-1 min-w-[56px]"
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                <Plus className="size-5" />
              </div>
            </button>

            {/* Community tab */}
            <button
              onClick={() => {
                useAppStore.getState().setViewMode('community')
                setMobileSidebarOpen(false)
              }}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-lg transition-all duration-200 min-w-[56px] border-0',
                'bg-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <Users className="size-5" />
              <span className="text-[10px] font-medium">{t('dashboard.community', locale)}</span>
            </button>

            {/* AI Design tab (mobile) */}
            <button
              onClick={() => {
                useAppStore.getState().setViewMode('ai-design')
                setMobileSidebarOpen(false)
              }}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-lg transition-all duration-200 min-w-[56px] border-0',
                'bg-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <Wand2 className="size-5" />
              <span className="text-[10px] font-medium">{t('dashboard.aiTab', locale)}</span>
            </button>

            {/* Admin tab (mobile) - only for ADMIN users */}
            {user?.role === 'ADMIN' && (
              <button
                onClick={() => {
                  setMobileSidebarOpen(false)
                  useAppStore.getState().setViewMode('admin')
                }}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-lg transition-all duration-200 min-w-[56px] border-0',
                  'bg-transparent text-emerald-600 hover:text-emerald-700'
                )}
              >
                <Shield className="size-5" />
                <span className="text-[10px] font-medium">Admin</span>
              </button>
            )}

            {/* Profile / Settings tab */}
            <button
              onClick={() => {
                setMobileSidebarOpen(false)
                onOpenSettings?.()
              }}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-lg transition-all duration-200 min-w-[56px] border-0',
                'bg-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <Settings className="size-5" />
              <span className="text-[10px] font-medium">{t('settings.title', locale)}</span>
            </button>
          </div>
        </nav>
      )}

      {/* Create Board Dialog */}
      <CreateBoardDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreateBoard={handleCreateBoard}
        locale={locale}
      />

      {/* Upload Design Dialog */}
      <UploadDesignDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
      />

      {/* Plugin Marketplace Dialog */}
      <PluginBrowserDialog
        open={useAppStore((s) => s.pluginDialogOpen)}
        onOpenChange={(v) => useAppStore.getState().setPluginDialogOpen(v)}
      />
    </div>
  )
}

// ─── Sidebar item ────────────────────────────────────────────────────────────

function SidebarItem({ name, boardId, onClick, active }: { name: string; boardId: string; onClick: () => void; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-2 py-1.5 text-xs transition-all duration-200 truncate w-full text-left border-0 cursor-pointer',
        active
          ? 'neu-pressed !rounded-md text-primary font-medium'
          : 'bg-transparent text-muted-foreground hover:text-foreground'
      )}
    >
      <ChevronRight
        className={cn(
          'size-3 shrink-0 transition-transform',
          active && 'rotate-90'
        )}
      />
      <span className="truncate">{name}</span>
    </button>
  )
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState({ onCreateBoard, searchQuery = '', locale }: { onCreateBoard: () => void; searchQuery?: string; locale: Locale }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="neu-card flex flex-col items-center justify-center py-24 text-center"
    >
      {/* Illustration */}
      <div className="relative mb-6">
        <div className="flex size-24 items-center justify-center rounded-3xl bg-neutral-200 dark:bg-neutral-800">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-foreground text-background shadow-lg">
            <GitBranch className="size-7" />
          </div>
        </div>
        <motion.div
          className="absolute -top-1 -right-1 flex size-7 items-center justify-center rounded-full bg-foreground text-background shadow-md"
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        >
          <Sparkles className="size-3.5" />
        </motion.div>
      </div>

      <h2 className="text-lg font-semibold mb-2">{t('dashboard.noBoardsFound', locale)}</h2>
      <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
        {searchQuery
          ? t('dashboard.noBoardsFoundSearch', locale, { query: searchQuery })
          : t('dashboard.noBoardsYet', locale)}
      </p>
      <Button onClick={onCreateBoard} className="btn-neu gap-2 text-foreground font-medium">
        <FilePlus className="size-4" />
        {t('dashboard.createFirstBoard', locale)}
      </Button>
    </motion.div>
  )
}