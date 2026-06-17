'use client';

import { t, type Locale } from '@/lib/i18n';
import { useAuthStore } from '@/store/auth-store';
import { useCallback, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Search,
  ChevronDown,
  ChevronRight,
  Check,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  FileDown,
} from 'lucide-react';

import {
  FORMAT_CATEGORIES,
  EXPORTABLE_FORMATS,
  type DesignFormat,
  type FormatCategory,
} from '@/lib/design-formats';
import { useCanvasStore } from '@/store/canvas-store';
import { useAppStore } from '@/store/app-store';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

// ─── Types ──────────────────────────────────────────────────────────────────

type ExportStatus = 'idle' | 'exporting' | 'done' | 'error';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardName?: string;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function ExportDialog({ open, onOpenChange, boardName }: ExportDialogProps) {
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  const elements = useCanvasStore((s) => s.elements);
  const currentBoardId = useAppStore((s) => s.currentBoardId);

  const [fileName, setFileName] = useState(boardName || 'layerboard-design');
  const [selectedFormat, setSelectedFormat] = useState<DesignFormat | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState<ExportStatus>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(() => {
    const firstThree = FORMAT_CATEGORIES.slice(0, 3).map((c) => c.id);
    return new Set(firstThree);
  });
  const linkRef = useRef<HTMLAnchorElement>(null);

  // Filter formats by search and export support
  const filteredFormats = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return EXPORTABLE_FORMATS.filter((f) => {
      if (!query) return true;
      return (
        f.name.toLowerCase().includes(query) ||
        f.extension.toLowerCase().includes(query) ||
        f.application.toLowerCase().includes(query) ||
        f.category.toLowerCase().includes(query)
      );
    });
  }, [searchQuery]);

  // Group filtered formats by category
  const formatsByCategory = useMemo(() => {
    const map = new Map<FormatCategory, DesignFormat[]>();
    for (const cat of FORMAT_CATEGORIES) {
      const catFormats = filteredFormats.filter((f) => f.category === cat.id);
      if (catFormats.length > 0) {
        map.set(cat.id, catFormats);
      }
    }
    return map;
  }, [filteredFormats]);

  const toggleCategory = useCallback((catId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) {
        next.delete(catId);
      } else {
        next.add(catId);
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setErrorMsg(null);
    // Don't reset selection so user can re-export easily
  }, []);

  const handleClose = useCallback(
    (nextOpen: boolean) => {
      if (status === 'exporting') return;
      if (!nextOpen) {
        reset();
        setSearchQuery('');
      }
      onOpenChange(nextOpen);
    },
    [status, reset, onOpenChange],
  );

  const handleExport = useCallback(async () => {
    if (!selectedFormat || status === 'exporting') return;

    setStatus('exporting');
    setErrorMsg(null);

    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          elements,
          format: selectedFormat.extension,
          boardName: fileName.trim() || 'layerboard-design',
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `Export failed (${res.status})`);
      }

      // Download the file
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (linkRef.current) {
        linkRef.current.href = url;
        linkRef.current.download = `${fileName.trim() || 'layerboard-design'}${selectedFormat.extension}`;
        linkRef.current.click();
        // Revoke after a short delay
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      }

      setStatus('done');
      setTimeout(() => setStatus('idle'), 2500);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : t('common.error', locale));
    }
  }, [selectedFormat, elements, fileName, locale, status]);

  const supportDotColor = (support: string) => {
    if (support === 'full') return 'bg-emerald-400';
    if (support === 'partial') return 'bg-amber-400';
    return 'bg-zinc-400';
  };

  const supportDotLabel = (support: string) => {
    if (support === 'full') return 'Full';
    if (support === 'partial') return 'Partial';
    return 'Image';
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[640px] gap-0 p-0 overflow-hidden max-h-[85vh] flex flex-col">
        {/* Hidden download link */}
        <a ref={linkRef} className="sr-only" aria-hidden="true" />

        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
          <DialogTitle className="text-xl flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg neu-raised">
              <Download className="size-4 text-primary" />
            </div>
            {t('export.title', locale)}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            {t('export.description', locale)}
          </DialogDescription>
        </DialogHeader>

        {/* Body */}
        <div className="px-6 pb-6 flex-1 overflow-y-auto neu-scroll">
          {/* File name input */}
          <div className="mt-3 mb-4">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
              {t('export.fileName', locale)}
            </label>
            <div className="flex items-center gap-2">
              <Input
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="layerboard-design"
                className="neu-input flex-1 h-9 text-sm"
                disabled={status === 'exporting'}
              />
              {selectedFormat && (
                <motion.div
                  key={selectedFormat.extension}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="shrink-0"
                >
                  <Badge variant="secondary" className="h-9 px-3 text-sm font-mono neu-flat">
                    {selectedFormat.extension}
                  </Badge>
                </motion.div>
              )}
            </div>
          </div>

          {/* Selected format indicator */}
          <AnimatePresence>
            {selectedFormat && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3 overflow-hidden"
              >
                <div className="flex items-center gap-2 rounded-lg neu-flat px-3 py-2 text-xs text-muted-foreground">
                  <Check className="size-3.5 text-emerald-500 shrink-0" />
                  <span>
                    {t('export.selected', locale)}:{' '}
                    <span className="font-medium text-foreground">{selectedFormat.extension}</span>{' '}
                    — {selectedFormat.name}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('export.searchFormats', locale)}
              className="neu-input h-8 pl-8 text-sm"
              disabled={status === 'exporting'}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Format grid by category */}
          <div className="space-y-3">
            {FORMAT_CATEGORIES.map((category) => {
              const catFormats = formatsByCategory.get(category.id);
              if (!catFormats || catFormats.length === 0) return null;
              const isExpanded = expandedCategories.has(category.id);

              return (
                <Collapsible
                  key={category.id}
                  open={isExpanded}
                  onOpenChange={() => toggleCategory(category.id)}
                >
                  <CollapsibleTrigger className="w-full flex items-center gap-2 py-1.5 group">
                    {isExpanded ? (
                      <ChevronDown className="size-3.5 text-muted-foreground transition-transform" />
                    ) : (
                      <ChevronRight className="size-3.5 text-muted-foreground transition-transform" />
                    )}
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider group-hover:text-foreground transition-colors">
                      {category.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground/60 ml-auto">
                      {catFormats.length}
                    </span>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.15 }}
                      className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 pl-5"
                    >
                      {catFormats.map((fmt) => {
                        const isSelected = selectedFormat?.extension === fmt.extension;
                        return (
                          <motion.button
                            key={fmt.extension}
                            whileHover={{ y: -1 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setSelectedFormat(isSelected ? null : fmt)}
                            disabled={status === 'exporting'}
                            className={`
                              relative flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition-all duration-150
                              ${isSelected
                                ? 'neu-pressed ring-2 ring-primary/40 bg-primary/5'
                                : 'neu-flat hover:neu-raised'
                              }
                            `}
                          >
                            {/* Support indicator dot */}
                            <span
                              className={`shrink-0 size-1.5 rounded-full ${supportDotColor(fmt.exportSupport)}`}
                              title={supportDotLabel(fmt.exportSupport)}
                            />
                            <div className="min-w-0 flex-1">
                              <p className={`font-medium truncate ${isSelected ? 'text-primary' : ''}`}>
                                {fmt.extension}
                              </p>
                              <p className="text-[10px] text-muted-foreground truncate">
                                {fmt.name}
                              </p>
                            </div>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                className="shrink-0"
                              >
                                <Check className="size-3.5 text-primary" />
                              </motion.div>
                            )}
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>

          {/* Empty state */}
          {filteredFormats.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Search className="size-8 mb-2 opacity-30" />
              <p className="text-sm">{t('export.noFormats', locale)}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 pt-3 border-t border-border/50 shrink-0">
          <div className="flex items-center gap-3">
            {/* Status indicator */}
            <AnimatePresence mode="wait">
              {status === 'exporting' && (
                <motion.div
                  key="exporting"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <Loader2 className="size-4 animate-spin" />
                  <span>{t('export.exporting', locale)}</span>
                </motion.div>
              )}
              {status === 'done' && (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-2 text-sm text-emerald-600"
                >
                  <CheckCircle2 className="size-4" />
                  <span>{t('export.done', locale)}</span>
                </motion.div>
              )}
              {status === 'error' && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-2 text-sm text-destructive"
                >
                  <AlertCircle className="size-4" />
                  <span className="truncate max-w-[200px]">{errorMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleClose(false)}
                disabled={status === 'exporting'}
                className="neu-flat"
              >
                {t('common.cancel', locale)}
              </Button>
              <Button
                size="sm"
                onClick={handleExport}
                disabled={!selectedFormat || status === 'exporting'}
                className="btn-neu-primary gap-2"
              >
                {status === 'exporting' ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : status === 'done' ? (
                  <CheckCircle2 className="size-3.5" />
                ) : (
                  <FileDown className="size-3.5" />
                )}
                {status === 'exporting'
                  ? t('export.exporting', locale)
                  : status === 'done'
                    ? t('export.done', locale)
                    : t('export.button', locale)}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}