'use client';

import React, { useMemo } from 'react';
import { usePrototypeStore } from '@/store/prototype-store';
import { useCanvasStore } from '@/store/canvas-store';
import { getCenter } from '@/lib/canvas-utils';

interface PrototypeFlowOverlayProps {
  panX: number;
  panY: number;
  zoom: number;
}

export default function PrototypeFlowOverlay({ panX, panY, zoom }: PrototypeFlowOverlayProps) {
  const interactions = usePrototypeStore((s) => s.interactions);
  const elements = useCanvasStore((s) => s.elements);

  // Get frame elements map for quick lookup
  const frameMap = useMemo(() => {
    const map = new Map<string, { x: number; y: number; width: number; height: number; name?: string }>();
    for (const el of elements) {
      if (el.type === 'FRAME') {
        map.set(el.id, {
          x: el.x,
          y: el.y,
          width: el.width,
          height: el.height,
          name: el.name || el.content || 'Frame',
        });
      }
    }
    return map;
  }, [elements]);

  if (interactions.length === 0) return null;

  // Convert canvas coords to screen coords
  const toScreen = (cx: number, cy: number) => ({
    sx: cx * zoom + panX,
    sy: cy * zoom + panY,
  });

  return (
    <svg
      className="pointer-events-none absolute inset-0"
      style={{ zIndex: 9997 }}
    >
      {interactions.map((interaction) => {
        const source = frameMap.get(interaction.sourceFrameId);
        const target = frameMap.get(interaction.targetFrameId);
        if (!source || !target) return null;

        const sourceCenter = getCenter(source as any);
        const targetCenter = getCenter(target as any);
        const from = toScreen(sourceCenter.x, sourceCenter.y);
        const to = toScreen(targetCenter.x, targetCenter.y);

        // Calculate arrow angle
        const angle = Math.atan2(to.sy - from.sy, to.sx - from.sx);
        const arrowSize = 10;

        // Arrow head points
        const a1 = angle + Math.PI * 0.85;
        const a2 = angle - Math.PI * 0.85;
        const arrowPoints = [
          `${to.sx},${to.sy}`,
          `${to.sx + Math.cos(a1) * arrowSize},${to.sy + Math.sin(a1) * arrowSize}`,
          `${to.sx + Math.cos(a2) * arrowSize},${to.sy + Math.sin(a2) * arrowSize}`,
        ].join(' ');

        // Label position (midpoint, offset slightly)
        const midX = (from.sx + to.sx) / 2;
        const midY = (from.sy + to.sy) / 2;

        // Friendly trigger label
        const triggerLabel = interaction.trigger.replace(/_/g, ' ');

        return (
          <g key={interaction.id}>
            {/* Connection line (dashed, semi-transparent blue) */}
            <line
              x1={from.sx}
              y1={from.sy}
              x2={to.sx}
              y2={to.sy}
              stroke="rgb(59 130 246 / 0.5)"
              strokeWidth={1.5}
              strokeDasharray="6,4"
            />
            {/* Arrow head */}
            <polygon
              points={arrowPoints}
              fill="rgb(59 130 246 / 0.5)"
            />
            {/* Trigger label */}
            <rect
              x={midX - 30}
              y={midY - 18}
              width={60}
              height={16}
              rx={4}
              fill="hsl(var(--card) / 0.9)"
              stroke="hsl(var(--border))"
              strokeWidth={0.5}
            />
            <text
              x={midX}
              y={midY - 8}
              textAnchor="middle"
              fontSize="9"
              fill="hsl(var(--muted-foreground))"
              fontFamily="ui-monospace, monospace"
            >
              {triggerLabel}
            </text>
          </g>
        );
      })}
    </svg>
  );
}