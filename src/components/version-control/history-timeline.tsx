'use client';

import { useState, useMemo, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GitCommitHorizontal, Tag, RotateCcw, Eye, Filter, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CommitInfo } from '@/lib/types';
import { useVersionStore } from '@/store/version-store';

// ─── Relative Time ──────────────────────────────────────────────────────────

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);

  if (diffSec < 5) return 'just now';
  if (diffSec < 60) return `${diffSec} seconds ago`;
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr !== 1 ? 's' : ''} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
  if (diffWeek < 5) return `${diffWeek} week${diffWeek !== 1 ? 's' : ''} ago`;
  return `${diffMonth} month${diffMonth !== 1 ? 's' : ''} ago`;
}

// ─── Avatar Colors ──────────────────────────────────────────────────────────

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
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
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

// ─── Filter State ───────────────────────────────────────────────────────────

interface FilterState {
  authorId: string | null;
  dateRange: 'all' | 'today' | 'week' | 'month';
}

// ─── Component ──────────────────────────────────────────────────────────────

export function HistoryTimeline() {
  const [filters, setFilters] = useState<FilterState>({ authorId: null, dateRange: 'all' });
  const [previewCommitId, setPreviewCommitId] = useState<string | null>(null);

  const commits = useVersionStore((s) => s.commits);
  const currentBranchId = useVersionStore((s) => s.currentBranchId);
  const branches = useVersionStore((s) => s.branches);

  const currentBranch = branches.find((b) => b.id === currentBranchId);
  const headCommitId = currentBranch?.headCommit?.id ?? null;

  // Get unique authors
  const authors = useMemo(() => {
    const map = new Map<string, { id: string; name: string; avatar?: string }>();
    commits.forEach((c) => {
      if (c.author) {
        map.set(c.author.id, c.author);
      }
    });
    return Array.from(map.values());
  }, [commits]);

  // Filter commits
  const filteredCommits = useMemo(() => {
    let result = currentBranchId
      ? commits.filter((c) => c.branchId === currentBranchId)
      : commits;

    if (filters.authorId) {
      result = result.filter((c) => c.authorId === filters.authorId);
    }

    if (filters.dateRange !== 'all') {
      const now = Date.now();
      const cutoffs: Record<string, number> = {
        today: 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000,
      };
      const cutoff = now - (cutoffs[filters.dateRange] ?? 0);
      result = result.filter((c) => new Date(c.createdAt).getTime() >= cutoff);
    }

    return result;
  }, [commits, currentBranchId, filters]);

  const handleRestore = useCallback(
    (commit: CommitInfo) => {
      const branchName = `restore-${commit.id.slice(0, 7)}`;
      // This would trigger creating a branch from this commit
      alert(`Would create branch "${branchName}" from commit "${commit.id.slice(0, 7)}"`);
    },
    [],
  );

  const handlePreview = useCallback(
    async (commitId: string) => {
      setPreviewCommitId((prev) => (prev === commitId ? null : commitId));
    },
    [],
  );

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold">Commit History</h3>
          <span className="text-xs text-muted-foreground">
            {filteredCommits.length} commit{filteredCommits.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <Select
            value={filters.authorId ?? '__all__'}
            onValueChange={(v) =>
              setFilters((f) => ({
                ...f,
                authorId: v === '__all__' ? null : v,
              }))
            }
          >
            <SelectTrigger className="h-7 flex-1 text-xs">
              <Filter className="mr-1.5 h-3 w-3 shrink-0" />
              <SelectValue placeholder="All authors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All authors</SelectItem>
              {authors.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.dateRange}
            onValueChange={(v) =>
              setFilters((f) => ({
                ...f,
                dateRange: v as FilterState['dateRange'],
              }))
            }
          >
            <SelectTrigger className="h-7 w-[100px] text-xs">
              <CalendarDays className="mr-1.5 h-3 w-3 shrink-0" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This week</SelectItem>
              <SelectItem value="month">This month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Timeline */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {filteredCommits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <GitCommitHorizontal className="mb-2 h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No commits yet</p>
              <p className="text-xs text-muted-foreground">
                Make changes and create your first commit
              </p>
            </div>
          ) : (
            <div className="relative pl-6">
              {/* Vertical line */}
              <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border" />

              <div className="space-y-0">
                {filteredCommits.map((commit, idx) => {
                  const isHead = commit.id === headCommitId;
                  const isPreview = commit.id === previewCommitId;
                  const authorColor = getAvatarColor(commit.authorId);
                  const authorName = commit.author?.name ?? 'Unknown';
                  const authorInitials = getInitials(authorName);
                  const isLast = idx === filteredCommits.length - 1;

                  return (
                    <div key={commit.id} className="relative pb-6 last:pb-0">
                      {/* Node */}
                      <div
                        className={cn(
                          'absolute -left-6 top-1.5 z-10 flex h-[18px] w-[18px] items-center justify-center rounded-full border-2',
                          isHead
                            ? 'border-primary bg-primary'
                            : 'border-muted-foreground/40 bg-background',
                          isLast && 'bottom-0',
                        )}
                      >
                        {isHead && (
                          <div className="h-[6px] w-[6px] rounded-full bg-primary-foreground" />
                        )}
                      </div>

                      {/* Commit card */}
                      <div
                        className={cn(
                          'rounded-md border p-3 transition-colors',
                          isHead
                            ? 'border-primary/30 bg-primary/5'
                            : 'border-border hover:bg-muted/50',
                        )}
                      >
                        {/* Top row: message + tag */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              'text-sm leading-snug',
                              isHead ? 'font-semibold' : 'font-medium',
                            )}>
                              {commit.message}
                            </p>
                          </div>
                          {commit.tag && (
                            <Badge variant="outline" className="shrink-0 gap-1 text-[10px] px-1.5 py-0 h-5">
                              <Tag className="h-2.5 w-2.5" />
                              {commit.tag}
                            </Badge>
                          )}
                        </div>

                        {/* Author & time */}
                        <div className="mt-2 flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            {commit.author?.avatar && (
                              <AvatarImage src={commit.author.avatar} alt={authorName} />
                            )}
                            <AvatarFallback
                              className={cn(
                                'text-[9px] text-white',
                                authorColor,
                              )}
                            >
                              {authorInitials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground truncate">
                            {authorName}
                          </span>
                          <span className="text-xs text-muted-foreground/60">
                            ·
                          </span>
                          <span className="text-xs text-muted-foreground/60 shrink-0">
                            {formatRelativeTime(commit.createdAt)}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="mt-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs gap-1"
                            onClick={() => handlePreview(commit.id)}
                          >
                            <Eye className="h-3 w-3" />
                            Preview
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs gap-1"
                            onClick={() => handleRestore(commit)}
                          >
                            <RotateCcw className="h-3 w-3" />
                            Restore
                          </Button>
                        </div>

                        {/* Expanded preview */}
                        {isPreview && (
                          <div className="mt-3 rounded border bg-muted/30 p-3">
                            <p className="text-xs text-muted-foreground mb-1">
                              Snapshot preview
                            </p>
                            <p className="text-xs font-mono text-muted-foreground">
                              Commit: {commit.id.slice(0, 7)} · Branch: {branches.find((b) => b.id === commit.branchId)?.name ?? commit.branchId}
                            </p>
                            {commit.parentId && (
                              <p className="text-xs font-mono text-muted-foreground mt-0.5">
                                Parent: {commit.parentId.slice(0, 7)}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}