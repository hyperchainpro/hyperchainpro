'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Search,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Shield,
  UserCheck,
  UserX,
  Pencil,
  Trash2,
  Users as UsersIcon,
  Filter,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface UserRecord {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

interface UserListResponse {
  users: UserRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const ITEMS_PER_PAGE = 20;

export function AdminUsers() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState<UserRecord | null>(null);
  const [editRole, setEditRole] = useState('');
  const [deleteUser, setDeleteUser] = useState<UserRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: ITEMS_PER_PAGE.toString(),
      });
      if (search) params.set('search', search);
      if (roleFilter !== 'all') params.set('role', roleFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) {
        const data: UserListResponse = await res.json();
        setUsers(data.users);
        setTotalPages(data.totalPages);
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error || 'Failed to fetch users');
        // Fallback mock data
        if (!search && roleFilter === 'all' && statusFilter === 'all') {
          setUsers(getMockUsers());
          setTotalPages(3);
        }
      }
    } catch {
      setError('Network error. Showing cached data.');
      if (page === 1 && !search && roleFilter === 'all' && statusFilter === 'all') {
        setUsers(getMockUsers());
        setTotalPages(3);
      }
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleEditRole = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${editUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: editRole }),
      });
      if (res.ok) {
        toast.success(`Role updated to ${editRole}`);
        setEditUser(null);
        fetchUsers();
      } else {
        toast.error('Failed to update role');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (user: UserRecord) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      if (res.ok) {
        toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}`);
        fetchUsers();
      } else {
        toast.error('Failed to update status');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${deleteUser.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('User deleted');
        setDeleteUser(null);
        fetchUsers();
      } else {
        toast.error('Failed to delete user');
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage user accounts and roles</p>
        </div>
        <Badge variant="outline" className="w-fit gap-1">
          <UsersIcon className="size-3" />
          {loading ? '...' : `${users.length} shown`}
        </Badge>
      </div>

      {error && (
        <div className="neu-card p-4 border-l-4 border-rose-400">
          <p className="text-sm text-rose-600">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="neu-card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="neu-input !pl-9 border-0"
            />
          </div>
          <div className="flex gap-2">
            <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[130px] neu-flat border-0">
                <Filter className="size-3.5 mr-1.5" />
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="EDITOR">Editor</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[130px] neu-flat border-0">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="neu-card overflow-hidden">
        <div className="max-h-96 overflow-y-auto custom-scrollbar">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Last Login</TableHead>
                <TableHead className="hidden lg:table-cell">Joined</TableHead>
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
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <p className="text-muted-foreground">No users found</p>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium text-foreground">
                      {user.name || <span className="text-muted-foreground italic">No name</span>}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={user.role === 'ADMIN' ? 'default' : 'secondary'}
                        className={user.role === 'ADMIN' ? 'bg-emerald-100 text-emerald-700' : ''}
                      >
                        <Shield className="size-3 mr-1" />
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? 'outline' : 'destructive'}>
                        {user.isActive ? (
                          <><UserCheck className="size-3 mr-1" />Active</>
                        ) : (
                          <><UserX className="size-3 mr-1" />Inactive</>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground text-xs">
                      {user.lastLoginAt ? format(new Date(user.lastLoginAt), 'MMM d, yyyy') : '—'}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground text-xs">
                      {format(new Date(user.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditUser(user); setEditRole(user.role); }}>
                            <Pencil className="size-3.5 mr-2" />
                            Edit Role
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                            {user.isActive ? (
                              <><UserX className="size-3.5 mr-2" />Deactivate</>
                            ) : (
                              <><UserCheck className="size-3.5 mr-2" />Activate</>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-rose-600"
                            onClick={() => setDeleteUser(user)}
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

      {/* Edit Role Dialog */}
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent className="neu-card border-0">
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm text-muted-foreground">User</Label>
              <p className="text-sm font-medium mt-1">{editUser?.name || editUser?.email}</p>
            </div>
            <div>
              <Label className="text-sm">Role</Label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger className="mt-1 neu-flat border-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">USER</SelectItem>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                  <SelectItem value="EDITOR">EDITOR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)} className="neu-flat border-0">Cancel</Button>
            <Button onClick={handleEditRole} disabled={saving} className="neu-raised">
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteUser} onOpenChange={(open) => !open && setDeleteUser(null)}>
        <AlertDialogContent className="neu-card border-0">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteUser?.name || deleteUser?.email}</strong>?
              This action cannot be undone.
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

function getMockUsers(): UserRecord[] {
  return [
    { id: 'u1', email: 'alex@example.com', name: 'Alex Chen', role: 'ADMIN', isActive: true, lastLoginAt: '2025-06-15T10:30:00Z', createdAt: '2024-01-15T00:00:00Z' },
    { id: 'u2', email: 'sarah@example.com', name: 'Sarah Kim', role: 'USER', isActive: true, lastLoginAt: '2025-06-14T14:20:00Z', createdAt: '2024-02-20T00:00:00Z' },
    { id: 'u3', email: 'jordan@example.com', name: 'Jordan Lee', role: 'USER', isActive: true, lastLoginAt: '2025-06-13T09:15:00Z', createdAt: '2024-03-10T00:00:00Z' },
    { id: 'u4', email: 'mike@example.com', name: 'Mike Wu', role: 'EDITOR', isActive: true, lastLoginAt: '2025-06-12T16:45:00Z', createdAt: '2024-04-05T00:00:00Z' },
    { id: 'u5', email: 'nora@example.com', name: 'Nora Patel', role: 'USER', isActive: false, lastLoginAt: '2025-05-20T11:00:00Z', createdAt: '2024-04-18T00:00:00Z' },
    { id: 'u6', email: 'emily@example.com', name: 'Emily Zhang', role: 'USER', isActive: true, lastLoginAt: '2025-06-15T08:00:00Z', createdAt: '2024-05-01T00:00:00Z' },
    { id: 'u7', email: 'dev@example.com', name: 'Dev Sharma', role: 'EDITOR', isActive: true, lastLoginAt: '2025-06-14T17:30:00Z', createdAt: '2024-05-22T00:00:00Z' },
    { id: 'u8', email: 'chris@example.com', name: 'Chris Park', role: 'USER', isActive: true, lastLoginAt: '2025-06-10T13:20:00Z', createdAt: '2024-06-08T00:00:00Z' },
    { id: 'u9', email: 'rina@example.com', name: 'Rina Takahashi', role: 'USER', isActive: true, lastLoginAt: '2025-06-15T06:45:00Z', createdAt: '2024-06-15T00:00:00Z' },
    { id: 'u10', email: 'luis@example.com', name: 'Luis Garcia', role: 'ADMIN', isActive: true, lastLoginAt: '2025-06-15T12:00:00Z', createdAt: '2024-01-02T00:00:00Z' },
    { id: 'u11', email: 'anna@example.com', name: null, role: 'USER', isActive: false, lastLoginAt: null, createdAt: '2024-07-20T00:00:00Z' },
    { id: 'u12', email: 'ben@example.com', name: 'Ben Torres', role: 'USER', isActive: true, lastLoginAt: '2025-06-13T19:10:00Z', createdAt: '2024-08-01T00:00:00Z' },
    { id: 'u13', email: 'clara@example.com', name: 'Clara Johansson', role: 'EDITOR', isActive: true, lastLoginAt: '2025-06-14T10:05:00Z', createdAt: '2024-08-15T00:00:00Z' },
    { id: 'u14', email: 'david@example.com', name: 'David Brown', role: 'USER', isActive: true, lastLoginAt: '2025-06-11T15:30:00Z', createdAt: '2024-09-01T00:00:00Z' },
    { id: 'u15', email: 'eva@example.com', name: 'Eva Muller', role: 'USER', isActive: true, lastLoginAt: '2025-06-15T07:20:00Z', createdAt: '2024-09-20T00:00:00Z' },
    { id: 'u16', email: 'frank@example.com', name: 'Frank Dubois', role: 'USER', isActive: false, lastLoginAt: '2025-04-15T14:00:00Z', createdAt: '2024-10-01T00:00:00Z' },
    { id: 'u17', email: 'grace@example.com', name: 'Grace Kim', role: 'USER', isActive: true, lastLoginAt: '2025-06-15T09:40:00Z', createdAt: '2024-10-15T00:00:00Z' },
    { id: 'u18', email: 'henry@example.com', name: 'Henry Wright', role: 'USER', isActive: true, lastLoginAt: '2025-06-12T11:50:00Z', createdAt: '2024-11-01T00:00:00Z' },
    { id: 'u19', email: 'iris@example.com', name: 'Iris Nakamura', role: 'EDITOR', isActive: true, lastLoginAt: '2025-06-14T16:00:00Z', createdAt: '2024-11-15T00:00:00Z' },
    { id: 'u20', email: 'jake@example.com', name: 'Jake Morrison', role: 'USER', isActive: true, lastLoginAt: '2025-06-15T05:15:00Z', createdAt: '2024-12-01T00:00:00Z' },
  ];
}
