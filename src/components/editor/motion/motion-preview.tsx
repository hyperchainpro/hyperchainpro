'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import type { AnimationPreset } from '@/lib/motion-types';

interface MotionPreviewBoxProps {
  preset: AnimationPreset;
  size?: number;
}

export function MotionPreviewBox({ preset, size = 36 }: MotionPreviewBoxProps) {
  const first = preset.keyframes[0];
  const last = preset.keyframes[preset.keyframes.length - 1];

  const initial = useMemo(() => {
    const s: Record<string, unknown> = {};
    if (first.opacity !== undefined) s.opacity = first.opacity;
    if (first.y !== undefined) s.y = first.y;
    if (first.x !== undefined) s.x = first.x;
    if (first.scale !== undefined) s.scale = first.scale;
    if (first.rotation !== undefined) s.rotate = first.rotation;
    if (first.skewX !== undefined) s.skewX = first.skewX;
    return s;
  }, [first]);

  const animate = useMemo(() => {
    const s: Record<string, unknown> = {};
    if (last.opacity !== undefined) s.opacity = last.opacity;
    if (last.y !== undefined) s.y = last.y;
    if (last.x !== undefined) s.x = last.x;
    if (last.scale !== undefined) s.scale = last.scale;
    if (last.rotation !== undefined) s.rotate = last.rotation;
    if (last.skewX !== undefined) s.skewX = last.skewX;
    return s;
  }, [last]);

  return (
    <div className="flex items-center justify-center" style={{ width: size, height: size }}>
      <motion.div
        className="rounded-sm bg-primary"
        style={{ width: size * 0.5, height: size * 0.5 }}
        initial={initial}
        animate={preset.loop ? [initial, animate, initial] : animate}
        transition={{
          duration: Math.min(preset.duration / 1000, 2),
          repeat: preset.loop ? Infinity : 0,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}