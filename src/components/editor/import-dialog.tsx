'use client';

import { t, type Locale } from '@/lib/i18n';import { useAuthStore } from '@/store/auth-store';
import { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileJson, ImageIcon, FileType, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

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

// ─── Types ──────────────────────────────────────────────────────────────────

type ImportStatus = 'idle' | 'uploading' | 'parsing' | 'done' | 'error';

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (elements: BoardElement[]) => void;
  boardId?: string;
}

interface FormatInfo {
  label: string;
  ext: string[];
  icon: React.ReactNode;
  color: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const FORMATS: FormatInfo[] = [
  {
    label: 'SVG',
    ext: ['.svg'],
    icon: <FileType className="size-5" />,
    color: 'text-amber-600',
  },
  {
    label: 'Figma JSON',
    ext: ['.json'],
    icon: <FileJson className="size-5" />,
    color: 'text-violet-600',
  },
  {
    label: 'Images',
    ext: ['.png', '.jpg', '.jpeg', '.webp'],
    icon: <ImageIcon className="size-5" />,
    color: 'text-emerald-600',
  },
];

const ACCEPTED_EXTENSIONS = '.svg,.json,.png,.jpg,.jpeg,.webp';
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

// ─── Component ──────────────────────────────────────────────────────────────

export function ImportDialog({ open, onOpenChange, onImport, boardId }: ImportDialogProps) {
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<ImportStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [elementCount, setElementCount] = useState(0);

  const reset = useCallback(() => {
    setStatus('idle');
    setProgress(0);
    setError(null);
    setFileName(null);
    setElementCount(0);
    setDragOver(false);
  }, []);

  const handleClose = useCallback(
    (nextOpen: boolean) => {
      if (status === 'uploading' || status === 'parsing') return; // prevent closing during upload
      if (!nextOpen) reset();
      onOpenChange(nextOpen);
    },
    [status, reset, onOpenChange],
  );

  const processFile = useCallback(
    async (file: File) => {
      // Validate size
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

        // Call callback after a short delay so the user sees success state
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
    [boardId, onImport, reset, handleClose],
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
      // Reset input so the same file can be re-selected
      if (inputRef.current) inputRef.current.value = '';
    },
    [processFile],
  );

  const handleBrowse = useCallback(() => {
    inputRef.current?.click();
  }, []);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[520px] gap-0 p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl">{t("import.title", locale)}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {t("import.description", locale)}
          </DialogDescription>
        </DialogHeader>

        {/* Body */}
        <div className="px-6 pb-6">
          {/* Drop Zone */}
          <motion.div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleBrowse}
            whileTap={{ scale: 0.98 }}
            className={`
              relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed
              px-6 py-10 cursor-pointer transition-colors duration-200
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
                      {t("import.dragDrop", locale)}<span className="text-primary underline underline-offset-2">{t("import.browse", locale)}</span>
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t("import.maxSize", locale, { size: MAX_FILE_SIZE / (1024 * 1024) })}
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
                      {status === 'uploading' ? t("import.uploading", locale) : t("import.parsingElements", locale)}
                    </p>
                    {fileName && (
                      <p className="mt-0.5 text-xs text-muted-foreground truncate max-w-[220px] mx-auto">
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
                    <p className="text-sm font-medium text-emerald-600">{t("import.successful", locale)}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {t("import.elementsImported", locale, { count: elementCount })}
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
                  <div className="text-center max-w-[280px]">
                    <p className="text-sm font-medium text-destructive">{t("import.failed", locale)}</p>
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
                    {t("import.tryAgain", locale)}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hidden file input */}
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED_EXTENSIONS}
              className="sr-only"
              onChange={handleInputChange}
            />
          </motion.div>

          {/* Supported Formats */}
          <div className="mt-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              {t("import.supportedFormats", locale)}
            </p>
            <div className="flex gap-3">
              {FORMATS.map((fmt) => (
                <motion.div
                  key={fmt.label}
                  whileHover={{ y: -2 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2.5 text-xs"
                >
                  <span className={fmt.color}>{fmt.icon}</span>
                  <div>
                    <p className="font-medium">{fmt.label}</p>
                    <p className="text-muted-foreground">{fmt.ext.join(', ')}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}