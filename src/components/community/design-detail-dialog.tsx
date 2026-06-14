'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Download, Share2, ExternalLink, Copy, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import type { CommunityDesignData } from './community-card';
import { cn } from '@/lib/utils';
import { t, type Locale } from '@/lib/i18n';import { useAuthStore } from '@/store/auth-store';

// ─── Category gradient mapping ────────────────────────────────────────────────

const CATEGORY_GRADIENTS: Record<string, string> = {
  'mobile-ui': 'from-violet-500 via-purple-500 to-fuchsia-500',
  'web-ui': 'from-sky-500 via-cyan-500 to-teal-500',
  'wireframes': 'from-neutral-400 via-gray-400 to-zinc-500',
  'dashboards': 'from-emerald-500 via-green-500 to-lime-500',
  'icons': 'from-orange-400 via-amber-400 to-yellow-400',
  'illustrations': 'from-rose-400 via-pink-400 to-fuchsia-400',
  'templates': 'from-blue-500 via-indigo-500 to-violet-500',
  'general': 'from-slate-500 via-gray-500 to-zinc-500',
};

const CATEGORY_LABEL_KEYS: Record<string, string> = {
  'mobile-ui': 'community.categoryMobileUI',
  'web-ui': 'community.categoryWebUI',
  'wireframes': 'community.categoryWireframes',
  'dashboards': 'community.categoryDashboards',
  'icons': 'community.categoryIcons',
  'illustrations': 'community.categoryIllustrations',
  'templates': 'community.categoryTemplates',
  'general': 'community.categoryGeneral',
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface DesignDetailDialogProps {
  designId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function DesignDetailDialog({ designId, open, onOpenChange }: DesignDetailDialogProps) {
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  const [design, setDesign] = useState<CommunityDesignData | null>(null);
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Fetch design details
  useEffect(() => {
    if (!designId || !open) return;

    setLoading(true);
    setLiked(false);

    fetch(`/api/community/${designId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          toast.error(t('community.failedToLoad', locale));
          setDesign(null);
        } else {
          setDesign(data);
        }
      })
      .catch(() => {
        toast.error(t('community.failedToLoad', locale));
        setDesign(null);
      })
      .finally(() => setLoading(false));
  }, [designId, open]);

  const handleLike = useCallback(async () => {
    if (!designId || liked) return;
    try {
      const res = await fetch(`/api/community/${designId}?action=like`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setDesign((prev) => prev ? { ...prev, likeCount: data.likeCount } : null);
        setLiked(true);
        toast.success(t('community.liked', locale));
      }
    } catch {
      toast.error(t('community.failedToLike', locale));
    }
  }, [designId, liked]);

  const handleDownload = useCallback(async () => {
    if (!designId || downloading) return;
    setDownloading(true);
    try {
      const res = await fetch(`/api/community/${designId}?action=download`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setDesign((prev) => prev ? { ...prev, downloadCount: data.downloadCount } : null);
        toast.success(t('community.downloadStarted', locale));
      }
    } catch {
      toast.error(t('community.failedToDownload', locale));
    } finally {
      setDownloading(false);
    }
  }, [designId, downloading]);

  const handleShare = useCallback(async () => {
    if (!design) return;
    const shareText = t('community.shareText', locale, { title: design.title });
    if (navigator.share) {
      try {
        await navigator.share({ title: design.title, text: shareText });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast.success(t('community.linkCopiedToast', locale));
    }
  }, [design]);

  const handleUseTemplate = useCallback(() => {
    toast.success(t('community.templateCopied', locale));
    onOpenChange(false);
  }, [onOpenChange]);

  const handleOpenEditor = useCallback(() => {
    if (!design?.boardId) {
      toast.info(t('community.noSourceBoard', locale));
      return;
    }
    toast.success(t('community.openingInEditor', locale));
    onOpenChange(false);
    // In a real app, this would navigate to the editor with the board
  }, [design, onOpenChange]);

  const gradientClass = design ? (CATEGORY_GRADIENTS[design.category] || CATEGORY_GRADIENTS['general']) : '';
  const categoryLabelKey = design ? CATEGORY_LABEL_KEYS[design.category] : '';
  const categoryLabel = categoryLabelKey ? t(categoryLabelKey, locale) : (design?.category || '');
  const tags = design?.tags ? design.tags.split(',').filter(Boolean) : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden max-h-[90vh]">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="size-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <Skeleton className="w-full aspect-[16/9] rounded-xl mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </motion.div>
          ) : design ? (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Preview area */}
              <div className={cn('relative w-full aspect-[16/9] overflow-hidden bg-gradient-to-br', gradientClass)}>
                {/* Decorative grid overlay */}
                <div className="absolute inset-0 opacity-10">
                  <svg className="h-full w-full" viewBox="0 0 400 225" fill="none" stroke="currentColor" strokeWidth="0.5" aria-hidden="true">
                    {[...Array(20)].map((_, i) => (
                      <line key={`h${i}`} x1="0" y1={i * 12} x2="400" y2={i * 12} className="text-white" />
                    ))}
                    {[...Array(34)].map((_, i) => (
                      <line key={`v${i}`} x1={i * 12} y1="0" x2={i * 12} y2="225" className="text-white" />
                    ))}
                  </svg>
                </div>

                {/* Featured badge */}
                {design.isFeatured && (
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-amber-500 text-white border-0 gap-1 shadow-sm">
                      ⭐ {t('community.featured', locale)}
                    </Badge>
                  </div>
                )}

                {/* Category badge */}
                <div className="absolute top-3 right-3">
                  <Badge className="bg-black/30 text-white border-0 backdrop-blur-sm">
                    {categoryLabel}
                  </Badge>
                </div>

                {/* Design title overlay */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent p-4">
                  <h2 className="text-white text-lg font-bold">{design.title}</h2>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4">
                {/* Author & stats header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10 ring-2 ring-border">
                      <AvatarFallback className="bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white font-semibold text-sm">
                        {(design.userName || 'A')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{design.userName || t('community.anonymous', locale)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(design.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Heart className="size-4" />
                      <span className="font-medium">{design.likeCount}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Download className="size-4" />
                      <span className="font-medium">{design.downloadCount}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Description */}
                {design.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {design.description}
                  </p>
                )}

                {/* Tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5 rounded-full">
                        #{tag.trim()}
                      </Badge>
                    ))}
                  </div>
                )}

                <Separator />

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={liked ? 'default' : 'outline'}
                    size="sm"
                    onClick={handleLike}
                    disabled={liked}
                    className={cn(
                      'gap-1.5 rounded-lg',
                      liked && 'bg-rose-500 hover:bg-rose-600 text-white border-rose-500'
                    )}
                  >
                    <Heart className={cn('size-4', liked && 'fill-current')} />
                    {liked ? t('community.likedBtn', locale) : t('community.likeBtn', locale)}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    disabled={downloading}
                    className="gap-1.5 rounded-lg"
                  >
                    <Download className="size-4" />
                    {downloading ? t('community.downloading', locale) : t('community.downloadBtn', locale)}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="gap-1.5 rounded-lg"
                  >
                    <Share2 className="size-4" />
                    {t('community.shareBtn', locale)}
                  </Button>

                  {design.boardId && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleOpenEditor}
                      className="gap-1.5 rounded-lg"
                    >
                      <ExternalLink className="size-4" />
                      {t('community.openInEditorBtn', locale)}
                    </Button>
                  )}

                  <Button
                    size="sm"
                    onClick={handleUseTemplate}
                    className="gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white border-0"
                  >
                    <Copy className="size-4" />
                    {t('community.useAsTemplate', locale)}
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center p-12 text-center"
            >
              <User className="size-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">{t("community.designNotFound", locale)}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
