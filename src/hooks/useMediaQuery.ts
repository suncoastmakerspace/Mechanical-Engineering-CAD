import { useEffect, useState } from 'react';

/**
 * Because every style in this project is inline, breakpoints cannot live in
 * CSS. They are resolved in JS and read as booleans by the components.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/**
 * A phone, including one held sideways.
 *
 * Width alone is not enough: a phone in landscape is about 844x390, which is
 * wider than any width-only breakpoint would catch, so it used to fall through
 * to the desktop layout. That meant a 560px-tall hero figure inside a 390px
 * viewport, and the 2.2MB skyscraper SVG that phones cannot render at all.
 *
 * The height clause is what catches it. Phones in landscape are around 390 to
 * 430 tall; the shortest tablet in landscape is about 744, so there is a wide
 * gap either side of 520 and nothing sits near it.
 */
export const useIsMobile = () =>
  useMediaQuery('(max-width: 768px), (max-height: 520px)');

/**
 * Small handsets. The type scale runs large by design -- it has to, to clear
 * the contrast bar on a mid-tone ground -- so it needs dialling back below
 * about 420px or the hero headline overruns its column.
 */
export const useIsNarrow = () => useMediaQuery('(max-width: 420px)');

/**
 * Wide enough to draw the schematic plate rather than stack it.
 *
 * The plate scales as one drawing, so below this the 11px micro-labels fall
 * under about 9px and stop being readable. At 1180 the scale is roughly 0.82,
 * which still holds up.
 */
export const useIsWideEnoughForMap = () => useMediaQuery('(min-width: 1180px)');

/** Touch / pen devices have no hover cursor, so the crosshair is pointless. */
export const useIsCoarsePointer = () => useMediaQuery('(pointer: coarse)');

export const useReducedMotion = () =>
  useMediaQuery('(prefers-reduced-motion: reduce)');
