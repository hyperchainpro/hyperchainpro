'use client';

import { useState } from 'react';
import { t, type Locale } from '@/lib/i18n';
import { useAuthStore } from '@/store/auth-store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Layers, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useCanvasStore } from '@/store/canvas-store';
import { useComponentStore } from '@/store/component-store';
import type { ComponentDefinition } from '@/lib/types';

const NEU_RAISED =
  'shadow-[4px_4px_8px_rgba(0,0,0,0.06),-4px_-4px_8px_rgba(255,255,255,0.8)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.35),-4px_-4px_8px_rgba(30,30,30,0.08)]';

const NEU_INSET =
  'shadow-[inset_1px_1px_3px_rgba(0,0,0,0.06),inset_-1px_-1px_3px_rgba(255,255,255,0.7)] dark:shadow-[inset_1px_1px_3px_rgba(0,0,0,0.3),inset_-1px_-1px_3px_rgba(30,30,30,0.05)]';

export function CreateComponentDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleCreate = () => {
    setError('');

    const canvasStore = useCanvasStore.getState();
    const componentStore = useComponentStore.getState();
    const selectedIds = canvasStore.selectedIds;
    const elements = canvasStore.elements;

    // Get selected elements
    const selectedElements = elements.filter((el) =>
      selectedIds.includes(el.id),
    );

    if (selectedElements.length === 0) {
      setError(t('component.selectFirst', locale));
      return;
    }

    if (!name.trim()) {
      setError(t('component.enterName', locale));
      return;
    }

    const now = new Date().toISOString();
    const componentId = `comp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const masterElementId = selectedElements[0].id;
    const childElementIds = selectedElements.slice(1).map((el) => el.id);

    const definition: ComponentDefinition = {
      id: componentId,
      name: name.trim(),
      description: `Component created from ${selectedElements.length} element(s)`,
      masterElementId,
      childElementIds,
      createdAt: now,
      updatedAt: now,
    };

    // Register the component
    componentStore.registerComponent(definition);

    // Mark the master element as a component instance
    canvasStore.updateElement(masterElementId, {
      componentId,
      name: name.trim(),
    });

    // Mark child elements as part of the component
    for (const childId of childElementIds) {
      canvasStore.updateElement(childId, {
        parentId: masterElementId,
        componentId,
      });
    }

    toast.success(t('component.created', locale, { name: name.trim(), count: selectedElements.length }));

    // Reset form and close
    setName('');
    setError('');
    onOpenChange(false);
  };

  // Count selected elements
  const selectedCount = useCanvasStore((s) =>
    s.elements.filter((el) => s.selectedIds.includes(el.id)).length,
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          setName('');
          setError('');
        }
        onOpenChange(v);
      }}
    >
      <DialogContent
        className={`sm:max-w-[440px] ${NEU_RAISED} border-neutral-200/60 dark:border-neutral-700/40`}
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Layers className="h-5 w-5" />
            {t('component.createTitle', locale)}
          </DialogTitle>
          <DialogDescription>
            {t('component.createDesc', locale)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Component Name */}
          <div className="space-y-2">
            <Label htmlFor="component-name" className="text-sm font-medium">
              {t('component.name', locale)}
            </Label>
            <Input
              id="component-name"
              placeholder={t('component.namePlaceholder', locale)}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              className={NEU_INSET}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
              }}
            />
          </div>

          {/* Preview / Selection Info */}
          <div
            className={`rounded-lg border p-4 ${NEU_INSET} ${
              selectedCount > 0
                ? 'border-primary/20 bg-primary/5'
                : 'border-destructive/20 bg-destructive/5'
            }`}
          >
            <div className="flex items-start gap-3">
              <Layers
                className={`h-5 w-5 mt-0.5 ${
                  selectedCount > 0
                    ? 'text-primary'
                    : 'text-destructive'
                }`}
              />
              <div>
                <p className="text-sm font-medium">
                  {selectedCount > 0
                    ? t('component.elementsSelected', locale, { count: selectedCount })
                    : t('component.noElementsSelected', locale)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selectedCount > 0
                    ? t('component.selectionHint', locale)
                    : t('component.noSelectionHint', locale)}
                </p>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
              <AlertCircle className="h-4 w-4 mt-0.5 text-destructive shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {t('common.cancel', locale)}
          </Button>
          <Button
            onClick={handleCreate}
            className={NEU_RAISED}
          >
            <Layers className="h-4 w-4" />
            {t('component.createTitle', locale)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}