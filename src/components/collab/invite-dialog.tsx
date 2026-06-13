'use client';

import { useEffect, useState, useCallback } from 'react';
import { Loader2, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { t, type Locale } from '@/lib/i18n';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Member {
  id: string;
  boardId: string;
  userId: string;
  role: string;
  joinedAt: string;
  isOwner: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

interface Invite {
  id: string;
  boardId: string;
  email: string;
  role: string;
  token: string;
  createdAt: string;
  expiresAt: string;
  inviter: {
    id: string;
    name: string;
    email: string;
  };
}

// ─── Role helpers ─────────────────────────────────────────────────────────────

function roleBadgeVariant(role: string) {
  switch (role) {
    case 'OWNER':
      return 'default' as const;
    case 'EDITOR':
      return 'secondary' as const;
    case 'REVIEWER':
      return 'outline' as const;
    case 'VIEWER':
    default:
      return 'outline' as const;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

interface InviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardId: string | null;
}

export function InviteDialog({ open, onOpenChange, boardId }: InviteDialogProps) {
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';

  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('EDITOR');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const fetchData = useCallback(async () => {
    if (!boardId) return;
    setLoading(true);
    try {
      const [membersRes, invitesRes] = await Promise.all([
        fetch(`/api/boards/${boardId}/members`),
        fetch(`/api/invites?boardId=${boardId}`),
      ]);
      if (membersRes.ok) {
        const data = await membersRes.json();
        setMembers(data.members ?? []);
      }
      if (invitesRes.ok) {
        const data = await invitesRes.json();
        setInvites(data.invites ?? []);
      }
    } catch (err) {
      console.error('Error fetching collab data:', err);
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    if (open && boardId) {
      fetchData();
    }
  }, [open, boardId, fetchData]);

  const handleSendInvite = async () => {
    if (!boardId || !email.trim()) return;
    setSending(true);
    try {
      const res = await fetch('/api/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boardId,
          email: email.trim(),
          role,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to send invite');
        return;
      }
      toast.success(t('collab.inviteSent', locale));
      setEmail('');
      setRole('EDITOR');
      fetchData();
    } catch {
      toast.error('Failed to send invite');
    } finally {
      setSending(false);
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    try {
      await fetch(`/api/invites?id=${inviteId}`, { method: 'DELETE' });
      fetchData();
    } catch {
      toast.error('Failed to revoke invite');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!boardId) return;
    try {
      const res = await fetch(`/api/boards/${boardId}/members?userId=${userId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to remove member');
        return;
      }
      fetchData();
    } catch {
      toast.error('Failed to remove member');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle>{t('collab.inviteMembers', locale)}</DialogTitle>
          <DialogDescription className="sr-only">
            {t('collab.inviteMembers', locale)}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col max-h-[70vh]">
          {/* Invite form */}
          <div className="p-4 pb-2 space-y-3">
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder={t('collab.email', locale)}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 h-9 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendInvite();
                }}
              />
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="w-[120px] h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EDITOR">{t('collab.editor', locale)}</SelectItem>
                  <SelectItem value="VIEWER">{t('collab.viewer', locale)}</SelectItem>
                  <SelectItem value="REVIEWER">{t('collab.reviewer', locale)}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              size="sm"
              className="w-full h-9 gap-2"
              onClick={handleSendInvite}
              disabled={!email.trim() || sending}
            >
              {sending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              {t('collab.sendInvite', locale)}
            </Button>
          </div>

          <Separator />

          {/* Members list */}
          <div className="flex flex-col flex-1 min-h-0">
            <div className="px-4 pt-3 pb-1">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('collab.members', locale)}
              </h3>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : members.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6 px-4">
                {t('collab.noMembers', locale)}
              </p>
            ) : (
              <ScrollArea className="max-h-[200px]">
                <div className="px-4 pb-2 space-y-1">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-muted/50 transition-colors"
                    >
                      <Avatar className="h-7 w-7">
                        {member.user.avatar && (
                          <AvatarImage src={member.user.avatar} alt={member.user.name} />
                        )}
                        <AvatarFallback className="text-[10px]">
                          {getInitials(member.user.name || member.user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {member.user.name || member.user.email}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {member.user.email}
                        </p>
                      </div>
                      <Badge variant={roleBadgeVariant(member.role)} className="text-[10px] shrink-0">
                        {member.isOwner
                          ? t('collab.owner', locale)
                          : member.role === 'EDITOR'
                            ? t('collab.editor', locale)
                            : member.role === 'VIEWER'
                              ? t('collab.viewer', locale)
                              : t('collab.reviewer', locale)}
                      </Badge>
                      {!member.isOwner && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveMember(member.userId)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          <Separator />

          {/* Pending invites */}
          <div className="flex flex-col flex-1 min-h-0">
            <div className="px-4 pt-3 pb-1">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('collab.pendingInvites', locale)}
              </h3>
            </div>

            {loading ? null : invites.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6 px-4">
                {t('collab.noInvites', locale)}
              </p>
            ) : (
              <ScrollArea className="max-h-[160px]">
                <div className="px-4 pb-3 space-y-1">
                  {invites.map((invite) => (
                    <div
                      key={invite.id}
                      className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-muted/50 transition-colors"
                    >
                      <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium shrink-0">
                        {getInitials(invite.email)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{invite.email}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {new Date(invite.expiresAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={roleBadgeVariant(invite.role)} className="text-[10px] shrink-0">
                        {invite.role === 'EDITOR'
                          ? t('collab.editor', locale)
                          : invite.role === 'VIEWER'
                            ? t('collab.viewer', locale)
                            : t('collab.reviewer', locale)}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => handleRevokeInvite(invite.id)}
                      >
                        {t('collab.revoke', locale)}
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}