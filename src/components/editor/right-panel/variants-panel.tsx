'use client';

import { useState, useMemo } from 'react';
import { Box, Plus, X, Check, Pencil, Trash2, Palette, Type, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n';
import type { ComponentDefinition, ComponentVariant, BoardElement } from '@/lib/types';
import { useAuthStore } from '@/store/auth-store';
import { useCanvasStore } from '@/store/canvas-store';
import { useComponentStore } from '@/store/component-store';

// ─── Color palette for variant dots ──────────────────────────────────────────

const VARIANT_COLORS = [
  '#6366F1', '#EC4899', '#F59E0B', '#10B981', '#3B82F6',
  '#EF4444', '#8B5CF6', '#14B8A6', '#F97316', '#06B6D4',
];

function getVariantColor(index: number): string {
  return VARIANT_COLORS[index % VARIANT_COLORS.length];
}

// ─── Override Property Editor ────────────────────────────────────────────────

function OverridePropertyEditor({
  keyName,
  value,
  onChange,
  onRemove,
  locale,
}: {
  keyName: string;
  value: unknown;
  onChange: (key: string, value: unknown) => void;
  onRemove: (key: string) => void;
  locale: Locale;
}) {
  const strValue = String(value ?? '');
  const isColor = typeof value === 'string' && /^#[0-9A-Fa-f]{3,8}$/.test(strValue);
  const isSizeKey = keyName === 'width' || keyName === 'height' || keyName === 'fontSize' || keyName === 'fontWeight';
  const isNumber = typeof value === 'number' || isSizeKey;

  return (
    <div className="flex items-center gap-2 py-1.5">
      <span className="text-[10px] font-mono text-muted-foreground w-20 shrink-0 truncate" title={keyName}>
        {keyName}
      </span>
      <div className="flex-1 min-w-0">
        {isColor ? (
          <div className="flex items-center gap-1.5">
            <input
              type="color"
              value={strValue}
              onChange={(e) => onChange(keyName, e.target.value)}
              className="h-6 w-6 rounded border cursor-pointer bg-transparent shrink-0"
            />
            <Input
              value={strValue}
              onChange={(e) => onChange(keyName, e.target.value)}
              className="h-6 text-[10px] font-mono"
            />
          </div>
        ) : isNumber ? (
          <Input
            type="number"
            value={Number(value) || 0}
            onChange={(e) => onChange(keyName, Number(e.target.value))}
            className="h-6 text-[10px] font-mono"
          />
        ) : (
          <Input
            value={strValue}
            onChange={(e) => onChange(keyName, e.target.value)}
            className="h-6 text-[10px]"
          />
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-5 w-5 shrink-0 text-muted-foreground hover:text-destructive"
        onClick={() => onRemove(keyName)}
      >
        <X className="h-2.5 w-2.5" />
      </Button>
    </div>
  );
}

// ─── Add Custom Override Row ──────────────────────────────────────────────────

function AddOverrideRow({ onAdd, locale }: { onAdd: (key: string, value: string) => void; locale: Locale }) {
  const [newKey, setNewKey] = useState('');
  const [newVal, setNewVal] = useState('');

  const handleAdd = () => {
    if (!newKey.trim()) return;
    onAdd(newKey.trim(), newVal);
    setNewKey('');
    setNewVal('');
  };

  return (
    <div className="flex items-center gap-1.5 pt-1">
      <Input
        value={newKey}
        onChange={(e) => setNewKey(e.target.value)}
        placeholder={t('variants.property', locale)}
        className="h-6 text-[10px] flex-1"
        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
      />
      <Input
        value={newVal}
        onChange={(e) => setNewVal(e.target.value)}
        placeholder="..."
        className="h-6 text-[10px] flex-1"
        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
      />
      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={handleAdd}>
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
}

// ─── Variant Card ─────────────────────────────────────────────────────────────

function VariantCard({
  variant,
  index,
  isSelected,
  onSelect,
  onApply,
  onDelete,
  locale,
}: {
  variant: ComponentVariant;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onApply: () => void;
  onDelete: () => void;
  locale: Locale;
}) {
  const color = getVariantColor(index);

  return (
    <div
      className={cn(
        'neu-card rounded-lg p-2.5 transition-all cursor-pointer group',
        isSelected && 'ring-1 ring-primary/30 bg-primary/[0.03]',
      )}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="h-3.5 w-3.5 rounded-full shrink-0 border border-white/50"
            style={{ backgroundColor: color }}
          />
          <div className="min-w-0">
            <p className="text-xs font-medium truncate">{variant.name}</p>
            <p className="text-[10px] text-muted-foreground">{variant.property}</p>
          </div>
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-muted-foreground hover:text-primary"
            onClick={(e) => { e.stopPropagation(); onApply(); }}
            title={t('variants.apply', locale)}
          >
            <Check className="h-2.5 w-2.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-muted-foreground hover:text-destructive"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            title={t('variants.delete', locale)}
          >
            <X className="h-2.5 w-2.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Override Editor Section ──────────────────────────────────────────────────

function OverrideEditor({
  variant,
  onUpdateOverrides,
  locale,
}: {
  variant: ComponentVariant;
  onUpdateOverrides: (overrides: Record<string, unknown>) => void;
  locale: Locale;
}) {
  const overrides = variant.instanceOverrides;

  const handleChange = (key: string, value: unknown) => {
    onUpdateOverrides({ ...overrides, [key]: value });
  };

  const handleRemove = (key: string) => {
    const next = { ...overrides };
    delete next[key];
    onUpdateOverrides(next);
  };

  const handleAdd = (key: string, value: string) => {
    onUpdateOverrides({ ...overrides, [key]: value });
  };

  const entries = Object.entries(overrides);

  if (entries.length === 0) return null;

  return (
    <div className="neu-flat rounded-lg p-2.5 mt-3">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Palette className="h-3 w-3 text-muted-foreground" />
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          {t('variants.overrides', locale)}
        </span>
        <Badge variant="secondary" className="ml-auto h-4 px-1 text-[9px]">
          {entries.length}
        </Badge>
      </div>
      <div className="divide-y divide-border/50">
        {entries.map(([key, val]) => (
          <OverridePropertyEditor
            key={key}
            keyName={key}
            value={val}
            onChange={handleChange}
            onRemove={handleRemove}
            locale={locale}
          />
        ))}
      </div>
      <AddOverrideRow onAdd={handleAdd} locale={locale} />
    </div>
  );
}

// ─── Main Variants Panel ─────────────────────────────────────────────────────

export function VariantsPanel() {
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  const selectedIds = useCanvasStore((s) => s.selectedIds);
  const elements = useCanvasStore((s) => s.elements);
  const updateElement = useCanvasStore((s) => s.updateElement);
  const updateElementStyles = useCanvasStore((s) => s.updateElementStyles);

  const components = useComponentStore((s) => s.components);
  const addVariant = useComponentStore((s) => s.addVariant);
  const removeVariant = useComponentStore((s) => s.removeVariant);

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVariantName, setNewVariantName] = useState('');
  const [newVariantProperty, setNewVariantProperty] = useState('');

  // Find selected element and its component
  const { selectedElement, componentDef } = useMemo(() => {
    const id = selectedIds[0];
    if (!id) return { selectedElement: null, componentDef: null };
    const el = elements.find((e) => e.id === id);
    if (!el || !el.componentId) return { selectedElement: el, componentDef: null };
    const comp = useComponentStore.getState().getComponentByMasterId(el.componentId);
    return { selectedElement: el, componentDef: comp ?? null };
  }, [selectedIds, elements, components]);

  const variants = componentDef?.variants ?? [];

  // Capture current element styles as overrides
  const captureCurrentStyles = (): Record<string, unknown> => {
    if (!selectedElement) return {};
    const overrides: Record<string, unknown> = {};
    const styles = selectedElement.styles;

    // Capture color/fill
    if (selectedElement.color) {
      overrides.color = selectedElement.color;
    }
    if (styles?.fills?.[0]?.color) {
      overrides.fill = styles.fills[0].color;
    }
    // Capture size
    overrides.width = selectedElement.width;
    overrides.height = selectedElement.height;
    // Capture content text
    if (selectedElement.content) {
      overrides.content = selectedElement.content;
    }
    // Capture typography
    if (styles?.typography) {
      if (styles.typography.color) overrides.textColor = styles.typography.color;
      if (styles.typography.fontSize) overrides.fontSize = styles.typography.fontSize;
      if (styles.typography.fontWeight) overrides.fontWeight = styles.typography.fontWeight;
    }
    // Capture corner radius
    if (styles?.borderRadius) {
      overrides.borderRadius = styles.borderRadius;
    }
    if (styles?.cornerRadius?.topLeft) {
      overrides.cornerRadius = `${styles.cornerRadius.topLeft}`;
    }

    return overrides;
  };

  const handleAddVariant = () => {
    if (!componentDef || !newVariantName.trim()) return;

    const variant: ComponentVariant = {
      id: `variant-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: newVariantName.trim(),
      property: newVariantProperty.trim() || 'Default',
      instanceOverrides: captureCurrentStyles(),
    };

    addVariant(componentDef.id, variant);
    setNewVariantName('');
    setNewVariantProperty('');
    setShowAddForm(false);
    setSelectedVariantId(variant.id);
  };

  const handleApplyVariant = (variant: ComponentVariant) => {
    if (!selectedElement) return;
    const overrides = variant.instanceOverrides;

    // Apply overrides to the selected element
    const updates: Partial<BoardElement> = {};
    const styleUpdates: Record<string, unknown> = {};

    for (const [key, val] of Object.entries(overrides)) {
      if (key === 'width' || key === 'height' || key === 'content' || key === 'color') {
        (updates as Record<string, unknown>)[key] = val;
      } else if (key === 'fill') {
        // Apply as fill color
        if (selectedElement.styles?.fills?.[0]) {
          styleUpdates.fills = [{ ...selectedElement.styles.fills[0], color: String(val) }];
        }
      } else if (key === 'textColor') {
        if (selectedElement.styles?.typography) {
          styleUpdates.typography = { ...selectedElement.styles.typography, color: String(val) };
        }
      } else if (key === 'fontSize') {
        if (selectedElement.styles?.typography) {
          styleUpdates.typography = { ...selectedElement.styles.typography, fontSize: Number(val) };
        }
      } else if (key === 'fontWeight') {
        if (selectedElement.styles?.typography) {
          styleUpdates.typography = { ...selectedElement.styles.typography, fontWeight: String(val) };
        }
      } else if (key === 'borderRadius') {
        styleUpdates.borderRadius = Number(val);
      } else if (key === 'cornerRadius') {
        const r = Number(val);
        styleUpdates.cornerRadius = { topLeft: r, topRight: r, bottomRight: r, bottomLeft: r };
      } else {
        styleUpdates[key] = val;
      }
    }

    if (Object.keys(updates).length > 0) {
      updateElement(selectedElement.id, updates);
    }
    if (Object.keys(styleUpdates).length > 0) {
      updateElementStyles(selectedElement.id, styleUpdates);
    }

    // Also store componentOverrides on the instance for tracking
    updateElement(selectedElement.id, {
      componentOverrides: { ...overrides },
    });
  };

  const handleDeleteVariant = (variantId: string) => {
    if (!componentDef) return;
    removeVariant(componentDef.id, variantId);
    if (selectedVariantId === variantId) {
      setSelectedVariantId(null);
    }
  };

  const handleUpdateOverrides = (newOverrides: Record<string, unknown>) => {
    if (!componentDef) return;
    // Update the variant in the store by removing and re-adding
    const variant = variants.find((v) => v.id === selectedVariantId);
    if (!variant) return;
    const updated: ComponentVariant = { ...variant, instanceOverrides: newOverrides };
    removeVariant(componentDef.id, selectedVariantId!);
    addVariant(componentDef.id, updated);
  };

  const selectedVariant = variants.find((v) => v.id === selectedVariantId);

  // ─── Empty state: no element selected ────────────────────────────────────
  if (!selectedElement) {
    return (
      <ScrollArea className="h-full">
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <Box className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-xs text-muted-foreground">{t('variants.empty', locale)}</p>
        </div>
      </ScrollArea>
    );
  }

  // ─── Empty state: element has no componentId ───────────────────────────
  if (!selectedElement.componentId || !componentDef) {
    return (
      <ScrollArea className="h-full">
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <Box className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-xs text-muted-foreground">{t('variants.empty', locale)}</p>
          <p className="text-[10px] text-muted-foreground mt-1">
            {selectedElement.name || selectedElement.type}
          </p>
        </div>
      </ScrollArea>
    );
  }

  // ─── Active component selected ──────────────────────────────────────────
  return (
    <ScrollArea className="h-full">
      <div className="p-3 space-y-3">
        {/* Component Info Header */}
        <div className="neu-card rounded-lg p-3">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate">{componentDef.name}</p>
              <p className="text-[10px] text-muted-foreground font-mono">
                {t('variants.masterElement', locale)}: {selectedElement.componentId.slice(0, 12)}...
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-[10px] shrink-0 neu-icon-btn"
            >
              <Pencil className="h-3 w-3" />
              {t('variants.editMaster', locale)}
            </Button>
          </div>

          {/* Applied variant badge */}
          {selectedElement.componentOverrides && Object.keys(selectedElement.componentOverrides).length > 0 && (
            <Badge variant="secondary" className="text-[10px] px-2 h-5 w-full justify-center">
              {selectedVariant
                ? t('variants.appliedVariant', locale, { name: selectedVariant.name })
                : t('variants.overrides', locale)}
            </Badge>
          )}
        </div>

        {/* Variants List */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              {t('variants.title', locale)}
            </span>
            <Badge variant="secondary" className="h-4 px-1.5 text-[9px]">
              {variants.length}
            </Badge>
          </div>

          {variants.length === 0 && !showAddForm ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Palette className="mb-2 h-7 w-7 text-muted-foreground/30" />
              <p className="text-[10px] text-muted-foreground">{t('variants.noVariants', locale)}</p>
            </div>
          ) : (
            variants.map((v, i) => (
              <VariantCard
                key={v.id}
                variant={v}
                index={i}
                isSelected={v.id === selectedVariantId}
                onSelect={() => setSelectedVariantId(v.id === selectedVariantId ? null : v.id)}
                onApply={() => handleApplyVariant(v)}
                onDelete={() => handleDeleteVariant(v.id)}
                locale={locale}
              />
            ))
          )}
        </div>

        {/* Add Variant Form */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full h-7 gap-1 text-[10px] text-muted-foreground border border-dashed border-border/50 rounded-lg hover:border-primary/30 hover:text-primary neu-flat"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus className="h-3 w-3" />
          {t('variants.addVariant', locale)}
        </Button>

        {showAddForm && (
          <div className="neu-card rounded-lg p-3 space-y-2">
            <Input
              value={newVariantName}
              onChange={(e) => setNewVariantName(e.target.value)}
              placeholder={t('variants.variantName', locale)}
              className="h-7 text-xs"
              onKeyDown={(e) => e.key === 'Enter' && handleAddVariant()}
            />
            <Input
              value={newVariantProperty}
              onChange={(e) => setNewVariantProperty(e.target.value)}
              placeholder={t('variants.property', locale)}
              className="h-7 text-xs"
              onKeyDown={(e) => e.key === 'Enter' && handleAddVariant()}
            />
            <div className="flex justify-end gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => { setShowAddForm(false); setNewVariantName(''); setNewVariantProperty(''); }}
              >
                <X className="h-3 w-3 mr-1" />
                {t('variants.delete', locale)}
              </Button>
              <Button
                size="sm"
                className="h-7 text-xs btn-neu"
                onClick={handleAddVariant}
                disabled={!newVariantName.trim()}
              >
                <Plus className="h-3 w-3 mr-1" />
                {t('variants.addVariant', locale)}
              </Button>
            </div>
          </div>
        )}

        {/* Selected Variant Override Editor */}
        {selectedVariant && (
          <OverrideEditor
            variant={selectedVariant}
            onUpdateOverrides={handleUpdateOverrides}
            locale={locale}
          />
        )}
      </div>
    </ScrollArea>
  );
}
