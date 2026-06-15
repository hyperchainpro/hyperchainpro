'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Link2,
  Copy,
  Check,
  Send,
  MoreHorizontal,
  Trash2,
  Github,
  MessageSquare,
  FileDown,
  Globe,
  Lock,
  Users,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/store/auth-store'
import { t } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// ── Types ───────────────────────────────────────────────────────────────────

interface ShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  boardId: string
  boardName: string
}

interface Collaborator {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'OWNER' | 'ADMIN' | 'EDITOR' | 'REVIEWER' | 'VIEWER'
}

// ── Demo collaborators ──────────────────────────────────────────────────────

const DEMO_COLLABORATORS: Collaborator[] = [
  {
    id: 'u1',
    name: 'Alex Chen',
    email: 'alex@example.com',
    avatar: '',
    role: 'OWNER',
  },
  {
    id: 'u2',
    name: 'Sarah Kim',
    email: 'sarah@example.com',
    avatar: '',
    role: 'EDITOR',
  },
  {
    id: 'u3',
    name: 'Jordan Lee',
    email: 'jordan@example.com',
    avatar: '',
    role: 'VIEWER',
  },
]

// ── Component ───────────────────────────────────────────────────────────────

export function ShareDialog({
  open,
  onOpenChange,
  boardId,
  boardName,
}: ShareDialogProps) {
  const locale = useAuthStore((s) => s.user?.language ?? 'en')

  const [isPublic, setIsPublic] = useState(false)
  const [linkPermission, setLinkPermission] = useState<string>('viewer')
  const [shareLink, setShareLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<string>('editor')
  const [collaborators, setCollaborators] = useState<Collaborator[]>(DEMO_COLLABORATORS)
  const [sending, setSending] = useState(false)

  const generatedLink = useMemo(
    () =>
      shareLink ||
      `${typeof window !== 'undefined' ? window.location.origin : ''}/share/${boardId}`,
    [shareLink, boardId],
  )

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return
    setSending(true)
    // Simulate API call
    await new Promise((r) => setTimeout(r, 500))

    const newCollab: Collaborator = {
      id: `u-${Date.now()}`,
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole.toUpperCase() as Collaborator['role'],
    }
    setCollaborators((prev) => [...prev, newCollab])
    setInviteEmail('')
    setSending(false)
  }

  const handleRemoveCollaborator = (id: string) => {
    setCollaborators((prev) => prev.filter((c) => c.id !== id))
  }

  const handleChangeRole = (id: string, newRole: string) => {
    setCollaborators((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, role: newRole.toUpperCase() as Collaborator['role'] }
          : c,
      ),
    )
  }

  const roleColor: Record<string, string> = {
    OWNER: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    ADMIN: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
    EDITOR: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
    REVIEWER: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
    VIEWER: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  }

  const integrations = [
    {
      icon: Github,
      labelKey: 'settings.stitch.connectGithub',
      color: 'text-foreground',
      action: 'github' as const,
    },
    {
      icon: MessageSquare,
      labelKey: 'settings.stitch.connectSlack',
      color: 'text-emerald-600',
      action: 'slack' as const,
    },
    {
      icon: FileDown,
      labelKey: 'settings.stitch.exportPdf',
      color: 'text-rose-600',
      action: 'pdf' as const,
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg w-[calc(100%-2rem)] max-h-[85vh] flex flex-col p-0 overflow-hidden rounded-2xl gap-0 neu-raised bg-background border-0"
        showCloseButton={false}
      >
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
          <DialogTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('settings.stitch.shareTitle', locale)} — {boardName}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {t('settings.stitch.shareDesc', locale)}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="px-6 pb-6 space-y-6">
            {/* ── Share link section ── */}
            <div className="rounded-xl bg-background p-4 neu-raised">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  {isPublic ? (
                    <Globe className="h-4 w-4 text-primary" />
                  ) : (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  )}
                  {t('settings.stitch.shareLink', locale)}
                </h3>
                <Switch checked={isPublic} onCheckedChange={setIsPublic} />
              </div>

              <p className="text-xs text-muted-foreground mb-3">
                {isPublic
                  ? t('settings.stitch.anyoneWithLink', locale)
                  : t('settings.stitch.onlyInvited', locale)}
              </p>

              <div className="flex gap-2">
                <Input
                  readOnly
                  value={generatedLink}
                  className="flex-1 text-xs font-mono neu-input border-0 bg-background rounded-xl"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopy}
                  className="shrink-0 rounded-xl gap-1.5 btn-neu"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied
                    ? t('settings.stitch.copied', locale)
                    : t('settings.stitch.copy', locale)}
                </Button>
              </div>

              {isPublic && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3"
                >
                  <Label className="text-xs text-muted-foreground">
                    {t('settings.stitch.linkPermission', locale)}
                  </Label>
                  <Select value={linkPermission} onValueChange={setLinkPermission}>
                    <SelectTrigger
                      className="mt-1.5 border-0 bg-background rounded-xl neu-input"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">
                        {t('settings.stitch.viewer', locale)}
                      </SelectItem>
                      <SelectItem value="commenter">
                        {t('settings.stitch.commenter', locale)}
                      </SelectItem>
                      <SelectItem value="editor">
                        {t('settings.stitch.editor', locale)}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>
              )}
            </div>

            {/* ── Invite people section ── */}
            <div className="rounded-xl bg-background p-4 neu-raised">
              <h3 className="text-sm font-medium mb-3">
                {t('settings.stitch.invitePeople', locale)}
              </h3>
              <div className="flex gap-2">
                <Input
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder={t('settings.stitch.emailPlaceholder', locale)}
                  className="flex-1 neu-input border-0 bg-background rounded-xl"
                  onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                />
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger className="w-[110px] border-0 bg-background rounded-xl neu-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="editor">
                      {t('settings.stitch.editor', locale)}
                    </SelectItem>
                    <SelectItem value="viewer">
                      {t('settings.stitch.viewer', locale)}
                    </SelectItem>
                    <SelectItem value="commenter">
                      {t('settings.stitch.commenter', locale)}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={handleInvite}
                  disabled={sending || !inviteEmail.trim()}
                  className="shrink-0 rounded-xl gap-1.5 btn-neu-primary"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* ── Collaborators list ── */}
            <div className="rounded-xl bg-background p-4 neu-raised">
              <h3 className="text-sm font-medium mb-3">
                {t('settings.stitch.collaborators', locale)} ({collaborators.length})
              </h3>
              <div className="space-y-2">
                <AnimatePresence>
                  {collaborators.map((collab) => {
                    const initials = collab.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)

                    return (
                      <motion.div
                        key={collab.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/30 transition-colors"
                      >
                        <Avatar className="h-8 w-8 neu-avatar">
                          <AvatarImage src={collab.avatar} />
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {collab.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {collab.email}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={cn(
                            'text-[10px] px-2 py-0 neu-badge',
                            roleColor[collab.role] ?? '',
                          )}
                        >
                          {collab.role}
                        </Badge>
                        {collab.role !== 'OWNER' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                              >
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  handleChangeRole(collab.id, 'editor')
                                }
                              >
                                {t('settings.stitch.makeEditor', locale)}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleChangeRole(collab.id, 'viewer')
                                }
                              >
                                {t('settings.stitch.makeViewer', locale)}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleChangeRole(collab.id, 'commenter')
                                }
                              >
                                {t('settings.stitch.makeCommenter', locale)}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() =>
                                  handleRemoveCollaborator(collab.id)
                                }
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-2" />
                                {t('settings.stitch.remove', locale)}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            </div>

            <Separator className="neu-divider" />

            {/* ── Integrations ── */}
            <div className="rounded-xl bg-background p-4 neu-raised">
              <h3 className="text-sm font-medium mb-3">
                {t('settings.stitch.integrations', locale)}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {integrations.map(({ icon: Icon, labelKey, color, action }) => (
                  <Button
                    key={labelKey}
                    variant="outline"
                    className={cn('rounded-xl gap-2 h-10 text-xs btn-neu')}
                    onClick={() => {
                      if (action === 'github') {
                        toast.success(t('settings.stitch.githubConnected', locale))
                      } else if (action === 'slack') {
                        toast.success(t('settings.stitch.slackConnected', locale))
                      } else if (action === 'pdf') {
                        toast.success(t('settings.stitch.pdfExported', locale))
                      }
                    }}
                  >
                    <Icon className={cn('h-4 w-4', color)} />
                    {t(labelKey, locale)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}