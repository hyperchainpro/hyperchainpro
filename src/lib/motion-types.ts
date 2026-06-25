// ─── LayerBoard Motion — Type Definitions ──────────────────────────────────────

export type EasingType =
  | 'linear'
  | 'easeIn'
  | 'easeOut'
  | 'easeInOut'
  | 'spring'
  | 'elastic'
  | 'bounce'
  | 'steps'
  | 'circIn'
  | 'circOut'
  | 'circInOut'
  | 'backIn'
  | 'backOut'
  | 'backInOut';

export type AnimationDirection = 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';

export type AnimationPlayState = 'idle' | 'playing' | 'paused';

export interface Keyframe {
  time: number;       // 0–100 percentage
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  opacity?: number;
  scale?: number;
  blur?: number;
  color?: string;
  borderRadius?: number;
  boxShadow?: string;
  skewX?: number;
  skewY?: number;
}

export interface ElementAnimation {
  id: string;
  elementId: string;
  keyframes: Keyframe[];
  duration: number;        // ms
  easing: EasingType;
  loop: boolean;
  delay: number;           // ms
  direction: AnimationDirection;
  playState: AnimationPlayState;
  presetName?: string;
}

export interface AnimationPreset {
  name: string;
  category: 'entrance' | 'emphasis' | 'exit' | 'loop';
  label: string;
  icon: string;            // lucide icon name
  keyframes: Keyframe[];
  duration: number;
  easing: EasingType;
  loop: boolean;
  delay: number;
  direction: AnimationDirection;
}

export interface MotionTimeline {
  animations: ElementAnimation[];
  totalDuration: number;
  isPlaying: boolean;
  currentTime: number;
}

// Framer Motion variant map
export type MotionVariant = Record<string, Record<string, unknown>>;

export function keyframeToStyle(kf: Keyframe): Record<string, unknown> {
  const style: Record<string, unknown> = {};
  if (kf.x !== undefined) style.x = kf.x;
  if (kf.y !== undefined) style.y = kf.y;
  if (kf.opacity !== undefined) style.opacity = kf.opacity;
  if (kf.rotation !== undefined) style.rotate = kf.rotation;
  if (kf.scale !== undefined) style.scale = kf.scale;
  if (kf.skewX !== undefined) style.skewX = kf.skewX;
  if (kf.skewY !== undefined) style.skewY = kf.skewY;
  if (kf.borderRadius !== undefined) style.borderRadius = `${kf.borderRadius}px`;
  if (kf.boxShadow !== undefined) style.boxShadow = kf.boxShadow;
  if (kf.blur !== undefined) style.filter = `blur(${kf.blur}px)`;
  return style;
}

export function buildFramerVariants(animation: ElementAnimation): MotionVariant {
  const variants: MotionVariant = {
    initial: {},
    animate: {},
  };

  if (animation.keyframes.length === 0) return variants;

  const first = animation.keyframes[0];
  const last = animation.keyframes[animation.keyframes.length - 1];

  variants.initial = keyframeToStyle(first);
  variants.animate = keyframeToStyle(last);

  return variants;
}

export function getFramerTransition(animation: ElementAnimation) {
  const easingMap: Record<EasingType, string | number[]> = {
    linear: 'linear',
    easeIn: [0.4, 0, 1, 1],
    easeOut: [0, 0, 0.2, 1],
    easeInOut: [0.4, 0, 0.2, 1],
    spring: 'spring',
    elastic: [0.68, -0.55, 0.265, 1.55],
    bounce: [0.6, -0.28, 0.735, 0.045],
    steps: 8,
    circIn: [0.55, 0.055, 0.675, 0.19],
    circOut: [0.215, 0.61, 0.355, 1],
    circInOut: [0.645, 0.045, 0.355, 1],
    backIn: [0.6, -0.28, 0.735, 0.045],
    backOut: [0.12, 0.4, 0.29, 1.2],
    backInOut: [0.68, -0.55, 0.265, 1.55],
  };

  return {
    duration: animation.duration / 1000,
    delay: animation.delay / 1000,
    ease: animation.easing === 'spring' ? undefined : easingMap[animation.easing],
    type: animation.easing === 'spring' ? 'spring' : animation.easing === 'bounce' ? 'spring' : 'tween',
    stiffness: animation.easing === 'spring' ? 200 : undefined,
    damping: animation.easing === 'spring' ? 20 : undefined,
    repeat: animation.loop ? Infinity : 0,
    repeatType: animation.direction === 'reverse' ? 'reverse' : animation.direction === 'alternate' || animation.direction === 'alternate-reverse' ? 'reverse' : 'loop',
    repeatDelay: animation.direction === 'alternate-reverse' ? 0.3 : 0,
  };
}