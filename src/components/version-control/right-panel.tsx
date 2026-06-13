'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  X,
  History,
  GitBranch,
  GitMerge,
  MessageSquare,
  Users,
  Send,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/app-store';
import type { RightPanelTab, BoardMember, BoardRole } from '@/lib/types';
import { HistoryTimeline } from './history-timeline';
import { useVersionStore } from '@/store/version-store';
import type { MergeStatus } from '@/lib/types';

// ─── Role badge config ──────────────────────────────────────────────────────

const ROLE_CONFIG: Record<BoardRole, { label: string; className: string }> = {
  OWNER: { label: 'Owner', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  ADMIN: { label: 'Admin', className: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
  EDITOR: { label: 'Editor', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  REVIEWER: { label: 'Reviewer', className: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' },
  VIEWER: { label: 'Viewer', className: 'bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400' },
};

const AVATAR_COLORS = [
  'bg-rose-500',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-cyan-500',
  'bg-violet-500',
  'bg-pink-500',
  'bg-teal-500',
  'bg-orange-500',
];

function getAvatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// ─── Branches Tab (inline panel) ─────────────────────────────────────────────

const STATUS_BADGE: Record<MergeStatus, { label: string; className: string }> = {
  OPEN: { label: 'Open', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  APPROVED: { label: 'Approved', className: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' },
  REJECTED: { label: 'Rejected', className: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
  MERGED: { label: 'Merged', className: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
  CONFLICT: { label: 'Conflict', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
};

function BranchesTab() {
  const branches = useVersionStore((s) => s.branches);
  const currentBranchId = useVersionStore((s) => s.currentBranchId);
  const switchBranch = useVersionStore((s) => s.switchBranch);
  const setBranchDialogOpen = useVersionStore((s) => s.setBranchDialogOpen);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">Branches</h3>
          <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
            {branches.length}
          </Badge>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setBranchDialogOpen(true)}
          className="h-7 gap-1 px-2 text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          New
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1">
          {branches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <GitBranch className="mb-2 h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No branches yet</p>
              <p className="text-xs text-muted-foreground">
                Create a branch to start working
              </p>
            </div>
          ) : (
            branches.map((branch) => (
              <div
                key={branch.id}
                className={cn(
                  'flex items-center justify-between rounded-md px-3 py-2.5 transition-colors hover:bg-muted/50',
                  branch.id === currentBranchId && 'bg-primary/5 border border-primary/20',
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <GitBranch className={cn('h-3.5 w-3.5 shrink-0', branch.id === currentBranchId ? 'text-primary' : 'text-muted-foreground')} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{branch.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {branch.isDefault ? 'Default branch' : `Created ${new Date(branch.createdAt).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                {branch.id !== currentBranchId && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 text-[10px]"
                    onClick={() => switchBranch(branch.id)}
                  >
                    Switch
                  </Button>
                )}
                {branch.id === currentBranchId && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                    Active
                  </Badge>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// ─── Merges Tab (inline panel) ───────────────────────────────────────────────

function MergesTab() {
  const mergeRequests = useVersionStore((s) => s.mergeRequests);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">Merge Requests</h3>
          <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
            {mergeRequests.length}
          </Badge>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => useVersionStore.getState().setMergeDialogOpen(true)}
          className="h-7 gap-1 px-2 text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          New
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1">
          {mergeRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <GitMerge className="mb-2 h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No merge requests</p>
              <p className="text-xs text-muted-foreground">
                Create a merge request to propose changes
              </p>
            </div>
          ) : (
            mergeRequests.map((mr) => {
              const status = STATUS_BADGE[mr.status];
              return (
                <div
                  key={mr.id}
                  className="rounded-md px-3 py-2.5 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">{mr.title}</p>
                    <Badge className={cn('shrink-0 text-[10px] px-1.5 py-0 h-5', status.className)}>
                      {status.label}
                    </Badge>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <span className="font-mono">{mr.sourceBranch?.name ?? '?'}</span>
                    <span>&rarr;</span>
                    <span className="font-mono">{mr.targetBranch?.name ?? '?'}</span>
                  </div>
                  <div className="mt-1 text-[10px] text-muted-foreground">
                    {new Date(mr.createdAt).toLocaleDateString()}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// ─── Comments Tab ────────────────────────────────────────────────────────────

function CommentsTab() {
  const [comments, setComments] = useState([
    { id: '1', author: 'Alice', avatar: '', authorId: 'a1', text: 'Great layout! Love the color scheme.', time: '2 hours ago' },
    { id: '2', author: 'Bob', avatar: '', authorId: 'a2', text: 'Should we add more sticky notes in the brainstorming section?', time: '1 hour ago' },
    { id: '3', author: 'You', avatar: '', authorId: 'me', text: 'Good idea, I\'ll add them in the next commit.', time: '30 minutes ago' },
  ]);
  const [newComment, setNewComment] = useState('');

  const handleSend = useCallback(() => {
    if (!newComment.trim()) return;
    setComments((prev) => [
      ...prev,
      {
        id: `c-${Date.now()}`,
        author: 'You',
        avatar: '',
        authorId: 'me',
        text: newComment.trim(),
        time: 'just now',
      },
    ]);
    setNewComment('');
  }, [newComment]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-4 py-3">
        <h3 className="text-sm font-semibold">Comments</h3>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-3 p-3">
          {comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <MessageSquare className="mb-2 h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No comments yet</p>
              <p className="text-xs text-muted-foreground">
                Start a conversation about this board
              </p>
            </div>
          ) : (
            comments.map((c) => {
              const color = getAvatarColor(c.authorId);
              return (
                <div key={c.id} className="flex gap-2.5">
                  <Avatar className="mt-0.5 h-7 w-7 shrink-0">
                    {c.avatar && <AvatarImage src={c.avatar} alt={c.author} />}
                    <AvatarFallback className={cn('text-[10px] text-white', color)}>
                      {getInitials(c.author)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-semibold">{c.author}</span>
                      <span className="text-[10px] text-muted-foreground">{c.time}</span>
                    </div>
                    <p className="mt-0.5 text-sm text-foreground/90 leading-relaxed">
                      {c.text}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t p-3">
        <div className="flex gap-2">
          <Input
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="h-8 text-sm"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!newComment.trim()}
            className="h-8 w-8 shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Members Tab ────────────────────────────────────────────────────────────

function MembersTab() {
  // Mock data - in a real app this would come from the store / API
  const [members] = useState<BoardMember[]>([
    { id: '1', boardId: 'b1', userId: 'u1', role: 'OWNER', joinedAt: '2024-01-01', user: { id: 'u1', name: 'Alice Johnson', email: 'alice@example.com' } },
    { id: '2', boardId: 'b1', userId: 'u2', role: 'EDITOR', joinedAt: '2024-01-05', user: { id: 'u2', name: 'Bob Smith', email: 'bob@example.com' } },
    { id: '3', boardId: 'b1', userId: 'u3', role: 'REVIEWER', joinedAt: '2024-01-10', user: { id: 'u3', name: 'Carol Williams', email: 'carol@example.com' } },
    { id: '4', boardId: 'b1', userId: 'u4', role: 'VIEWER', joinedAt: '2024-02-01', user: { id: 'u4', name: 'Dave Brown', email: 'dave@example.com' } },
  ]);

  const [inviteEmail, setInviteEmail] = useState('');
  const [showInvite, setShowInvite] = useState(false);

  const handleInvite = useCallback(() => {
    if (!inviteEmail.trim()) return;
    // In a real app, this would call an API
    setInviteEmail('');
    setShowInvite(false);
  }, [inviteEmail]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">Members</h3>
          <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
            {members.length}
          </Badge>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowInvite((v) => !v)}
          className="h-7 gap-1 px-2 text-xs"
        >
          {showInvite ? 'Cancel' : (
            <>
              <Plus className="h-3.5 w-3.5" />
              Invite
            </>
          )}
        </Button>
      </div>

      {showInvite && (
        <div className="border-b px-4 py-3 space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="email@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleInvite();
                if (e.key === 'Escape') setShowInvite(false);
              }}
              className="h-8 text-sm"
              type="email"
              autoFocus
            />
            <Button
              size="sm"
              onClick={handleInvite}
              disabled={!inviteEmail.trim()}
              className="h-8 px-3 text-xs"
            >
              Invite
            </Button>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1">
          {members.map((member) => {
            const user = member.user;
            if (!user) return null;
            const color = getAvatarColor(user.id);
            const initials = getInitials(user.name);
            const roleConfig = ROLE_CONFIG[member.role];

            return (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-md px-3 py-2.5 hover:bg-muted/50"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar className="h-8 w-8 shrink-0">
                    {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                    <AvatarFallback className={cn('text-[10px] text-white', color)}>
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Badge className={cn('shrink-0 text-[10px] px-1.5 py-0 h-5', roleConfig.className)}>
                  {roleConfig.label}
                </Badge>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

// ─── Tab Icon Map ────────────────────────────────────────────────────────────

const TAB_CONFIG: { value: RightPanelTab; label: string; icon: React.ReactNode }[] = [
  { value: 'history', label: 'History', icon: <History className="h-4 w-4" /> },
  { value: 'branches', label: 'Branches', icon: <GitBranch className="h-4 w-4" /> },
  { value: 'merges', label: 'Merges', icon: <GitMerge className="h-4 w-4" /> },
  { value: 'comments', label: 'Comments', icon: <MessageSquare className="h-4 w-4" /> },
  { value: 'members', label: 'Members', icon: <Users className="h-4 w-4" /> },
];

// ─── Main Panel ─────────────────────────────────────────────────────────────

export function RightPanel() {
  const rightPanelOpen = useAppStore((s) => s.rightPanelOpen);
  const setRightPanelOpen = useAppStore((s) => s.setRightPanelOpen);
  const rightPanelTab = useAppStore((s) => s.rightPanelTab);
  const setRightPanelTab = useAppStore((s) => s.setRightPanelTab);

  return (
    <AnimatePresence>
      {rightPanelOpen && (
        <motion.div
          key="right-panel"
          initial={{ x: 320, opacity: 0.8 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0.8 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="absolute right-0 top-0 z-30 flex h-full w-full sm:w-[320px] flex-col border-l bg-background shadow-xl"
        >
          {/* Close button */}
          <div className="absolute right-2 top-2 z-10">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full bg-background/80 backdrop-blur-sm"
              onClick={() => setRightPanelOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <Tabs
            value={rightPanelTab}
            onValueChange={(v) => setRightPanelTab(v as RightPanelTab)}
            className="flex h-full flex-col"
          >
            <TabsList className="mx-3 mt-3 mb-0 h-9 w-auto grid grid-cols-5 shrink-0">
              {TAB_CONFIG.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="gap-1 px-1.5 text-[11px] data-[state=active]:shadow-sm"
                  title={tab.label}
                >
                  {tab.icon}
                  <span className="hidden xl:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="flex-1 overflow-hidden mt-0">
              <TabsContent value="history" className="m-0 h-full">
                <HistoryTimeline />
              </TabsContent>
              <TabsContent value="branches" className="m-0 h-full">
                <BranchesTab />
              </TabsContent>
              <TabsContent value="merges" className="m-0 h-full">
                <MergesTab />
              </TabsContent>
              <TabsContent value="comments" className="m-0 h-full">
                <CommentsTab />
              </TabsContent>
              <TabsContent value="members" className="m-0 h-full">
                <MembersTab />
              </TabsContent>
            </div>
          </Tabs>
        </motion.div>
      )}
    </AnimatePresence>
  );
}