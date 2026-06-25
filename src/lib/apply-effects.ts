import type { ElementEffect, AdvancedFill } from './effects-types';

/**
 * Build a CSS filter string from an array of effects.
 */
export function buildFilterString(effects: ElementEffect[]): string {
  const parts: string[] = [];

  for (const fx of effects) {
    if (!fx.enabled) continue;
    const p = fx.params;

    switch (fx.type) {
      case 'blur':
        parts.push(`blur(${Number(p.value) || 0}px)`);
        break;
      case 'brightness':
        parts.push(`brightness(${(Number(p.value) || 100) / 100})`);
        break;
      case 'contrast':
        parts.push(`contrast(${(Number(p.value) || 100) / 100})`);
        break;
      case 'saturate':
        parts.push(`saturate(${(Number(p.value) || 100) / 100})`);
        break;
      case 'hueRotate':
        parts.push(`hue-rotate(${Number(p.value) || 0}deg)`);
        break;
      case 'grayscale':
        parts.push(`grayscale(${(Number(p.value) || 0) / 100})`);
        break;
      case 'sepia':
        parts.push(`sepia(${(Number(p.value) || 0) / 100})`);
        break;
      case 'invert':
        parts.push(`invert(${(Number(p.value) || 0) / 100})`);
        break;
      case 'dropShadow': {
        const x = Number(p.x) || 0;
        const y = Number(p.y) || 4;
        const blur = Number(p.blur) || 10;
        const color = String(p.color || 'rgba(0,0,0,0.2)');
        parts.push(`drop-shadow(${x}px ${y}px ${blur}px ${color})`);
        break;
      }
      case 'glow': {
        const intensity = Number(p.intensity) || 10;
        const color = String(p.color || 'rgba(99,102,241,0.5)');
        parts.push(`drop-shadow(0 0 ${intensity}px ${color})`);
        break;
      }
      case 'pixelate': {
        const size = Number(p.value) || 4;
        // pixelate is done via CSS, not filter
        break;
      }
      case 'noise':
      case 'duotone':
      case 'chromatic':
      case 'vignette':
        // These are handled via box-shadow or overlay, not filter
        break;
    }
  }

  return parts.length > 0 ? parts.join(' ') : 'none';
}

/**
 * Build box-shadow string from shadow-related effects.
 */
export function buildBoxShadow(effects: ElementEffect[]): string {
  const shadows: string[] = [];

  for (const fx of effects) {
    if (!fx.enabled) continue;
    const p = fx.params;

    if (fx.type === 'glow') {
      const intensity = Number(p.intensity) || 10;
      const color = String(p.color || 'rgba(99,102,241,0.5)');
      shadows.push(`0 0 ${intensity}px ${color}`);
      shadows.push(`0 0 ${intensity * 2}px ${color.replace(/[\d.]+\)$/, '0.3)')}`);
    }

    if (fx.type === 'vignette') {
      const intensity = Number(p.intensity) || 40;
      shadows.push(`inset 0 0 ${intensity}px rgba(0,0,0,0.6)`);
    }
  }

  return shadows.length > 0 ? shadows.join(', ') : 'none';
}

/**
 * Build CSS background from AdvancedFill.
 */
export function buildFillStyle(fill: AdvancedFill): string {
  switch (fill.type) {
    case 'solid':
      return fill.color1;
    case 'linear-gradient': {
      const angle = fill.angle ?? 135;
      if (fill.color3) {
        return `linear-gradient(${angle}deg, ${fill.color1}, ${fill.color2}, ${fill.color3})`;
      }
      return `linear-gradient(${angle}deg, ${fill.color1}, ${fill.color2})`;
    }
    case 'radial-gradient': {
      if (fill.color3) {
        return `radial-gradient(circle, ${fill.color1}, ${fill.color2}, ${fill.color3})`;
      }
      return `radial-gradient(circle, ${fill.color1}, ${fill.color2})`;
    }
    case 'conic-gradient': {
      const angle = fill.angle ?? 0;
      if (fill.color3) {
        return `conic-gradient(from ${angle}deg, ${fill.color1}, ${fill.color2}, ${fill.color3}, ${fill.color1})`;
      }
      return `conic-gradient(from ${angle}deg, ${fill.color1}, ${fill.color2}, ${fill.color1})`;
    }
    case 'mesh-gradient':
      return `linear-gradient(${fill.angle ?? 135}deg, ${fill.color1}, ${fill.color2})`;
    case 'pattern': {
      switch (fill.patternType) {
        case 'dots':
          return `radial-gradient(circle, ${fill.color2} 1.5px, transparent 1.5px), ${fill.color1}`;
        case 'grid':
          return `linear-gradient(${fill.color2} 1px, transparent 1px), linear-gradient(90deg, ${fill.color2} 1px, transparent 1px), ${fill.color1}`;
        case 'diagonal':
          return `repeating-linear-gradient(45deg, transparent, transparent 5px, ${fill.color2} 5px, ${fill.color2} 6px), ${fill.color1}`;
        case 'cross':
          return `linear-gradient(${fill.color2} 1px, transparent 1px), linear-gradient(90deg, ${fill.color2} 1px, transparent 1px), radial-gradient(circle at center, transparent 3px, ${fill.color1} 3px, ${fill.color1})`;
        case 'zigzag':
          return `linear-gradient(135deg, ${fill.color1} 25%, ${fill.color2} 25%, ${fill.color2} 50%, ${fill.color1} 50%, ${fill.color1} 75%, ${fill.color2} 75%)`;
        default:
          return fill.color1;
      }
    }
    default:
      return fill.color1;
  }
}

/**
 * Get background-size for pattern fills.
 */
export function getPatternSize(fill: AdvancedFill): string | undefined {
  if (fill.type === 'pattern') {
    switch (fill.patternType) {
      case 'dots':
        return '8px 8px';
      case 'grid':
        return '12px 12px';
      case 'diagonal':
        return 'auto';
      case 'cross':
        return '12px 12px';
      case 'zigzag':
        return '8px 8px';
      default:
        return undefined;
    }
  }
  return undefined;
}

/**
 * Combine all effects into CSS properties for a canvas element.
 */
export function applyElementStyles(
  _elementId: string,
  effects: ElementEffect[],
  fill?: AdvancedFill
): React.CSSProperties {
  const styles: React.CSSProperties = {};

  const filterStr = buildFilterString(effects);
  if (filterStr !== 'none') {
    styles.filter = filterStr;
  }

  const shadowStr = buildBoxShadow(effects);
  if (shadowStr !== 'none') {
    styles.boxShadow = shadowStr;
  }

  if (fill && fill.type !== 'solid') {
    styles.background = buildFillStyle(fill);
    const patternSize = getPatternSize(fill);
    if (patternSize) {
      styles.backgroundSize = patternSize;
    }
  }

  return styles;
}