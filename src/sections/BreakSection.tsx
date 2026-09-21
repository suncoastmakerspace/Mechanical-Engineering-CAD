import { ASSETS } from '../content/assets';
import { ART_FILTER, SECTION_IDS, font, sand } from '../design/tokens';
import { useIsMobile, useIsNarrow } from '../hooks/useMediaQuery';

/**
 * The break in the drawing set.
 *
 * Sand palette ONLY. This section deliberately does not use BlueprintSection,
 * which is what keeps the two palettes from mixing: no master grid, no vellum
 * overlay, no cursor crosshair, no white-on-blue. Stepping into it should feel
 * like putting the print down.
 */

export default function BreakSection() {
  const isMobile = useIsMobile();
  const isNarrow = useIsNarrow();

  return (
    <section
      id={SECTION_IDS.brk}
      style={{
        position: 'relative',
        background: sand.paper,
        color: sand.rust,
        padding: isMobile ? '60px 24px' : '88px 48px',
        overflow: 'hidden',
        scrollMarginTop: 78,
      }}
    >
      {/* A single ochre rule, the only structure this section gets. */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          background: sand.ochre,
        }}
      />

      <div
        style={{
          maxWidth: 1080,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) minmax(0, 1fr)',
          gap: isMobile ? 40 : 72,
          alignItems: 'center',
        }}
      >
        <div>
          <span
            style={{
              fontFamily: font.mono,
              fontSize: 11,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: sand.muted,
            }}
          >
            Interlude — put the pencil down
          </span>

          <h2
            style={{
              fontFamily: font.mono,
              fontSize: isNarrow ? 25 : isMobile ? 29 : 44,
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              lineHeight: 1.1,
              margin: '16px 0 20px',
              color: sand.rust,
            }}
          >
            Plan before
            <br />
            you model
          </h2>

          <p
            style={{
              fontFamily: font.mono,
              fontSize: isNarrow ? 13.5 : isMobile ? 14.5 : 15.5,
              lineHeight: 1.7,
              margin: '0 0 18px',
              color: sand.rust,
              maxWidth: 460,
            }}
          >
            Most rework in CAD is not a modelling problem. It is a decision that was
            never made: which face is the datum, what the fit needs to be, which
            dimension the rest of the part should follow.
          </p>

          <p
            style={{
              fontFamily: font.hand,
              fontSize: isNarrow ? 18 : isMobile ? 19 : 21,
              lineHeight: 1.5,
              margin: 0,
              color: sand.rust,
              maxWidth: 420,
            }}
          >
            Sketch the thing on paper first. It costs five minutes and saves the
            feature tree.
          </p>
        </div>

        <figure style={{ margin: 0, position: 'relative' }}>
          <div
            style={{
              border: `1px solid ${sand.base}`,
              background: sand.paper,
              padding: 12,
            }}
          >
            <img
              src={ASSETS.officeDude.src}
              alt={ASSETS.officeDude.title}
              style={{
                display: 'block',
                width: '100%',
                height: isMobile ? 220 : 300,
                objectFit: 'contain',
                filter: ART_FILTER.sand,
              }}
            />
          </div>
          <figcaption
            style={{
              fontFamily: font.mono,
              fontSize: 10,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: sand.muted,
              marginTop: 10,
            }}
          >
            Fig. 04 — planning pass
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
