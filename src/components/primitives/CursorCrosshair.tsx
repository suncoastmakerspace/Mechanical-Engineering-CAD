import { useEffect, useRef, useState } from 'react';
import { alpha, blueprint, font } from '../../design/tokens';
import { useIsCoarsePointer } from '../../hooks/useMediaQuery';

/**
 * A drafting crosshair that tracks the cursor inside blueprint sections, with
 * a live coordinate readout beside it.
 *
 * Scoped to its parent element: it reports coordinates relative to the section
 * it sits in, not the viewport, so the numbers mean something. Mounted only in
 * blueprint-palette sections, and never on coarse pointers, where there is no
 * cursor to follow.
 */

export default function CursorCrosshair() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const coarse = useIsCoarsePointer();

  useEffect(() => {
    if (coarse) return;
    const host = hostRef.current;
    const section = host?.parentElement;
    if (!section) return;

    let frame = 0;
    const onMove = (e: MouseEvent) => {
      // Coalesce to one update per frame; mousemove fires far faster than paint.
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const rect = section.getBoundingClientRect();
        setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      });
    };
    const onLeave = () => setPos(null);

    section.addEventListener('mousemove', onMove);
    section.addEventListener('mouseleave', onLeave);
    return () => {
      section.removeEventListener('mousemove', onMove);
      section.removeEventListener('mouseleave', onLeave);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [coarse]);

  if (coarse || !pos) return <div ref={hostRef} style={{ display: 'none' }} />;

  const rule = {
    position: 'absolute' as const,
    background: alpha.line35,
    pointerEvents: 'none' as const,
  };

  return (
    <div
      ref={hostRef}
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 3,
        overflow: 'hidden',
      }}
    >
      <div style={{ ...rule, left: 0, right: 0, top: pos.y, height: 1 }} />
      <div style={{ ...rule, top: 0, bottom: 0, left: pos.x, width: 1 }} />

      {/* The pick point itself. */}
      <div
        style={{
          position: 'absolute',
          left: pos.x - 4,
          top: pos.y - 4,
          width: 8,
          height: 8,
          border: `1px solid ${blueprint.line}`,
          borderRadius: '50%',
        }}
      />

      <span
        style={{
          position: 'absolute',
          left: pos.x + 12,
          top: pos.y + 10,
          fontFamily: font.mono,
          fontSize: 10,
          letterSpacing: '0.12em',
          color: blueprint.line,
          background: 'rgba(0,0,0,0.25)',
          padding: '2px 5px',
          whiteSpace: 'nowrap',
        }}
      >
        {`x:${Math.round(pos.x)} y:${Math.round(pos.y)}`}
      </span>
    </div>
  );
}
