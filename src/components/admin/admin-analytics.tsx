'use client';

import { useState } from 'react';
import {
  Users,
  LayoutGrid,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

// Mock data for analytics
const userGrowthData = [
  { month: 'Jan', users: 120 },
  { month: 'Feb', users: 185 },
  { month: 'Mar', users: 240 },
  { month: 'Apr', users: 310 },
  { month: 'May', users: 420 },
  { month: 'Jun', users: 580 },
  { month: 'Jul', users: 720 },
  { month: 'Aug', users: 850 },
  { month: 'Sep', users: 980 },
  { month: 'Oct', users: 1080 },
  { month: 'Nov', users: 1180 },
  { month: 'Dec', users: 1247 },
];

const boardCreationData = [
  { month: 'Jan', boards: 15 },
  { month: 'Feb', boards: 22 },
  { month: 'Mar', boards: 35 },
  { month: 'Apr', boards: 48 },
  { month: 'May', boards: 65 },
  { month: 'Jun', boards: 78 },
  { month: 'Jul', boards: 92 },
  { month: 'Aug', boards: 105 },
  { month: 'Sep', boards: 128 },
  { month: 'Oct', boards: 145 },
  { month: 'Nov', boards: 168 },
  { month: 'Dec', boards: 184 },
];

const categoryData = [
  { name: 'UI Design', value: 42 },
  { name: 'Wireframes', value: 28 },
  { name: 'Prototypes', value: 35 },
  { name: 'User Research', value: 18 },
  { name: 'Architecture', value: 12 },
  { name: 'Branding', value: 22 },
];

const popularPluginsData = [
  { name: 'Basic Shapes', installs: 842 },
  { name: 'Auto Layout', installs: 756 },
  { name: 'Icons Pack', installs: 698 },
  { name: 'Color Picker', installs: 621 },
  { name: 'Grid System', installs: 534 },
  { name: 'Typography', installs: 489 },
  { name: 'Export Tools', installs: 445 },
  { name: 'Star & Bursts', installs: 402 },
];

export function AdminAnalytics() {
  const [loading, setLoading] = useState(false);

  const statCards = [
    {
      label: 'Total Users',
      value: '1,247',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'text-emerald-600',
    },
    {
      label: 'Total Boards',
      value: '384',
      change: '+8.3%',
      trend: 'up',
      icon: LayoutGrid,
      color: 'text-amber-600',
    },
    {
      label: 'Active This Week',
      value: '567',
      change: '+15.2%',
      trend: 'up',
      icon: Activity,
      color: 'text-violet-600',
    },
    {
      label: 'Avg. Session',
      value: '24m',
      change: '-3.1%',
      trend: 'down',
      icon: Calendar,
      color: 'text-rose-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Platform usage statistics and trends</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.label} className="neu-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`flex items-center justify-center size-10 rounded-xl bg-muted/50`}>
                  <card.icon className={`size-5 ${card.color}`} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${card.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {card.trend === 'up' ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                  {card.change}
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card className="neu-card border-0">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-foreground mb-4">User Growth</h3>
            {loading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11 }}
                    className="text-muted-foreground"
                  />
                  <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--popover)',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                      fontSize: '12px',
                    }}
                  />
                  <Bar
                    dataKey="users"
                    fill="var(--primary)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Board Creation Trends */}
        <Card className="neu-card border-0">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-foreground mb-4">Board Creation Trends</h3>
            {loading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={boardCreationData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11 }}
                    className="text-muted-foreground"
                  />
                  <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--popover)',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                      fontSize: '12px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="boards"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <Card className="neu-card border-0">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-foreground mb-4">Top Board Categories</h3>
            <div className="space-y-3">
              {categoryData
                .sort((a, b) => b.value - a.value)
                .map((cat, i) => (
                  <div key={cat.name} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-5">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-foreground">{cat.name}</span>
                        <span className="text-xs text-muted-foreground">{cat.value} boards</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${(cat.value / categoryData[0].value) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Popular Plugins */}
        <Card className="neu-card border-0">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-foreground mb-4">Most Popular Plugins</h3>
            <div className="space-y-3">
              {popularPluginsData.map((plugin, i) => (
                <div key={plugin.name} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-foreground truncate">{plugin.name}</span>
                      <span className="text-xs text-muted-foreground">{plugin.installs} installs</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all"
                        style={{ width: `${(plugin.installs / popularPluginsData[0].installs) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
