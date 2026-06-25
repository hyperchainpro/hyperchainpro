// ─── LayerBoard Creative Tools — Barrel Export ──────────────────────────
//
// Inspired by modern design tools but 100% original implementation.
// These features add motion, effects, code layers, and generative design
// capabilities to the LayerBoard canvas editor.
//
// Legal note: Concepts (animation, effects, code editing, generative design)
// are not copyrightable. Only specific code, assets, and trademarks are
// protected. All code below is original work.

// Motion
export { MotionPanel } from '@/components/editor/motion/motion-panel';
export { MotionPreviewBox } from '@/components/editor/motion/motion-preview';
export { MotionWrapper } from '@/components/editor/motion/motion-wrapper';
export { useMotionStore } from '@/store/motion-store';
export { MOTION_PRESETS, PRESET_CATEGORIES, getPresetByName, getPresetsByCategory } from '@/lib/motion-presets';
export type {
  Keyframe,
  ElementAnimation,
  AnimationPreset,
  EasingType,
  AnimationDirection,
  AnimationPlayState,
  MotionTimeline,
  MotionVariant,
} from '@/lib/motion-types';
export { keyframeToStyle, buildFramerVariants, getFramerTransition } from '@/lib/motion-types';

// Effects
export { EffectsPanel } from '@/components/editor/effects/effects-panel';
export { useEffectsStore } from '@/store/effects-store';
export { EFFECT_PRESETS, EFFECT_CATEGORIES, getPresetByName as getEffectPresetByName } from '@/lib/effects-presets';
export { buildFilterString, buildBoxShadow, buildFillStyle, applyElementStyles } from '@/lib/apply-effects';
export type {
  EffectType,
  FillType,
  ElementEffect,
  AdvancedFill,
  EffectPreset,
} from '@/lib/effects-types';

// Code Layers
export { CodeLayerPanel } from '@/components/editor/code-layer/code-layer-panel';
export { CodeLayerCanvasElement } from '@/components/editor/code-layer/code-layer-canvas-element';
export { useCodeLayerStore } from '@/store/code-layer-store';
export { CODE_TEMPLATES, TEMPLATE_CATEGORIES, DEFAULT_CODE_LAYER } from '@/lib/code-layer-types';
export type { CodeLanguage, CodeLayerData, CodeTemplate } from '@/lib/code-layer-types';

// Generative
export { GenerativePanel } from '@/components/editor/generative/generative-panel';
export { useGenerativeStore } from '@/store/generative-store';
export type { GeneratedElement } from '@/store/generative-store';