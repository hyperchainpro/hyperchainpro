import { create } from 'zustand'

export interface WebhookEntry {
  id: string
  url: string
  events: string[]
  createdAt: string
}

export interface IntegrationConfig {
  mcp: {
    enabled: boolean
    endpoint: string
  }
  github: {
    connected: boolean
    token: string
  }
  slack: {
    connected: boolean
    webhookUrl: string
    channel: string
  }
  notion: {
    connected: boolean
    apiKey: string
  }
  linear: {
    connected: boolean
    apiKey: string
  }
  figma: {
    token: string
    fileUrl: string
  }
  api: {
    apiKey: string
    rateLimit: string
  }
}

export interface AdminIntegrationEntry {
  id: string
  provider: string
  user: string
  status: 'active' | 'inactive' | 'error'
  createdAt: string
}

interface IntegrationState {
  config: IntegrationConfig
  webhooks: WebhookEntry[]
  adminEntries: AdminIntegrationEntry[]
  // Actions
  setMcpEnabled: (enabled: boolean) => void
  setGithubToken: (token: string) => void
  connectGithub: () => void
  disconnectGithub: () => void
  setSlackWebhookUrl: (url: string) => void
  setSlackChannel: (channel: string) => void
  connectSlack: () => void
  setNotionApiKey: (key: string) => void
  connectNotion: () => void
  disconnectNotion: () => void
  setLinearApiKey: (key: string) => void
  connectLinear: () => void
  disconnectLinear: () => void
  setFigmaToken: (token: string) => void
  setFigmaFileUrl: (url: string) => void
  generateApiKey: () => void
  addWebhook: (url: string, events: string[]) => void
  removeWebhook: (id: string) => void
}

export const useIntegrationStore = create<IntegrationState>((set) => ({
  config: {
    mcp: {
      enabled: false,
      endpoint: typeof window !== 'undefined' ? `${window.location.origin}/api/mcp` : '/api/mcp',
    },
    github: { connected: false, token: '' },
    slack: { connected: false, webhookUrl: '', channel: '' },
    notion: { connected: false, apiKey: '' },
    linear: { connected: false, apiKey: '' },
    figma: { token: '', fileUrl: '' },
    api: { apiKey: '', rateLimit: '1000 req/hour' },
  },
  webhooks: [],
  adminEntries: [
    { id: '1', provider: 'MCP', user: 'Alex Chen', status: 'active', createdAt: '2025-01-15' },
    { id: '2', provider: 'GitHub', user: 'Sarah Kim', status: 'active', createdAt: '2025-01-14' },
    { id: '3', provider: 'Slack', user: 'Mike Wu', status: 'inactive', createdAt: '2025-01-13' },
    { id: '4', provider: 'Notion', user: 'Emily Zhang', status: 'active', createdAt: '2025-01-12' },
    { id: '5', provider: 'Linear', user: 'Jordan Lee', status: 'error', createdAt: '2025-01-11' },
    { id: '6', provider: 'Webhooks', user: 'Alex Chen', status: 'active', createdAt: '2025-01-10' },
    { id: '7', provider: 'REST API', user: 'Chris Park', status: 'active', createdAt: '2025-01-09' },
    { id: '8', provider: 'Figma Import', user: 'Nora Patel', status: 'inactive', createdAt: '2025-01-08' },
  ],

  setMcpEnabled: (enabled) =>
    set((s) => ({ config: { ...s.config, mcp: { ...s.config.mcp, enabled } } })),

  setGithubToken: (token) =>
    set((s) => ({ config: { ...s.config, github: { ...s.config.github, token } } })),
  connectGithub: () =>
    set((s) => ({ config: { ...s.config, github: { ...s.config.github, connected: true } } })),
  disconnectGithub: () =>
    set((s) => ({ config: { ...s.config, github: { ...s.config.github, connected: false, token: '' } } })),

  setSlackWebhookUrl: (url) =>
    set((s) => ({ config: { ...s.config, slack: { ...s.config.slack, webhookUrl: url } } })),
  setSlackChannel: (channel) =>
    set((s) => ({ config: { ...s.config, slack: { ...s.config.slack, channel } } })),
  connectSlack: () =>
    set((s) => ({ config: { ...s.config, slack: { ...s.config.slack, connected: true } } })),

  setNotionApiKey: (key) =>
    set((s) => ({ config: { ...s.config, notion: { ...s.config.notion, apiKey: key } } })),
  connectNotion: () =>
    set((s) => ({ config: { ...s.config, notion: { ...s.config.notion, connected: true } } })),
  disconnectNotion: () =>
    set((s) => ({ config: { ...s.config, notion: { ...s.config.notion, connected: false, apiKey: '' } } })),

  setLinearApiKey: (key) =>
    set((s) => ({ config: { ...s.config, linear: { ...s.config.linear, apiKey: key } } })),
  connectLinear: () =>
    set((s) => ({ config: { ...s.config, linear: { ...s.config.linear, connected: true } } })),
  disconnectLinear: () =>
    set((s) => ({ config: { ...s.config, linear: { ...s.config.linear, connected: false, apiKey: '' } } })),

  setFigmaToken: (token) =>
    set((s) => ({ config: { ...s.config, figma: { ...s.config.figma, token } } })),
  setFigmaFileUrl: (url) =>
    set((s) => ({ config: { ...s.config, figma: { ...s.config.figma, fileUrl: url } } })),

  generateApiKey: () =>
    set((s) => ({
      config: {
        ...s.config,
        api: { ...s.config.api, apiKey: `lb_${crypto.randomUUID().replace(/-/g, '')}` },
      },
    })),

  addWebhook: (url, events) =>
    set((s) => ({
      webhooks: [
        ...s.webhooks,
        { id: crypto.randomUUID(), url, events, createdAt: new Date().toISOString() },
      ],
    })),

  removeWebhook: (id) =>
    set((s) => ({ webhooks: s.webhooks.filter((w) => w.id !== id) })),
}))