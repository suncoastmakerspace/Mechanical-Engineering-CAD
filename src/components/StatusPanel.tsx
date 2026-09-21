import { alpha, blueprint, font, label } from '../design/tokens';

/**
 * The persistent bottom-right readout. Same frosted construction as the nav
 * pills -- blurred backdrop, semi-transparent fill, soft shadow -- in white on
 * blueprint rather than warm cream.
 */

type Props = {
  /**
   * What sits in the middle of the viewport right now. Up to two, because a
   * section boundary often sits in that band while one scrolls into the next.
   */
  viewing: string[];
  /** The open node's animation state, surfaced as a live telemetry line. */
  animState?: string;
};

export default function StatusPanel({ viewing, animState }: Props) {
  return (
    <aside
      aria-live="polite"
      style={{
        position: 'fixed',
        right: 18,
        bottom: 18,
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        padding: '10px 14px',
        borderRadius: 10,
        border: `1px solid ${alpha.line55}`,
        background: 'rgba(119,141,178,0.55)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        boxShadow: '0 10px 28px rgba(0,0,0,0.22)',
        pointerEvents: 'none',
        maxWidth: '62vw',
      }}
    >
      <span style={{ ...label, color: alpha.line55, fontSize: 9 }}>Viewing</span>
      {viewing.map((name, i) => (
        <span
          key={name}
          style={{
            fontFamily: font.mono,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            // The second entry is the one being scrolled into, so it sits back.
            color: i === 0 ? blueprint.line : alpha.line75,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {name}
        </span>
      ))}
      {animState && (
        <span
          style={{
            fontFamily: font.mono,
            fontSize: 9,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: alpha.line75,
          }}
        >
          {`anim: ${animState}`}
        </span>
      )}
    </aside>
  );
}
