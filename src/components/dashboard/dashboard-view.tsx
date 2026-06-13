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
import {
  BoardCard,
  type BoardCardData,
} from '@/components/dashboard/board-card'
import {
  CreateBoardDialog,
} from '@/components/dashboard/create-board-dialog'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/app-store'

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
  { id: 'my-boards' as SidebarSection, label: 'My Boards', icon: LayoutDashboard },
  { id: 'shared' as SidebarSection, label: 'Shared with me', icon: Users },
  { id: 'starred' as SidebarSection, label: 'Starred', icon: Star },
  { id: 'recent' as SidebarSection, label: 'Recent', icon: Clock },
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

// ── Component ──────────────────────────────────────────────────────────────

export function DashboardView() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all')
  const [sortOption, setSortOption] = useState<SortOption>('lastModified')
  const [activeSidebar, setActiveSidebar] = useState<SidebarSection | null>('my-boards')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [boards, setBoards] = useState<BoardCardData[]>([])
  const [loading, setLoading] = useState(true)

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

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ─── Sidebar ──────────────────────────────────────────────────── */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-4">
          <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-sm">
            <GitBranch className="size-4" />
          </div>
          <span className="text-base font-bold tracking-tight">BranchBoard</span>
        </div>

        <Separator />

        {/* New Board button */}
        <div className="p-3">
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="w-full gap-2 shadow-sm"
          >
            <Plus className="size-4" />
            New Board
          </Button>
        </div>

        <Separator />

        {/* Navigation sections */}
        <ScrollArea className="flex-1 px-2 py-1">
          <nav className="flex flex-col gap-0.5" aria-label="Board navigation">
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
                        'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-accent text-accent-foreground'
                          : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="flex-1 text-left">{section.label}</span>
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0 h-5 font-normal"
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
                            {section.id === 'my-boards' && (
                              <>
                                <SidebarItem name="Product Roadmap Q4" active />
                                <SidebarItem name="Sprint Planning" />
                                <SidebarItem name="Design System" />
                                <SidebarItem name="API Workshop" />
                              </>
                            )}
                            {section.id === 'shared' && (
                              <>
                                <SidebarItem name="User Research" />
                                <SidebarItem name="Brand Identity" />
                                <SidebarItem name="Journey Map" />
                              </>
                            )}
                            {section.id === 'starred' && (
                              <>
                                <SidebarItem name="Product Roadmap Q4" />
                                <SidebarItem name="Architecture ADRs" />
                                <SidebarItem name="Design System" />
                                <SidebarItem name="Brand Identity" />
                              </>
                            )}
                            {section.id === 'recent' && (
                              <>
                                <SidebarItem name="Product Roadmap Q4" />
                                <SidebarItem name="Sprint Planning" />
                                <SidebarItem name="API Workshop" />
                              </>
                            )}
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
        <Separator />
        <div className="p-3">
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-muted-foreground">
            <Avatar className="size-6">
              <AvatarFallback className="bg-violet-500 text-[10px] text-white font-medium">
                AC
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium truncate">Alex Chen</span>
          </div>
        </div>
      </aside>

      {/* ─── Main content ──────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between gap-4 border-b border-border bg-card px-4 py-3 lg:px-6">
          <div className="flex items-center gap-3 md:hidden">
            <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white">
              <GitBranch className="size-3.5" />
            </div>
            <span className="text-sm font-bold tracking-tight">BranchBoard</span>
          </div>

          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search boards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-muted/50 border-0 focus-visible:ring-1"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile new board button */}
            <Button
              variant="default"
              size="sm"
              className="md:hidden gap-1.5"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="size-4" />
              New
            </Button>

            {/* Notification bell */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="size-4" />
                  <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-rose-500 ring-2 ring-background" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Notifications</TooltipContent>
            </Tooltip>

            {/* User avatar */}
            <Avatar className="size-8 ring-2 ring-border cursor-pointer transition-ring hover:ring-primary/30">
              <AvatarFallback className="bg-violet-500 text-xs text-white font-medium">
                AC
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Filter / Sort bar */}
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5 lg:px-6 bg-muted/30">
          <div className="flex items-center gap-1">
            {(
              [
                { key: 'all', label: 'All' },
                { key: 'recent', label: 'Recent' },
                { key: 'starred', label: 'Starred' },
              ] as const
            ).map((tab) => (
              <Button
                key={tab.key}
                variant={activeFilter === tab.key ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setActiveFilter(tab.key)}
                className={cn(
                  'text-xs h-8 px-3 rounded-full',
                  activeFilter === tab.key && 'font-semibold'
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

          {/* Sort controls */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Sort by:
            </span>
            <div className="flex items-center bg-muted rounded-lg p-0.5">
              <Button
                variant={sortOption === 'lastModified' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setSortOption('lastModified')}
                className="text-xs h-7 px-2.5 rounded-md"
              >
                Last modified
              </Button>
              <Button
                variant={sortOption === 'name' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setSortOption('name')}
                className="text-xs h-7 px-2.5 rounded-md"
              >
                Name
              </Button>
              <Button
                variant={sortOption === 'created' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setSortOption('created')}
                className="text-xs h-7 px-2.5 rounded-md"
              >
                Created
              </Button>
            </div>

            <Separator orientation="vertical" className="h-5 hidden sm:block" />

            {/* Grid/List toggle */}
            <div className="hidden sm:flex items-center bg-muted rounded-lg p-0.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="secondary" size="sm" className="text-xs h-7 px-2 rounded-md">
                    <Grid className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Grid view</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-xs h-7 px-2 rounded-md">
                    <List className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>List view</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Board grid */}
        <ScrollArea className="flex-1">
          <main className="p-4 lg:p-6">
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <div className="size-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <p className="text-sm">Loading boards...</p>
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
              <EmptyState onCreateBoard={() => setCreateDialogOpen(true)} />
            )}
          </main>
        </ScrollArea>

        {/* Footer */}
        <footer className="flex shrink-0 items-center justify-center border-t border-border bg-card/50 px-4 py-2">
          <p className="text-xs text-muted-foreground">
            © 2024 BranchBoard. Collaborative whiteboard with version control.
          </p>
        </footer>
      </div>

      {/* Create Board Dialog */}
      <CreateBoardDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreateBoard={async (data) => {
          try {
            const res = await fetch('/api/boards', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: data.name,
                description: data.description || undefined,
                isPublic: data.isPublic,
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
            }));
            setBoards(apiBoards);
          } catch (err) {
            console.error('Failed to create board:', err);
          }
        }}
      />
    </div>
  )
}

// ─── Sidebar item ────────────────────────────────────────────────────────────

function SidebarItem({ name, active }: { name: string; active?: boolean }) {
  return (
    <button
      className={cn(
        'flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors truncate w-full text-left',
        active
          ? 'bg-primary/10 text-primary font-medium'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
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

function EmptyState({ onCreateBoard }: { onCreateBoard: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      {/* Illustration */}
      <div className="relative mb-6">
        <div className="flex size-24 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-950/40 dark:to-fuchsia-950/40">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg">
            <GitBranch className="size-7" />
          </div>
        </div>
        <motion.div
          className="absolute -top-1 -right-1 flex size-7 items-center justify-center rounded-full bg-amber-400 text-white shadow-md"
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        >
          <Sparkles className="size-3.5" />
        </motion.div>
      </div>

      <h2 className="text-lg font-semibold mb-2">No boards found</h2>
      <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
        {searchQuery
          ? `No boards match "${searchQuery}". Try a different search or create a new board.`
          : "You haven't created any boards yet. Start by creating your first collaborative whiteboard."}
      </p>
      <Button onClick={onCreateBoard} className="gap-2 shadow-sm">
        <FilePlus className="size-4" />
        Create your first board
      </Button>
    </motion.div>
  )
}
