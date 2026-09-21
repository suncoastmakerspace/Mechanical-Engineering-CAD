import BlueprintSection from '../components/BlueprintSection';
import { PLATES } from '../content/assets';
import { SITE, STAGES } from '../content/path';
import {
  ART_FILTER,
  SECTION_IDS,
  alpha,
  blueprint,
  body,
  font,
  heading,
  label,
} from '../design/tokens';
import { useIsMobile } from '../hooks/useMediaQuery';

/**
 * The title block, as on a real drawing sheet: the sheet's own metadata set
 * into ruled cells in the bottom-right corner of the drawing.
 */

const cells = [
  { k: 'Sheet', v: '05 OF 05' },
  { k: 'Scale', v: 'NTS' },
  { k: 'Drawn', v: 'ME/CAD' },
  { k: 'Rev', v: 'A' },
];

export default function Footer() {
  const isMobile = useIsMobile();
  const checkpoints = STAGES.reduce((n, s) => n + s.checkpoints.length, 0);
  const gates = STAGES.filter((s) => s.gate).length;

  return (
    <BlueprintSection
      id={SECTION_IDS.footer}
      sheet="SHEET 05 / 05"
      crosshair={false}
      style={{ padding: isMobile ? '58px 0 36px' : '80px 0 44px' }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: '0 auto',
          padding: isMobile ? '0 24px' : '0 48px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.3fr) minmax(0, 1fr)',
            gap: isMobile ? 40 : 64,
            alignItems: 'start',
          }}
        >
          <div>
            <h2 style={{ ...heading(isMobile ? 24 : 30), marginBottom: 16 }}>
              What comes after
            </h2>
            <p
              style={{
                ...body(isMobile ? 14.5 : 15.5),
                color: alpha.textPrimary,
                maxWidth: 540,
              }}
            >
              {SITE.outro}
            </p>

            {/*
              The supplied machine elevation, inverted to white line-work: a
              general-arrangement drawing sitting on the sheet. Framed and
              captioned like the other figures rather than hidden as a
              watermark, which at 12% opacity nobody could see.

              Desktop only. On phones this drawing already appears in Stage 1's
              panel, and repeating it at the foot of the same scroll is just
              weight for no gain.
            */}
            {!isMobile && (
            <figure
              style={{
                position: 'relative',
                margin: isMobile ? '30px 0 0' : '38px 0 0',
                border: `1px solid ${alpha.line55}`,
                background: alpha.line08,
                padding: 10,
                maxWidth: 560,
              }}
            >
              <span
                style={{
                  ...label,
                  position: 'absolute',
                  top: -9,
                  left: 14,
                  background: blueprint.bg,
                  padding: '0 8px',
                  color: alpha.line75,
                }}
              >
                FIG. 05
              </span>

              <img
                src={PLATES.engineeringModel.src}
                alt={PLATES.engineeringModel.title}
                style={{
                  display: 'block',
                  width: '100%',
                  height: isMobile ? 300 : 420,
                  objectFit: 'contain',
                  filter: ART_FILTER.wireframe,
                  opacity: 0.95,
                }}
              />

              <figcaption
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  marginTop: 10,
                  ...label,
                  color: alpha.line55,
                }}
              >
                <span>GENERAL ARRANGEMENT</span>
                <span style={{ fontFamily: font.mono }}>NTS</span>
              </figcaption>
            </figure>
            )}
          </div>

          {/* Title block */}
          <div
            style={{
              border: `2px solid ${blueprint.line}`,
              background: alpha.line08,
            }}
          >
            <div
              style={{
                padding: '12px 16px',
                borderBottom: `1px solid ${blueprint.line}`,
              }}
            >
              <span style={{ ...label, color: alpha.line75 }}>Title</span>
              <p
                style={{
                  ...heading(15),
                  marginTop: 6,
                  lineHeight: 1.3,
                }}
              >
                {SITE.name}
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              }}
            >
              {cells.map((c, i) => (
                <div
                  key={c.k}
                  style={{
                    padding: '10px 16px',
                    borderRight: i % 2 === 0 ? `1px solid ${alpha.line35}` : undefined,
                    borderBottom: i < 2 ? `1px solid ${alpha.line35}` : undefined,
                  }}
                >
                  <span style={{ ...label, fontSize: 10, color: alpha.line55 }}>
                    {c.k}
                  </span>
                  <p
                    style={{
                      fontFamily: font.mono,
                      fontSize: 15,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      margin: '4px 0 0',
                    }}
                  >
                    {c.v}
                  </p>
                </div>
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                padding: '10px 16px',
                borderTop: `1px solid ${blueprint.line}`,
              }}
            >
              <span style={{ ...label, fontSize: 11, color: alpha.line75 }}>
                {STAGES.length} NODES
              </span>
              <span style={{ ...label, fontSize: 11, color: alpha.line75 }}>
                {checkpoints} CHECKPOINTS
              </span>
              <span style={{ ...label, fontSize: 11, color: alpha.line75 }}>
                {gates} GATES
              </span>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: isMobile ? 48 : 72,
            paddingTop: 18,
            borderTop: `1px solid ${alpha.line35}`,
            display: 'flex',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <span style={{ ...label, fontSize: 10, color: alpha.line55 }}>
            {SITE.docSerial} — {SITE.subtitle}
          </span>
          <span style={{ ...label, fontSize: 10, color: alpha.line55 }}>
            END OF DRAWING SET
          </span>
        </div>
      </div>
    </BlueprintSection>
  );
}
