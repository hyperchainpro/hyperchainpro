'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Star,
  MoreVertical,
  GitBranch,
  GitCommit,
  Clock,
  Users,
  Copy,
  Share2,
  Trash2,
  ExternalLink,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export interface BoardMember {
  id: string
  name: string
  avatar?: string
}

export interface BoardCardData {
  id: string
  name: string
  description?: string
  thumbnail?: string
  gradient?: string
  members: BoardMember[]
  branchCount: number
  commitCount: number
  isStarred: boolean
  updatedAt: Date | string
  isPublic: boolean
}

interface BoardCardProps {
  board: BoardCardData
  onStarToggle?: (boardId: string) => void
  onOpen?: (boardId: string) => void
  onDuplicate?: (boardId: string) => void
  onShare?: (boardId: string) => void
  onDelete?: (boardId: string) => void
}

const gradients = [
  'from-rose-400 via-fuchsia-500 to-purple-600',
  'from-amber-400 via-orange-500 to-red-500',
  'from-emerald-400 via-teal-500 to-cyan-600',
  'from-violet-400 via-purple-500 to-indigo-600',
  'from-pink-400 via-rose-500 to-red-500',
  'from-lime-400 via-emerald-500 to-teal-600',
  'from-orange-400 via-amber-500 to-yellow-500',
  'from-sky-400 via-cyan-500 to-teal-500',
]

function getGradient(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  return gradients[Math.abs(hash) % gradients.length]
}

function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const d = new Date(date)
  const diffMs = now.getTime() - d.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  if (diffDay < 30) return `${Math.floor(diffDay / 7)}w ago`
  return `${Math.floor(diffDay / 30)}mo ago`
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const avatarColors = [
  'bg-rose-500',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-cyan-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-teal-500',
]

function getAvatarColor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

export function BoardCard({
  board,
  onStarToggle,
  onOpen,
  onDuplicate,
  onShare,
  onDelete,
}: BoardCardProps) {
  const [isStarred, setIsStarred] = useState(board.isStarred)
  const gradient = board.gradient || getGradient(board.id)

  const handleStarToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setIsStarred((prev) => !prev)
    onStarToggle?.(board.id)
  }

  const displayedMembers = board.members.slice(0, 4)
  const remainingCount = board.members.length - displayedMembers.length

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group relative"
    >
      <Card
        className="cursor-pointer overflow-hidden border-border/60 py-0 transition-shadow duration-300 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 gap-0"
        onClick={() => onOpen?.(board.id)}
      >
        {/* Thumbnail area */}
        <div className="relative h-36 w-full overflow-hidden">
          {board.thumbnail ? (
            <img
              src={board.thumbnail}
              alt={board.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div
              className={cn(
                'flex h-full w-full items-center justify-center bg-gradient-to-br',
                gradient
              )}
            >
              <div className="flex flex-col items-center gap-1.5 text-white/90">
                <GitBranch className="size-8 opacity-80" />
                <span className="text-xs font-medium tracking-wide opacity-70">
                  {board.name.slice(0, 20)}
                </span>
              </div>
            </div>
          )}

          {/* Top-right actions overlay */}
          <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            {/* Star toggle */}
            <button
              onClick={handleStarToggle}
              className={cn(
                'flex size-8 items-center justify-center rounded-full backdrop-blur-sm transition-colors',
                isStarred
                  ? 'bg-amber-400/90 text-white hover:bg-amber-500/90'
                  : 'bg-black/20 text-white hover:bg-black/30'
              )}
            >
              <Star
                className={cn('size-4', isStarred && 'fill-current')}
              />
            </button>

            {/* Three-dot menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                  }}
                  className="flex size-8 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm transition-colors hover:bg-black/30"
                >
                  <MoreVertical className="size-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenuItem onClick={() => onOpen?.(board.id)}>
                  <ExternalLink className="size-4" />
                  <span>Open</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate?.(board.id)}>
                  <Copy className="size-4" />
                  <span>Duplicate</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onShare?.(board.id)}>
                  <Share2 className="size-4" />
                  <span>Share</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDelete?.(board.id)}
                >
                  <Trash2 className="size-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Always-visible star on non-hover (only when starred) */}
          {isStarred && (
            <div className="absolute top-2 right-2 flex items-center gap-1 transition-opacity duration-200 group-hover:opacity-0">
              <div className="flex size-8 items-center justify-center rounded-full bg-amber-400/90 text-white">
                <Star className="size-4 fill-current" />
              </div>
            </div>
          )}

          {/* Visibility badge */}
          <div className="absolute bottom-2 left-2">
            <Badge
              variant="secondary"
              className="text-[10px] font-medium backdrop-blur-sm bg-white/80 dark:bg-black/50 border-0"
            >
              {board.isPublic ? 'Public' : 'Private'}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-4 space-y-3">
          {/* Board name and description */}
          <div className="space-y-1 min-w-0">
            <h3 className="text-sm font-semibold truncate leading-tight">
              {board.name}
            </h3>
            {board.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {board.description}
              </p>
            )}
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-2 flex-wrap">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="gap-1 text-[10px] px-1.5 py-0 h-5 font-normal">
                    <GitBranch className="size-3" />
                    {board.branchCount}
                  </Badge>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{board.branchCount} {board.branchCount === 1 ? 'branch' : 'branches'}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="gap-1 text-[10px] px-1.5 py-0 h-5 font-normal">
                    <GitCommit className="size-3" />
                    {board.commitCount}
                  </Badge>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{board.commitCount} {board.commitCount === 1 ? 'commit' : 'commits'}</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Footer: members + last updated */}
          <div className="flex items-center justify-between pt-1">
            {/* Member avatars */}
            <div className="flex items-center">
              {displayedMembers.length > 0 ? (
                <div className="flex -space-x-2">
                  {displayedMembers.map((member, index) => (
                    <Tooltip key={member.id}>
                      <TooltipTrigger asChild>
                        <Avatar className="size-6 ring-2 ring-background transition-transform hover:scale-110 hover:z-10">
                          {member.avatar ? (
                            <AvatarImage src={member.avatar} alt={member.name} />
                          ) : null}
                          <AvatarFallback
                            className={cn(
                              'text-[9px] font-medium text-white',
                              getAvatarColor(member.id)
                            )}
                          >
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{member.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                  {remainingCount > 0 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex size-6 items-center justify-center rounded-full bg-muted ring-2 ring-background text-[9px] font-medium text-muted-foreground">
                          +{remainingCount}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {remainingCount} more {remainingCount === 1 ? 'member' : 'members'}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="size-3" />
                  <span className="text-[10px]">No members</span>
                </div>
              )}
            </div>

            {/* Last updated */}
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="size-3" />
              <span className="text-[10px]">{formatRelativeTime(board.updatedAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
