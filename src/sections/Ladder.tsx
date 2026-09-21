import { COGS } from '../content/assets';
import { LADDER } from '../content/path';
import { ART_FILTER, SECTION_IDS, font, sand } from '../design/tokens';
import { useIsMobile, useIsNarrow } from '../hooks/useMediaQuery';

/**
 * The software ladder: a second, smaller sand band, sitting directly after the
 * hero.
 *
 * Its job is partly structural. With only one sand section in the whole set,
 * the Break reads as an anomaly; putting a shorter one early establishes sand
 * as part of the language before the reader meets the long one.
 *
 * Sand palette ONLY. Like BreakSection, it deliberately does not use
 * BlueprintSection -- no master grid, no vellum overlay, no cursor crosshair.
 * That omission is what enforces the separation.
 */

export default function Ladder() {
  const isMobile = useIsMobile();
  const isNarrow = useIsNarrow();

  return (
    <section
      id={SECTION_IDS.ladder}
      style={{
        position: 'relative',
        background: sand.paper,
        color: sand.rust,
        padding: isMobile ? '44px 24px 48px' : '60px 48px 64px',
        overflow: 'hidden',
        scrollMarginTop: 78,
      }}
    >
      {/* One ochre rule top and bottom, so the band reads as an inserted sheet. */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: sand.ochre,
        }}
      />

      <div
        style={{
          maxWidth: 1180,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) 210px',
          gap: isMobile ? 28 : 48,
          alignItems: 'center',
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 14,
              marginBottom: isMobile ? 20 : 24,
              flexWrap: 'wrap',
            }}
          >
            <h2
              style={{
                fontFamily: font.mono,
                fontSize: isNarrow ? 21 : isMobile ? 24 : 30,
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                margin: 0,
                color: sand.rust,
              }}
            >
              The Ladder
            </h2>
            <span
              style={{
                fontFamily: font.mono,
                fontSize: 11,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: sand.muted,
              }}
            >
              four rungs, easiest first
            </span>
          </div>

          <ol style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {LADDER.map((rung, i) => (
              <li
                key={rung.n}
                style={{
                  display: 'grid',
                  gridTemplateColumns: isNarrow ? '30px 1fr' : '44px minmax(0, 1fr)',
                  gap: isNarrow ? 10 : 18,
                  alignItems: 'baseline',
                  padding: isMobile ? '11px 0' : '13px 0',
                  borderTop: i === 0 ? `1px solid ${sand.base}` : `1px dashed ${sand.base}`,
                  // The Fusion rung is after this path, not on it. Dimmed by
                  // colour rather than opacity, which would stack on top of an
                  // already low-contrast tone.
                  opacity: rung.ahead ? 0.82 : 1,
                }}
              >
                <span
                  style={{
                    fontFamily: font.mono,
                    fontSize: isNarrow ? 12 : 14,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: rung.ahead ? sand.muted : sand.ochre,
                  }}
                >
                  {rung.n}
                </span>

                <span
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'baseline',
                    gap: isMobile ? '2px 12px' : '4px 16px',
                  }}
                >
                  <span
                    style={{
                      fontFamily: font.mono,
                      fontSize: isNarrow ? 14 : isMobile ? 15 : 17,
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      color: rung.ahead ? sand.muted : sand.rust,
                    }}
                  >
                    {rung.name}
                  </span>
                  <span
                    style={{
                      fontFamily: font.mono,
                      fontSize: isNarrow ? 12 : 13.5,
                      lineHeight: 1.5,
                      color: rung.ahead ? sand.muted : sand.rust,
                    }}
                  >
                    {rung.note}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* Gear loop, toned into the sand palette. */}
        <figure
          style={{
            margin: 0,
            justifySelf: isMobile ? 'center' : 'end',
            width: isMobile ? 146 : 210,
          }}
        >
          <img
            src={COGS.src}
            alt=""
            aria-hidden
            style={{
              display: 'block',
              width: '100%',
              filter: ART_FILTER.sandInk,
              opacity: 1,
            }}
          />
        </figure>
      </div>
    </section>
  );
}
