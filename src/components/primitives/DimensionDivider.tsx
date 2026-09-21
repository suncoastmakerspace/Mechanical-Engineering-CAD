import { blueprint, label } from '../../design/tokens';
import { useInView } from '../../hooks/useInView';
import { useReducedMotion } from '../../hooks/useMediaQuery';

/**
 * A divider drawn as a dimension line: arrowheads at both ends, a measurement
 * label in the middle. The label carries real layout context -- a stage's
 * pacing estimate, a count of checkpoints -- rather than a fake pixel width.
 *
 * The rules draw themselves in via stroke-dashoffset the first time the
 * divider scrolls into view.
 */

type Props = {
  /** The measurement text set into the middle of the line. */
  measure: string;
  color?: string;
  /** Skip the draw-in when the divider is already on screen at mount. */
  animate?: boolean;
};

export default function DimensionDivider({
  measure,
  color = blueprint.line,
  animate = true,
}: Props) {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.4 });
  const reduced = useReducedMotion();
  const drawn = reduced || !animate || inView;

  const rule = (flip: boolean) => (
    <svg
      height="9"
      width="100%"
      preserveAspectRatio="none"
      aria-hidden
      style={{ display: 'block', flex: 1, minWidth: 0, overflow: 'visible' }}
    >
      {/* The rule itself, drawn in from the label outwards. */}
      <line
        x1={flip ? '100%' : '0'}
        y1="4.5"
        x2={flip ? '0' : '100%'}
        y2="4.5"
        stroke={color}
        strokeWidth="1"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={drawn ? 0 : 1}
        style={{ transition: reduced ? undefined : 'stroke-dashoffset 900ms ease' }}
      />
    </svg>
  );

  return (
    <div
      ref={ref}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        opacity: drawn ? 1 : 0.2,
        transition: reduced ? undefined : 'opacity 500ms ease',
      }}
    >
      <Arrow direction="left" color={color} />
      {rule(false)}
      <span
        style={{
          ...label,
          color,
          whiteSpace: 'nowrap',
          padding: '0 4px',
        }}
      >
        {measure}
      </span>
      {rule(true)}
      <Arrow direction="right" color={color} />
    </div>
  );
}

function Arrow({
  direction,
  color,
}: {
  direction: 'left' | 'right';
  color: string;
}) {
  return (
    <svg width="9" height="9" aria-hidden style={{ display: 'block', flexShrink: 0 }}>
      <path
        d={direction === 'left' ? 'M 8 0 L 0 4.5 L 8 9' : 'M 1 0 L 9 4.5 L 1 9'}
        stroke={color}
        strokeWidth="1"
        fill="none"
      />
      <line
        x1={direction === 'left' ? 0.5 : 8.5}
        y1="0"
        x2={direction === 'left' ? 0.5 : 8.5}
        y2="9"
        stroke={color}
        strokeWidth="1"
      />
    </svg>
  );
}
