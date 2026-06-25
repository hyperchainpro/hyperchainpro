'use client';

import { motion, type Variants } from 'framer-motion';
import { useMemo } from 'react';
import { useMotionStore } from '@/store/motion-store';
import { buildFramerVariants, getFramerTransition } from '@/lib/motion-types';

interface MotionWrapperProps {
  elementId: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export function MotionWrapper({ elementId, children, style, className }: MotionWrapperProps) {
  const animation = useMotionStore((s) => s.animations[elementId]);

  const { variants, transition, shouldAnimate } = useMemo(() => {
    if (!animation) return { variants: {}, transition: {}, shouldAnimate: false };

    return {
      variants: buildFramerVariants(animation) as Variants,
      transition: getFramerTransition(animation),
      shouldAnimate: animation.playState === 'playing' || animation.playState === 'idle',
    };
  }, [animation]);

  if (!animation || !shouldAnimate) {
    return <div style={style} className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      style={style}
      variants={variants}
      initial="initial"
      animate="animate"
      transition={transition}
    >
      {children}
    </motion.div>
  );
}