'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Plus,
  FileCode2,
  MoreHorizontal,
  Pencil,
  Trash2,
  Power,
  PowerOff,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
  DialogDescription,
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
import { toast } from 'sonner';
import { format } from 'date-fns';

interface AdScriptRecord {
  id: string;
  name: string;
  platform: string;
  description: string | null;
  scriptCode: string;
  position: string;
  isActive: boolean;
  priority: number;
  targeting: string | null;
  createdAt: string;
  updatedAt: string;
}

const PLATFORMS = [
  { value: 'google-adsense', label: 'Google AdSense' },
  { value: 'meta-ads', label: 'Meta Ads' },
  { value: 'taboola', label: 'Taboola' },
  { value: 'outbrain', label: 'Outbrain' },
  { value: 'mgid', label: 'MGID' },
  { value: 'propellerads', label: 'PropellerAds' },
  { value: 'ezoic', label: 'Ezoic' },
  { value: 'mediavine', label: 'Mediavine' },
  { value: 'adstera', label: 'AdStera' },
  { value: 'carbon-ads', label: 'Carbon Ads' },
  { value: 'buysellads', label: 'BuySellAds' },
  { value: 'custom', label: 'Custom' },
];

const POSITIONS = [
  { value: 'head', label: 'Head' },
  { value: 'body-start', label: 'Body Start' },
  { value: 'body-end', label: 'Body End' },
];

const emptyForm = {
  name: '',
  platform: 'custom',
  description: '',
  scriptCode: '',
  position: 'head',
  isActive: false,
  priority: 0,
  targeting: '',
};

export function AdminAdScripts() {
  const [scripts, setScripts] = useState<AdScriptRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteScript, setDeleteScript] = useState<AdScriptRecord | null>(null);
  const [search, setSearch] = useState('');

  const fetchScripts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/ad-scripts');
      if (res.ok) {
        const data = await res.json();
        setScripts(data.scripts || []);
      } else {
        setError('Failed to load ad scripts. Showing sample data.');
        setScripts(getMockScripts());
      }
    } catch {
      setError('Network error. Showing sample data.');
      setScripts(getMockScripts());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScripts();
  }, [fetchScripts]);

  const filteredScripts = scripts.filter((s) =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.platform.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (script: AdScriptRecord) => {
    setEditingId(script.id);
    setForm({
      name: script.name,
      platform: script.platform,
      description: script.description || '',
      scriptCode: script.scriptCode,
      position: script.position,
      isActive: script.isActive,
      priority: script.priority,
      targeting: script.targeting || '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.scriptCode.trim()) {
      toast.error('Name and Script Code are required');
      return;
    }
    setSaving(true);
    try {
      const isCreate = !editingId;
      const url = isCreate ? '/api/admin/ad-scripts' : `/api/admin/ad-scripts/${editingId}`;
      const method = isCreate ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          platform: form.platform,
          description: form.description.trim() || null,
          scriptCode: form.scriptCode.trim(),
          position: form.position,
          isActive: form.isActive,
          priority: form.priority,
          targeting: form.targeting.trim() || null,
        }),
      });
      if (res.ok) {
        toast.success(isCreate ? 'Ad script created' : 'Ad script updated');
        setDialogOpen(false);
        fetchScripts();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || 'Failed to save');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (script: AdScriptRecord) => {
    try {
      const res = await fetch(`/api/admin/ad-scripts/${script.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !script.isActive }),
      });
      if (res.ok) {
        toast.success(script.isActive ? 'Script deactivated' : 'Script activated');
        fetchScripts();
      } else {
        toast.error('Failed to toggle');
      }
    } catch {
      toast.error('Network error');
    }
  };

  const handleDelete = async () => {
    if (!deleteScript) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/ad-scripts/${deleteScript.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Ad script deleted');
        setDeleteScript(null);
        fetchScripts();
      } else {
        toast.error('Failed to delete');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  const getPlatformLabel = (platform: string) =>
    PLATFORMS.find((p) => p.value === platform)?.label || platform;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Ad Scripts</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage ad scripts injected into the application</p>
        </div>
        <Button onClick={openCreate} className="neu-raised gap-2">
          <Plus className="size-4" />
          Add Script
        </Button>
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
            placeholder="Search ad scripts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
                <TableHead>Platform</TableHead>
                <TableHead className="hidden md:table-cell">Position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Priority</TableHead>
                <TableHead className="w-10">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-5 w-full max-w-[120px]" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredScripts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <FileCode2 className="size-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-muted-foreground">No ad scripts found</p>
                    <Button variant="outline" size="sm" className="mt-3 neu-flat border-0" onClick={openCreate}>
                      <Plus className="size-3.5 mr-1.5" />
                      Add your first script
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                filteredScripts.map((script) => (
                  <TableRow key={script.id}>
                    <TableCell className="font-medium text-foreground">{script.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{getPlatformLabel(script.platform)}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-xs capitalize">
                      {script.position.replace('-', ' ')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={script.isActive ? 'outline' : 'secondary'}>
                        {script.isActive ? (
                          <><Power className="size-3 mr-1 text-emerald-600" />Active</>
                        ) : (
                          <><PowerOff className="size-3 mr-1" />Inactive</>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">{script.priority}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(script)}>
                            <Pencil className="size-3.5 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleActive(script)}>
                            {script.isActive ? (
                              <><PowerOff className="size-3.5 mr-2" />Deactivate</>
                            ) : (
                              <><Power className="size-3.5 mr-2" />Activate</>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-rose-600" onClick={() => setDeleteScript(script)}>
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
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="neu-card border-0 max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Ad Script' : 'Create Ad Script'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Update the ad script configuration.' : 'Add a new ad script to be injected into the application.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ad-name">Name *</Label>
                <Input
                  id="ad-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Header Banner Ad"
                  className="neu-input border-0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ad-platform">Platform</Label>
                <Select value={form.platform} onValueChange={(v) => setForm({ ...form, platform: v })}>
                  <SelectTrigger id="ad-platform" className="neu-flat border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ad-desc">Description</Label>
              <Textarea
                id="ad-desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description of this ad script..."
                className="neu-input border-0 min-h-[60px]"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ad-code">Script Code *</Label>
              <Textarea
                id="ad-code"
                value={form.scriptCode}
                onChange={(e) => setForm({ ...form, scriptCode: e.target.value })}
                placeholder="// Paste your ad script code here..."
                className="neu-input border-0 font-mono text-xs min-h-[120px]"
                rows={6}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ad-position">Position</Label>
                <Select value={form.position} onValueChange={(v) => setForm({ ...form, position: v })}>
                  <SelectTrigger id="ad-position" className="neu-flat border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POSITIONS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ad-priority">Priority</Label>
                <Input
                  id="ad-priority"
                  type="number"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 0 })}
                  className="neu-input border-0"
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(v) => setForm({ ...form, isActive: v })}
                />
                <Label>Active</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ad-targeting">Targeting (JSON, optional)</Label>
              <Textarea
                id="ad-targeting"
                value={form.targeting}
                onChange={(e) => setForm({ ...form, targeting: e.target.value })}
                placeholder='{"pages": ["/dashboard"], "devices": ["desktop"]}'
                className="neu-input border-0 font-mono text-xs min-h-[80px]"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="neu-flat border-0">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="neu-raised">
              {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteScript} onOpenChange={(open) => !open && setDeleteScript(null)}>
        <AlertDialogContent className="neu-card border-0">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Ad Script</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteScript?.name}</strong>?
              This will stop the script from being injected.
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

function getMockScripts(): AdScriptRecord[] {
  return [
    {
      id: 'ad1',
      name: 'Google AdSense - Header',
      platform: 'google-adsense',
      description: 'Main header banner ad unit',
      scriptCode: '// google ad sense script\n<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>',
      position: 'head',
      isActive: true,
      priority: 10,
      targeting: '{"pages": ["*"]}',
      createdAt: '2025-01-10T00:00:00Z',
      updatedAt: '2025-06-01T00:00:00Z',
    },
    {
      id: 'ad2',
      name: 'Meta Pixel',
      platform: 'meta-ads',
      description: 'Facebook/Meta tracking pixel',
      scriptCode: '<!-- Meta Pixel Code -->\n<script>!function(f,b,e,v,n,t,s)...',
      position: 'head',
      isActive: true,
      priority: 20,
      targeting: null,
      createdAt: '2025-02-15T00:00:00Z',
      updatedAt: '2025-05-20T00:00:00Z',
    },
    {
      id: 'ad3',
      name: 'Taboola Widget',
      platform: 'taboola',
      description: 'Content recommendations widget below articles',
      scriptCode: '<script type="text/javascript">\n  window._taboola = ...',
      position: 'body-end',
      isActive: false,
      priority: 5,
      targeting: '{"pages": ["/community", "/dashboard"]}',
      createdAt: '2025-03-20T00:00:00Z',
      updatedAt: '2025-04-10T00:00:00Z',
    },
    {
      id: 'ad4',
      name: 'Carbon Ads Sidebar',
      platform: 'carbon-ads',
      description: 'Carbon Ads for developer audience',
      scriptCode: '<script async src="//cdn.carbonads.com/carbon.js?serve=..."></script>',
      position: 'body-end',
      isActive: true,
      priority: 8,
      targeting: '{"devices": ["desktop"]}',
      createdAt: '2025-04-01T00:00:00Z',
      updatedAt: '2025-06-10T00:00:00Z',
    },
    {
      id: 'ad5',
      name: 'Custom Analytics Tracker',
      platform: 'custom',
      description: 'Custom analytics tracking snippet',
      scriptCode: '<script>\n  window.CUSTOM_ANALYTICS = true;\n  // ... custom tracking code\n</script>',
      position: 'body-start',
      isActive: true,
      priority: 15,
      targeting: null,
      createdAt: '2025-05-05T00:00:00Z',
      updatedAt: '2025-06-12T00:00:00Z',
    },
  ];
}
