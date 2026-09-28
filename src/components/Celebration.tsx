import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Download, X } from 'lucide-react';
import ModelViewer from './ModelViewer';
import CrosshairCard from './primitives/CrosshairCard';
import StampButton from './primitives/StampButton';
import { REDLINE_INK, alpha, blueprint, body, font, heading, label } from '../design/tokens';
import { useIsMobile } from '../hooks/useMediaQuery';

/**
 * Shown once, the moment the last of the twelve checkpoints is ticked.
 *
 * The keyphrase is the whole point, so it is set as a stamp rather than buried
 * in a sentence, and it stays reachable from the map header afterwards in case
 * this gets dismissed before anyone reads it.
 */

export const KEYPHRASE = 'MakerspaceMech';

/** The badge earned by finishing the path. Sources in /models. */
export const BADGE_STL = '/assets/reference/badge-makerspace.stl';

export default function Celebration({ onClose }: { onClose: () => void }) {
  const isMobile = useIsMobile();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Path complete"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? 16 : 40,
        background: 'rgba(0,0,0,0.52)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 520, maxHeight: '92vh', overflowY: 'auto' }}
      >
        <CrosshairCard
          weight={2}
          serial="DOC-001"
          readout="SIGNED OFF"
          style={{ background: blueprint.bg, padding: isMobile ? 22 : 30 }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 12,
            }}
          >
            <div>
              <span style={{ ...label, color: alpha.line75 }}>All 12 checkpoints</span>
              <h3 style={{ ...heading(isMobile ? 26 : 34), margin: '10px 0 0' }}>
                Path complete
              </h3>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              style={{
                width: 30,
                height: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${blueprint.line}`,
                background: 'transparent',
                color: blueprint.line,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <X size={15} />
            </button>
          </div>

          <p
            style={{
              ...body(isMobile ? 15 : 16.5),
              color: alpha.textPrimary,
              margin: '18px 0 18px',
            }}
          >
            Print the makerspace badge, then next meeting go ask Diego for some candy.
          </p>

          <div style={{ marginBottom: 18 }}>
            <ModelViewer src={BADGE_STL} caption="Your badge. Print it in whatever color you like" />
            <div style={{ marginTop: 12 }}>
              <StampButton
                rotate={0}
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = BADGE_STL;
                  a.download = 'makerspace-badge.stl';
                  a.click();
                }}
              >
                <Download size={13} strokeWidth={2.5} />
                Download the file to print
              </StampButton>
            </div>
          </div>

          <div
            style={{
              border: `2px solid ${blueprint.line}`,
              padding: isMobile ? '14px 16px' : '16px 20px',
              transform: 'rotate(-1.2deg)',
              background: alpha.line08,
            }}
          >
            <span style={{ ...label, color: alpha.line75, display: 'block', marginBottom: 8 }}>
              Keyphrase
            </span>
            <span
              style={{
                fontFamily: font.mono,
                fontSize: isMobile ? 24 : 30,
                fontWeight: 700,
                letterSpacing: '0.06em',
                color: blueprint.line,
                wordBreak: 'break-word',
              }}
            >
              {KEYPHRASE}
            </span>
          </div>

          <p
            style={{
              fontFamily: font.hand,
              fontSize: isMobile ? 17 : 19,
              color: REDLINE_INK,
              WebkitTextStroke: '0.4px currentColor',
              margin: '20px 0 22px',
            }}
          >
            twelve projects, start to finish. print the badge, you earned it.
          </p>

          <StampButton solid rotate={-1} onClick={onClose}>
            Nice
          </StampButton>
        </CrosshairCard>
      </div>
    </div>,
    document.body,
  );
}
