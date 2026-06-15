'use client'

import { useState, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare,
  Send,
  CheckCircle2,
  X,
  Filter,
  AtSign,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/store/auth-store'
import { t } from '@/lib/i18n'
import { cn } from '@/lib/utils'

// ── Types ───────────────────────────────────────────────────────────────────

interface CommentPanelProps {
  boardId: string
  elementId?: string | null
  onClose?: () => void
}

interface Comment {
  id: string
  boardId: string
  elementId?: string | null
  userId: string
  userName: string
  userAvatar?: string
  content: string
  resolved: boolean
  createdAt: string
  mentions?: string[]
}

type CommentFilter = 'all' | 'open' | 'resolved'

// ── Demo data ───────────────────────────────────────────────────────────────

const DEMO_COMMENTS: Comment[] = [
  {
    id: 'c1',
    boardId: 'demo',
    elementId: null,
    userId: 'u1',
    userName: 'Alex Chen',
    userAvatar: '',
    content: 'This layout looks great! Let me review the flow diagram.',
    resolved: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'c2',
    boardId: 'demo',
    elementId: 'el-1',
    userId: 'u2',
    userName: 'Sarah Kim',
    userAvatar: '',
    content: 'Can we change the color scheme for the header component? The contrast seems low.',
    resolved: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    mentions: ['Alex Chen'],
  },
  {
    id: 'c3',
    boardId: 'demo',
    elementId: null,
    userId: 'u3',
    userName: 'Jordan Lee',
    userAvatar: '',
    content: 'The navigation structure is solid. Approved!',
    resolved: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: 'c4',
    boardId: 'demo',
    elementId: 'el-2',
    userId: 'u1',
    userName: 'Alex Chen',
    userAvatar: '',
    content: '@Sarah Kim Good catch! I\'ll update the contrast ratios.',
    resolved: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    mentions: ['Sarah Kim'],
  },
]

// ── Collaborator mentions ───────────────────────────────────────────────────

const MENTIONABLE_USERS = [
  { id: 'u1', name: 'Alex Chen' },
  { id: 'u2', name: 'Sarah Kim' },
  { id: 'u3', name: 'Jordan Lee' },
]

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatRelativeTime(isoString: string, locale: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return t('comments.justNow', locale)
  if (minutes < 60) return t('comments.minutesAgo', locale, { n: minutes })
  if (hours < 24) return t('comments.hoursAgo', locale, { n: hours })
  return t('comments.daysAgo', locale, { n: days })
}

function highlightMentions(text: string): React.ReactNode[] {
  const parts = text.split(/(@\w[\w\s]*\w)/g)
  return parts.map((part, i) => {
    if (part.startsWith('@')) {
      return (
        <span key={i} className="text-primary font-medium">
          {part}
        </span>
      )
    }
    return <span key={i}>{part}</span>
  })
}

// ── Component ───────────────────────────────────────────────────────────────

export function CommentPanel({ boardId, elementId, onClose }: CommentPanelProps) {
  const user = useAuthStore((s) => s.user)
  const locale = useAuthStore((s) => s.user?.language ?? 'en')

  const [comments, setComments] = useState<Comment[]>(DEMO_COMMENTS)
  const [newComment, setNewComment] = useState('')
  const [filter, setFilter] = useState<CommentFilter>('all')
  const [mentionQuery, setMentionQuery] = useState('')
  const [showMentions, setShowMentions] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const filteredComments = useMemo(() => {
    let filtered = comments
    if (elementId) {
      filtered = filtered.filter((c) => c.elementId === elementId)
    }
    switch (filter) {
      case 'open':
        return filtered.filter((c) => !c.resolved)
      case 'resolved':
        return filtered.filter((c) => c.resolved)
      default:
        return filtered
    }
  }, [comments, filter, elementId])

  const openCount = comments.filter((c) => !c.resolved).length
  const resolvedCount = comments.filter((c) => c.resolved).length

  const handleTextChange = (value: string) => {
    setNewComment(value)

    // Detect @mention
    const textBeforeCursor = value.slice(0, value.length)
    const match = textBeforeCursor.match(/@(\w[\w\s]*)$/)
    if (match) {
      setMentionQuery(match[1].toLowerCase())
      setShowMentions(true)
    } else {
      setShowMentions(false)
      setMentionQuery('')
    }
  }

  const handleSelectMention = (name: string) => {
    const textBeforeCursor = newComment.slice(0, newComment.length)
    const newText = textBeforeCursor.replace(/@\w[\w\s]*$/, '') + `@${name} `
    setNewComment(newText)
    setShowMentions(false)
    setMentionQuery('')
    textareaRef.current?.focus()
  }

  const handleSubmit = async () => {
    if (!newComment.trim()) return

    const comment: Comment = {
      id: `c-${Date.now()}`,
      boardId,
      elementId: elementId ?? null,
      userId: user?.id ?? 'current',
      userName: user?.name ?? 'You',
      userAvatar: user?.avatar,
      content: newComment.trim(),
      resolved: false,
      createdAt: new Date().toISOString(),
    }

    setComments((prev) => [comment, ...prev])
    setNewComment('')
  }

  const handleResolve = (id: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, resolved: !c.resolved } : c)),
    )
  }

  const mentionResults = mentionQuery
    ? MENTIONABLE_USERS.filter((u) =>
        u.name.toLowerCase().includes(mentionQuery),
      )
    : MENTIONABLE_USERS

  const filters: { value: CommentFilter; labelKey: string; count: number }[] = [
    { value: 'all', labelKey: 'comments.all', count: comments.length },
    { value: 'open', labelKey: 'comments.open', count: openCount },
    { value: 'resolved', labelKey: 'comments.resolved', count: resolvedCount },
  ]

  return (
    <div className="flex flex-col h-full neu-raised bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 neu-divider shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">
            {t('comments.title', locale)}
          </h2>
          {openCount > 0 && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 neu-badge">
              {openCount}
            </Badge>
          )}
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 neu-icon-btn"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 px-4 py-2 neu-divider shrink-0">
        <Filter className="h-3.5 w-3.5 text-muted-foreground mr-1" />
        {filters.map(({ value, labelKey, count }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={cn(
              'rounded-lg px-2.5 py-1 text-xs font-medium transition-colors',
              filter === value
                ? 'neu-pressed bg-primary/10 text-primary'
                : 'neu-flat text-muted-foreground hover:bg-muted/30',
            )}
          >
            {t(labelKey, locale)} ({count})
          </button>
        ))}
      </div>

      {/* Comments list */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredComments.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <MessageSquare className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  {t('comments.empty', locale)}
                </p>
              </motion.div>
            ) : (
              filteredComments.map((comment) => {
                const initials = comment.userName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)

                return (
                  <motion.div
                    key={comment.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className={cn(
                      'rounded-xl p-4 transition-all bg-background',
                      comment.resolved && 'opacity-60',
                      'neu-flat',
                    )}
                  >
                    <div className="flex gap-3">
                      <Avatar className="h-7 w-7 shrink-0 mt-0.5 neu-avatar">
                        <AvatarImage src={comment.userAvatar} />
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold">
                            {comment.userName}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {formatRelativeTime(comment.createdAt, locale)}
                          </span>
                          {comment.resolved && (
                            <Badge
                              variant="secondary"
                              className="text-[9px] px-1.5 py-0 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 neu-badge"
                            >
                              {t('comments.resolved', locale)}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-foreground/90 leading-relaxed">
                          {highlightMentions(comment.content)}
                        </p>
                        {!comment.resolved && (
                          <div className="mt-2">
                            <button
                              onClick={() => handleResolve(comment.id)}
                              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors btn-neu rounded-lg px-2 py-1"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              {t('comments.resolve', locale)}
                            </button>
                          </div>
                        )}
                        {comment.resolved && (
                          <div className="mt-2">
                            <button
                              onClick={() => handleResolve(comment.id)}
                              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors btn-neu rounded-lg px-2 py-1"
                            >
                              {t('comments.reopen', locale)}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* New comment input */}
      <div className="neu-divider p-4 shrink-0">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={newComment}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder={t('comments.placeholder', locale)}
            rows={2}
            className={cn('border-0 bg-background rounded-xl resize-none pr-10 neu-input')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                handleSubmit()
              }
            }}
          />

          {/* Mention dropdown */}
          <AnimatePresence>
            {showMentions && mentionResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="absolute bottom-full left-0 mb-1 w-48 rounded-xl bg-background border-0 p-1 neu-raised z-50"
              >
                {mentionResults.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleSelectMention(u.name)}
                    className="w-full flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-muted/50 transition-colors text-left"
                  >
                    <AtSign className="h-3.5 w-3.5 text-muted-foreground" />
                    {u.name}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            size="icon"
            onClick={handleSubmit}
            disabled={!newComment.trim()}
            className="absolute right-2 bottom-2 h-7 w-7 rounded-lg btn-neu"
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5">
          {t('comments.hint', locale)}
        </p>
      </div>
    </div>
  )
}