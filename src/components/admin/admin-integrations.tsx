'use client'

import { Cpu, Webhook, Github, MessageSquare, FileText, ArrowRightLeft, Layers, Code2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/store/auth-store'
import { useIntegrationStore } from '@/store/integration-store'
import { t } from '@/lib/i18n'

type Locale = import('@/lib/i18n').Locale

const providerIcons: Record<string, React.ElementType> = {
  MCP: Cpu,
  Webhooks: Webhook,
  GitHub: Github,
  Slack: MessageSquare,
  Notion: FileText,
  Linear: ArrowRightLeft,
  'Figma Import': Layers,
  'REST API': Code2,
}

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default',
  inactive: 'secondary',
  error: 'destructive',
}

export function AdminIntegrations() {
  const locale = (useAuthStore((s) => s.user?.language) as Locale) ?? 'en'
  const entries = useIntegrationStore((s) => s.adminEntries)

  const activeCount = entries.filter((e) => e.status === 'active').length

  // Provider breakdown
  const providerCounts: Record<string, number> = {}
  for (const entry of entries) {
    providerCounts[entry.provider] = (providerCounts[entry.provider] || 0) + 1
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {t('admin.integrations.title', locale)}
        </h2>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="neu-card border-0 bg-background">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              {t('admin.integrations.totalActive', locale)}
            </p>
            <p className="text-3xl font-bold mt-1">{activeCount}</p>
          </CardContent>
        </Card>
        <Card className="neu-card border-0 bg-background sm:col-span-2">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-3">
              {t('admin.integrations.provider', locale)}
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(providerCounts).map(([provider, count]) => {
                const Icon = providerIcons[provider]
                return (
                  <div
                    key={provider}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted/50 text-xs"
                  >
                    {Icon && <Icon className="h-3.5 w-3.5" />}
                    <span>{provider}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 ml-1">
                      {count}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integrations table */}
      <Card className="neu-card border-0 bg-background">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">
                    {t('admin.integrations.provider', locale)}
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">
                    {t('admin.integrations.user', locale)}
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">
                    {t('admin.integrations.createdAt', locale)}
                  </th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => {
                  const Icon = providerIcons[entry.provider]
                  return (
                    <tr
                      key={entry.id}
                      className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                          <span className="font-medium">{entry.provider}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{entry.user}</td>
                      <td className="px-4 py-3">
                        <Badge variant={statusVariant[entry.status] ?? 'outline'} className="text-xs">
                          {entry.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{entry.createdAt}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {entries.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              {t('admin.integrations.noIntegrations', locale)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}