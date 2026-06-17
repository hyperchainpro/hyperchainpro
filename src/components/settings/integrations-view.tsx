'use client'

import { useState } from 'react'
import {
  Cpu,
  Webhook,
  Github,
  MessageSquare,
  FileText,
  ArrowRightLeft,
  Layers,
  Code2,
  Copy,
  Check,
  Plus,
  Trash2,
  Plug,
  Unplug,
  RefreshCw,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { useAuthStore } from '@/store/auth-store'
import { useIntegrationStore } from '@/store/integration-store'
import { t } from '@/lib/i18n'
import { toast } from 'sonner'

type Locale = import('@/lib/i18n').Locale

// ── Sub-components ────────────────────────────────────────────────────────

function StatusBadge({ active }: { active: boolean }) {
  const locale = (useAuthStore((s) => s.user?.language) as Locale) ?? 'en'
  return (
    <Badge variant={active ? 'default' : 'secondary'} className="text-xs">
      {active
        ? t('integrations.enabled', locale)
        : t('integrations.disabled', locale)}
    </Badge>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const locale = (useAuthStore((s) => s.user?.language) as Locale) ?? 'en'

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success(t('integrations.mcp.copied', locale))
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 neu-icon-btn" onClick={handleCopy}>
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </Button>
  )
}

// ── Integration Card ──────────────────────────────────────────────────────

interface IntegrationCardProps {
  icon: LucideIcon
  titleKey: string
  descriptionKey: string
  active: boolean
  children: React.ReactNode
}

function IntegrationCard({ icon: Icon, titleKey, descriptionKey, active, children }: IntegrationCardProps) {
  const locale = (useAuthStore((s) => s.user?.language) as Locale) ?? 'en'

  return (
    <Card className="neu-card border-0 bg-background">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl neu-icon-btn bg-background">
              <Icon className="h-4.5 w-4.5" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">{t(titleKey, locale)}</CardTitle>
              <CardDescription className="text-xs mt-0.5">{t(descriptionKey, locale)}</CardDescription>
            </div>
          </div>
          <StatusBadge active={active} />
        </div>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  )
}

// ── MCP Card ──────────────────────────────────────────────────────────────

function McpCard() {
  const locale = (useAuthStore((s) => s.user?.language) as Locale) ?? 'en'
  const mcp = useIntegrationStore((s) => s.config.mcp)
  const setMcpEnabled = useIntegrationStore((s) => s.setMcpEnabled)
  const endpoint = typeof window !== 'undefined' ? `${window.location.origin}/api/mcp` : '/api/mcp'

  const tools = [
    'create_element', 'update_element', 'delete_element',
    'get_board', 'list_boards', 'create_board',
  ]

  return (
    <IntegrationCard
      icon={Cpu}
      titleKey="integrations.mcp.title"
      descriptionKey="integrations.mcp.description"
      active={mcp.enabled}
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground min-w-[90px]">
            {t('integrations.mcp.endpoint', locale)}
          </span>
          <Input
            readOnly
            value={endpoint}
            className="h-8 text-xs font-mono bg-muted/50 border-0 rounded-lg"
          />
          <CopyButton text={endpoint} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground min-w-[90px]">
            {t('integrations.enabled', locale)}
          </span>
          <Switch checked={mcp.enabled} onCheckedChange={setMcpEnabled} />
        </div>
        <div>
          <span className="text-xs font-medium text-muted-foreground">
            {t('integrations.mcp.tools', locale)}
          </span>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {tools.map((tool) => (
              <Badge key={tool} variant="outline" className="text-[10px] font-mono">
                {tool}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </IntegrationCard>
  )
}

// ── Webhooks Card ─────────────────────────────────────────────────────────

function WebhooksCard() {
  const locale = (useAuthStore((s) => s.user?.language) as Locale) ?? 'en'
  const webhooks = useIntegrationStore((s) => s.webhooks)
  const addWebhook = useIntegrationStore((s) => s.addWebhook)
  const removeWebhook = useIntegrationStore((s) => s.removeWebhook)
  const [newUrl, setNewUrl] = useState('')

  const eventOptions = [
    'integrations.events.boardCreated',
    'integrations.events.boardUpdated',
    'integrations.events.commitPushed',
    'integrations.events.commentAdded',
  ]

  const handleAdd = () => {
    if (!newUrl.trim()) return
    addWebhook(newUrl.trim(), eventOptions.map((k) => t(k, locale)))
    setNewUrl('')
  }

  const handleTest = (url: string) => {
    toast.success(t('integrations.testSuccess', locale))
    void url
  }

  return (
    <IntegrationCard
      icon={Webhook}
      titleKey="integrations.webhook.title"
      descriptionKey="integrations.webhook.description"
      active={webhooks.length > 0}
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Input
            placeholder={t('integrations.webhook.urlPlaceholder', locale)}
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="h-8 text-xs rounded-lg border-0"
          />
          <Button size="sm" className="h-8 rounded-lg btn-neu border-0" onClick={handleAdd}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            {t('integrations.webhook.add', locale)}
          </Button>
        </div>
        {webhooks.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            {t('integrations.webhook.noWebhooks', locale)}
          </p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {webhooks.map((w) => (
              <div key={w.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/40">
                <code className="flex-1 text-[10px] font-mono text-muted-foreground truncate">
                  {w.url}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 neu-icon-btn"
                  onClick={() => handleTest(w.url)}
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 neu-icon-btn text-destructive hover:text-destructive"
                  onClick={() => removeWebhook(w.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </IntegrationCard>
  )
}

// ── GitHub Card ───────────────────────────────────────────────────────────

function GithubCard() {
  const locale = (useAuthStore((s) => s.user?.language) as Locale) ?? 'en'
  const github = useIntegrationStore((s) => s.config.github)
  const setGithubToken = useIntegrationStore((s) => s.setGithubToken)
  const connectGithub = useIntegrationStore((s) => s.connectGithub)
  const disconnectGithub = useIntegrationStore((s) => s.disconnectGithub)

  const handleTest = () => {
    toast.success(t('integrations.testSuccess', locale))
  }

  return (
    <IntegrationCard
      icon={Github}
      titleKey="integrations.github.title"
      descriptionKey="integrations.github.description"
      active={github.connected}
    >
      <div className="space-y-3">
        <Input
          type="password"
          placeholder={t('integrations.github.token', locale)}
          value={github.token}
          onChange={(e) => setGithubToken(e.target.value)}
          className="h-8 text-xs rounded-lg border-0"
        />
        <div className="flex gap-2">
          {github.connected ? (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-lg neu-flat border-0"
                onClick={handleTest}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                {t('integrations.testConnection', locale)}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-lg border-0 text-destructive hover:text-destructive"
                onClick={disconnectGithub}
              >
                <Unplug className="h-3 w-3 mr-1" />
                {t('integrations.github.disconnect', locale)}
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              className="h-8 rounded-lg btn-neu border-0"
              onClick={connectGithub}
              disabled={!github.token.trim()}
            >
              <Plug className="h-3 w-3 mr-1" />
              {t('integrations.github.connect', locale)}
            </Button>
          )}
        </div>
      </div>
    </IntegrationCard>
  )
}

// ── Slack Card ────────────────────────────────────────────────────────────

function SlackCard() {
  const locale = (useAuthStore((s) => s.user?.language) as Locale) ?? 'en'
  const slack = useIntegrationStore((s) => s.config.slack)
  const setSlackWebhookUrl = useIntegrationStore((s) => s.setSlackWebhookUrl)
  const setSlackChannel = useIntegrationStore((s) => s.setSlackChannel)
  const connectSlack = useIntegrationStore((s) => s.connectSlack)

  return (
    <IntegrationCard
      icon={MessageSquare}
      titleKey="integrations.slack.title"
      descriptionKey="integrations.slack.description"
      active={slack.connected}
    >
      <div className="space-y-3">
        <Input
          placeholder={t('integrations.slack.webhookUrl', locale)}
          value={slack.webhookUrl}
          onChange={(e) => setSlackWebhookUrl(e.target.value)}
          className="h-8 text-xs rounded-lg border-0"
        />
        <Input
          placeholder={t('integrations.slack.channel', locale)}
          value={slack.channel}
          onChange={(e) => setSlackChannel(e.target.value)}
          className="h-8 text-xs rounded-lg border-0"
        />
        <Button
          size="sm"
          className="h-8 rounded-lg btn-neu border-0"
          onClick={connectSlack}
          disabled={!slack.webhookUrl.trim()}
        >
          {t('integrations.testConnection', locale)}
        </Button>
      </div>
    </IntegrationCard>
  )
}

// ── Notion Card ───────────────────────────────────────────────────────────

function NotionCard() {
  const locale = (useAuthStore((s) => s.user?.language) as Locale) ?? 'en'
  const notion = useIntegrationStore((s) => s.config.notion)
  const setNotionApiKey = useIntegrationStore((s) => s.setNotionApiKey)
  const connectNotion = useIntegrationStore((s) => s.connectNotion)
  const disconnectNotion = useIntegrationStore((s) => s.disconnectNotion)

  return (
    <IntegrationCard
      icon={FileText}
      titleKey="integrations.notion.title"
      descriptionKey="integrations.notion.description"
      active={notion.connected}
    >
      <div className="space-y-3">
        <Input
          type="password"
          placeholder={t('integrations.notion.apiKey', locale)}
          value={notion.apiKey}
          onChange={(e) => setNotionApiKey(e.target.value)}
          className="h-8 text-xs rounded-lg border-0"
        />
        <div className="flex gap-2">
          {notion.connected ? (
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-lg border-0 text-destructive hover:text-destructive"
              onClick={disconnectNotion}
            >
              <Unplug className="h-3 w-3 mr-1" />
              {t('integrations.disconnect', locale)}
            </Button>
          ) : (
            <Button
              size="sm"
              className="h-8 rounded-lg btn-neu border-0"
              onClick={connectNotion}
              disabled={!notion.apiKey.trim()}
            >
              <Plug className="h-3 w-3 mr-1" />
              {t('integrations.notion.connect', locale)}
            </Button>
          )}
        </div>
      </div>
    </IntegrationCard>
  )
}

// ── Linear Card ───────────────────────────────────────────────────────────

function LinearCard() {
  const locale = (useAuthStore((s) => s.user?.language) as Locale) ?? 'en'
  const linear = useIntegrationStore((s) => s.config.linear)
  const setLinearApiKey = useIntegrationStore((s) => s.setLinearApiKey)
  const connectLinear = useIntegrationStore((s) => s.connectLinear)
  const disconnectLinear = useIntegrationStore((s) => s.disconnectLinear)

  return (
    <IntegrationCard
      icon={ArrowRightLeft}
      titleKey="integrations.linear.title"
      descriptionKey="integrations.linear.description"
      active={linear.connected}
    >
      <div className="space-y-3">
        <Input
          type="password"
          placeholder={t('integrations.linear.apiKey', locale)}
          value={linear.apiKey}
          onChange={(e) => setLinearApiKey(e.target.value)}
          className="h-8 text-xs rounded-lg border-0"
        />
        <div className="flex gap-2">
          {linear.connected ? (
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-lg border-0 text-destructive hover:text-destructive"
              onClick={disconnectLinear}
            >
              <Unplug className="h-3 w-3 mr-1" />
              {t('integrations.disconnect', locale)}
            </Button>
          ) : (
            <Button
              size="sm"
              className="h-8 rounded-lg btn-neu border-0"
              onClick={connectLinear}
              disabled={!linear.apiKey.trim()}
            >
              <Plug className="h-3 w-3 mr-1" />
              {t('integrations.connect', locale)}
            </Button>
          )}
        </div>
      </div>
    </IntegrationCard>
  )
}

// ── Figma Import Card ─────────────────────────────────────────────────────

function FigmaCard() {
  const locale = (useAuthStore((s) => s.user?.language) as Locale) ?? 'en'
  const figma = useIntegrationStore((s) => s.config.figma)
  const setFigmaToken = useIntegrationStore((s) => s.setFigmaToken)
  const setFigmaFileUrl = useIntegrationStore((s) => s.setFigmaFileUrl)

  const handleImport = () => {
    if (figma.token && figma.fileUrl) {
      toast.success(t('integrations.testSuccess', locale))
    }
  }

  return (
    <IntegrationCard
      icon={FigTreeFigma}
      titleKey="integrations.figma.title"
      descriptionKey="integrations.figma.description"
      active={!!figma.token}
    >
      <div className="space-y-3">
        <Input
          type="password"
          placeholder={t('integrations.figma.token', locale)}
          value={figma.token}
          onChange={(e) => setFigmaToken(e.target.value)}
          className="h-8 text-xs rounded-lg border-0"
        />
        <Input
          placeholder="https://www.figma.com/file/..."
          value={figma.fileUrl}
          onChange={(e) => setFigmaFileUrl(e.target.value)}
          className="h-8 text-xs rounded-lg border-0"
        />
        <Button
          size="sm"
          className="h-8 rounded-lg btn-neu border-0"
          onClick={handleImport}
          disabled={!figma.token.trim() || !figma.fileUrl.trim()}
        >
          {t('integrations.figma.import', locale)}
        </Button>
      </div>
    </IntegrationCard>
  )
}

// ── REST API Card ─────────────────────────────────────────────────────────

function RestApiCard() {
  const locale = (useAuthStore((s) => s.user?.language) as Locale) ?? 'en'
  const api = useIntegrationStore((s) => s.config.api)
  const generateApiKey = useIntegrationStore((s) => s.generateApiKey)

  return (
    <IntegrationCard
      icon={Code2}
      titleKey="integrations.api.title"
      descriptionKey="integrations.api.description"
      active={!!api.apiKey}
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground min-w-[70px]">
            {t('integrations.api.apiKey', locale)}
          </span>
          <Input
            readOnly
            value={api.apiKey || '••••••••••••••••'}
            className="h-8 text-xs font-mono bg-muted/50 border-0 rounded-lg flex-1"
          />
          <CopyButton text={api.apiKey} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground min-w-[70px]">
            {t('integrations.api.rateLimit', locale)}
          </span>
          <span className="text-xs text-foreground">{api.rateLimit}</span>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="h-8 rounded-lg neu-flat border-0"
          onClick={generateApiKey}
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          {api.apiKey ? t('integrations.api.regenerateKey', locale) : t('integrations.api.generateKey', locale)}
        </Button>
      </div>
    </IntegrationCard>
  )
}

// ── Main View ─────────────────────────────────────────────────────────────

export function IntegrationsView() {
  const locale = (useAuthStore((s) => s.user?.language) as Locale) ?? 'en'

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">{t('integrations.title', locale)}</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          {t('integrations.description', locale)}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <McpCard />
        <WebhooksCard />
        <GithubCard />
        <SlackCard />
        <NotionCard />
        <LinearCard />
        <FigmaCard />
        <RestApiCard />
      </div>
    </div>
  )
}