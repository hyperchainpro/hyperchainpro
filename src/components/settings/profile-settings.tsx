'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, Lock, Eye, EyeOff, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuthStore } from '@/store/auth-store'
import { t } from '@/lib/i18n'

const neuLight = 'shadow-[6px_6px_12px_rgba(0,0,0,0.08),-6px_-6px_12px_rgba(255,255,255,0.9)]'
const neuDark = 'dark:shadow-[6px_6px_12px_rgba(0,0,0,0.4),-6px_-6px_12px_rgba(30,30,30,0.1)]'
const neuInput = 'shadow-[inset_3px_3px_6px_rgba(0,0,0,0.06),inset_-3px_-3px_6px_rgba(255,255,255,0.7)]'
const neuInputDark = 'dark:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.3),inset_-3px_-3px_6px_rgba(50,50,50,0.15)]'

export function ProfileSettings() {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const locale = useAuthStore((s) => s.user?.language ?? 'en')

  const [name, setName] = useState(user?.name ?? '')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar ?? '')
  const [showAvatarInput, setShowAvatarInput] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [saving, setSaving] = useState(false)
  const [pwSaving, setPwSaving] = useState(false)
  const [pwError, setPwError] = useState('')

  const initials = (user?.name ?? 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/user/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, avatar: avatarUrl }),
      })
      if (res.ok && user) {
        setUser({ ...user, name, avatar: avatarUrl })
      }
    } catch {
      // silently fail
    }
    setSaving(false)
  }

  const handleChangePassword = async () => {
    setPwError('')
    if (newPassword !== confirmPassword) {
      setPwError(t('settings.passwordMismatch', locale))
      return
    }
    if (newPassword.length < 8) {
      setPwError(t('settings.passwordTooShort', locale))
      return
    }
    setPwSaving(true)
    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })
      if (res.ok) {
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setPwError(t('settings.passwordError', locale))
      }
    } catch {
      setPwError(t('settings.passwordError', locale))
    }
    setPwSaving(false)
  }

  const roleColor: Record<string, string> = {
    OWNER: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    ADMIN: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
    USER: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    VIEWER: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
    EDITOR: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* Avatar section */}
      <div
        className={`rounded-xl bg-card p-6 ${neuLight} ${neuDark}`}
      >
        <h3 className="text-sm font-medium text-muted-foreground mb-4">
          {t('settings.avatar', locale)}
        </h3>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Avatar className="h-20 w-20">
              <AvatarImage src={avatarUrl} alt={user?.name ?? 'User'} />
              <AvatarFallback className="text-lg bg-primary/10 text-primary font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => setShowAvatarInput(!showAvatarInput)}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Camera className="h-5 w-5 text-white" />
            </button>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold">{user?.name ?? 'User'}</h2>
            <p className="text-sm text-muted-foreground">{user?.email ?? ''}</p>
            <div className="mt-1">
              <Badge
                variant="secondary"
                className={roleColor[user?.role ?? 'USER'] ?? ''}
              >
                {user?.role ?? 'USER'}
              </Badge>
            </div>
          </div>
        </div>

        {showAvatarInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4"
          >
            <Label className="text-xs text-muted-foreground">
              {t('settings.avatarUrl', locale)}
            </Label>
            <Input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className={`mt-1.5 ${neuInput} ${neuInputDark} border-0 bg-muted/50 rounded-xl`}
            />
          </motion.div>
        )}
      </div>

      {/* Profile info */}
      <div className={`rounded-xl bg-card p-6 ${neuLight} ${neuDark}`}>
        <h3 className="text-sm font-medium text-muted-foreground mb-4">
          {t('settings.profileInfo', locale)}
        </h3>
        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">
              {t('settings.name', locale)}
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`mt-1.5 ${neuInput} ${neuInputDark} border-0 bg-muted/50 rounded-xl`}
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">
              {t('settings.email', locale)}
            </Label>
            <Input
              value={user?.email ?? ''}
              disabled
              className={`mt-1.5 ${neuInput} ${neuInputDark} border-0 bg-muted/50 rounded-xl opacity-60 cursor-not-allowed`}
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {t('settings.memberSince', locale)}:{' '}
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString(locale, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : '—'}
            </span>
          </div>
          <Button
            onClick={handleSaveProfile}
            disabled={saving}
            className="w-full rounded-xl"
          >
            {saving ? t('settings.saving', locale) : t('settings.saveProfile', locale)}
          </Button>
        </div>
      </div>

      {/* Change password */}
      <Separator />
      <div className={`rounded-xl bg-card p-6 ${neuLight} ${neuDark}`}>
        <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
          <Lock className="h-4 w-4" />
          {t('settings.changePassword', locale)}
        </h3>
        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">
              {t('settings.currentPassword', locale)}
            </Label>
            <div className="relative mt-1.5">
              <Input
                type={showCurrentPw ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={`pr-10 ${neuInput} ${neuInputDark} border-0 bg-muted/50 rounded-xl`}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw(!showCurrentPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">
              {t('settings.newPassword', locale)}
            </Label>
            <div className="relative mt-1.5">
              <Input
                type={showNewPw ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`pr-10 ${neuInput} ${neuInputDark} border-0 bg-muted/50 rounded-xl`}
              />
              <button
                type="button"
                onClick={() => setShowNewPw(!showNewPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">
              {t('settings.confirmPassword', locale)}
            </Label>
            <div className="relative mt-1.5">
              <Input
                type={showConfirmPw ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`pr-10 ${neuInput} ${neuInputDark} border-0 bg-muted/50 rounded-xl`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPw(!showConfirmPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {pwError && (
            <p className="text-sm text-destructive">{pwError}</p>
          )}
          <Button
            onClick={handleChangePassword}
            disabled={pwSaving || !currentPassword || !newPassword || !confirmPassword}
            variant="outline"
            className="w-full rounded-xl"
          >
            {pwSaving
              ? t('settings.saving', locale)
              : t('settings.updatePassword', locale)}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}