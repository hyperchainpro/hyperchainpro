'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare,
  Eye,
  Volume2,
  Mic,
  Image,
  Video,
  Search,
  BookOpen,
  ChevronDown,
  Save,
  RotateCcw,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
// Separator removed — using neu-divider via div
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuthStore } from '@/store/auth-store'
import { t } from '@/lib/i18n'
import { cn } from '@/lib/utils'

// ── Agent types ─────────────────────────────────────────────────────────────

interface AgentConfig {
  id: string
  nameKey: string
  descriptionKey: string
  icon: LucideIcon
  modelOptions: string[]
  defaultModel: string
  settings: AgentSettingDef[]
}

interface AgentSettingDef {
  key: string
  labelKey: string
  type: 'slider' | 'select' | 'textarea' | 'switch'
  options?: { value: string; labelKey: string }[]
  min?: number
  max?: number
  step?: number
  defaultValue: string | number | boolean
}

const AGENTS: AgentConfig[] = [
  {
    id: 'llm',
    nameKey: 'settings.agents.llm',
    descriptionKey: 'settings.agents.llmDesc',
    icon: MessageSquare,
    modelOptions: ['glm-4-flash', 'glm-4-plus', 'glm-4-air'],
    defaultModel: 'glm-4-flash',
    settings: [
      {
        key: 'temperature',
        labelKey: 'settings.agents.temperature',
        type: 'slider',
        min: 0,
        max: 2,
        step: 0.1,
        defaultValue: 0.7,
      },
      {
        key: 'maxTokens',
        labelKey: 'settings.agents.maxTokens',
        type: 'slider',
        min: 100,
        max: 8000,
        step: 100,
        defaultValue: 2048,
      },
      {
        key: 'systemPrompt',
        labelKey: 'settings.agents.systemPrompt',
        type: 'textarea',
        defaultValue: 'You are a helpful assistant.',
      },
    ],
  },
  {
    id: 'vlm',
    nameKey: 'settings.agents.vlm',
    descriptionKey: 'settings.agents.vlmDesc',
    icon: Eye,
    modelOptions: ['glm-4-flash', 'glm-4-plus', 'glm-4-air'],
    defaultModel: 'glm-4-flash',
    settings: [
      {
        key: 'temperature',
        labelKey: 'settings.agents.temperature',
        type: 'slider',
        min: 0,
        max: 2,
        step: 0.1,
        defaultValue: 0.7,
      },
      {
        key: 'maxTokens',
        labelKey: 'settings.agents.maxTokens',
        type: 'slider',
        min: 100,
        max: 8000,
        step: 100,
        defaultValue: 2048,
      },
      {
        key: 'detail',
        labelKey: 'settings.agents.detailLevel',
        type: 'select',
        options: [
          { value: 'low', labelKey: 'settings.agents.detailLow' },
          { value: 'high', labelKey: 'settings.agents.detailHigh' },
          { value: 'auto', labelKey: 'settings.agents.detailAuto' },
        ],
        defaultValue: 'auto',
      },
    ],
  },
  {
    id: 'tts',
    nameKey: 'settings.agents.tts',
    descriptionKey: 'settings.agents.ttsDesc',
    icon: Volume2,
    modelOptions: ['tts-1', 'tts-1-hd'],
    defaultModel: 'tts-1',
    settings: [
      {
        key: 'voice',
        labelKey: 'settings.agents.voice',
        type: 'select',
        options: [
          { value: 'alloy', labelKey: 'settings.agents.voiceAlloy' },
          { value: 'echo', labelKey: 'settings.agents.voiceEcho' },
          { value: 'fable', labelKey: 'settings.agents.voiceFable' },
          { value: 'onyx', labelKey: 'settings.agents.voiceOnyx' },
          { value: 'nova', labelKey: 'settings.agents.voiceNova' },
          { value: 'shimmer', labelKey: 'settings.agents.voiceShimmer' },
        ],
        defaultValue: 'alloy',
      },
      {
        key: 'speed',
        labelKey: 'settings.agents.speed',
        type: 'slider',
        min: 0.5,
        max: 2.0,
        step: 0.1,
        defaultValue: 1.0,
      },
    ],
  },
  {
    id: 'asr',
    nameKey: 'settings.agents.asr',
    descriptionKey: 'settings.agents.asrDesc',
    icon: Mic,
    modelOptions: ['whisper-1'],
    defaultModel: 'whisper-1',
    settings: [
      {
        key: 'responseFormat',
        labelKey: 'settings.agents.responseFormat',
        type: 'select',
        options: [
          { value: 'json', labelKey: 'JSON' },
          { value: 'text', labelKey: 'Text' },
          { value: 'srt', labelKey: 'SRT' },
          { value: 'vtt', labelKey: 'VTT' },
        ],
        defaultValue: 'json',
      },
    ],
  },
  {
    id: 'image-gen',
    nameKey: 'settings.agents.imageGen',
    descriptionKey: 'settings.agents.imageGenDesc',
    icon: Image,
    modelOptions: ['dall-e-3', 'stable-diffusion-xl'],
    defaultModel: 'dall-e-3',
    settings: [
      {
        key: 'size',
        labelKey: 'settings.agents.size',
        type: 'select',
        options: [
          { value: '1024x1024', labelKey: '1024×1024' },
          { value: '1792x1024', labelKey: '1792×1024' },
          { value: '1024x1792', labelKey: '1024×1792' },
        ],
        defaultValue: '1024x1024',
      },
      {
        key: 'quality',
        labelKey: 'settings.agents.quality',
        type: 'select',
        options: [
          { value: 'standard', labelKey: 'settings.agents.standard' },
          { value: 'hd', labelKey: 'HD' },
        ],
        defaultValue: 'standard',
      },
      {
        key: 'style',
        labelKey: 'settings.agents.style',
        type: 'select',
        options: [
          { value: 'natural', labelKey: 'settings.agents.natural' },
          { value: 'vivid', labelKey: 'settings.agents.vivid' },
        ],
        defaultValue: 'vivid',
      },
    ],
  },
  {
    id: 'video-understand',
    nameKey: 'settings.agents.videoUnderstand',
    descriptionKey: 'settings.agents.videoUnderstandDesc',
    icon: Video,
    modelOptions: ['video-understand-v1'],
    defaultModel: 'video-understand-v1',
    settings: [
      {
        key: 'maxFrames',
        labelKey: 'settings.agents.maxFrames',
        type: 'slider',
        min: 1,
        max: 50,
        step: 1,
        defaultValue: 10,
      },
    ],
  },
  {
    id: 'web-search',
    nameKey: 'settings.agents.webSearch',
    descriptionKey: 'settings.agents.webSearchDesc',
    icon: Search,
    modelOptions: [],
    defaultModel: '',
    settings: [
      {
        key: 'maxResults',
        labelKey: 'settings.agents.maxResults',
        type: 'slider',
        min: 1,
        max: 10,
        step: 1,
        defaultValue: 5,
      },
      {
        key: 'region',
        labelKey: 'settings.agents.region',
        type: 'select',
        options: [
          { value: 'us', labelKey: 'settings.agents.regionUS' },
          { value: 'uk', labelKey: 'settings.agents.regionUK' },
          { value: 'de', labelKey: 'settings.agents.regionDE' },
          { value: 'jp', labelKey: 'settings.agents.regionJP' },
          { value: 'cn', labelKey: 'settings.agents.regionCN' },
        ],
        defaultValue: 'us',
      },
    ],
  },
  {
    id: 'web-reader',
    nameKey: 'settings.agents.webReader',
    descriptionKey: 'settings.agents.webReaderDesc',
    icon: BookOpen,
    modelOptions: [],
    defaultModel: '',
    settings: [
      {
        key: 'includeMetadata',
        labelKey: 'settings.agents.includeMetadata',
        type: 'switch',
        defaultValue: true,
      },
      {
        key: 'extractMode',
        labelKey: 'settings.agents.extractMode',
        type: 'select',
        options: [
          { value: 'full', labelKey: 'settings.agents.modeFull' },
          { value: 'summary', labelKey: 'settings.agents.modeSummary' },
          { value: 'structured', labelKey: 'settings.agents.modeStructured' },
        ],
        defaultValue: 'full',
      },
    ],
  },
]

// ── Agent settings storage ──────────────────────────────────────────────────

interface AgentState {
  enabled: boolean
  model: string
  settings: Record<string, string | number | boolean>
}

function parseAiSettings(raw: string | null | undefined): Record<string, AgentState> {
  if (!raw) return {}
  try {
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function getDefaultState(agent: AgentConfig): AgentState {
  const settings: Record<string, string | number | boolean> = {}
  for (const s of agent.settings) {
    settings[s.key] = s.defaultValue
  }
  return { enabled: true, model: agent.defaultModel, settings }
}

// ── Component ───────────────────────────────────────────────────────────────

export function AIAgentsSettings() {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const locale = useAuthStore((s) => s.user?.language ?? 'en')

  const parsed = parseAiSettings(user?.aiSettings)
  const [states, setStates] = useState<Record<string, AgentState>>(() => {
    const result: Record<string, AgentState> = {}
    for (const agent of AGENTS) {
      result[agent.id] = parsed[agent.id] ?? getDefaultState(agent)
    }
    return result
  })

  const [openAgents, setOpenAgents] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)

  const toggleAgent = useCallback((id: string) => {
    setStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], enabled: !prev[id].enabled },
    }))
  }, [])

  const toggleOpen = useCallback((id: string) => {
    setOpenAgents((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const updateModel = useCallback((id: string, model: string) => {
    setStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], model },
    }))
  }, [])

  const updateSetting = useCallback(
    (agentId: string, key: string, value: string | number | boolean) => {
      setStates((prev) => ({
        ...prev,
        [agentId]: {
          ...prev[agentId],
          settings: { ...prev[agentId].settings, [key]: value },
        },
      }))
    },
    [],
  )

  const resetAgent = useCallback((agent: AgentConfig) => {
    setStates((prev) => ({
      ...prev,
      [agent.id]: getDefaultState(agent),
    }))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/user/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aiSettings: JSON.stringify(states) }),
      })
      if (res.ok && user) {
        setUser({ ...user, aiSettings: JSON.stringify(states) })
      }
    } catch {
      // silently fail
    }
    setSaving(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-muted-foreground">
          {t('settings.agents.description', locale)}
        </p>
        <Button
          onClick={handleSave}
          disabled={saving}
          size="sm"
          className="rounded-xl gap-1.5 btn-neu-primary border-0"
        >
          <Save className="h-3.5 w-3.5" />
          {saving ? t('settings.saving', locale) : t('settings.saveAll', locale)}
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-220px)] pr-2">
        <div className="space-y-3 pb-4">
          {AGENTS.map((agent) => {
            const state = states[agent.id]
            const Icon = agent.icon
            const isOpen = openAgents.has(agent.id)

            return (
              <Collapsible
                key={agent.id}
                open={isOpen}
                onOpenChange={() => toggleOpen(agent.id)}
              >
                <div
                  className="rounded-[18px] bg-background p-4 transition-shadow neu-card border-0"
                >
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background neu-convex text-primary">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium">
                        {t(agent.nameKey, locale)}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {t(agent.descriptionKey, locale)}
                      </p>
                    </div>
                    <Switch
                      checked={state.enabled}
                      onCheckedChange={() => toggleAgent(agent.id)}
                    />
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 neu-icon-btn"
                      >
                        <ChevronDown
                          className={cn(
                            'h-4 w-4 transition-transform',
                            isOpen && 'rotate-180',
                          )}
                        />
                      </Button>
                    </CollapsibleTrigger>
                  </div>

                  {/* Expanded settings */}
                  <AnimatePresence>
                    {isOpen && (
                      <CollapsibleContent forceMount>
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="neu-divider my-3" />

                          {/* Model selector */}
                          {agent.modelOptions.length > 0 && (
                            <div className="mb-4">
                              <Label className="text-xs text-muted-foreground">
                                {t('settings.agents.model', locale)}
                              </Label>
                              <Select
                                value={state.model}
                                onValueChange={(v) => updateModel(agent.id, v)}
                              >
                                <SelectTrigger
                                  className="mt-1.5 border-0 bg-background rounded-xl neu-input"
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {agent.modelOptions.map((m) => (
                                    <SelectItem key={m} value={m}>
                                      {m}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          {/* Settings */}
                          <div className="space-y-4">
                            {agent.settings.map((setting) => (
                              <div key={setting.key}>
                                <div className="flex items-center justify-between mb-1.5">
                                  <Label className="text-xs text-muted-foreground">
                                    {t(setting.labelKey, locale)}
                                  </Label>
                                  {setting.type === 'slider' && (
                                    <span className="text-xs font-mono text-muted-foreground">
                                      {String(state.settings[setting.key])}
                                    </span>
                                  )}
                                </div>

                                {setting.type === 'slider' && (
                                  <Slider
                                    value={[Number(state.settings[setting.key])]}
                                    onValueChange={([v]) =>
                                      updateSetting(agent.id, setting.key, v)
                                    }
                                    min={setting.min}
                                    max={setting.max}
                                    step={setting.step}
                                    className="py-1"
                                  />
                                )}

                                {setting.type === 'select' && setting.options && (
                                  <Select
                                    value={String(state.settings[setting.key])}
                                    onValueChange={(v) =>
                                      updateSetting(agent.id, setting.key, v)
                                    }
                                  >
                                    <SelectTrigger
                                      className="border-0 bg-background rounded-xl neu-input"
                                    >
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {setting.options.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                          {t(opt.labelKey, locale)}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}

                                {setting.type === 'textarea' && (
                                  <Textarea
                                    value={String(state.settings[setting.key])}
                                    onChange={(e) =>
                                      updateSetting(agent.id, setting.key, e.target.value)
                                    }
                                    rows={3}
                                    className="border-0 bg-background rounded-xl resize-none neu-input"
                                  />
                                )}

                                {setting.type === 'switch' && (
                                  <Switch
                                    checked={Boolean(state.settings[setting.key])}
                                    onCheckedChange={(v) =>
                                      updateSetting(agent.id, setting.key, v)
                                    }
                                  />
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Reset */}
                          <div className="mt-4 flex justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => resetAgent(agent)}
                              className="text-xs text-muted-foreground gap-1.5 btn-neu border-0"
                            >
                              <RotateCcw className="h-3 w-3" />
                              {t('settings.agents.resetToDefault', locale)}
                            </Button>
                          </div>
                        </motion.div>
                      </CollapsibleContent>
                    )}
                  </AnimatePresence>
                </div>
              </Collapsible>
            )
          })}
        </div>
      </ScrollArea>
    </motion.div>
  )
}