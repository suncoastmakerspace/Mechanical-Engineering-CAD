import { blueprint } from '../../design/tokens';

/**
 * Diagonal hatching, the drafting convention for a filled region and the
 * treatment the reference dashboard uses on its bars.
 *
 * Render <HatchDefs /> once inside an <svg>, then fill shapes with
 * `url(#<id>)`.
 */

type Props = {
  id: string;
  color?: string;
  /** Distance between hatch lines. Tighter reads as denser material. */
  spacing?: number;
  strokeWidth?: number;
  /** Degrees. 45 is the drafting default; 135 distinguishes a second series. */
  angle?: number;
  /** A faint wash behind the hatching, so bars read at a glance. */
  wash?: string;
};

export function HatchDefs({
  id,
  color = blueprint.line,
  spacing = 6,
  strokeWidth = 1,
  angle = 45,
  wash,
}: Props) {
  return (
    <defs>
      <pattern
        id={id}
        width={spacing}
        height={spacing}
        patternUnits="userSpaceOnUse"
        patternTransform={`rotate(${angle})`}
      >
        {wash && <rect width={spacing} height={spacing} fill={wash} />}
        <line
          x1="0"
          y1="0"
          x2="0"
          y2={spacing}
          stroke={color}
          strokeWidth={strokeWidth}
        />
      </pattern>
    </defs>
  );
}

export const hatch = (id: string) => `url(#${id})`;
