import type { CSSProperties, ReactNode } from 'react';
import { alpha, blueprint, font, label } from '../../design/tokens';

/**
 * The card treatment for this system: a thin outline with a "+" crosshair mark
 * at each of the four corners, a dashed inner frame inset from it, and a
 * background transparent enough that the master grid reads straight through
 * (the "wireframe transparency" tenet).
 */

type Props = {
  children: ReactNode;
  /** Top-left technical label, e.g. "NODE-02". */
  serial?: string;
  /** Top-right readout, e.g. "3-4 WKS". */
  readout?: string;
  /** Bottom-left coordinate, e.g. "x:860, y:40". */
  coordinate?: string;
  /** 1px hairline, or 2px for the emphasised outline. */
  weight?: 1 | 2;
  /** Drop the fill entirely, letting the grid through untinted. */
  transparent?: boolean;
  style?: CSSProperties;
  onClick?: () => void;
  ariaLabel?: string;
  interactive?: boolean;
};

const CROSS = 9;

/** A "+" drawn as two hairlines, placed over a corner. */
function CornerCross({
  top,
  left,
  right,
  bottom,
  color,
}: {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  color: string;
}) {
  return (
    <span
      aria-hidden
      style={{
        position: 'absolute',
        top,
        left,
        right,
        bottom,
        width: CROSS * 2,
        height: CROSS * 2,
        pointerEvents: 'none',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: CROSS,
          left: 0,
          width: CROSS * 2,
          height: 1,
          background: color,
        }}
      />
      <span
        style={{
          position: 'absolute',
          left: CROSS,
          top: 0,
          height: CROSS * 2,
          width: 1,
          background: color,
        }}
      />
    </span>
  );
}

export default function CrosshairCard({
  children,
  serial,
  readout,
  coordinate,
  weight = 1,
  transparent = false,
  style,
  onClick,
  ariaLabel,
  interactive = false,
}: Props) {
  const line = blueprint.line;

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={ariaLabel}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      style={{
        position: 'relative',
        border: `${weight}px solid ${line}`,
        background: transparent ? 'transparent' : alpha.line08,
        padding: 20,
        cursor: onClick ? 'pointer' : undefined,
        transition: interactive
          ? 'background 160ms ease, transform 160ms ease'
          : undefined,
        ...style,
      }}
    >
      {/* Dashed inner frame, inset from the solid outline. */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          inset: 6,
          border: `1px dashed ${alpha.line35}`,
          pointerEvents: 'none',
        }}
      />

      <CornerCross top={-CROSS} left={-CROSS} color={line} />
      <CornerCross top={-CROSS} right={-CROSS} color={line} />
      <CornerCross bottom={-CROSS} left={-CROSS} color={line} />
      <CornerCross bottom={-CROSS} right={-CROSS} color={line} />

      {(serial || readout) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: 12,
            marginBottom: 12,
          }}
        >
          <span style={{ ...label, color: alpha.line75 }}>{serial}</span>
          <span style={{ ...label, color: alpha.line75 }}>{readout}</span>
        </div>
      )}

      {children}

      {coordinate && (
        <span
          aria-hidden
          style={{
            position: 'absolute',
            bottom: -18,
            left: 0,
            fontFamily: font.mono,
            fontSize: 9,
            letterSpacing: '0.1em',
            color: alpha.line55,
          }}
        >
          {coordinate}
        </span>
      )}
    </div>
  );
}
