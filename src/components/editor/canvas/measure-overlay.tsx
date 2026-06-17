'use client';

import React, { useMemo } from 'react';
import { useCanvasStore } from '@/store/canvas-store';

const RULER_SIZE = 24;
const MEASURE_COLOR = '#0d9488'; // teal-600
const MEASURE_BG = 'rgba(13, 148, 136, 0.12)';
const LABEL_BG = 'rgba(13, 148, 136, 0.9)';

interface MeasureLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  distance: number;
  labelX: number;
  labelY: number;
}

interface DimensionLabel {
  x: number;
  y: number;
  text: string;
}

export default function MeasureOverlay() {
  const showMeasureLines = useCanvasStore((s) => s.showMeasureLines);
  const selectedIds = useCanvasStore((s) => s.selectedIds);
  const elements = useCanvasStore((s) => s.elements);
  const panX = useCanvasStore((s) => s.panX);
  const panY = useCanvasStore((s) => s.panY);
  const zoom = useCanvasStore((s) => s.zoom);

  const { measureLines, dimensionLabels } = useMemo(() => {
    if (!showMeasureLines || selectedIds.length < 2) {
      return { measureLines: [], dimensionLabels: [] };
    }

    const selected = selectedIds
      .map((id) => elements.find((el) => el.id === id))
      .filter((el): el is NonNullable<typeof el> => el != null);

    if (selected.length < 2) {
      return { measureLines: [], dimensionLabels: [] };
    }

    const lines: MeasureLine[] = [];
    const dims: DimensionLabel[] = [];
    const offsetX = panX + RULER_SIZE;
    const offsetY = panY + RULER_SIZE;

    // Show dimensions for each selected element
    for (const el of selected) {
      const sx = el.x * zoom + offsetX;
      const sy = el.y * zoom + offsetY;
      const sw = el.width * zoom;
      const sh = el.height * zoom;

      dims.push({
        x: sx + sw / 2,
        y: sy - 12,
        text: `${Math.round(el.width)} × ${Math.round(el.height)}`,
      });
    }

    // Calculate pairwise distances
    // Only show distances between consecutive elements based on horizontal then vertical proximity
    const sorted = [...selected].sort((a, b) => a.x - b.x || a.y - b.y);

    for (let i = 0; i < sorted.length - 1; i++) {
      const a = sorted[i];
      const b = sorted[i + 1];

      const aRight = a.x + a.width;
      const aBottom = a.y + a.height;
      const bRight = b.x + b.width;
      const bBottom = b.y + b.height;

      const aCenterX = a.x + a.width / 2;
      const aCenterY = a.y + a.height / 2;
      const bCenterX = b.x + b.width / 2;
      const bCenterY = b.y + b.height / 2;

      // Check if elements overlap vertically (for horizontal distance)
      const overlapY = Math.min(aBottom, bBottom) - Math.max(a.y, b.y);
      // Check if elements overlap horizontally (for vertical distance)
      const overlapX = Math.min(aRight, bRight) - Math.max(a.x, b.x);

      // Horizontal distance (gap between right edge of A and left edge of B)
      if (overlapY > 0 && b.x > aRight) {
        const gap = b.x - aRight;
        const sx1 = aRight * zoom + offsetX;
        const sx2 = b.x * zoom + offsetX;
        const sy = (aCenterY + bCenterY) / 2 * zoom + offsetY;

        lines.push({
          x1: sx1,
          y1: sy,
          x2: sx2,
          y2: sy,
          distance: Math.round(gap),
          labelX: (sx1 + sx2) / 2,
          labelY: sy,
        });
      }

      // Vertical distance (gap between bottom edge of A and top edge of B)
      if (overlapX > 0 && b.y > aBottom) {
        const gap = b.y - aBottom;
        const sx = (aCenterX + bCenterX) / 2 * zoom + offsetX;
        const sy1 = aBottom * zoom + offsetY;
        const sy2 = b.y * zoom + offsetY;

        lines.push({
          x1: sx,
          y1: sy1,
          x2: sx,
          y2: sy2,
          distance: Math.round(gap),
          labelX: sx,
          labelY: (sy1 + sy2) / 2,
        });
      }

      // For elements that don't align on either axis, show the center-to-center distances
      if (overlapY <= 0 && overlapX <= 0) {
        const dx = Math.abs(bCenterX - aCenterX);
        const dy = Math.abs(bCenterY - aCenterY);

        // Show horizontal distance
        const hGap = b.x > aRight ? b.x - aRight : a.x > bRight ? a.x - bRight : dx;
        if (hGap > 0) {
          const leftEl = a.x < b.x ? a : b;
          const rightEl = a.x < b.x ? b : a;
          const sx1 = (leftEl.x + leftEl.width) * zoom + offsetX;
          const sx2 = rightEl.x * zoom + offsetX;
          const sy = aCenterY * zoom + offsetY;

          lines.push({
            x1: sx1,
            y1: sy,
            x2: sx2,
            y2: sy,
            distance: Math.round(hGap),
            labelX: (sx1 + sx2) / 2,
            labelY: sy,
          });
        }

        // Show vertical distance
        const vGap = b.y > aBottom ? b.y - aBottom : a.y > bBottom ? a.y - bBottom : dy;
        if (vGap > 0) {
          const topEl = a.y < b.y ? a : b;
          const bottomEl = a.y < b.y ? b : a;
          const sx = aCenterX * zoom + offsetX;
          const sy1 = (topEl.y + topEl.height) * zoom + offsetY;
          const sy2 = bottomEl.y * zoom + offsetY;

          lines.push({
            x1: sx,
            y1: sy1,
            x2: sx,
            y2: sy2,
            distance: Math.round(vGap),
            labelX: sx,
            labelY: (sy1 + sy2) / 2,
          });
        }
      }
    }

    return { measureLines: lines, dimensionLabels: dims };
  }, [showMeasureLines, selectedIds, elements, panX, panY, zoom]);

  if (!showMeasureLines || selectedIds.length < 2) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-[9950]" style={{ overflow: 'hidden' }}>
      {/* Measure lines */}
      <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
        {measureLines.map((line, i) => {
          const isHorizontal = Math.abs(line.y1 - line.y2) < 1;

          return (
            <g key={`ml-${i}`}>
              {/* Background fill for the gap region */}
              {isHorizontal ? (
                <rect
                  x={line.x1}
                  y={line.y1 - 6}
                  width={line.x2 - line.x1}
                  height={12}
                  fill={MEASURE_BG}
                />
              ) : (
                <rect
                  x={line.x1 - 6}
                  y={line.y1}
                  width={12}
                  height={line.y2 - line.y1}
                  fill={MEASURE_BG}
                />
              )}

              {/* Main line */}
              <line
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke={MEASURE_COLOR}
                strokeWidth={1}
                strokeDasharray="4,3"
              />

              {/* End ticks */}
              {isHorizontal ? (
                <>
                  <line x1={line.x1} y1={line.y1 - 4} x2={line.x1} y2={line.y1 + 4} stroke={MEASURE_COLOR} strokeWidth={1} />
                  <line x1={line.x2} y1={line.y2 - 4} x2={line.x2} y2={line.y2 + 4} stroke={MEASURE_COLOR} strokeWidth={1} />
                </>
              ) : (
                <>
                  <line x1={line.x1 - 4} y1={line.y1} x2={line.x1 + 4} y2={line.y1} stroke={MEASURE_COLOR} strokeWidth={1} />
                  <line x1={line.x2 - 4} y1={line.y2} x2={line.x2 + 4} y2={line.y2} stroke={MEASURE_COLOR} strokeWidth={1} />
                </>
              )}

              {/* Distance label */}
              <g transform={`translate(${line.labelX}, ${line.labelY})`}>
                <rect
                  x={-22}
                  y={-8}
                  width={44}
                  height={16}
                  rx={3}
                  fill={LABEL_BG}
                />
                <text
                  x={0}
                  y={4}
                  textAnchor="middle"
                  fill="white"
                  fontSize={10}
                  fontWeight={600}
                  fontFamily="ui-monospace, monospace"
                >
                  {line.distance}
                </text>
              </g>
            </g>
          );
        })}
      </svg>

      {/* Dimension labels (W × H) */}
      {dimensionLabels.map((dim, i) => (
        <div
          key={`dim-${i}`}
          className="absolute whitespace-nowrap"
          style={{
            left: dim.x,
            top: dim.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <span
            className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold text-white"
            style={{
              backgroundColor: LABEL_BG,
              fontFamily: 'ui-monospace, monospace',
            }}
          >
            {dim.text}
          </span>
        </div>
      ))}
    </div>
  );
}