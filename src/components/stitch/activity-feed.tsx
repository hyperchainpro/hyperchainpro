'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  PlusCircle,
  Pencil,
  Trash2,
  GitBranch,
  GitCommit,
  GitMerge,
  CheckCircle2,
  MessageSquare,
  Share2,
  UserPlus,
  Clock,
  ChevronDown,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/store/auth-store'
import { t } from '@/lib/i18n'
import { cn } from '@/lib/utils'

// ── Neumorphism helpers ─────────────────────────────────────────────────────

const neuLight = 'shadow-[6px_6px_12px_rgba(0,0,0,0.08),-6px_-6px_12px_rgba(255,255,255,0.9)]'
const neuDark = 'dark:shadow-[6px_6px_12px_rgba(0,0,0,0.4),-6px_-6px_12px_rgba(30,30,30,0.1)]'

// ── Types ───────────────────────────────────────────────────────────────────

interface ActivityFeedProps {
  boardId: string
}

interface ActivityEntry {
  id: string
  type: ActivityType
  userId: string
  userName: string
  userAvatar?: string
  description: string
  metadata?: Record<string, string>
  createdAt: string
}

type ActivityType =
  | 'created_board'
  | 'added_element'
  | 'edited_element'
  | 'deleted_element'
  | 'created_branch'
  | 'committed'
  | 'created_merge_request'
  | 'merged'
  | 'commented'
  | 'shared'
  | 'invited_member'

// ── Activity config ─────────────────────────────────────────────────────────

interface ActivityConfig {
  icon: LucideIcon
  color: string
  bgColor: string
}

const ACTIVITY_CONFIG: Record<ActivityType, ActivityConfig> = {
  created_board: {
    icon: LayoutDashboard,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/40',
  },
  added_element: {
    icon: PlusCircle,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/40',
  },
  edited_element: {
    icon: Pencil,
    color: 'text-sky-600 dark:text-sky-400',
    bgColor: 'bg-sky-100 dark:bg-sky-900/40',
  },
  deleted_element: {
    icon: Trash2,
    color: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-100 dark:bg-rose-900/40',
  },
  created_branch: {
    icon: GitBranch,
    color: 'text-violet-600 dark:text-violet-400',
    bgColor: 'bg-violet-100 dark:bg-violet-900/40',
  },
  committed: {
    icon: GitCommit,
    color: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-cyan-100 dark:bg-cyan-900/40',
  },
  created_merge_request: {
    icon: GitMerge,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/40',
  },
  merged: {
    icon: CheckCircle2,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/40',
  },
  commented: {
    icon: MessageSquare,
    color: 'text-pink-600 dark:text-pink-400',
    bgColor: 'bg-pink-100 dark:bg-pink-900/40',
  },
  shared: {
    icon: Share2,
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/40',
  },
  invited_member: {
    icon: UserPlus,
    color: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-100 dark:bg-teal-900/40',
  },
}

// ── Demo data ───────────────────────────────────────────────────────────────

function generateDemoActivities(boardId: string): ActivityEntry[] {
  const now = Date.now()
  return [
    {
      id: 'a1',
      type: 'merged',
      userId: 'u1',
      userName: 'Alex Chen',
      userAvatar: '',
      description: 'Merged branch "feature/ui-redesign" into main',
      metadata: { branch: 'feature/ui-redesign', target: 'main' },
      createdAt: new Date(now - 1000 * 60 * 5).toISOString(),
    },
    {
      id: 'a2',
      type: 'commented',
      userId: 'u2',
      userName: 'Sarah Kim',
      userAvatar: '',
      description: 'Left a comment on "Header Component"',
      metadata: { element: 'Header Component' },
      createdAt: new Date(now - 1000 * 60 * 20).toISOString(),
    },
    {
      id: 'a3',
      type: 'committed',
      userId: 'u1',
      userName: 'Alex Chen',
      userAvatar: '',
      description: 'Committed "Update color palette and typography"',
      metadata: { branch: 'feature/ui-redesign', message: 'Update color palette and typography' },
      createdAt: new Date(now - 1000 * 60 * 45).toISOString(),
    },
    {
      id: 'a4',
      type: 'created_merge_request',
      userId: 'u3',
      userName: 'Jordan Lee',
      userAvatar: '',
      description: 'Created merge request "Redesign navigation flow"',
      metadata: { sourceBranch: 'feat/nav', targetBranch: 'main' },
      createdAt: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: 'a5',
      type: 'added_element',
      userId: 'u2',
      userName: 'Sarah Kim',
      userAvatar: '',
      description: 'Added "Footer Section" element',
      createdAt: new Date(now - 1000 * 60 * 60 * 3).toISOString(),
    },
    {
      id: 'a6',
      type: 'created_branch',
      userId: 'u1',
      userName: 'Alex Chen',
      userAvatar: '',
      description: 'Created branch "feature/ui-redesign"',
      metadata: { branch: 'feature/ui-redesign' },
      createdAt: new Date(now - 1000 * 60 * 60 * 4).toISOString(),
    },
    {
      id: 'a7',
      type: 'edited_element',
      userId: 'u3',
      userName: 'Jordan Lee',
      userAvatar: '',
      description: 'Edited "Hero Banner" element',
      createdAt: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
    },
    {
      id: 'a8',
      type: 'invited_member',
      userId: 'u1',
      userName: 'Alex Chen',
      userAvatar: '',
      description: 'Invited "Jordan Lee" to the board',
      createdAt: new Date(now - 1000 * 60 * 60 * 8).toISOString(),
    },
    {
      id: 'a9',
      type: 'shared',
      userId: 'u1',
      userName: 'Alex Chen',
      userAvatar: '',
      description: 'Made the board public via share link',
      createdAt: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
      id: 'a10',
      type: 'created_board',
      userId: 'u1',
      userName: 'Alex Chen',
      userAvatar: '',
      description: 'Created this board',
      createdAt: new Date(now - 1000 * 60 * 60 * 48).toISOString(),
    },
  ]
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatRelativeTime(isoString: string, locale: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return t('activity.justNow', locale)
  if (minutes < 60) return t('activity.minutesAgo', locale, { n: minutes })
  if (hours < 24) return t('activity.hoursAgo', locale, { n: hours })
  return t('activity.daysAgo', locale, { n: days })
}

function formatGroupLabel(isoString: string, locale: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const days = Math.floor(diff / 86400000)

  if (days === 0) return t('activity.today', locale)
  if (days === 1) return t('activity.yesterday', locale)
  if (days < 7) return t('activity.thisWeek', locale)
  return t('activity.earlier', locale)
}

// ── Component ───────────────────────────────────────────────────────────────

export function ActivityFeed({ boardId }: ActivityFeedProps) {
  const locale = useAuthStore((s) => s.user?.language ?? 'en')
  const [activities] = useState<ActivityEntry[]>(() =>
    generateDemoActivities(boardId),
  )
  const [visibleCount, setVisibleCount] = useState(6)

  const visibleActivities = useMemo(
    () => activities.slice(0, visibleCount),
    [activities, visibleCount],
  )

  const hasMore = visibleCount < activities.length

  // Group activities by time period
  const groupedActivities: { label: string; items: ActivityEntry[] }[] = []
  let currentGroup = ''

  for (const activity of visibleActivities) {
    const groupLabel = formatGroupLabel(activity.createdAt, locale)
    if (groupLabel !== currentGroup) {
      currentGroup = groupLabel
      groupedActivities.push({ label: groupLabel, items: [activity] })
    } else {
      groupedActivities[groupedActivities.length - 1].items.push(activity)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b shrink-0">
        <Clock className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold">
          {t('activity.title', locale)}
        </h2>
      </div>

      {/* Feed */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {groupedActivities.map((group, groupIdx) => (
            <div key={group.label}>
              {groupIdx > 0 && <Separator className="my-4" />}
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                {group.label}
              </p>

              <div className="relative pl-6 space-y-4">
                {/* Timeline line */}
                <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />

                {group.items.map((activity) => {
                  const config = ACTIVITY_CONFIG[activity.type]
                  const Icon = config.icon
                  const initials = activity.userName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)

                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      className="relative flex gap-3"
                    >
                      {/* Timeline dot */}
                      <div
                        className={cn(
                          'absolute -left-6 top-1 flex h-[22px] w-[22px] items-center justify-center rounded-full z-10',
                          config.bgColor,
                        )}
                      >
                        <Icon className={cn('h-3 w-3', config.color)} />
                      </div>

                      {/* Content */}
                      <div
                        className={cn(
                          'flex-1 rounded-xl p-3 bg-card',
                          neuLight,
                          neuDark,
                        )}
                      >
                        <p className="text-sm text-foreground/90 leading-relaxed">
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Avatar className="h-4 w-4">
                            <AvatarImage src={activity.userAvatar} />
                            <AvatarFallback className="text-[7px] bg-primary/10 text-primary">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-[11px] font-medium text-foreground/70">
                            {activity.userName}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {formatRelativeTime(activity.createdAt, locale)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Load more */}
          {hasMore && (
            <div className="mt-4 flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVisibleCount((prev) => prev + 5)}
                className="rounded-xl gap-1.5 text-xs"
              >
                <ChevronDown className="h-3.5 w-3.5" />
                {t('activity.loadMore', locale)}
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}