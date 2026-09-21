import type { CSSProperties, ReactNode } from 'react';
import { alpha, blueprint, gridBackground, label, vellumGrain } from '../design/tokens';
import CursorCrosshair from './primitives/CursorCrosshair';
import { useIsMobile } from '../hooks/useMediaQuery';

/**
 * The blueprint field: master grid, vellum grain, sheet border and a cursor
 * crosshair. Every blueprint-palette section is wrapped in this, which is also
 * what keeps the palettes from mixing -- the Break Section simply does not use
 * it.
 */

type Props = {
  id: string;
  children: ReactNode;
  /** Section serial, printed in the sheet margin, e.g. "SHEET 02". */
  sheet?: string;
  /** Margin note running up the left edge of the sheet. */
  edgeNote?: string;
  crosshair?: boolean;
  style?: CSSProperties;
};

export default function BlueprintSection({
  id,
  children,
  sheet,
  edgeNote,
  crosshair = true,
  style,
}: Props) {
  // There is no spare margin for a rotated note on a phone: it runs straight
  // through the content column.
  const isMobile = useIsMobile();

  return (
    <section
      id={id}
      style={{
        position: 'relative',
        background: blueprint.bg,
        color: blueprint.line,
        overflow: 'hidden',
        // Clear the fixed navbar when this section is scrolled to.
        scrollMarginTop: 78,
        ...style,
      }}
    >
      {/* The master grid. */}
      <div
        aria-hidden
        style={{ position: 'absolute', inset: 0, ...gridBackground, pointerEvents: 'none' }}
      />
      {/* Paper grain over the field. */}
      <div aria-hidden style={vellumGrain} />

      {/* Sheet border, inset like a real drawing frame. */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 14,
          border: `1px solid ${alpha.line35}`,
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      {crosshair && <CursorCrosshair />}

      {sheet && (
        <span
          aria-hidden
          style={{
            ...label,
            position: 'absolute',
            top: 22,
            right: 26,
            color: alpha.line55,
            zIndex: 4,
          }}
        >
          {sheet}
        </span>
      )}

      {edgeNote && !isMobile && (
        <span
          aria-hidden
          style={{
            ...label,
            position: 'absolute',
            left: 24,
            top: '50%',
            transformOrigin: 'left center',
            transform: 'rotate(-90deg) translateX(-50%)',
            color: alpha.line35,
            whiteSpace: 'nowrap',
            zIndex: 4,
          }}
        >
          {edgeNote}
        </span>
      )}

      <div style={{ position: 'relative', zIndex: 5, width: '100%' }}>{children}</div>
    </section>
  );
}
