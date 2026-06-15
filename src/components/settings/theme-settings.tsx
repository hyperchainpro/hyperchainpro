'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sun, Moon, Monitor, Check } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/store/auth-store'
import { t } from '@/lib/i18n'
import { cn } from '@/lib/utils'

// ── Preset colors ───────────────────────────────────────────────────────────

const ACCENT_PRESETS = [
  { color: '#6366f1', name: 'Indigo' },
  { color: '#ec4899', name: 'Pink' },
  { color: '#f59e0b', name: 'Amber' },
  { color: '#10b981', name: 'Emerald' },
  { color: '#06b6d4', name: 'Cyan' },
  { color: '#8b5cf6', name: 'Violet' },
  { color: '#ef4444', name: 'Red' },
  { color: '#f97316', name: 'Orange' },
]

// ── Font sizes ──────────────────────────────────────────────────────────────

type FontSize = 'small' | 'medium' | 'large'

const FONT_SIZES: { value: FontSize; labelKey: string }[] = [
  { value: 'small', labelKey: 'settings.theme.fontSizeSmall' },
  { value: 'medium', labelKey: 'settings.theme.fontSizeMedium' },
  { value: 'large', labelKey: 'settings.theme.fontSizeLarge' },
]

// ── Component ───────────────────────────────────────────────────────────────

export function ThemeSettings() {
  const { theme, setTheme } = useTheme()
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const locale = useAuthStore((s) => s.user?.language ?? 'en')

  const [accentColor, setAccentColor] = useState(user?.accentColor ?? '#6366f1')
  const [customColor, setCustomColor] = useState('')
  const [showCustomColor, setShowCustomColor] = useState(false)
  const [fontSize, setFontSize] = useState<FontSize>('medium')
  const [compactMode, setCompactMode] = useState(false)
  const [enableAnimations, setEnableAnimations] = useState(true)

  const handleSave = async () => {
    try {
      const res = await fetch('/api/user/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: theme ?? 'system',
          accentColor,
          fontSize,
          compactMode,
          enableAnimations,
        }),
      })
      if (res.ok && user) {
        setUser({
          ...user,
          theme: theme ?? 'system',
          accentColor,
        })
      }
    } catch {
      // silently fail
    }
  }

  const handleAccentSelect = (color: string) => {
    setAccentColor(color)
    setShowCustomColor(false)
    // Apply CSS variable
    document.documentElement.style.setProperty('--accent', color)
  }

  const handleCustomColorSubmit = () => {
    if (/^#[0-9A-Fa-f]{6}$/.test(customColor)) {
      handleAccentSelect(customColor)
      setCustomColor('')
    }
  }

  const themes = [
    { value: 'light', icon: Sun, labelKey: 'settings.theme.light' },
    { value: 'dark', icon: Moon, labelKey: 'settings.theme.dark' },
    { value: 'system', icon: Monitor, labelKey: 'settings.theme.system' },
  ] as const

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* Theme toggle */}
      <div className="rounded-2xl bg-background p-6 neu-card border-0">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">
          {t('settings.theme.mode', locale)}
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {themes.map(({ value, icon: Icon, labelKey }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl p-4 transition-all bg-background border-0',
                theme === value
                  ? 'neu-pressed text-primary'
                  : 'neu-flat text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">
                {t(labelKey, locale)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Accent color */}
      <div className="rounded-2xl bg-background p-6 neu-card border-0">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">
          {t('settings.theme.accentColor', locale)}
        </h3>
        <div className="grid grid-cols-4 sm:grid-cols-4 gap-3 mb-4">
          {ACCENT_PRESETS.map(({ color, name }) => (
            <button
              key={color}
              onClick={() => handleAccentSelect(color)}
              title={name}
              className={cn(
                'relative h-12 rounded-xl transition-all flex items-center justify-center bg-background border-0',
                accentColor === color
                  ? 'neu-pressed scale-105'
                  : 'neu-flat hover:scale-105',
              )}
            >
              <div
                className="h-8 w-8 rounded-lg"
                style={{ backgroundColor: color }}
              />
              {accentColor === color && (
                <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Check className="h-2.5 w-2.5" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Custom color input */}
        <button
          onClick={() => setShowCustomColor(!showCustomColor)}
          className="w-full h-10 rounded-xl border-0 bg-background neu-flat text-xs text-muted-foreground hover:text-muted-foreground transition-colors"
        >
          {t('settings.theme.customColor', locale)}
        </button>

        {showCustomColor && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 flex gap-2"
          >
            <Input
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              placeholder="#FF6600"
              className="border-0 bg-background neu-input rounded-xl font-mono text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleCustomColorSubmit()}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={handleCustomColorSubmit}
              className="shrink-0 rounded-xl btn-neu border-0"
            >
              {t('settings.theme.apply', locale)}
            </Button>
          </motion.div>
        )}
      </div>

      {/* Font size */}
      <div className="rounded-2xl bg-background p-6 neu-card border-0">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">
          {t('settings.theme.fontSize', locale)}
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {FONT_SIZES.map(({ value, labelKey }) => (
            <button
              key={value}
              onClick={() => setFontSize(value)}
              className={cn(
                'rounded-xl py-3 px-4 text-center text-sm font-medium transition-all bg-background border-0',
                fontSize === value
                  ? 'neu-pressed text-primary'
                  : 'neu-flat text-muted-foreground hover:text-foreground',
              )}
            >
              <span
                className={cn(
                  value === 'small' && 'text-xs',
                  value === 'medium' && 'text-sm',
                  value === 'large' && 'text-base',
                )}
              >
                Aa
              </span>
              <span className="block mt-1 text-xs">
                {t(labelKey, locale)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="rounded-2xl bg-background p-6 neu-card border-0">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">
          {t('settings.theme.preferences', locale)}
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl neu-flat bg-background p-3">
            <Label className="text-sm">
              {t('settings.theme.compactMode', locale)}
            </Label>
            <Switch checked={compactMode} onCheckedChange={setCompactMode} />
          </div>
          <div className="flex items-center justify-between rounded-xl neu-flat bg-background p-3">
            <Label className="text-sm">
              {t('settings.theme.animations', locale)}
            </Label>
            <Switch
              checked={enableAnimations}
              onCheckedChange={setEnableAnimations}
            />
          </div>
        </div>
      </div>

      {/* Save */}
      <Button onClick={handleSave} className="w-full rounded-xl btn-neu-primary border-0">
        {t('settings.theme.saveAppearance', locale)}
      </Button>
    </motion.div>
  )
}