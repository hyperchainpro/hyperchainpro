'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Search,
  LayoutGrid,
  MoreHorizontal,
  Trash2,
  Eye,
  Users as UsersIcon,
  ChevronLeft,
  ChevronRight,
  Globe,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface BoardRecord {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  isPublic: boolean;
  deviceType: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { members: number; branches: number; commits: number };
  owner?: { name: string | null; email: string };
}

interface BoardListResponse {
  boards: BoardRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const ITEMS_PER_PAGE = 20;

export function AdminBoards() {
  const [boards, setBoards] = useState<BoardRecord[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteBoard, setDeleteBoard] = useState<BoardRecord | null>(null);
  const [viewBoard, setViewBoard] = useState<BoardRecord | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchBoards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: ITEMS_PER_PAGE.toString(),
      });
      if (search) params.set('search', search);

      const res = await fetch(`/api/admin/boards?${params}`);
      if (res.ok) {
        const data: BoardListResponse = await res.json();
        setBoards(data.boards);
        setTotalPages(data.totalPages);
      } else {
        setError('Failed to fetch boards');
        if (page === 1 && !search) {
          setBoards(getMockBoards());
          setTotalPages(2);
        }
      }
    } catch {
      setError('Network error');
      if (page === 1 && !search) {
        setBoards(getMockBoards());
        setTotalPages(2);
      }
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const handleDelete = async () => {
    if (!deleteBoard) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/boards/${deleteBoard.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Board deleted');
        setDeleteBoard(null);
        fetchBoards();
      } else {
        toast.error('Failed to delete board');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Boards</h1>
          <p className="text-sm text-muted-foreground mt-1">View and manage all design boards</p>
        </div>
        <Badge variant="outline" className="w-fit gap-1">
          <LayoutGrid className="size-3" />
          {loading ? '...' : `${boards.length} shown`}
        </Badge>
      </div>

      {error && (
        <div className="neu-card p-4 border-l-4 border-amber-400">
          <p className="text-sm text-amber-700">{error}</p>
        </div>
      )}

      {/* Search */}
      <div className="neu-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search boards by name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="neu-input !pl-9 border-0"
          />
        </div>
      </div>

      {/* Table */}
      <div className="neu-card overflow-hidden">
        <div className="max-h-96 overflow-y-auto custom-scrollbar">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Owner</TableHead>
                <TableHead className="hidden sm:table-cell">Members</TableHead>
                <TableHead className="hidden lg:table-cell">Device</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Created</TableHead>
                <TableHead className="w-10">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-5 w-full max-w-[120px]" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : boards.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <LayoutGrid className="size-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-muted-foreground">No boards found</p>
                  </TableCell>
                </TableRow>
              ) : (
                boards.map((board) => (
                  <TableRow key={board.id}>
                    <TableCell className="font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <span className="truncate max-w-[200px]">{board.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {board.owner?.name || board.owner?.email || 'Unknown'}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <UsersIcon className="size-3" />
                        {board._count?.members ?? '—'}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground text-xs">
                      {board.deviceType || '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={board.isPublic ? 'outline' : 'secondary'}>
                        {board.isPublic ? (
                          <><Globe className="size-3 mr-1" />Public</>
                        ) : (
                          <><Lock className="size-3 mr-1" />Private</>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground text-xs">
                      {format(new Date(board.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewBoard(board)}>
                            <Eye className="size-3.5 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-rose-600"
                            onClick={() => setDeleteBoard(board)}
                          >
                            <Trash2 className="size-3.5 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/40">
            <p className="text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="size-8 border-0 neu-flat"
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                <ChevronLeft className="size-4" />
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                const p = start + i;
                if (p > totalPages) return null;
                return (
                  <Button
                    key={p}
                    variant={p === page ? 'secondary' : 'ghost'}
                    size="icon"
                    className={`size-8 border-0 ${p === page ? 'neu-pressed' : ''}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="icon"
                className="size-8 border-0 neu-flat"
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* View Details Dialog */}
      <Dialog open={!!viewBoard} onOpenChange={(open) => !open && setViewBoard(null)}>
        <DialogContent className="neu-card border-0">
          <DialogHeader>
            <DialogTitle>Board Details</DialogTitle>
          </DialogHeader>
          {viewBoard && (
            <div className="space-y-3 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="text-sm font-medium">{viewBoard.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge variant={viewBoard.isPublic ? 'outline' : 'secondary'}>
                    {viewBoard.isPublic ? 'Public' : 'Private'}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Owner</p>
                  <p className="text-sm">{viewBoard.owner?.name || viewBoard.owner?.email || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Members</p>
                  <p className="text-sm">{viewBoard._count?.members ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Branches</p>
                  <p className="text-sm">{viewBoard._count?.branches ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Commits</p>
                  <p className="text-sm">{viewBoard._count?.commits ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Device Type</p>
                  <p className="text-sm">{viewBoard.deviceType || 'Default'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-sm">{format(new Date(viewBoard.createdAt), 'MMM d, yyyy')}</p>
                </div>
              </div>
              {viewBoard.description && (
                <div>
                  <p className="text-xs text-muted-foreground">Description</p>
                  <p className="text-sm">{viewBoard.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteBoard} onOpenChange={(open) => !open && setDeleteBoard(null)}>
        <AlertDialogContent className="neu-card border-0">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Board</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteBoard?.name}</strong>?
              This will permanently remove the board and all its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="neu-flat border-0">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={saving}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {saving ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function getMockBoards(): BoardRecord[] {
  return [
    { id: 'b1', name: 'Product Roadmap Q4', description: 'High-level roadmap', ownerId: 'u1', isPublic: false, deviceType: 'desktop', createdAt: '2025-01-15T00:00:00Z', updatedAt: '2025-06-15T00:00:00Z', _count: { members: 5, branches: 5, commits: 42 }, owner: { name: 'Alex Chen', email: 'alex@example.com' } },
    { id: 'b2', name: 'User Research Synthesis', description: 'Research findings', ownerId: 'u2', isPublic: true, deviceType: null, createdAt: '2025-02-20T00:00:00Z', updatedAt: '2025-06-14T00:00:00Z', _count: { members: 2, branches: 3, commits: 18 }, owner: { name: 'Sarah Kim', email: 'sarah@example.com' } },
    { id: 'b3', name: 'Architecture Decision Records', description: 'ADR tracking', ownerId: 'u1', isPublic: false, deviceType: null, createdAt: '2025-03-10T00:00:00Z', updatedAt: '2025-06-13T00:00:00Z', _count: { members: 3, branches: 8, commits: 67 }, owner: { name: 'Alex Chen', email: 'alex@example.com' } },
    { id: 'b4', name: 'Sprint Planning Board', description: 'Weekly sprint planning', ownerId: 'u3', isPublic: false, deviceType: null, createdAt: '2025-04-05T00:00:00Z', updatedAt: '2025-06-12T00:00:00Z', _count: { members: 4, branches: 12, commits: 156 }, owner: { name: 'Jordan Lee', email: 'jordan@example.com' } },
    { id: 'b5', name: 'Brand Identity Exploration', description: 'Visual mood boards', ownerId: 'u5', isPublic: true, deviceType: null, createdAt: '2025-04-18T00:00:00Z', updatedAt: '2025-06-10T00:00:00Z', _count: { members: 1, branches: 2, commits: 9 }, owner: { name: 'Nora Patel', email: 'nora@example.com' } },
    { id: 'b6', name: 'Mobile App Wireframes', description: 'iOS app wireframes', ownerId: 'u6', isPublic: false, deviceType: 'mobile', createdAt: '2025-05-01T00:00:00Z', updatedAt: '2025-06-15T00:00:00Z', _count: { members: 3, branches: 4, commits: 31 }, owner: { name: 'Emily Zhang', email: 'emily@example.com' } },
    { id: 'b7', name: 'Landing Page Design', description: 'Marketing landing page', ownerId: 'u4', isPublic: true, deviceType: 'desktop', createdAt: '2025-05-22T00:00:00Z', updatedAt: '2025-06-14T00:00:00Z', _count: { members: 2, branches: 1, commits: 14 }, owner: { name: 'Mike Wu', email: 'mike@example.com' } },
    { id: 'b8', name: 'Design System Components', description: 'Component library', ownerId: 'u7', isPublic: false, deviceType: null, createdAt: '2025-06-08T00:00:00Z', updatedAt: '2025-06-15T00:00:00Z', _count: { members: 6, branches: 3, commits: 22 }, owner: { name: 'Dev Sharma', email: 'dev@example.com' } },
  ];
}
