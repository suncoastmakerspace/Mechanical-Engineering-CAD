import { REDLINE_INK, alpha, blueprint, font, label } from '../design/tokens';
import { useAuth } from '../auth/AuthContext';

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
  const { saveState, retrySave } = useAuth();

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
        // The retry needs to be clickable, so only the text ignores the pointer.
        pointerEvents: saveState === 'error' ? 'auto' : 'none',
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
      {/*
        A write that failed used to be invisible: the tick stayed on screen and
        quietly disappeared on the next reload.
      */}
      {saveState === 'error' && (
        <button
          type="button"
          onClick={retrySave}
          style={{
            marginTop: 6,
            padding: '5px 8px',
            border: `1px solid ${REDLINE_INK}`,
            background: 'rgba(90,36,23,0.35)',
            color: blueprint.line,
            fontFamily: font.mono,
            fontSize: 10,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          Not saved — retry
        </button>
      )}

      {saveState === 'saving' && (
        <span
          style={{
            fontFamily: font.mono,
            fontSize: 9,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: alpha.line55,
            marginTop: 4,
          }}
        >
          saving…
        </span>
      )}

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
