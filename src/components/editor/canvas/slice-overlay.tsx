'use client';

import React from 'react';
import { X } from 'lucide-react';
import { useCanvasStore } from '@/store/canvas-store';
import { t, type Locale } from '@/lib/i18n';
import { useAuthStore } from '@/store/auth-store';

export function SliceOverlay() {
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  const sliceRegions = useCanvasStore((s) => s.sliceRegions);
  const removeSliceRegion = useCanvasStore((s) => s.removeSliceRegion);
  const panX = useCanvasStore((s) => s.panX);
  const panY = useCanvasStore((s) => s.panY);
  const zoom = useCanvasStore((s) => s.zoom);

  if (sliceRegions.length === 0) return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 40 }}
    >
      <svg
        className="w-full h-full"
        style={{ overflow: 'visible' }}
      >
        {sliceRegions.map((region) => {
          const screenX = region.x * zoom + panX;
          const screenY = region.y * zoom + panY;
          const screenW = region.width * zoom;
          const screenH = region.height * zoom;

          return (
            <g key={region.id}>
              {/* Dashed green border */}
              <rect
                x={screenX}
                y={screenY}
                width={screenW}
                height={screenH}
                fill="none"
                stroke="#22c55e"
                strokeWidth={2}
                strokeDasharray="8 4"
                rx={2}
              />

              {/* Semi-transparent fill */}
              <rect
                x={screenX}
                y={screenY}
                width={screenW}
                height={screenH}
                fill="#22c55e"
                fillOpacity={0.04}
                rx={2}
              />

              {/* Label background */}
              <rect
                x={screenX}
                y={screenY}
                width={Math.max(region.name.length * 7 + 28, 60) * Math.min(zoom, 1.2)}
                height={22 * Math.min(zoom, 1.2)}
                fill="#22c55e"
                rx={3 * Math.min(zoom, 1.2)}
              />

              {/* Label text */}
              <text
                x={screenX + 6 * Math.min(zoom, 1.2)}
                y={screenY + 15 * Math.min(zoom, 1.2)}
                fill="white"
                fontSize={11 * Math.min(zoom, 1.2)}
                fontFamily="Inter, system-ui, sans-serif"
                fontWeight={600}
              >
                {region.name}
              </text>

              {/* Delete button background (positioned at top-right of slice region) */}
              <foreignObject
                x={screenX + screenW - 24 * Math.min(zoom, 1.2)}
                y={screenY - 4 * Math.min(zoom, 1.2)}
                width={24 * Math.min(zoom, 1.2)}
                height={24 * Math.min(zoom, 1.2)}
              >
                <div
                  className="pointer-events-auto"
                  xmlns="http://www.w3.org/1999/xhtml"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSliceRegion(region.id);
                    }}
                    className="flex items-center justify-center rounded-full bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm"
                    style={{
                      width: 22,
                      height: 22,
                    }}
                    title={t('slice.delete', locale)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </foreignObject>

              {/* Dimension labels */}
              {zoom > 0.3 && (
                <>
                  <text
                    x={screenX + screenW / 2}
                    y={screenY + screenH / 2 + 4}
                    fill="#22c55e"
                    fontSize={10 * Math.min(zoom, 1.2)}
                    fontFamily="Inter, system-ui, sans-serif"
                    fontWeight={500}
                    textAnchor="middle"
                    opacity={0.7}
                  >
                    {region.width} × {region.height}
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
