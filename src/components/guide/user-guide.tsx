'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useAuthStore } from '@/store/auth-store'
import { t } from '@/lib/i18n'

type Locale = import('@/lib/i18n').Locale

interface UserGuideProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserGuide({ open, onOpenChange }: UserGuideProps) {
  const locale = (useAuthStore((s) => s.user?.language) as Locale) ?? 'en'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[calc(100%-2rem)] h-[80vh] max-h-[700px] flex flex-col p-0 overflow-hidden rounded-3xl gap-0 neu-raised bg-background border-0">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
          <DialogTitle className="text-xl">{t('guide.title', locale)}</DialogTitle>
          <DialogDescription className="text-sm mt-1">
            {t('guide.search', locale)}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <p className="text-muted-foreground text-sm">
            Guide content coming soon…
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}