import BlueprintSection from '../components/BlueprintSection';
import DraftingReveal, { revealStroke } from '../components/primitives/DraftingReveal';
import { HatchDefs, hatch } from '../components/primitives/HatchFill';
import Redline from '../components/primitives/Redline';
import { STAGES } from '../content/path';
import {
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
 * Suggested pacing, drawn as a dimensioned bar chart.
 *
 * Two series per stage: casual and focused. Stage 3's pacing is "ongoing"
 * rather than a duration, so it is drawn as an open-ended bar that runs off
 * the axis with a dashed edge, instead of being given an invented number.
 */

/** Axis maximum in weeks, with a little headroom past the longest bar. */
const AXIS_MAX = 6;
const TICKS = [0, 1, 2, 3, 4, 5, 6];

const ROW_H = 74;
const BAR_H = 20;
const LABEL_W = 210;
/** Total drawing width, and the gutter kept clear for the row readouts. */
const VB_W = 1160;
const READOUT_GUTTER = 190;

export default function Pacing() {
  const isMobile = useIsMobile();
  const labelW = isMobile ? 120 : LABEL_W;

  return (
    <BlueprintSection
      id={SECTION_IDS.pacing}
      sheet="SHEET 03 / 05"
      edgeNote="SCHEDULE — DURATION"
      style={{ padding: isMobile ? '64px 0 72px' : '88px 0 104px' }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: '0 auto',
          padding: isMobile ? '0 24px' : '0 48px',
        }}
      >
        <header style={{ marginBottom: 38, maxWidth: 700 }}>
          <span style={{ ...label, color: alpha.line75 }}>PLATE 03</span>
          <h2 style={{ ...heading(isMobile ? 30 : 44), margin: '12px 0 14px' }}>
            Suggested Pacing
          </h2>
          <p style={{ ...body(isMobile ? 14 : 15), color: alpha.textPrimary }}>
            Two schedules against the same path. Hatched bars are casual pace; solid
            rules are focused pace.
          </p>
        </header>

        {/* Legend */}
        <div
          style={{
            display: 'flex',
            gap: 28,
            marginBottom: 26,
            flexWrap: 'wrap',
          }}
        >
          <LegendSwatch kind="casual" text="CASUAL" />
          <LegendSwatch kind="focused" text="FOCUSED" />
        </div>

        <DraftingReveal threshold={0.2}>
          {(drawn) => (
            <div style={{ position: 'relative', overflowX: 'auto' }}>
              <svg
                viewBox={`0 0 ${VB_W} ${STAGES.length * ROW_H + 52}`}
                preserveAspectRatio="xMinYMin meet"
                style={{ width: '100%', minWidth: isMobile ? 520 : undefined, display: 'block' }}
                role="img"
                aria-label="Suggested pacing per stage, casual versus focused"
              >
                <HatchDefs
                  id="hatch-casual"
                  color={blueprint.line}
                  spacing={6}
                  angle={45}
                  wash="rgba(255,255,255,0.10)"
                />

                {/* Vertical grid + axis ticks */}
                {TICKS.map((t) => {
                  const x = labelW + (t / AXIS_MAX) * (VB_W - labelW - READOUT_GUTTER);
                  return (
                    <g key={t}>
                      <line
                        x1={x}
                        y1={0}
                        x2={x}
                        y2={STAGES.length * ROW_H}
                        stroke={blueprint.line}
                        strokeWidth={t === 0 ? 1.4 : 1}
                        opacity={t === 0 ? 0.8 : 0.22}
                      />
                      <text
                        x={x}
                        y={STAGES.length * ROW_H + 22}
                        textAnchor="middle"
                        fill={blueprint.line}
                        opacity={0.7}
                        style={{ fontFamily: font.mono, fontSize: 12, letterSpacing: '0.1em' }}
                      >
                        {t}
                      </text>
                    </g>
                  );
                })}

                <text
                  x={labelW + (VB_W - labelW - READOUT_GUTTER) / 2}
                  y={STAGES.length * ROW_H + 44}
                  textAnchor="middle"
                  fill={blueprint.line}
                  opacity={0.6}
                  style={{ fontFamily: font.mono, fontSize: 11.5, letterSpacing: '0.2em' }}
                >
                  WEEKS
                </text>

                {STAGES.map((s, i) => {
                  const y = i * ROW_H + 16;
                  const track = VB_W - labelW - READOUT_GUTTER;
                  const scale = (w: number) => (w / AXIS_MAX) * track;
                  const ongoing = s.pacing.casualWeeks === null;

                  const casualW = ongoing ? track : scale(s.pacing.casualWeeks!);
                  const focusedW = ongoing ? track : scale(s.pacing.focusedWeeks!);

                  return (
                    <g key={s.id}>
                      {/* Stage label */}
                      <text
                        x={0}
                        y={y + BAR_H}
                        fill={blueprint.line}
                        style={{
                          fontFamily: font.mono,
                          fontSize: isMobile ? 12 : 13,
                          fontWeight: 700,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {s.serial}
                      </text>
                      <text
                        x={0}
                        y={y + BAR_H + 16}
                        fill={blueprint.line}
                        opacity={0.65}
                        style={{ fontFamily: font.mono, fontSize: isMobile ? 11 : 12 }}
                      >
                        {s.title.length > 24 ? `${s.title.slice(0, 23)}…` : s.title}
                      </text>

                      {/* Casual bar: hatched */}
                      <rect
                        x={labelW}
                        y={y}
                        width={drawn ? casualW : 0}
                        height={BAR_H}
                        fill={hatch('hatch-casual')}
                        stroke={blueprint.line}
                        strokeWidth={1}
                        strokeDasharray={ongoing ? '5 4' : undefined}
                        style={{
                          transition: `width 900ms cubic-bezier(0.4,0,0.2,1) ${i * 110}ms`,
                        }}
                      />

                      {/* Focused bar: solid rule beneath */}
                      <rect
                        x={labelW}
                        y={y + BAR_H + 6}
                        width={drawn ? focusedW : 0}
                        height={8}
                        fill={blueprint.line}
                        opacity={ongoing ? 0.35 : 0.9}
                        style={{
                          transition: `width 900ms cubic-bezier(0.4,0,0.2,1) ${i * 110 + 90}ms`,
                        }}
                      />

                      {/* Readout */}
                      <text
                        x={labelW + Math.max(casualW, focusedW) + (ongoing ? 32 : 10)}
                        y={y + BAR_H - 4}
                        fill={blueprint.line}
                        opacity={drawn ? 0.9 : 0}
                        style={{
                          fontFamily: font.mono,
                          fontSize: 11.5,
                          letterSpacing: '0.12em',
                          transition: 'opacity 500ms ease 900ms',
                        }}
                      >
                        {ongoing
                          ? 'ONGOING'
                          : `${s.pacing.casual.toUpperCase()} / ${s.pacing.focused.toUpperCase()}`}
                      </text>

                      {/* The open-ended run-off arrow for the parallel track. */}
                      {ongoing && (
                        <path
                          d={`M ${labelW + track} ${y + BAR_H / 2} l 16 0 m -6 -5 l 6 5 l -6 5`}
                          stroke={blueprint.line}
                          strokeWidth={1.2}
                          fill="none"
                          opacity={drawn ? 0.8 : 0}
                          style={{ transition: 'opacity 500ms ease 1000ms' }}
                        />
                      )}

                      {/* Row rule */}
                      <line
                        x1={0}
                        y1={y + ROW_H - 20}
                        x2={VB_W - READOUT_GUTTER}
                        y2={y + ROW_H - 20}
                        stroke={blueprint.line}
                        strokeWidth={1}
                        opacity={0.18}
                        {...revealStroke(drawn, { delay: i * 110, duration: 700 })}
                      />
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
        </DraftingReveal>

        <div style={{ marginTop: 28 }}>
          <Redline rotate={-1.5} size={isMobile ? 17 : 19} leader="none">
            concepts run the whole way — no end date
          </Redline>
        </div>
      </div>
    </BlueprintSection>
  );
}

function LegendSwatch({ kind, text }: { kind: 'casual' | 'focused'; text: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <svg width="30" height="16" aria-hidden>
        <HatchDefs
          id={`legend-${kind}`}
          color={blueprint.line}
          spacing={6}
          angle={45}
          wash="rgba(255,255,255,0.10)"
        />
        {kind === 'casual' ? (
          <rect
            width="30"
            height="16"
            fill={hatch(`legend-${kind}`)}
            stroke={blueprint.line}
            strokeWidth="1"
          />
        ) : (
          <rect y="4" width="30" height="8" fill={blueprint.line} opacity={0.9} />
        )}
      </svg>
      <span style={{ ...label, color: alpha.line75 }}>{text}</span>
    </span>
  );
}
