'use client';

import { motion } from 'framer-motion';
import { Heart, Download, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { t, type Locale } from '@/lib/i18n';
import { useAuthStore } from '@/store/auth-store';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CommunityDesignData {
  id: string;
  title: string;
  description?: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  boardId?: string;
  thumbnail?: string;
  tags?: string;
  category: string;
  downloadCount: number;
  likeCount: number;
  isFeatured: boolean;
  createdAt: string;
}

export interface CommunityCardProps {
  design: CommunityDesignData;
  onClick: () => void;
  onLike: () => void;
}

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

const CATEGORY_BG_PATTERNS: Record<string, string> = {
  'mobile-ui': 'M80 40 Q120 20 160 40 T240 40',
  'web-ui': 'M40 80 Q80 60 120 80 T200 80',
  'wireframes': 'M40 40 L120 40 L120 120 L40 120 Z M60 60 L100 60 M60 80 L100 80 M60 100 L80 100',
  'dashboards': 'M40 40 h40 v20 h-40z M100 40 h40 v20 h-40z M40 70 h100 v10 h-100z M40 90 h60 v10 h-60z',
  'icons': 'M100 40 L120 60 L100 80 L80 60 Z M60 100 L80 80 L100 100 L80 120 Z',
  'illustrations': 'M60 120 Q100 80 140 120 M80 100 Q100 70 120 100 M50 140 Q100 60 150 140',
  'templates': 'M40 40 h120 v80 h-120z M55 55 h30 M55 65 h20 M55 75 h25',
  'general': 'M40 40 Q120 120 200 40 M40 120 Q120 40 200 120',
};

function getGradientClass(category: string): string {
  return CATEGORY_GRADIENTS[category] || CATEGORY_GRADIENTS['general'];
}

// ─── Component ──────────────────────────────────────────────────────────────

export function CommunityCard({ design, onClick, onLike }: CommunityCardProps) {
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  const gradientClass = getGradientClass(design.category);
  const pattern = CATEGORY_BG_PATTERNS[design.category] || '';
  const categoryLabelKey = CATEGORY_LABEL_KEYS[design.category];
  const categoryLabel = categoryLabelKey ? t(categoryLabelKey, locale) : design.category;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="group cursor-pointer"
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`View ${design.title} by ${design.userName || t('community.anonymous', locale)}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="relative overflow-hidden rounded-xl neu-card bg-background transition-shadow">
        {/* Thumbnail area */}
        <div
          className={cn(
            'relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br',
            gradientClass
          )}
        >
          {/* Decorative pattern overlay */}
          <svg
            className="absolute inset-0 h-full w-full opacity-20"
            viewBox="0 0 240 160"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d={pattern} className="text-white/60" />
            {design.category === 'mobile-ui' && (
              <>
                <rect x="90" y="30" width="60" height="100" rx="8" className="text-white/40" />
                <rect x="96" y="40" width="48" height="8" rx="2" className="text-white/60" />
                <rect x="96" y="52" width="48" height="6" rx="2" className="text-white/50" />
                <rect x="96" y="62" width="48" height="6" rx="2" className="text-white/50" />
                <circle cx="120" cy="112" r="4" className="text-white/60" />
              </>
            )}
            {design.category === 'dashboards' && (
              <>
                <rect x="20" y="20" width="50" height="35" rx="4" className="text-white/40" />
                <rect x="80" y="20" width="50" height="35" rx="4" className="text-white/40" />
                <rect x="140" y="20" width="80" height="35" rx="4" className="text-white/40" />
                <rect x="20" y="65" width="200" height="15" rx="3" className="text-white/30" />
                <rect x="20" y="90" width="130" height="15" rx="3" className="text-white/30" />
                <rect x="20" y="115" width="80" height="25" rx="4" className="text-white/40" />
              </>
            )}
            {design.category === 'illustrations' && (
              <>
                <circle cx="80" cy="60" r="20" className="text-white/40" />
                <circle cx="160" cy="80" r="25" className="text-white/30" />
                <path d="M120 120 Q140 90 160 120" className="text-white/40" />
              </>
            )}
          </svg>

          {/* Featured badge */}
          {design.isFeatured && (
            <div className="absolute top-2 left-2">
              <Badge className="gap-1 bg-amber-500 text-white border-0 text-[10px] px-2 py-0.5 neu-badge">
                <Star className="size-2.5 fill-current" />
                {t('community.featured', locale)}
              </Badge>
            </div>
          )}

          {/* Category badge */}
          <div className="absolute top-2 right-2">
            <Badge className="bg-black/30 text-white border-0 text-[10px] px-2 py-0.5 backdrop-blur-sm neu-badge">
              {categoryLabel}
            </Badge>
          </div>

          {/* Like overlay on hover */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/10"
            initial={false}
          >
            <motion.button
              className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-sm font-medium text-rose-500 shadow-sm opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                onLike();
              }}
              whileTap={{ scale: 0.9 }}
              aria-label={`Like ${design.title}`}
            >
              <Heart className="size-3.5 fill-current" />
              {design.likeCount}
            </motion.button>
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-3">
          {/* Title */}
          <h3 className="text-sm font-semibold text-foreground leading-tight line-clamp-2 mb-1.5">
            {design.title}
          </h3>

          {/* Author & stats */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-400 text-[8px] font-bold text-white neu-avatar">
                {(design.userName || 'A')[0].toUpperCase()}
              </div>
              <span className="text-xs text-muted-foreground truncate">
                {design.userName || t('community.anonymous', locale)}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                <Heart className="size-3" />
                {design.likeCount}
              </span>
              <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                <Download className="size-3" />
                {design.downloadCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
