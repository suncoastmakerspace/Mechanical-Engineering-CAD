import { ArrowDown } from 'lucide-react';
import BlueprintSection from '../components/BlueprintSection';
import DimensionDivider from '../components/primitives/DimensionDivider';
import Redline from '../components/primitives/Redline';
import StampButton from '../components/primitives/StampButton';
import { ASSETS, PLATES } from '../content/assets';
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
import { useIsMobile, useIsNarrow } from '../hooks/useMediaQuery';

/**
 * The establishing shot. Title block on the left, the skyscraper timelapse
 * standing in the right column as the drawing's subject.
 */

export default function Hero() {
  const isMobile = useIsMobile();
  const isNarrow = useIsNarrow();

  /*
   * The skyscraper timelapse is 2.2MB of SVG carrying roughly 12,000 SMIL
   * elements. A desktop decodes it fine, but on a throttled phone it never
   * finishes: measured at 6x CPU throttling on a slow connection it was still
   * reporting complete=false and naturalWidth=0 after 22 seconds, so the frame
   * just sat empty. Phones get the static machine elevation instead, which is
   * 38KB, the same white wireframe language, and reads as an establishing
   * drawing in its own right.
   */
  const plate = isMobile
    ? {
        /*
         * The baked final frame of the house drawing, not the animated SVG.
         * Several mobile browsers do not run SMIL inside an <img>, and this
         * particular Lottie export draws nothing at all without it, so the
         * frame came up empty on real phones. Already white line work on
         * transparency, so it needs no filter.
         */
        src: PLATES.houseFinal.src,
        alt: PLATES.houseFinal.title,
        filter: 'none',
        transform: 'none',
        fit: 'contain' as const,
        height: 130,
      }
    : {
        src: ASSETS.skyscraper.src,
        alt: ASSETS.skyscraper.title,
        filter: ART_FILTER.blueprint,
        // The artwork sits small inside its own 1080x1920 canvas, so it is
        // scaled up and the surplus margin cropped by the frame.
        transform: 'scale(1.55)',
        fit: 'contain' as const,
        height: 560,
      };
  const checkpointCount = STAGES.reduce((n, s) => n + s.checkpoints.length, 0);

  return (
    <BlueprintSection
      id={SECTION_IDS.hero}
      sheet="SHEET 01 / 05"
      edgeNote="ELEVATION — NORTH"
      style={{ minHeight: '88vh', display: 'flex', alignItems: 'center' }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 1560,
          margin: '0 auto',
          padding: isMobile ? '104px 24px 58px' : '112px 60px 72px',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.2fr) minmax(0, 0.8fr)',
          gap: isMobile ? 48 : 64,
          alignItems: 'center',
        }}
      >
        {/* ---- Title block ---- */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <span style={{ ...label, color: alpha.line75 }}>{SITE.docSerial}</span>
            <span style={{ width: 28, height: 1, background: alpha.line55 }} />
            <span style={{ ...label, color: alpha.line75 }}>{SITE.subtitle}</span>
          </div>

          <h1
            style={{
              ...heading(isNarrow ? 31 : isMobile ? 38 : 64),
              marginBottom: 4,
              // The second word set in outline, as a drafted-but-unfilled title.
              color: blueprint.line,
            }}
          >
            Mechanical
            <br />
            Engineering
            <br />
            <span
              style={{
                color: 'transparent',
                WebkitTextStroke: `1.5px ${blueprint.line}`,
              }}
            >
              with CAD
            </span>
          </h1>

          <div style={{ margin: '28px 0 26px', maxWidth: 620 }}>
            <DimensionDivider measure={`${STAGES.length} STAGES / ${checkpointCount} CHECKPOINTS`} />
          </div>

          <p
            style={{
              ...body(isNarrow ? 13 : isMobile ? 14 : 15.5),
              maxWidth: 620,
              color: alpha.textPrimary,
            }}
          >
            {SITE.tagline}
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 22,
              marginTop: 36,
              flexWrap: 'wrap',
            }}
          >
            <StampButton
              solid
              onClick={() =>
                document
                  .getElementById(SECTION_IDS.map)
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
            >
              Open Schematic
              <ArrowDown size={13} strokeWidth={2.5} />
            </StampButton>

            <Redline rotate={-3} size={isNarrow ? 15 : isMobile ? 16 : 19}>
              Modular Learning Sequence Tailored to You
            </Redline>
          </div>
        </div>

        {/* ---- Subject ---- */}
        <figure
          style={{
            position: 'relative',
            margin: 0,
            border: `1px solid ${alpha.line55}`,
            background: alpha.line08,
            padding: 10,
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
            FIG. 01
          </span>

          <div
            style={{
              position: 'relative',
              width: '100%',
              // Portrait asset: cap the height so it does not dominate the fold.
              height: plate.height,
              overflow: 'hidden',
            }}
          >
            <img
              src={plate.src}
              alt={plate.alt}
              decoding="async"
              style={{
                width: '100%',
                height: '100%',
                objectFit: plate.fit,
                objectPosition: 'center center',
                filter: plate.filter,
                opacity: 0.95,
                transform: plate.transform,
                transformOrigin: 'center center',
              }}
            />
          </div>

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
            <span>ESTABLISHING SHOT</span>
            <span style={{ fontFamily: font.mono }}>SCALE 1:1</span>
          </figcaption>
        </figure>
      </div>
    </BlueprintSection>
  );
}
