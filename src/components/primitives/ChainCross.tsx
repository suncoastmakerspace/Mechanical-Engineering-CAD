import { useEffect, useRef, useState } from 'react';
import { alpha, blueprint } from '../../design/tokens';

/**
 * Two runs of chain across the diagonals of whatever this sits inside, for a
 * node that is shut.
 *
 * The lock glyph and the redline note already say a card is locked, but both
 * are small and sit inside the type. The chain is the thing you see from across
 * the map, and it reads as drawn rather than as a disabled state.
 *
 * Measured rather than drawn in a normalised viewBox: the cards are 320x190 on
 * the field and full-width when stacked on a phone, so a `preserveAspectRatio`
 * of `none` would stretch every link into an oval on one axis and squash it on
 * the other.
 */

/*
 * Link geometry, in px. Deliberately small and thin: at first pass the links
 * were half again this size at full opacity, and they buried the one line on
 * the card that says what to go and do ("locked - finish Onshape first").
 * The chain has to be legible as a chain without taking the card with it.
 */
const LINK = 12;
const WIDTH = 7;
/** Less than LINK, so consecutive links overlap and appear to interlock. */
const STEP = 8.5;

export default function ChainCross() {
  const host = useRef<HTMLSpanElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const measure = () =>
      setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <span
      ref={host}
      aria-hidden
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      {size && size.w > 0 && size.h > 0 && (
        <svg
          width={size.w}
          height={size.h}
          viewBox={`0 0 ${size.w} ${size.h}`}
          style={{ display: 'block', overflow: 'visible' }}
        >
          {/* Both diagonals, corner to corner, inset so links stay on the card. */}
          {[
            [10, 10, size.w - 10, size.h - 10],
            [size.w - 10, 10, 10, size.h - 10],
          ].map(([x1, y1, x2, y2], run) => (
            <ChainRun key={run} x1={x1} y1={y1} x2={x2} y2={y2} />
          ))}
        </svg>
      )}
    </span>
  );
}

function ChainRun({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
  const count = Math.max(2, Math.round(len / STEP));

  return (
    <g transform={`translate(${x1} ${y1}) rotate(${deg})`}>
      {Array.from({ length: count }, (_, i) => {
        const cx = ((i + 0.5) / count) * len;
        /*
         * Alternating links sit in perpendicular planes on a real chain, so
         * every other one is drawn narrow. Without that the run reads as a
         * string of beads.
         */
        const edgeOn = i % 2 === 1;
        return (
          <ellipse
            key={i}
            cx={cx}
            cy={0}
            rx={LINK / 2}
            ry={edgeOn ? WIDTH / 4.5 : WIDTH / 2}
            fill="none"
            stroke={blueprint.line}
            strokeWidth={edgeOn ? 0.85 : 1.05}
            opacity={edgeOn ? 0.45 : 0.62}
          />
        );
      })}
      {/* A hairline through the run, which is what makes it hang together. */}
      <line
        x1={0}
        y1={0}
        x2={len}
        y2={0}
        stroke={alpha.line20}
        strokeWidth={0.6}
      />
    </g>
  );
}
