import type { CSSProperties } from 'react';
import { REDLINE_INK, annotation } from '../../design/tokens';

/**
 * A redline: the margin note someone scribbled on the print after it was
 * drafted. Always in a different pen from the drawing it annotates, which is
 * the one sanctioned place the sand palette appears inside a blueprint
 * section.
 *
 * Optionally circled with a hand-drawn ellipse, or tied to what it refers to
 * with a leader line.
 */

type Props = {
  children: string;
  /** Draw a wobbling ellipse around the note, as on a marked-up print. */
  circled?: boolean;
  /** Add a leader line running out of the note towards its target. */
  leader?: 'none' | 'left' | 'right' | 'down';
  rotate?: number;
  size?: number;
  /** Tone down the stroke weight where the note is already large. */
  light?: boolean;
  color?: string;
  style?: CSSProperties;
};

export default function Redline({
  children,
  circled = false,
  leader = 'none',
  rotate = -2,
  size = 18,
  color = REDLINE_INK,
  light = false,
  style,
}: Props) {
  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-block',
        transform: `rotate(${rotate}deg)`,
        ...style,
      }}
    >
      {circled && (
        <svg
          aria-hidden
          viewBox="0 0 200 60"
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            inset: -10,
            width: 'calc(100% + 20px)',
            height: 'calc(100% + 20px)',
            overflow: 'visible',
            pointerEvents: 'none',
          }}
        >
          {/*
            Two offset, slightly-open ellipses read as one hand-drawn circle:
            a single clean ellipse looks machine-made.
          */}
          <path
            d="M 100 4 C 158 4 196 16 196 30 C 196 46 152 57 98 57 C 44 57 4 45 4 30 C 4 16 42 5 98 4"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M 96 6 C 150 5 193 14 194 31"
            fill="none"
            stroke={color}
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity={0.7}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}

      {leader !== 'none' && <Leader direction={leader} color={color} />}

      <span
        style={{
          ...annotation(size),
          position: 'relative',
          color,
          display: 'inline-block',
          /*
           * Architects Daughter ships a single weight, so fontWeight does
           * nothing here. Painting a hairline stroke in the same ink is what
           * actually thickens the glyphs on a mid-tone ground.
           */
          WebkitTextStroke: light ? '0.2px currentColor' : '0.4px currentColor',
        }}
      >
        {children}
      </span>
    </span>
  );
}

function Leader({
  direction,
  color,
}: {
  direction: 'left' | 'right' | 'down';
  color: string;
}) {
  const common: CSSProperties = {
    position: 'absolute',
    overflow: 'visible',
    pointerEvents: 'none',
  };

  if (direction === 'down') {
    return (
      <svg width="40" height="46" aria-hidden style={{ ...common, top: '100%', left: 8 }}>
        <path d="M 4 0 L 4 30 L 26 42" stroke={color} strokeWidth="1.5" fill="none" />
        <circle cx="26" cy="42" r="2.5" fill={color} />
      </svg>
    );
  }

  const isLeft = direction === 'left';
  return (
    <svg
      width="54"
      height="26"
      aria-hidden
      style={{
        ...common,
        top: '50%',
        [isLeft ? 'right' : 'left']: '100%',
        marginTop: -13,
        [isLeft ? 'marginRight' : 'marginLeft']: 6,
      }}
    >
      <path
        d={isLeft ? 'M 50 13 L 20 13 L 4 20' : 'M 4 13 L 34 13 L 50 20'}
        stroke={color}
        strokeWidth="1.5"
        fill="none"
      />
      <circle cx={isLeft ? 4 : 50} cy="20" r="2.5" fill={color} />
    </svg>
  );
}
