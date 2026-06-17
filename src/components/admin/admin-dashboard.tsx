'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  LayoutGrid,
  Puzzle,
  FileCode2,
  TrendingUp,
  Activity,
  Clock,
  ArrowRight,
  Settings,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

type AdminSection = 'dashboard' | 'users' | 'ad-scripts' | 'boards' | 'plugins' | 'analytics' | 'integrations' | 'settings';

interface DashboardStats {
  totalUsers: number;
  activeBoards: number;
  totalPlugins: number;
  activeAdScripts: number;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  user?: string;
}

const mockActivities: RecentActivity[] = [
  { id: '1', type: 'user', description: 'New user signed up', timestamp: '2 min ago', user: 'John D.' },
  { id: '2', type: 'board', description: 'Board "Marketing Kit" created', timestamp: '15 min ago', user: 'Sarah K.' },
  { id: '3', type: 'ad', description: 'Ad script "Header Banner" activated', timestamp: '1 hour ago', user: 'Admin' },
  { id: '4', type: 'user', description: 'User role updated to ADMIN', timestamp: '2 hours ago', user: 'Admin' },
  { id: '5', type: 'board', description: 'Board deleted by owner', timestamp: '3 hours ago', user: 'Mike W.' },
  { id: '6', type: 'user', description: 'User account deactivated', timestamp: '5 hours ago', user: 'Admin' },
  { id: '7', type: 'board', description: 'Board "Q4 Roadmap" shared publicly', timestamp: '8 hours ago', user: 'Alex C.' },
  { id: '8', type: 'user', description: 'Bulk user import completed', timestamp: '1 day ago', user: 'Admin' },
];

export function AdminDashboard({ onNavigate }: { onNavigate: (section: AdminSection) => void }) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/admin/analytics');
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
        } else {
          // Use fallback mock data
          setStats({
            totalUsers: 1247,
            activeBoards: 384,
            totalPlugins: 72,
            activeAdScripts: 5,
          });
        }
      } catch {
        setStats({
          totalUsers: 1247,
          activeBoards: 384,
          totalPlugins: 72,
          activeAdScripts: 5,
        });
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const statCards = [
    {
      label: 'Total Users',
      value: stats?.totalUsers ?? '—',
      icon: Users,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      onClick: () => onNavigate('users'),
    },
    {
      label: 'Active Boards',
      value: stats?.activeBoards ?? '—',
      icon: LayoutGrid,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      onClick: () => onNavigate('boards'),
    },
    {
      label: 'Total Plugins',
      value: stats?.totalPlugins ?? '—',
      icon: Puzzle,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      onClick: () => onNavigate('plugins'),
    },
    {
      label: 'Active Ad Scripts',
      value: stats?.activeAdScripts ?? '—',
      icon: FileCode2,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      onClick: () => onNavigate('ad-scripts'),
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user': return Users;
      case 'board': return LayoutGrid;
      case 'ad': return FileCode2;
      default: return Activity;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your LayerBoard instance</p>
      </div>

      {error && (
        <div className="neu-card p-4 border-l-4 border-rose-400">
          <p className="text-sm text-rose-600">{error}</p>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card
            key={card.label}
            className="neu-card cursor-pointer hover:shadow-md transition-shadow duration-200 border-0"
            onClick={card.onClick}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`flex items-center justify-center size-12 rounded-xl ${card.bg}`}>
                <card.icon className={`size-6 ${card.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                {loading ? (
                  <Skeleton className="h-8 w-16 mb-1" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{card.value}</p>
                )}
                <p className="text-xs text-muted-foreground">{card.label}</p>
              </div>
              <ArrowRight className="size-4 text-muted-foreground/50" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 neu-card border-0">
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-4 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="size-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">Recent Activity</h2>
              </div>
              <Badge variant="secondary" className="text-xs">Last 24h</Badge>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {mockActivities.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors border-0"
                  >
                    <div className="flex items-center justify-center size-8 rounded-lg bg-muted/50 shrink-0 mt-0.5">
                      <Icon className="size-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{activity.description}</p>
                      {activity.user && (
                        <p className="text-xs text-muted-foreground">by {activity.user}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                      <Clock className="size-3" />
                      {activity.timestamp}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="neu-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="size-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Quick Actions</h2>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 border-0 neu-flat"
                onClick={() => onNavigate('users')}
              >
                <Users className="size-4" />
                Manage Users
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 border-0 neu-flat"
                onClick={() => onNavigate('ad-scripts')}
              >
                <FileCode2 className="size-4" />
                Configure Ad Scripts
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 border-0 neu-flat"
                onClick={() => onNavigate('boards')}
              >
                <LayoutGrid className="size-4" />
                View Boards
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 border-0 neu-flat"
                onClick={() => onNavigate('analytics')}
              >
                <TrendingUp className="size-4" />
                View Analytics
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 border-0 neu-flat"
                onClick={() => onNavigate('settings')}
              >
                <Settings className="size-4" />
                System Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


