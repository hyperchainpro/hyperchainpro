'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  Puzzle,
  Filter,
  Download,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { DESIGN_PLUGINS, PLUGIN_CATEGORIES } from '@/lib/plugins-data';

export function AdminPlugins() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [enabledPlugins, setEnabledPlugins] = useState<Record<string, boolean>>(() => {
    const enabled: Record<string, boolean> = {};
    DESIGN_PLUGINS.forEach((p) => {
      if (p && p.id) enabled[p.id] = p.isInstalled || false;
    });
    return enabled;
  });

  const filteredPlugins = useMemo(() => {
    return (DESIGN_PLUGINS || []).filter((plugin) => {
      if (!plugin || !plugin.id) return false;
      const matchesSearch = !search ||
        plugin.name.toLowerCase().includes(search.toLowerCase()) ||
        (plugin.description || '').toLowerCase().includes(search.toLowerCase()) ||
        (plugin.author || '').toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || plugin.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [search, categoryFilter]);

  const handleToggleEnabled = (pluginId: string, name: string) => {
    setEnabledPlugins((prev) => {
      const next = { ...prev, [pluginId]: !prev[pluginId] };
      toast.success(`${name} ${next[pluginId] ? 'enabled' : 'disabled'} globally`);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Plugins</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage built-in design plugins</p>
        </div>
        <Badge variant="outline" className="w-fit gap-1">
          <Puzzle className="size-3" />
          {DESIGN_PLUGINS.length} plugins
        </Badge>
      </div>

      {/* Filters */}
      <div className="neu-card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search plugins..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="neu-input !pl-9 border-0"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px] neu-flat border-0">
              <Filter className="size-3.5 mr-1.5" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {PLUGIN_CATEGORIES.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="neu-card p-3 text-center">
          <p className="text-lg font-bold text-foreground">{DESIGN_PLUGINS.length}</p>
          <p className="text-xs text-muted-foreground">Total Plugins</p>
        </div>
        <div className="neu-card p-3 text-center">
          <p className="text-lg font-bold text-emerald-600">
            {Object.values(enabledPlugins).filter(Boolean).length}
          </p>
          <p className="text-xs text-muted-foreground">Enabled</p>
        </div>
        <div className="neu-card p-3 text-center">
          <p className="text-lg font-bold text-muted-foreground">
            {Object.values(enabledPlugins).filter((v) => !v).length}
          </p>
          <p className="text-xs text-muted-foreground">Disabled</p>
        </div>
        <div className="neu-card p-3 text-center">
          <p className="text-lg font-bold text-amber-600">
            {DESIGN_PLUGINS.filter((p) => p.isPopular).length}
          </p>
          <p className="text-xs text-muted-foreground">Popular</p>
        </div>
      </div>

      {/* Table */}
      <div className="neu-card overflow-hidden">
        <div className="max-h-96 overflow-y-auto custom-scrollbar">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="hidden lg:table-cell">Author</TableHead>
                <TableHead className="hidden sm:table-cell">Version</TableHead>
                <TableHead className="hidden lg:table-cell">Popularity</TableHead>
                <TableHead>Enabled</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlugins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <Puzzle className="size-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-muted-foreground">No plugins found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPlugins.map((plugin) => (
                  <TableRow key={plugin.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center size-8 rounded-lg bg-muted/50 shrink-0">
                          <Puzzle className="size-3.5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{plugin.name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{plugin.description}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="secondary" className="capitalize">
                        {plugin.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground text-xs">
                      {plugin.author}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground text-xs">
                      v{plugin.version}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-1">
                        {plugin.isPopular && <Star className="size-3 text-amber-500 fill-amber-500" />}
                        <span className="text-xs text-muted-foreground">
                          {plugin.tags.slice(0, 2).join(', ')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={enabledPlugins[plugin.id] ?? false}
                        onCheckedChange={() => handleToggleEnabled(plugin.id, plugin.name)}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
