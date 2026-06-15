'use client';

import { t, type Locale } from '@/lib/i18n';
import { useAuthStore } from '@/store/auth-store';
import {
  ALL_DESIGN_FORMATS,
  FORMAT_CATEGORIES,
  ALL_EXTENSIONS,
  IMPORTABLE_EXTENSIONS,
  getFormatsByCategory,
  type DesignFormat,
  type FormatCategory,
} from '@/lib/design-formats';
import { useCallback, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Search,
  Palette,
  MousePointerClick,
  GitBranch,
  Presentation,
  Image,
  Camera,
  Code,
  Box,
  Database,
  FileText,
  type LucideIcon,
} from 'lucide-react';
import type { BoardElement } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

// ─── Icon map ────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, LucideIcon> = {
  Palette,
  MousePointerClick,
  GitBranch,
  Presentation,
  Image,
  Camera,
  Code,
  Box,
  Database,
  FileText,
};

// ─── Types ──────────────────────────────────────────────────────────────

type ImportStatus = 'idle' | 'uploading' | 'parsing' | 'done' | 'error';

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (elements: BoardElement[]) => void;
  boardId?: string;
}

// ─── Constants ──────────────────────────────────────────────────────────

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
const TOTAL_FORMATS = ALL_DESIGN_FORMATS.length;
const TOTAL_CATEGORIES = FORMAT_CATEGORIES.length;

// ─── Component ──────────────────────────────────────────────────────────

export function ImportDialog({ open, onOpenChange, onImport, boardId }: ImportDialogProps) {
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<ImportStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [elementCount, setElementCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Group formats by category, filtered by search query
  const groupedFormats = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return FORMAT_CATEGORIES.map((cat) => {
      let formats = getFormatsByCategory(cat.id);

      if (query) {
        formats = formats.filter(
          (f) =>
            f.extension.toLowerCase().includes(query) ||
            f.application.toLowerCase().includes(query) ||
            f.name.toLowerCase().includes(query),
        );
      }

      return { ...cat, formats };
    }).filter((cat) => cat.formats.length > 0);
  }, [searchQuery]);

  const totalFilteredFormats = useMemo(
    () => groupedFormats.reduce((sum, cat) => sum + cat.formats.length, 0),
    [groupedFormats],
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setProgress(0);
    setError(null);
    setFileName(null);
    setElementCount(0);
    setDragOver(false);
    setSearchQuery('');
  }, []);

  const handleClose = useCallback(
    (nextOpen: boolean) => {
      if (status === 'uploading' || status === 'parsing') return;
      if (!nextOpen) reset();
      onOpenChange(nextOpen);
    },
    [status, reset, onOpenChange],
  );

  const processFile = useCallback(
    async (file: File) => {
      if (file.size > MAX_FILE_SIZE) {
        setError(t('import.fileTooLarge', locale, { size: MAX_FILE_SIZE / (1024 * 1024) }));
        setStatus('error');
        return;
      }

      reset();
      setFileName(file.name);
      setStatus('uploading');
      setProgress(10);

      try {
        const formData = new FormData();
        formData.append('file', file);
        if (boardId) formData.append('boardId', boardId);

        setProgress(30);

        const res = await fetch('/api/import', {
          method: 'POST',
          body: formData,
        });

        setProgress(70);
        setStatus('parsing');

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || t('import.importFailedError', locale));
        }

        setProgress(100);
        setStatus('done');
        setElementCount(data.elements?.length ?? 0);

        if (data.elements?.length) {
          setTimeout(() => {
            onImport(data.elements);
            handleClose(false);
          }, 800);
        }
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : t('common.error', locale));
        setProgress(0);
      }
    },
    [boardId, locale, onImport, reset, handleClose],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      if (inputRef.current) inputRef.current.value = '';
    },
    [processFile],
  );

  const handleBrowse = useCallback(() => {
    inputRef.current?.click();
  }, []);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[640px] gap-0 p-0 overflow-hidden">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center gap-3">
            <DialogTitle className="text-xl">{t('import.title', locale)}</DialogTitle>
            <Badge variant="secondary" className="text-[10px] font-medium px-2 py-0 h-5 shrink-0">
              {TOTAL_FORMATS}+ {locale === 'zh' ? '格式' : 'formats'}
            </Badge>
          </div>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            {locale === 'zh'
              ? `支持 ${TOTAL_FORMATS}+ 种设计文件格式，横跨 ${TOTAL_CATEGORIES} 个类别`
              : `${TOTAL_FORMATS}+ design file formats across ${TOTAL_CATEGORIES} categories`}
          </DialogDescription>
        </DialogHeader>

        {/* ── Body ──────────────────────────────────────────────────── */}
        <div className="px-6 pb-6">
          {/* Drop Zone */}
          <motion.div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleBrowse}
            whileTap={{ scale: 0.98 }}
            className={`
              neu-raised relative flex flex-col items-center justify-center gap-3
              rounded-xl border-2 border-dashed px-6 py-10 cursor-pointer
              transition-colors duration-200
              ${
                dragOver
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
              }
              ${status === 'uploading' || status === 'parsing' ? 'pointer-events-none opacity-70' : ''}
            `}
          >
            <AnimatePresence mode="wait">
              {status === 'idle' && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center gap-3"
                >
                  <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                    <Upload className="size-6 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">
                      {t('import.dragDrop', locale)}{' '}
                      <span className="text-primary underline underline-offset-2">
                        {t('import.browse', locale)}
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t('import.maxSize', locale, { size: MAX_FILE_SIZE / (1024 * 1024) })}
                    </p>
                  </div>
                </motion.div>
              )}

              {(status === 'uploading' || status === 'parsing') && (
                <motion.div
                  key="uploading"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center gap-3 w-full max-w-xs"
                >
                  <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
                    <Loader2 className="size-6 text-primary animate-spin" />
                  </div>
                  <div className="text-center w-full">
                    <p className="text-sm font-medium">
                      {status === 'uploading'
                        ? t('import.uploading', locale)
                        : t('import.parsingElements', locale)}
                    </p>
                    {fileName && (
                      <p className="mt-0.5 text-xs text-muted-foreground truncate max-w-[320px] mx-auto">
                        {fileName}
                      </p>
                    )}
                  </div>
                  <Progress value={progress} className="h-1.5 w-full" />
                </motion.div>
              )}

              {status === 'done' && (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col items-center gap-3"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                    className="flex size-14 items-center justify-center rounded-full bg-emerald-500/10"
                  >
                    <CheckCircle2 className="size-6 text-emerald-500" />
                  </motion.div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-emerald-600">
                      {t('import.successful', locale)}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {t('import.elementsImported', locale, { count: elementCount })}
                    </p>
                  </div>
                </motion.div>
              )}

              {status === 'error' && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center gap-3"
                >
                  <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10">
                    <AlertCircle className="size-6 text-destructive" />
                  </div>
                  <div className="text-center max-w-[320px]">
                    <p className="text-sm font-medium text-destructive">{t('import.failed', locale)}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground break-words">{error}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      reset();
                    }}
                    className="mt-1"
                  >
                    <X className="size-3.5" />
                    {t('import.tryAgain', locale)}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hidden file input */}
            <input
              ref={inputRef}
              type="file"
              accept={IMPORTABLE_EXTENSIONS}
              className="sr-only"
              onChange={handleInputChange}
            />
          </motion.div>

          {/* ── Format Browser ─────────────────────────────────────── */}
          <div className="mt-5">
            {/* Section header with search */}
            <div className="flex items-center justify-between gap-3 mb-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider shrink-0">
                {t('import.supportedFormats', locale)}
                {searchQuery && (
                  <span className="ml-1.5 text-primary font-normal normal-case">
                    ({totalFilteredFormats})
                  </span>
                )}
              </p>
              <div className="relative w-48 shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/60 pointer-events-none" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={locale === 'zh' ? '搜索格式...' : 'Search formats...'}
                  className="h-7 text-xs pl-7 pr-3 rounded-lg"
                />
              </div>
            </div>

            {/* Categorized format list */}
            <div className="neu-flat rounded-xl p-3 max-h-48 overflow-y-auto neu-scroll">
              {groupedFormats.length === 0 && (
                <div className="flex items-center justify-center py-6 text-xs text-muted-foreground">
                  {locale === 'zh' ? '未找到匹配的格式' : 'No matching formats found'}
                </div>
              )}

              {groupedFormats.map((cat, catIdx) => {
                const CatIcon = ICON_MAP[cat.icon] ?? FileText;

                return (
                  <div key={cat.id} className={catIdx > 0 ? 'mt-3 pt-3 border-t border-border/50' : ''}>
                    {/* Category header */}
                    <div className="flex items-center gap-2 mb-2">
                      <CatIcon className="size-3.5 text-muted-foreground shrink-0" />
                      <span className="text-xs font-semibold text-foreground/80">
                        {cat.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground/70 tabular-nums">
                        ({cat.formats.length} {locale === 'zh' ? '种格式' : cat.formats.length === 1 ? 'format' : 'formats'})
                      </span>
                    </div>

                    {/* Format chips grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {cat.formats.map((fmt: DesignFormat) => (
                        <div
                          key={fmt.extension}
                          className="inline-flex items-center gap-1.5 rounded-md bg-muted/60 px-2 py-1 text-[11px] leading-tight hover:bg-muted transition-colors"
                        >
                          <span className="font-semibold text-foreground/90 shrink-0">
                            {fmt.extension}
                          </span>
                          <span className="text-muted-foreground truncate">{fmt.application}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}