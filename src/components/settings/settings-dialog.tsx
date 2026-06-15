'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Brain,
  Palette,
  Globe,
  Shield,
  LogOut,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth-store'
import { t } from '@/lib/i18n'
import { cn } from '@/lib/utils'

import { ProfileSettings } from './profile-settings'
import { AIAgentsSettings } from './ai-agents-settings'
import { ThemeSettings } from './theme-settings'
import { LanguageSettings } from './language-settings'

// ── Tab definitions ─────────────────────────────────────────────────────────

type SettingsTab = 'profile' | 'ai-agents' | 'appearance' | 'language' | 'account'

interface TabDef {
  id: SettingsTab
  icon: LucideIcon
  labelKey: string
}

const TABS: TabDef[] = [
  { id: 'profile', icon: User, labelKey: 'settings.tabs.profile' },
  { id: 'ai-agents', icon: Brain, labelKey: 'settings.tabs.aiAgents' },
  { id: 'appearance', icon: Palette, labelKey: 'settings.tabs.appearance' },
  { id: 'language', icon: Globe, labelKey: 'settings.tabs.language' },
  { id: 'account', icon: Shield, labelKey: 'settings.tabs.account' },
]

// ── Props ───────────────────────────────────────────────────────────────────

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// ── Component ───────────────────────────────────────────────────────────────

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const locale = useAuthStore((s) => s.user?.language ?? 'en')

  const handleTabChange = (tab: SettingsTab) => {
    setActiveTab(tab)
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // ignore
    }
    logout()
    onOpenChange(false)
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />
      case 'ai-agents':
        return <AIAgentsSettings />
      case 'appearance':
        return <ThemeSettings />
      case 'language':
        return <LanguageSettings />
      case 'account':
        return <AccountTab onLogout={handleLogout} />
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl w-[calc(100%-2rem)] h-[85vh] max-h-[700px] flex flex-col p-0 overflow-hidden rounded-3xl gap-0 neu-raised bg-background border-0"
        showCloseButton={false}
      >
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">
                {t('settings.title', locale)}
              </DialogTitle>
              <DialogDescription className="text-sm mt-1">
                {t('settings.description', locale)}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-8 w-8 rounded-full bg-background flex items-center justify-center text-primary text-xs font-semibold neu-avatar">
                  {(user?.name ?? 'U')
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
                <span className="hidden sm:inline max-w-[140px] truncate">
                  {user?.name}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 rounded-xl neu-icon-btn"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="neu-divider" />

        {/* Body: sidebar + content */}
        <div className="flex flex-col flex-1 min-h-0 sm:flex-row">
          {/* Sidebar — vertical on desktop, horizontal on mobile */}
          <nav className="shrink-0">
            {/* Mobile: horizontal scroll */}
            <div className="flex sm:hidden">
              <div className="flex gap-1 p-2 overflow-x-auto">
                {TABS.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={cn(
                        'flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium transition-all whitespace-nowrap min-w-[60px] bg-background',
                        isActive
                          ? 'neu-pressed text-primary'
                          : 'text-muted-foreground hover:neu-flat hover:text-foreground',
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{t(tab.labelKey, locale)}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Desktop: vertical stack */}
            <div className="hidden sm:flex flex-col gap-1 p-3 w-[180px]">
              {TABS.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all text-left bg-background',
                      isActive
                        ? 'neu-pressed text-primary'
                        : 'text-muted-foreground hover:neu-flat hover:text-foreground',
                    )}
                  >
                    <Icon className="h-4.5 w-4.5 shrink-0" />
                    <span className="truncate">{t(tab.labelKey, locale)}</span>
                  </button>
                )
              })}
            </div>
          </nav>

          {/* Content area */}
          <div className="flex-1 min-w-0 min-h-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15 }}
                  >
                    {renderContent()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Account Tab ─────────────────────────────────────────────────────────────

function AccountTab({ onLogout }: { onLogout: () => void }) {
  const user = useAuthStore((s) => s.user)
  const locale = useAuthStore((s) => s.user?.language ?? 'en')

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* Danger zone */}
      <div
        className="rounded-2xl bg-background p-6 neu-flat border-0 shadow-[6px_6px_12px_rgba(239,68,68,0.06),-6px_-6px_12px_rgba(239,68,68,0.02)] dark:shadow-[6px_6px_12px_rgba(239,68,68,0.15),-6px_-6px_12px_rgba(239,68,68,0.05)]"
      >
        <h3 className="text-sm font-medium text-destructive mb-2">
          {t('settings.account.dangerZone', locale)}
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          {t('settings.account.dangerZoneDesc', locale)}
        </p>
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full rounded-xl gap-2 text-destructive border-0 neu-flat hover:neu-pressed hover:text-destructive"
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4" />
            {t('settings.account.logout', locale)}
          </Button>
        </div>
      </div>

      {/* Account info */}
      <div className="rounded-2xl bg-background p-6 neu-card border-0">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">
          {t('settings.account.info', locale)}
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('settings.account.userId', locale)}</span>
            <span className="font-mono text-xs">{user?.id?.slice(0, 12)}…</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('settings.account.email', locale)}</span>
            <span>{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('settings.account.role', locale)}</span>
            <span className="font-medium">{user?.role ?? 'USER'}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}