'use client';

import React, { useMemo } from 'react';
import { useCanvasStore } from '@/store/canvas-store';
import { GRID_SIZE } from '@/lib/types';

const RULER_SIZE = 24;
const MAJOR_EVERY = 5; // Every 5 minor grid lines = major line (every 100px)

export default function GuidesOverlay() {
  const showGuides = useCanvasStore((s) => s.showGuides);
  const panX = useCanvasStore((s) => s.panX);
  const panY = useCanvasStore((s) => s.panY);
  const zoom = useCanvasStore((s) => s.zoom);

  const gridLines = useMemo(() => {
    if (!showGuides) return { verticals: [], horizontals: [] };

    // Calculate visible area in canvas coordinates
    // The canvas area starts at (RULER_SIZE, RULER_SIZE) in screen space
    const canvasLeft = (-panX - RULER_SIZE) / zoom;
    const canvasTop = (-panY - RULER_SIZE) / zoom;

    // We need to know the viewport size - we'll estimate large bounds
    const viewW = (typeof window !== 'undefined' ? window.innerWidth : 2000) / zoom;
    const viewH = (typeof window !== 'undefined' ? window.innerHeight : 1200) / zoom;
    const canvasRight = canvasLeft + viewW;
    const canvasBottom = canvasTop + viewH;

    const startX = Math.floor(canvasLeft / GRID_SIZE) * GRID_SIZE;
    const startY = Math.floor(canvasTop / GRID_SIZE) * GRID_SIZE;
    const endX = Math.ceil(canvasRight / GRID_SIZE) * GRID_SIZE;
    const endY = Math.ceil(canvasBottom / GRID_SIZE) * GRID_SIZE;

    const verticals: { pos: number; major: boolean }[] = [];
    const horizontals: { pos: number; major: boolean }[] = [];

    for (let x = startX; x <= endX; x += GRID_SIZE) {
      verticals.push({ pos: x, major: x % (GRID_SIZE * MAJOR_EVERY) === 0 });
    }

    for (let y = startY; y <= endY; y += GRID_SIZE) {
      horizontals.push({ pos: y, major: y % (GRID_SIZE * MAJOR_EVERY) === 0 });
    }

    return { verticals, horizontals };
  }, [showGuides, panX, panY, zoom]);

  if (!showGuides) return null;

  const offsetX = panX + RULER_SIZE;
  const offsetY = panY + RULER_SIZE;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-[10]"
      style={{ overflow: 'hidden' }}
    >
      {/* Clip to canvas area (after rulers) */}
      <defs>
        <clipPath id="guides-clip">
          <rect x={RULER_SIZE} y={RULER_SIZE} width="10000" height="10000" />
        </clipPath>
      </defs>

      <g clipPath="url(#guides-clip)">
        {/* Minor grid lines - vertical */}
        {gridLines.verticals
          .filter((v) => !v.major)
          .map((v, i) => (
            <line
              key={`vg-${i}`}
              x1={v.pos * zoom + offsetX}
              y1={0}
              x2={v.pos * zoom + offsetX}
              y2={20000}
              stroke="currentColor"
              strokeOpacity={0.1}
              strokeWidth={1 / zoom}
            />
          ))}

        {/* Minor grid lines - horizontal */}
        {gridLines.horizontals
          .filter((h) => !h.major)
          .map((h, i) => (
            <line
              key={`hg-${i}`}
              x1={0}
              y1={h.pos * zoom + offsetY}
              x2={20000}
              y2={h.pos * zoom + offsetY}
              stroke="currentColor"
              strokeOpacity={0.1}
              strokeWidth={1 / zoom}
            />
          ))}

        {/* Major grid lines - vertical */}
        {gridLines.verticals
          .filter((v) => v.major)
          .map((v, i) => (
            <line
              key={`vm-${i}`}
              x1={v.pos * zoom + offsetX}
              y1={0}
              x2={v.pos * zoom + offsetX}
              y2={20000}
              stroke="currentColor"
              strokeOpacity={0.2}
              strokeWidth={1 / zoom}
            />
          ))}

        {/* Major grid lines - horizontal */}
        {gridLines.horizontals
          .filter((h) => h.major)
          .map((h, i) => (
            <line
              key={`hm-${i}`}
              x1={0}
              y1={h.pos * zoom + offsetY}
              x2={20000}
              y2={h.pos * zoom + offsetY}
              stroke="currentColor"
              strokeOpacity={0.2}
              strokeWidth={1 / zoom}
            />
          ))}
      </g>
    </svg>
  );
}