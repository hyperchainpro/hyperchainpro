'use client';

import { useMemo, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useCanvasStore } from '@/store/canvas-store';
import { t } from '@/lib/i18n';
import { useAuthStore } from '@/store/auth-store';
import type { Locale } from '@/lib/i18n';
import type { BoardElement } from '@/lib/types';
import { useState } from 'react';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [text]);

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-6 w-6 shrink-0"
      onClick={handleCopy}
    >
      {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
    </Button>
  );
}

function generateCSS(el: BoardElement): string {
  const lines: string[] = [];
  lines.push(`position: absolute;`);
  lines.push(`left: ${el.x}px;`);
  lines.push(`top: ${el.y}px;`);
  lines.push(`width: ${el.width}px;`);
  lines.push(`height: ${el.height}px;`);

  if (el.rotation) {
    lines.push(`transform: rotate(${el.rotation}deg);`);
  }

  const opacity = el.styles?.opacity;
  if (typeof opacity === 'number') {
    lines.push(`opacity: ${opacity};`);
  }

  const radius = el.styles?.cornerRadius;
  if (radius) {
    const { topLeft, topRight, bottomRight, bottomLeft } = radius;
    lines.push(`border-radius: ${topLeft}px ${topRight}px ${bottomRight}px ${bottomLeft}px;`);
  }

  const fills = el.styles?.fills;
  if (fills?.length && fills[0].type === 'solid' && fills[0].color) {
    lines.push(`background: ${fills[0].color};`);
  }

  const strokes = el.styles?.strokes;
  if (strokes?.length && strokes[0].width > 0) {
    lines.push(`border: ${strokes[0].width}px ${strokes[0].style} ${strokes[0].color};`);
  }

  const typo = el.styles?.typography;
  if (typo) {
    lines.push(`font-family: ${typo.fontFamily};`);
    lines.push(`font-size: ${typo.fontSize}px;`);
    lines.push(`font-weight: ${typo.fontWeight};`);
    lines.push(`color: ${typo.color};`);
    lines.push(`text-align: ${typo.textAlign};`);
    if (typo.lineHeight !== 1.5) lines.push(`line-height: ${typo.lineHeight};`);
    if (typo.letterSpacing !== 0) lines.push(`letter-spacing: ${typo.letterSpacing}px;`);
  }

  return lines.join('\n');
}

function generateTailwind(el: BoardElement): string {
  const classes: string[] = ['absolute'];

  if (el.rotation) classes.push(`rotate-[${el.rotation}deg]`);

  const opacity = el.styles?.opacity;
  if (typeof opacity === 'number' && opacity < 1) {
    classes.push(`opacity-[${Math.round(opacity * 100)}%]`);
  }

  const radius = el.styles?.cornerRadius;
  if (radius) {
    const vals = [radius.topLeft, radius.topRight, radius.bottomRight, radius.bottomLeft];
    if (vals.every((v) => v === vals[0] && v > 0)) {
      classes.push(`rounded-[${vals[0]}px]`);
    } else if (vals.some((v) => v > 0)) {
      classes.push(`rounded-tl-[${vals[0]}px] rounded-tr-[${vals[1]}px] rounded-br-[${vals[2]}px] rounded-bl-[${vals[3]}px]`);
    }
  }

  // Size classes (arbitrary values for non-standard sizes)
  if (el.width % 4 === 0 && el.width >= 16 && el.width <= 96) {
    classes.push(`w-${el.width / 4}`);
  } else {
    classes.push(`w-[${el.width}px]`);
  }
  if (el.height % 4 === 0 && el.height >= 16 && el.height <= 96) {
    classes.push(`h-${el.height / 4}`);
  } else {
    classes.push(`h-[${el.height}px]`);
  }

  // Position
  classes.push(`left-[${el.x}px]`);
  classes.push(`top-[${el.y}px]`);

  return classes.join(' ');
}

export function DevModePanel() {
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  const selectedIds = useCanvasStore((s) => s.selectedIds);
  const elements = useCanvasStore((s) => s.elements);

  const selectedElement = useMemo(
    () => (selectedIds.length === 1 ? elements.find((e) => e.id === selectedIds[0]) : null),
    [elements, selectedIds],
  );

  if (!selectedElement) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <p className="text-sm text-muted-foreground">{t('devMode.noSelection', locale)}</p>
      </div>
    );
  }

  const el = selectedElement;
  const cssCode = generateCSS(el);
  const tailwindClass = generateTailwind(el);

  const specs = [
    { label: t('devMode.type', locale), value: el.type },
    { label: 'X', value: `${el.x}px` },
    { label: 'Y', value: `${el.y}px` },
    { label: t('devMode.width', locale), value: `${el.width}px` },
    { label: t('devMode.height', locale), value: `${el.height}px` },
    { label: t('devMode.rotation', locale), value: `${el.rotation}°` },
    { label: t('devMode.opacity', locale), value: el.styles?.opacity != null ? String(el.styles.opacity) : '1' },
    {
      label: t('devMode.cornerRadius', locale),
      value: el.styles?.cornerRadius
        ? `${el.styles.cornerRadius.topLeft} / ${el.styles.cornerRadius.topRight} / ${el.styles.cornerRadius.bottomRight} / ${el.styles.cornerRadius.bottomLeft}`
        : '0',
    },
  ];

  return (
    <ScrollArea className="h-full">
      <div className="p-3 space-y-3">
        {/* Element name */}
        <div className="neu-card rounded-lg p-3">
          <p className="text-xs font-medium text-muted-foreground mb-1">{t('devMode.element', locale)}</p>
          <p className="text-sm font-semibold">{el.name || el.id}</p>
        </div>

        {/* Specs table */}
        <div className="neu-card rounded-lg p-3">
          <p className="text-xs font-medium text-muted-foreground mb-2">{t('devMode.specs', locale)}</p>
          <div className="space-y-1">
            {specs.map((spec) => (
              <div key={spec.label} className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">{spec.label}</span>
                <span className="font-mono">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CSS Code */}
        <div className="neu-card rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground">CSS</p>
            <CopyButton text={cssCode} />
          </div>
          <pre className="text-[11px] font-mono bg-muted/50 rounded-md p-2 overflow-x-auto whitespace-pre-wrap break-all text-foreground/80">
            {cssCode}
          </pre>
        </div>

        {/* Tailwind classes */}
        <div className="neu-card rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground">Tailwind</p>
            <CopyButton text={tailwindClass} />
          </div>
          <code className="block text-[11px] font-mono bg-muted/50 rounded-md p-2 overflow-x-auto whitespace-pre-wrap break-all text-foreground/80">
            {tailwindClass}
          </code>
        </div>
      </div>
    </ScrollArea>
  );
}