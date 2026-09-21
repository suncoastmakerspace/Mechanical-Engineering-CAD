import type { CSSProperties, ReactNode } from 'react';
import { useState } from 'react';
import { alpha, blueprint, font } from '../../design/tokens';

/**
 * Buttons as approval stamps: rectangular, double-ruled, block caps, and
 * rotated a degree or two so they read as something pressed onto the drawing
 * rather than drafted into it.
 */

type Props = {
  children: ReactNode;
  onClick?: () => void;
  /** Degrees of stamp rotation. Zero for anything inside a tight layout. */
  rotate?: number;
  color?: string;
  /** Fill the stamp, for the one primary call to action. */
  solid?: boolean;
  disabled?: boolean;
  style?: CSSProperties;
  type?: 'button' | 'submit';
};

export default function StampButton({
  children,
  onClick,
  rotate = -1.5,
  color = blueprint.line,
  solid = false,
  disabled = false,
  style,
  type = 'button',
}: Props) {
  const [hover, setHover] = useState(false);

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 22px',
        border: `2px solid ${color}`,
        // The second rule, inset, is what makes it read as a stamp.
        boxShadow: `inset 0 0 0 1px ${solid ? 'transparent' : alpha.line35}`,
        background: solid
          ? color
          : hover && !disabled
            ? alpha.line20
            : 'transparent',
        color: solid ? blueprint.bg : color,
        fontFamily: font.mono,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        transform: `rotate(${rotate}deg)`,
        transition: 'background 160ms ease, transform 160ms ease',
        ...style,
      }}
    >
      {children}
    </button>
  );
}
