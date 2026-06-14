'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image, X, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { t, type Locale } from '@/lib/i18n';import { useAuthStore } from '@/store/auth-store';

// ─── Props ────────────────────────────────────────────────────────────────────

interface UploadDesignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface BoardOption {
  id: string;
  name: string;
}

// ─── Category options ─────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: 'mobile-ui', labelKey: 'community.categoryMobileUI' },
  { value: 'web-ui', labelKey: 'community.categoryWebUI' },
  { value: 'wireframes', labelKey: 'community.categoryWireframes' },
  { value: 'dashboards', labelKey: 'community.categoryDashboards' },
  { value: 'icons', labelKey: 'community.categoryIcons' },
  { value: 'illustrations', labelKey: 'community.categoryIllustrations' },
  { value: 'templates', labelKey: 'community.categoryTemplates' },
  { value: 'general', labelKey: 'community.categoryGeneral' },
];

// ─── Thumbnail gradient options ───────────────────────────────────────────────

const THUMBNAIL_GRADIENTS = [
  'from-violet-500 via-purple-500 to-fuchsia-500',
  'from-sky-500 via-cyan-500 to-teal-500',
  'from-emerald-500 via-green-500 to-lime-500',
  'from-orange-400 via-amber-400 to-yellow-400',
  'from-rose-400 via-pink-400 to-fuchsia-400',
  'from-blue-500 via-indigo-500 to-violet-500',
  'from-red-500 via-rose-500 to-pink-500',
  'from-teal-500 via-emerald-500 to-green-500',
];

// ─── Component ──────────────────────────────────────────────────────────────

export function UploadDesignDialog({ open, onOpenChange }: UploadDesignDialogProps) {
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [tagsInput, setTagsInput] = useState('');
  const [selectedBoardId, setSelectedBoardId] = useState('');
  const [boards, setBoards] = useState<BoardOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [gradientIndex, setGradientIndex] = useState(0);

  // Fetch user's boards when dialog opens
  useEffect(() => {
    if (!open) return;

    fetch('/api/boards')
      .then((r) => r.json())
      .then((data) => {
        const apiBoards: BoardOption[] = (data.boards || []).map(
          (b: Record<string, unknown>) => ({
            id: b.id as string,
            name: b.name as string,
          })
        );
        setBoards(apiBoards);
      })
      .catch(() => {
        // Boards are optional
      });

    // Reset form
    setTitle('');
    setDescription('');
    setCategory('general');
    setTagsInput('');
    setSelectedBoardId('');
    setGradientIndex(Math.floor(Math.random() * THUMBNAIL_GRADIENTS.length));
  }, [open]);

  const tagsArray = useMemo(() => {
    return tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  }, [tagsInput]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error(t('community.titleRequired', locale));
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          category,
          tags: tagsArray.join(',') || undefined,
          boardId: selectedBoardId || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to publish');
      }

      toast.success(t('community.publishSuccess', locale));
      onOpenChange(false);
    } catch {
      toast.error(t('community.publishFailed', locale));
    } finally {
      setSubmitting(false);
    }
  };

  const isValid = title.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
              <Upload className="size-4" />
            </div>
            {t('community.publishTitle', locale)}
          </DialogTitle>
          <DialogDescription>
            {t('community.publishDesc', locale)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Thumbnail Preview */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t("community.previewThumbnail", locale)}</Label>
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  'relative w-32 h-20 rounded-lg bg-gradient-to-br overflow-hidden border border-border shadow-sm',
                  THUMBNAIL_GRADIENTS[gradientIndex]
                )}
              >
                {/* Decorative elements */}
                <svg className="absolute inset-0 h-full w-full opacity-20" viewBox="0 0 128 80" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
                  <rect x="20" y="15" width="88" height="50" rx="6" className="text-white/60" />
                  <rect x="28" y="23" width="40" height="4" rx="2" className="text-white/80" />
                  <rect x="28" y="31" width="30" height="3" rx="1.5" className="text-white/60" />
                  <rect x="28" y="38" width="35" height="3" rx="1.5" className="text-white/60" />
                  <rect x="72" y="23" width="28" height="4" rx="2" className="text-white/80" />
                </svg>
                <div className="absolute bottom-1.5 left-2 right-2">
                  <p className="text-[9px] font-medium text-white truncate drop-shadow-sm">
                    {title || t('community.designTitle', locale)}
                  </p>
                </div>
              </div>

              {/* Gradient picker */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-muted-foreground">{t("community.themeColor", locale)}</span>
                <div className="flex flex-wrap gap-1.5 max-w-[180px]">
                  {THUMBNAIL_GRADIENTS.map((gradient, i) => (
                    <button
                      key={i}
                      className={cn(
                        'w-6 h-6 rounded-full bg-gradient-to-br transition-all hover:scale-110',
                        gradient,
                        gradientIndex === i ? 'ring-2 ring-primary ring-offset-2' : 'ring-1 ring-border'
                      )}
                      onClick={() => setGradientIndex(i)}
                      aria-label={`Select theme color ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="design-title">
              {t('community.titleLabel', locale)} <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="design-title"
              placeholder={t('community.titlePlaceholder', locale)}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              className="h-9"
            />
            <p className="text-xs text-muted-foreground text-right">{title.length}/100</p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="design-description">{t("community.descriptionLabel", locale)}</Label>
            <Textarea
              id="design-description"
              placeholder={t("community.descriptionPlaceholder", locale)}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">{description.length}/500</p>
          </div>

          {/* Category & Board selection row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("community.categoryLabel", locale)}</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={t("community.selectCategory", locale)} />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {t(cat.labelKey, locale)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("community.linkToBoard", locale)}</Label>
              <Select value={selectedBoardId} onValueChange={setSelectedBoardId}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={t("community.selectBoard", locale)} />
                </SelectTrigger>
                <SelectContent>
                  {boards.length > 0 ? (
                    boards.map((board) => (
                      <SelectItem key={board.id} value={board.id}>
                        {board.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      {t('community.noBoards', locale)}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="design-tags">{t("community.tagsLabel", locale)}</Label>
            <Input
              id="design-tags"
              placeholder={t('community.tagsPlaceholder', locale)}
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="h-9"
            />
            {tagsArray.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                <AnimatePresence>
                  {tagsArray.map((tag) => (
                    <motion.span
                      key={tag}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                    >
                      #{tag}
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Submit button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-lg"
            >
              {t('common.cancel', locale)}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isValid || submitting}
              className={cn(
                'gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600',
                'hover:from-violet-700 hover:to-fuchsia-700 text-white border-0',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {submitting ? (
                <>
                  <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {t('community.publishing', locale)}
                </>
              ) : (
                <>
                  <Check className="size-4" />
                  {t('community.publish', locale)}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
