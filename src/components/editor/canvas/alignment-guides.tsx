'use client';

import React from 'react';
import type { AlignmentGuide } from '@/lib/types';
import { useCanvasStore } from '@/store/canvas-store';

interface AlignmentGuidesProps {
  guides: AlignmentGuide[];
  panX: number;
  panY: number;
  zoom: number;
}

export default function AlignmentGuides({ guides, panX, panY, zoom }: AlignmentGuidesProps) {
  if (guides.length === 0) return null;

  // Deduplicate guides by axis+position to avoid duplicate lines
  const seen = new Set<string>();
  const uniqueGuides = guides.filter((g) => {
    const key = `${g.axis}-${g.position.toFixed(1)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return (
    <svg
      className="pointer-events-none absolute inset-0"
      style={{ zIndex: 9998 }}
    >
      {/* Horizontal guides (axis='y') — full-width horizontal lines */}
      {uniqueGuides
        .filter((g) => g.axis === 'y')
        .map((g, i) => {
          const screenY = g.position * zoom + panY;
          return (
            <line
              key={`h-${i}`}
              x1={0}
              y1={screenY}
              x2="100%"
              y2={screenY}
              stroke="rgb(239 68 68 / 0.7)"
              strokeWidth={1}
            />
          );
        })}

      {/* Vertical guides (axis='x') — full-height vertical lines */}
      {uniqueGuides
        .filter((g) => g.axis === 'x')
        .map((g, i) => {
          const screenX = g.position * zoom + panX;
          return (
            <line
              key={`v-${i}`}
              x1={screenX}
              y1={0}
              x2={screenX}
              y2="100%"
              stroke="rgb(239 68 68 / 0.7)"
              strokeWidth={1}
            />
          );
        })}
    </svg>
  );
}