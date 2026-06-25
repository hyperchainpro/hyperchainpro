import type { EffectPreset } from './effects-types';

export const EFFECT_PRESETS: EffectPreset[] = [
  // ── Basic ──────────────────────────────────────────────────────────
  {
    name: 'glassmorphism',
    description: 'Frosted glass effect',
    category: 'basic',
    effects: [
      { id: 'g1', type: 'blur', enabled: true, params: { value: 16 }, order: 0 },
      { id: 'g2', type: 'brightness', enabled: true, params: { value: 110 }, order: 1 },
    ],
    preview: 'backdrop-filter:blur(8px);background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.2)',
  },
  {
    name: 'soft-shadow',
    description: 'Soft elevated shadow',
    category: 'basic',
    effects: [
      { id: 'ss1', type: 'dropShadow', enabled: true, params: { x: 0, y: 4, blur: 20, color: 'rgba(0,0,0,0.15)' }, order: 0 },
    ],
    preview: 'box-shadow:0 4px 20px rgba(0,0,0,0.15)',
  },
  {
    name: 'hard-shadow',
    description: 'Hard offset shadow',
    category: 'basic',
    effects: [
      { id: 'hs1', type: 'dropShadow', enabled: true, params: { x: 4, y: 4, blur: 0, color: 'rgba(0,0,0,0.3)' }, order: 0 },
    ],
    preview: 'box-shadow:4px 4px 0 rgba(0,0,0,0.3)',
  },
  {
    name: 'neon-glow',
    description: 'Neon light glow effect',
    category: 'basic',
    effects: [
      { id: 'ng1', type: 'glow', enabled: true, params: { intensity: 15, color: 'rgba(0,255,136,0.6)' }, order: 0 },
      { id: 'ng2', type: 'brightness', enabled: true, params: { value: 105 }, order: 1 },
    ],
    preview: 'box-shadow:0 0 10px rgba(0,255,136,0.6),0 0 30px rgba(0,255,136,0.3),0 0 60px rgba(0,255,136,0.1)',
  },
  {
    name: 'vintage',
    description: 'Retro vintage look',
    category: 'basic',
    effects: [
      { id: 'v1', type: 'sepia', enabled: true, params: { value: 40 }, order: 0 },
      { id: 'v2', type: 'brightness', enabled: true, params: { value: 95 }, order: 1 },
      { id: 'v3', type: 'contrast', enabled: true, params: { value: 90 }, order: 2 },
    ],
    preview: 'filter:sepia(0.4) brightness(0.95) contrast(0.9)',
  },
  {
    name: 'high-contrast',
    description: 'Enhanced contrast',
    category: 'basic',
    effects: [
      { id: 'hc1', type: 'contrast', enabled: true, params: { value: 150 }, order: 0 },
      { id: 'hc2', type: 'brightness', enabled: true, params: { value: 105 }, order: 1 },
    ],
    preview: 'filter:contrast(1.5) brightness(1.05)',
  },
  {
    name: 'grayscale',
    description: 'Black and white',
    category: 'basic',
    effects: [
      { id: 'gs1', type: 'grayscale', enabled: true, params: { value: 100 }, order: 0 },
    ],
    preview: 'filter:grayscale(1)',
  },
  {
    name: 'invert',
    description: 'Inverted colors',
    category: 'basic',
    effects: [
      { id: 'in1', type: 'invert', enabled: true, params: { value: 100 }, order: 0 },
    ],
    preview: 'filter:invert(1)',
  },

  // ── Color ──────────────────────────────────────────────────────────
  {
    name: 'warm-tone',
    description: 'Warm color shift',
    category: 'color',
    effects: [
      { id: 'wt1', type: 'hueRotate', enabled: true, params: { value: -15 }, order: 0 },
      { id: 'wt2', type: 'saturate', enabled: true, params: { value: 130 }, order: 1 },
      { id: 'wt3', type: 'brightness', enabled: true, params: { value: 105 }, order: 2 },
    ],
    preview: 'filter:hue-rotate(-15deg) saturate(1.3) brightness(1.05)',
  },
  {
    name: 'cool-tone',
    description: 'Cool blue shift',
    category: 'color',
    effects: [
      { id: 'ct1', type: 'hueRotate', enabled: true, params: { value: 20 }, order: 0 },
      { id: 'ct2', type: 'saturate', enabled: true, params: { value: 110 }, order: 1 },
      { id: 'ct3', type: 'brightness', enabled: true, params: { value: 100 }, order: 2 },
    ],
    preview: 'filter:hue-rotate(20deg) saturate(1.1)',
  },
  {
    name: 'saturate-boost',
    description: 'Vivid colors',
    category: 'color',
    effects: [
      { id: 'sb1', type: 'saturate', enabled: true, params: { value: 200 }, order: 0 },
      { id: 'sb2', type: 'contrast', enabled: true, params: { value: 110 }, order: 1 },
    ],
    preview: 'filter:saturate(2) contrast(1.1)',
  },
  {
    name: 'desaturate',
    description: 'Muted colors',
    category: 'color',
    effects: [
      { id: 'ds1', type: 'saturate', enabled: true, params: { value: 50 }, order: 0 },
    ],
    preview: 'filter:saturate(0.5)',
  },
  {
    name: 'duotone-sunset',
    description: 'Sunset duotone',
    category: 'color',
    effects: [
      { id: 'dus1', type: 'duotone', enabled: true, params: { color1: '#ff6b35', color2: '#1a0533' }, order: 0 },
    ],
    preview: 'background:linear-gradient(135deg,#ff6b35,#1a0533);mix-blend-mode:color',
  },
  {
    name: 'duotone-ocean',
    description: 'Ocean duotone',
    category: 'color',
    effects: [
      { id: 'doc1', type: 'duotone', enabled: true, params: { color1: '#00b4d8', color2: '#03045e' }, order: 0 },
    ],
    preview: 'background:linear-gradient(135deg,#00b4d8,#03045e);mix-blend-mode:color',
  },

  // ── Texture ────────────────────────────────────────────────────────
  {
    name: 'noise',
    description: 'Film grain noise',
    category: 'texture',
    effects: [
      { id: 'n1', type: 'noise', enabled: true, params: { intensity: 30 }, order: 0 },
    ],
    preview: 'opacity:0.9;background-image:url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.15\'/%3E%3C/svg%3E")',
  },
  {
    name: 'dot-pattern',
    description: 'Dot grid overlay',
    category: 'texture',
    effects: [
      { id: 'dp1', type: 'noise', enabled: true, params: { intensity: 10 }, order: 0 },
    ],
    preview: 'background-image:radial-gradient(circle,currentColor 1px,transparent 1px);background-size:8px 8px;opacity:0.15',
  },
  {
    name: 'grid-pattern',
    description: 'Grid line overlay',
    category: 'texture',
    effects: [
      { id: 'gp1', type: 'noise', enabled: true, params: { intensity: 10 }, order: 0 },
    ],
    preview: 'background-image:linear-gradient(currentColor 1px,transparent 1px),linear-gradient(90deg,currentColor 1px,transparent 1px);background-size:12px 12px;opacity:0.1',
  },
  {
    name: 'diagonal-lines',
    description: 'Diagonal stripe pattern',
    category: 'texture',
    effects: [
      { id: 'dl1', type: 'noise', enabled: true, params: { intensity: 10 }, order: 0 },
    ],
    preview: 'background-image:repeating-linear-gradient(45deg,transparent,transparent 4px,currentColor 4px,currentColor 5px);opacity:0.1',
  },

  // ── Creative ───────────────────────────────────────────────────────
  {
    name: 'vignette',
    description: 'Dark edge vignette',
    category: 'creative',
    effects: [
      { id: 'vig1', type: 'vignette', enabled: true, params: { intensity: 40 }, order: 0 },
    ],
    preview: 'box-shadow:inset 0 0 60px rgba(0,0,0,0.6)',
  },
  {
    name: 'holographic',
    description: 'Rainbow holographic',
    category: 'creative',
    effects: [
      { id: 'holo1', type: 'hueRotate', enabled: true, params: { value: 0 }, order: 0 },
    ],
    fill: {
      type: 'linear-gradient',
      color1: '#ff0080',
      color2: '#7928ca',
      color3: '#00d4ff',
      angle: 135,
    },
    preview: 'background:linear-gradient(135deg,#ff0080,#7928ca,#00d4ff);opacity:0.7',
  },
  {
    name: 'glitch',
    description: 'Glitch displacement',
    category: 'creative',
    effects: [
      { id: 'gl1', type: 'chromatic', enabled: true, params: { value: 3 }, order: 0 },
      { id: 'gl2', type: 'contrast', enabled: true, params: { value: 120 }, order: 1 },
    ],
    preview: 'text-shadow:3px 0 #ff0000,-3px 0 #00ffff;filter:contrast(1.2)',
  },
  {
    name: 'aurora',
    description: 'Northern lights gradient',
    category: 'creative',
    effects: [],
    fill: {
      type: 'linear-gradient',
      color1: '#00ff87',
      color2: '#60efff',
      angle: 135,
    },
    preview: 'background:linear-gradient(135deg,#00ff87,#60efff);opacity:0.8',
  },
];

export function getPresetByName(name: string): EffectPreset | undefined {
  return EFFECT_PRESETS.find((p) => p.name === name);
}

export const EFFECT_CATEGORIES: { key: EffectPreset['category']; label: string }[] = [
  { key: 'basic', label: 'Basic' },
  { key: 'color', label: 'Color' },
  { key: 'texture', label: 'Texture' },
  { key: 'creative', label: 'Creative' },
];