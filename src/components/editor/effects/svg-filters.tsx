// ─── SVG Filter Definitions ──────────────────────────────────────────────────
// LayerBoard — Hidden SVG with filter definitions for advanced effects
// Must be rendered once in the layout.

'use client';

import { SVG_FILTER_IDS } from '@/lib/effects-types';

export { SVG_FILTER_IDS };

export function SvgFilterDefs() {
  return (
    <svg
      aria-hidden="true"
      style={{
        position: 'absolute',
        width: 0,
        height: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <defs>
        {/* ── Noise (medium) ─────────────────────────────────────────── */}
        <filter id={SVG_FILTER_IDS.NOISE} x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
            result="noise"
          />
          <feColorMatrix
            in="noise"
            type="saturate"
            values="0"
            result="grayNoise"
          />
          <feBlend in="SourceGraphic" in2="grayNoise" mode="overlay" result="blend" />
          <feComponentTransfer in="blend">
            <feFuncA type="linear" slope="1" />
          </feComponentTransfer>
        </filter>

        {/* ── Noise Fine ─────────────────────────────────────────────── */}
        <filter id={SVG_FILTER_IDS.NOISE_FINE} x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="4"
            stitchTiles="stitch"
            result="noise"
          />
          <feColorMatrix
            in="noise"
            type="saturate"
            values="0"
            result="grayNoise"
          />
          <feBlend in="SourceGraphic" in2="grayNoise" mode="overlay" />
        </filter>

        {/* ── Film Grain ─────────────────────────────────────────────── */}
        <filter id={SVG_FILTER_IDS.GRAIN} x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.4"
            numOctaves="5"
            stitchTiles="stitch"
            result="noise"
          />
          <feColorMatrix
            in="noise"
            type="saturate"
            values="0"
            result="grayNoise"
          />
          <feBlend in="SourceGraphic" in2="grayNoise" mode="multiply" result="blend" />
          <feComponentTransfer in="blend">
            <feFuncA type="linear" slope="1" />
          </feComponentTransfer>
        </filter>

        {/* ── Duotone Blue/Orange ────────────────────────────────────── */}
        <filter id={SVG_FILTER_IDS.DUOTONE_BLUE_ORANGE} x="0%" y="0%" width="100%" height="100%">
          <feColorMatrix
            type="matrix"
            values="0.3 0.3 0.3 0 0.1
                    0.3 0.3 0.3 0 0.1
                    0.3 0.3 0.3 0 0.3
                    0   0   0   1 0"
            in="SourceGraphic"
            result="mono"
          />
          <feComponentTransfer in="mono">
            <feFuncR type="table" tableValues="0.05 0.05 0.15 1" />
            <feFuncG type="table" tableValues="0.1  0.2  0.5  0.65" />
            <feFuncB type="table" tableValues="0.2  0.3  0.4  0.15" />
          </feComponentTransfer>
        </filter>

        {/* ── Duotone Purple/Green ───────────────────────────────────── */}
        <filter id={SVG_FILTER_IDS.DUOTONE_PURPLE_GREEN} x="0%" y="0%" width="100%" height="100%">
          <feColorMatrix
            type="matrix"
            values="0.3 0.3 0.3 0 0.2
                    0.3 0.3 0.3 0 0.1
                    0.3 0.3 0.3 0 0.3
                    0   0   0   1 0"
            in="SourceGraphic"
            result="mono"
          />
          <feComponentTransfer in="mono">
            <feFuncR type="table" tableValues="0.3 0.5 0.7 0.9" />
            <feFuncG type="table" tableValues="0.1 0.2 0.3 0.2" />
            <feFuncB type="table" tableValues="0.3 0.5 0.7 0.9" />
          </feComponentTransfer>
        </filter>

        {/* ── Duotone Red/Cyan ───────────────────────────────────────── */}
        <filter id={SVG_FILTER_IDS.DUOTONE_RED_CYAN} x="0%" y="0%" width="100%" height="100%">
          <feColorMatrix
            type="matrix"
            values="0.3 0.3 0.3 0 0.1
                    0.3 0.3 0.3 0 0.1
                    0.3 0.3 0.3 0 0.1
                    0   0   0   1 0"
            in="SourceGraphic"
            result="mono"
          />
          <feComponentTransfer in="mono">
            <feFuncR type="table" tableValues="0.1 0.5 0.8 1" />
            <feFuncG type="table" tableValues="0.2 0.6 0.8 0.9" />
            <feFuncB type="table" tableValues="0.1 0.4 0.6 0.8" />
          </feComponentTransfer>
        </filter>

        {/* ── Displacement Map ───────────────────────────────────────── */}
        <filter id={SVG_FILTER_IDS.DISPLACEMENT} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence
            type="turbulence"
            baseFrequency="0.02"
            numOctaves="3"
            result="turbulence"
            seed="2"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="turbulence"
            scale="12"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        {/* ── Chromatic Aberration ───────────────────────────────────── */}
        <filter id={SVG_FILTER_IDS.CHROMATIC_ABERRATION} x="-5%" y="-5%" width="110%" height="110%">
          <feOffset in="SourceGraphic" dx="2" dy="0" result="red" />
          <feOffset in="SourceGraphic" dx="-2" dy="0" result="cyan" />
          <feOffset in="SourceGraphic" dx="0" dy="0" result="green" />
          <feColorMatrix in="red" type="matrix"
            values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.7 0" result="redOnly" />
          <feColorMatrix in="cyan" type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 0.7 0" result="blueOnly" />
          <feBlend in="green" in2="redOnly" mode="screen" result="greenRed" />
          <feBlend in="greenRed" in2="blueOnly" mode="screen" />
        </filter>

        {/* ── Pixelate ───────────────────────────────────────────────── */}
        <filter id={SVG_FILTER_IDS.PIXELATE} x="0%" y="0%" width="100%" height="100%">
          <feFlood x="4" y="4" height="2" width="2" />
          <feComposite width="8" height="8" />
          <feTile result="a" />
          <feComposite in="SourceGraphic" in2="a" operator="in" />
          <feMorphology operator="dilate" radius="4" />
        </filter>

        {/* ── Vignette ───────────────────────────────────────────────── */}
        <filter id={SVG_FILTER_IDS.VIGNETTE} x="-10%" y="-10%" width="120%" height="120%">
          <feFlood floodColor="black" floodOpacity="0.6" result="black" />
          <feComposite in="black" in2="SourceGraphic" operator="in" result="blackMask" />
          <feGaussianBlur in="blackMask" stdDeviation="20" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* ── Aurora ─────────────────────────────────────────────────── */}
        <filter id={SVG_FILTER_IDS.AURORA} x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.015 0.08"
            numOctaves="4"
            seed="5"
            result="auroraNoise"
          />
          <feColorMatrix
            in="auroraNoise"
            type="matrix"
            values="0.2 0 0 0 0.1
                    0   0.3 0 0 0.2
                    0   0   0.3 0 0.3
                    0   0   0   0.4 0"
            result="auroraColor"
          />
          <feBlend in="SourceGraphic" in2="auroraColor" mode="screen" />
        </filter>
      </defs>
    </svg>
  );
}