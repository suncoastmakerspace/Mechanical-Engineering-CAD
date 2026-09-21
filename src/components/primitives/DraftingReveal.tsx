import type { CSSProperties, ReactNode } from 'react';
import { useInView } from '../../hooks/useInView';
import { useReducedMotion } from '../../hooks/useMediaQuery';

/**
 * Line work that draws itself in the first time it scrolls into view.
 *
 * Exposes `drawn` to its children rather than reaching into them, because the
 * consumer knows which of its own paths should be stroked and in what order.
 * Pair it with `revealStroke()` below on each path.
 *
 * Respects prefers-reduced-motion by reporting `drawn` immediately, so the
 * final state renders with no transition at all.
 */

type Props = {
  children: (drawn: boolean) => ReactNode;
  threshold?: number;
  style?: CSSProperties;
};

export default function DraftingReveal({
  children,
  threshold = 0.25,
  style,
}: Props) {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold });
  const reduced = useReducedMotion();
  const drawn = reduced || inView;

  return (
    <div ref={ref} style={style}>
      {children(drawn)}
    </div>
  );
}

/**
 * Stroke props that make an SVG path draw itself.
 *
 * `pathLength={1}` normalises every path to a length of 1 regardless of its
 * real geometry, so one duration reads the same on a short connector and a
 * long one.
 */
export function revealStroke(
  drawn: boolean,
  { delay = 0, duration = 900 }: { delay?: number; duration?: number } = {},
) {
  return {
    pathLength: 1,
    strokeDasharray: 1,
    strokeDashoffset: drawn ? 0 : 1,
    style: {
      transition: `stroke-dashoffset ${duration}ms cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`,
    } as CSSProperties,
  };
}
