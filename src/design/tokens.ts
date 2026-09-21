import type { CSSProperties } from 'react';

/**
 * "Architectural Blueprint" design system.
 * Single source of truth: nothing in this project hard-codes a colour or a
 * grid size, because every section reads from here.
 */

/** Blueprint palette — schematic map, stage nodes, nav, hero, pacing, footer. */
export const blueprint = {
  bg: '#778db2',
  line: '#FFFFFF',
  ink: '#000000',
} as const;

/**
 * Sand palette — the two sand bands ONLY. Never mixed into a blueprint section.
 *
 * Measured against the #e8dac6 ground, only `rust` is fit for body copy:
 *   rust  #904933  4.79:1  body copy and headings
 *   muted #90887c  2.55:1  small labels and deliberately de-emphasised rows
 *   ochre #ae8037  2.57:1  short accent numerals only
 *   base  #b9a07c  1.82:1  RULES AND BORDERS ONLY -- too faint to read
 */
export const sand = {
  base: '#b9a07c',
  muted: '#90887c',
  paper: '#e8dac6',
  ochre: '#ae8037',
  rust: '#904933',
} as const;

/**
 * The single sanctioned cross-palette borrow: a redline is drawn with a
 * different pen than the drawing it annotates, so it uses a rust ink even
 * inside blueprint sections.
 *
 * This is a DARKER shade of `sand.rust`, not the rust itself. #778db2 is a
 * mid-tone, so contrast there can only be won by going darker: the rust
 * #904933 manages just 1.96:1 against it, while #5A2417 reaches 3.67:1 --
 * better even than pure white, which caps at 3.37:1. Going lighter is the
 * intuitive read of "bolder" and it is the wrong direction; the sand ochre
 * #ae8037 would land at 1.05:1, effectively invisible.
 *
 * `sand.rust` stays the ink inside the sand sections, where it reads cleanly
 * against the #e8dac6 ground.
 */
export const REDLINE_INK = '#5A2417';

/**
 * Translucent whites.
 *
 * Two jobs, deliberately kept apart. The low tiers (08-35) draw structure --
 * the master grid, dashed inner frames, sheet borders -- and SHOULD recede.
 * The high tiers (68-92) carry text, and on a mid-tone ground they have to be
 * near-opaque or the type sinks into grey: 55% white measures 2.08:1 against
 * #778db2 and 75% only 2.41:1, which is the washed-out feel. 92% reaches
 * 3.11:1 and full white 3.37:1.
 *
 * 3.37:1 is the ceiling for white here, which is under WCAG AA's 4.5:1 for
 * normal text but over the 3:1 bar for large text -- which is why the type
 * scale below runs big. The two have to travel together.
 */
export const alpha = {
  // Structure: faint on purpose.
  line08: 'rgba(255,255,255,0.08)',
  line12: 'rgba(255,255,255,0.12)',
  line20: 'rgba(255,255,255,0.20)',
  line35: 'rgba(255,255,255,0.35)',
  // Text: near-opaque, or it greys out.
  line55: 'rgba(255,255,255,0.68)',
  line75: 'rgba(255,255,255,0.92)',
  /** Primary body copy. Full white, the most contrast available here. */
  textPrimary: '#FFFFFF',
  ink10: 'rgba(0,0,0,0.10)',
  ink20: 'rgba(0,0,0,0.20)',
} as const;

/** The Master Grid: 20px minor, 100px major (5 x 20, so both align). */
export const GRID_MINOR = 20;
export const GRID_MAJOR = 100;

/** Snap any value to the master grid so elements land on intersections. */
export const snap = (n: number, step: number = GRID_MINOR): number =>
  Math.round(n / step) * step;

/** Two stacked repeating gradients: the drafting grid itself. */
export const gridBackground: CSSProperties = {
  backgroundImage: [
    `repeating-linear-gradient(to right, ${alpha.line12} 0 1px, transparent 1px ${GRID_MINOR}px)`,
    `repeating-linear-gradient(to bottom, ${alpha.line12} 0 1px, transparent 1px ${GRID_MINOR}px)`,
    `repeating-linear-gradient(to right, ${alpha.line20} 0 1px, transparent 1px ${GRID_MAJOR}px)`,
    `repeating-linear-gradient(to bottom, ${alpha.line20} 0 1px, transparent 1px ${GRID_MAJOR}px)`,
  ].join(','),
  backgroundSize: `${GRID_MINOR}px ${GRID_MINOR}px, ${GRID_MINOR}px ${GRID_MINOR}px, ${GRID_MAJOR}px ${GRID_MAJOR}px, ${GRID_MAJOR}px ${GRID_MAJOR}px`,
};

/**
 * Vellum grain. An feTurbulence data-URI laid over the blueprint fields for
 * paper depth. Kept as a single shared string so it is parsed once.
 */
const GRAIN_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='160' height='160' filter='url(%23g)' opacity='0.5'/></svg>`;

export const vellumGrain: CSSProperties = {
  position: 'absolute',
  inset: 0,
  backgroundImage: `url("data:image/svg+xml,${GRAIN_SVG}")`,
  backgroundSize: '160px 160px',
  opacity: 0.16,
  mixBlendMode: 'overlay',
  pointerEvents: 'none',
  zIndex: 1,
};

/** Typography. */
export const font = {
  mono: '"Roboto Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
  hand: '"Architects Daughter", "Comic Sans MS", cursive',
} as const;

/** Small monospaced technical label — the workhorse of this system. */
export const label: CSSProperties = {
  fontFamily: font.mono,
  fontSize: 11,
  fontWeight: 500,
  // Larger glyphs need less tracking to read as a unit.
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  lineHeight: 1.2,
};

/** Block-caps heading. */
export const heading = (size: number): CSSProperties => ({
  fontFamily: font.mono,
  fontSize: size,
  fontWeight: 700,
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
  lineHeight: 1.08,
  margin: 0,
});

/** Body copy. Mono, because this document is a technical drawing. */
export const body = (size = 15): CSSProperties => ({
  fontFamily: font.mono,
  fontSize: size,
  fontWeight: 400,
  lineHeight: 1.65,
  margin: 0,
});

/** Hand-written annotation. */
export const annotation = (size = 18): CSSProperties => ({
  fontFamily: font.hand,
  fontSize: size,
  lineHeight: 1.3,
  margin: 0,
});

/** Serial numbers: serial(2) -> "NODE-02". */
export const serial = (n: number, prefix = 'NODE'): string =>
  `${prefix}-${String(n).padStart(2, '0')}`;

/** Coordinate readout: coord({x:140,y:220}) -> "x:140, y:220". */
export const coord = (p: { x: number; y: number }): string =>
  `x:${Math.round(p.x)}, y:${Math.round(p.y)}`;

/**
 * The supplied artwork arrives in its own colours -- cyan, periwinkle, a blue
 * and orange office scene -- which would break the rule that the two palettes
 * never mix. These filters flatten each asset into the palette of the section
 * it sits in. A display treatment only: the source files are untouched.
 */
export const ART_FILTER = {
  /** Cyan/grey line art -> white-on-blue line art. */
  blueprint: 'grayscale(1) brightness(1.75) contrast(1.25)',
  /** Saturated blue/orange -> warm sand tones. */
  sand: 'grayscale(1) sepia(1) saturate(1.45) hue-rotate(-12deg) contrast(0.95)',
  /**
   * For line art that is mostly white fills with pale strokes, which the
   * standard sand filter leaves invisible against #e8dac6. Pushed darker and
   * more saturated so the strokes actually register.
   */
  sandInk: 'grayscale(1) sepia(1) saturate(2.6) hue-rotate(-16deg) brightness(0.5) contrast(1.7)',
  /**
   * The two supplied PNGs are black line-art on a fully transparent ground,
   * so a straight invert turns them into white wireframes with no background
   * plate to fight. Nothing else needed.
   */
  wireframe: 'invert(1)',
} as const;

export const SECTION_IDS = {
  hero: 'hero',
  ladder: 'ladder',
  map: 'map',
  pacing: 'pacing',
  brk: 'break',
  footer: 'footer',
} as const;
