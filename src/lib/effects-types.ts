// ─── LayerBoard Effects & Advanced Fills — Type Definitions ────────────────

export type EffectType =
  | 'blur'
  | 'brightness'
  | 'contrast'
  | 'saturate'
  | 'hueRotate'
  | 'grayscale'
  | 'sepia'
  | 'invert'
  | 'dropShadow'
  | 'glow'
  | 'noise'
  | 'duotone'
  | 'vignette'
  | 'pixelate'
  | 'chromatic';

export type FillType = 'solid' | 'linear-gradient' | 'radial-gradient' | 'conic-gradient' | 'mesh-gradient' | 'pattern';

export interface ElementEffect {
  id: string;
  type: EffectType;
  enabled: boolean;
  params: Record<string, number | string>;
  order: number;
}

export interface AdvancedFill {
  type: FillType;
  color1: string;
  color2: string;
  color3?: string;
  angle?: number;
  positions?: { x: number; y: number }[];
  patternType?: 'dots' | 'grid' | 'diagonal' | 'cross' | 'zigzag';
}

export interface EffectPreset {
  name: string;
  description: string;
  category: 'basic' | 'color' | 'texture' | 'creative';
  effects: ElementEffect[];
  fill?: AdvancedFill;
  preview: string; // inline CSS for preview card
}