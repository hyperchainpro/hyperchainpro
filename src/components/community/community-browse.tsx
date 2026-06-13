'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Heart,
  Download,
  Star,
  Grid3x3,
  Filter,
  TrendingUp,
  Clock,
  Users,
  Upload,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { CommunityCard, type CommunityDesignData } from './community-card';
import { DesignDetailDialog } from './design-detail-dialog';
import { UploadDesignDialog } from './upload-design-dialog';
import { cn } from '@/lib/utils';

// ─── Category tabs ───────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'mobile-ui', label: 'Mobile UI' },
  { value: 'web-ui', label: 'Web UI' },
  { value: 'wireframes', label: 'Wireframes' },
  { value: 'dashboards', label: 'Dashboards' },
  { value: 'icons', label: 'Icons' },
  { value: 'illustrations', label: 'Illustrations' },
  { value: 'templates', label: 'Templates' },
] as const;

// ─── Sort options ────────────────────────────────────────────────────────────

type SortOption = 'latest' | 'popular' | 'featured';

const SORT_OPTIONS: { value: SortOption; label: string; icon: React.ElementType }[] = [
  { value: 'latest', label: 'Latest', icon: Clock },
  { value: 'popular', label: 'Most Popular', icon: TrendingUp },
  { value: 'featured', label: 'Featured', icon: Star },
];

// ─── Animation variants ────────────────────────────────────────────────────────

const gridContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const gridItemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface CommunityBrowseProps {
  onBack?: () => void;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function CommunityBrowse({ onBack }: CommunityBrowseProps) {
  // State
  const [designs, setDesigns] = useState<CommunityDesignData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState<SortOption>('latest');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [selectedDesignId, setSelectedDesignId] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState(false);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const LIMIT = 12;

  // Fetch designs
  const fetchDesigns = useCallback(
    async (pageNum: number, append: boolean = false) => {
      try {
        const params = new URLSearchParams({
          page: String(pageNum),
          limit: String(LIMIT),
          sort,
        });

        if (search.trim()) params.set('search', search.trim());
        if (category !== 'all') params.set('category', category);

        const res = await fetch(`/api/community?${params}`);
        const data = await res.json();

        if (append) {
          setDesigns((prev) => [...prev, ...data.designs]);
        } else {
          setDesigns(data.designs);
        }

        setTotal(data.total);
        setHasMore(data.designs.length + (append ? designs.length : 0) < data.total);
      } catch (error) {
        console.error('Failed to fetch community designs:', error);
      } finally {
        setLoading(false);
      }
    },
    [search, category, sort, designs.length]
  );

  // Initial load and when filters change
  useEffect(() => {
    setLoading(true);
    setPage(1);
    fetchDesigns(1, false);
  }, [search, category, sort, fetchDesigns]);

  // Load more with IntersectionObserver
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchDesigns(nextPage, true);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [hasMore, loading, page, fetchDesigns]);

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      // Search is updated via state, the useEffect will handle fetching
    }, 300);
  };

  // Handle like
  const handleLike = useCallback(async (designId: string) => {
    try {
      const res = await fetch(`/api/community/${designId}?action=like`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setDesigns((prev) =>
          prev.map((d) =>
            d.id === designId ? { ...d, likeCount: data.likeCount } : d
          )
        );
      }
    } catch {
      // Silently fail
    }
  }, []);

  // Handle card click
  const handleCardClick = useCallback((designId: string) => {
    setSelectedDesignId(designId);
  }, []);

  // Loading skeletons
  const renderSkeletons = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
          <Skeleton className="aspect-[4/3] w-full" />
          <div className="p-3 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="shrink-0 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="px-4 py-3 lg:px-6">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Back + Title */}
            <div className="flex items-center gap-3">
              {onBack && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onBack}
                  className="shrink-0"
                  aria-label="Go back"
                >
                  <ArrowLeft className="size-5" />
                </Button>
              )}
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-sm">
                  <Users className="size-4" />
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-tight leading-none">Community</h1>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {total > 0 ? `${total} designs shared by creators` : 'Browse and share designs'}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* Upload button */}
              <Button
                onClick={() => setUploadOpen(true)}
                className={cn(
                  'gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600',
                  'hover:from-violet-700 hover:to-fuchsia-700 text-white border-0 shadow-sm'
                )}
                size="sm"
              >
                <Upload className="size-4" />
                <span className="hidden sm:inline">Share Your Work</span>
                <span className="sm:hidden">Upload</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Search + Filters */}
      <div className="shrink-0 border-b border-border bg-muted/30">
        <div className="px-4 py-3 lg:px-6">
          {/* Search bar */}
          <div className="relative max-w-xl mb-3">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search designs, tags, creators..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 h-9 bg-background border-border/60 focus-visible:ring-1"
              aria-label="Search community designs"
            />
          </div>

          {/* Category tabs */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 overflow-x-auto">
              <Tabs value={category} onValueChange={setCategory}>
                <TabsList className="h-8 bg-muted/50 p-0.5 gap-0.5">
                  {CATEGORIES.map((cat) => (
                    <TabsTrigger
                      key={cat.value}
                      value={cat.value}
                      className="text-xs h-7 px-3 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
                    >
                      {cat.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {/* Sort options */}
            <div className="hidden sm:flex items-center gap-1.5 shrink-0">
              {SORT_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                return (
                  <Button
                    key={opt.value}
                    variant={sort === opt.value ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setSort(opt.value)}
                    className={cn(
                      'text-xs h-7 px-2.5 rounded-md gap-1',
                      sort === opt.value && 'font-semibold'
                    )}
                  >
                    <Icon className="size-3" />
                    {opt.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Mobile sort selector */}
          <div className="sm:hidden mt-3 flex items-center gap-2">
            <Filter className="size-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Sort:</span>
            <div className="flex items-center gap-1">
              {SORT_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  variant={sort === opt.value ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setSort(opt.value)}
                  className="text-xs h-7 px-2.5 rounded-md"
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <ScrollArea className="flex-1">
        <main className="p-4 lg:p-6 pb-20 md:pb-6">
          {loading && designs.length === 0 ? (
            renderSkeletons()
          ) : designs.length > 0 ? (
            <>
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5"
                variants={gridContainerVariants}
                initial="hidden"
                animate="show"
                key={`${category}-${sort}-${search}`}
              >
                <AnimatePresence mode="popLayout">
                  {designs.map((design) => (
                    <motion.div
                      key={design.id}
                      variants={gridItemVariants}
                      layout
                    >
                      <CommunityCard
                        design={design}
                        onClick={() => handleCardClick(design.id)}
                        onLike={() => handleLike(design.id)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Load more trigger */}
              {hasMore && (
                <div ref={loadMoreRef} className="flex items-center justify-center py-8">
                  {loading && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <div className="size-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span className="text-sm">Loading more designs...</span>
                    </div>
                  )}
                </div>
              )}

              {/* End of results */}
              {!hasMore && designs.length > 0 && (
                <div className="flex items-center justify-center py-8 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Sparkles className="size-5" />
                    <p className="text-sm">
                      {designs.length === total
                        ? `You've seen all ${total} designs!`
                        : 'That\'s all for now.'}
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Empty state */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="relative mb-6">
                <div className="flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-950/40 dark:to-fuchsia-950/40">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg">
                    <Grid3x3 className="size-6" />
                  </div>
                </div>
              </div>

              <h2 className="text-lg font-semibold mb-2">
                {search ? 'No designs found' : 'No designs yet'}
              </h2>
              <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
                {search
                  ? `No designs match "${search}". Try different keywords or browse by category.`
                  : 'Be the first to share your design with the community! Your creativity could inspire others.'}
              </p>

              {search && (
                <Button
                  variant="outline"
                  onClick={() => setSearch('')}
                  className="gap-2 rounded-lg"
                >
                  Clear search
                </Button>
              )}

              {!search && (
                <Button
                  onClick={() => setUploadOpen(true)}
                  className={cn(
                    'gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600',
                    'hover:from-violet-700 hover:to-fuchsia-700 text-white border-0'
                  )}
                >
                  <Upload className="size-4" />
                  Share Your First Design
                </Button>
              )}
            </motion.div>
          )}
        </main>
      </ScrollArea>

      {/* Detail dialog */}
      <DesignDetailDialog
        designId={selectedDesignId}
        open={!!selectedDesignId}
        onOpenChange={(open) => {
          if (!open) setSelectedDesignId(null);
        }}
      />

      {/* Upload dialog */}
      <UploadDesignDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
      />
    </div>
  );
}
