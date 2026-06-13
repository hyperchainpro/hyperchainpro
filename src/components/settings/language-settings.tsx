'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
import { t, LOCALES, type Locale } from '@/lib/i18n'
import { cn } from '@/lib/utils'

// ── Neumorphism helpers ─────────────────────────────────────────────────────

const neuLight = 'shadow-[6px_6px_12px_rgba(0,0,0,0.08),-6px_-6px_12px_rgba(255,255,255,0.9)]'
const neuDark = 'dark:shadow-[6px_6px_12px_rgba(0,0,0,0.4),-6px_-6px_12px_rgba(30,30,30,0.1)]'

// ── Language data ───────────────────────────────────────────────────────────

interface LocaleInfo {
  code: Locale
  flag: string
  name: string
  native: string
}

const LOCALE_LIST: LocaleInfo[] = [
  { code: 'en', flag: '🇺🇸', name: 'English', native: 'English' },
  { code: 'id', flag: '🇮🇩', name: 'Indonesian', native: 'Bahasa Indonesia' },
  { code: 'ja', flag: '🇯🇵', name: 'Japanese', native: '日本語' },
  { code: 'ko', flag: '🇰🇷', name: 'Korean', native: '한국어' },
  { code: 'zh', flag: '🇨🇳', name: 'Chinese', native: '简体中文' },
]

// ── Component ───────────────────────────────────────────────────────────────

export function LanguageSettings() {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const locale = useAuthStore((s) => s.user?.language ?? 'en')

  const currentLocale = (user?.language ?? 'en') as Locale

  const handleSelect = async (code: Locale) => {
    if (code === currentLocale) return

    try {
      const res = await fetch('/api/user/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: code }),
      })
      if (res.ok && user) {
        setUser({ ...user, language: code })
      }
    } catch {
      // silently fail
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      <p className="text-sm text-muted-foreground mb-2">
        {t('settings.language.description', locale)}
      </p>

      <div className="space-y-3">
        {LOCALE_LIST.map((item) => {
          const isActive = item.code === currentLocale

          return (
            <motion.button
              key={item.code}
              onClick={() => handleSelect(item.code)}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'w-full flex items-center gap-4 rounded-xl p-4 transition-all text-left border-2',
                isActive
                  ? 'border-primary bg-primary/5'
                  : 'border-transparent bg-card hover:bg-muted/50',
                neuLight,
                neuDark,
              )}
            >
              <span className="text-2xl" role="img" aria-label={item.name}>
                {item.flag}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium">{item.native}</h3>
                <p className="text-xs text-muted-foreground">{item.name}</p>
              </div>
              {isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground"
                >
                  <Check className="h-3.5 w-3.5" />
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}