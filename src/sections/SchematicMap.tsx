import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Lock, Unlock } from 'lucide-react';
import BlueprintSection from '../components/BlueprintSection';
import CrosshairCard from '../components/primitives/CrosshairCard';
import DraftingReveal, { revealStroke } from '../components/primitives/DraftingReveal';
import StagePanel from './StagePanel';
import { BAND, CARD, MAP_FIELD, STAGES, stageById, type Stage } from '../content/path';
import {
  REDLINE_INK,
  SECTION_IDS,
  alpha,
  blueprint,
  body,
  font,
  heading,
  label,
} from '../design/tokens';
import { useIsMobile, useIsWideEnoughForMap } from '../hooks/useMediaQuery';
import { useAuth } from '../auth/AuthContext';
import type { AnimState } from '../components/SmilAnimation';

/**
 * The schematic map.
 *
 * Stages 0 -> 1 -> 2 -> 4 form the chain. Stage 3 is not in it: the source
 * calls it "parallel, not software" and paces it as "ongoing". It is therefore
 * drawn as a wide, shallow band beside Stage 4 -- so scanning the plate reads
 * 0, 1, 2, 3, 4 in order -- and shaped unlike any numbered step, so an ongoing
 * track is never mistaken for the fifth thing to do.
 *
 * The plate is ONE DRAWING. It is authored at MAP_FIELD's exact pixel size and
 * scaled as a unit, rather than having the SVG scale by viewBox while the cards
 * scale by percentage. Those were two mechanisms that merely agreed with each
 * other: the line work landed on the card edges, but the type inside the cards
 * kept its fixed size and spilled out as the window narrowed. Scaling the whole
 * canvas means type, cards and line work shrink together and can never
 * separate -- and verifying the layout once at scale 1 verifies every width.
 */

/** Edge anchors for a card at a given coordinate. */
const anchors = (s: Stage) => {
  const { x, y } = s.coord;
  const { width: w, height: h } = CARD;
  return {
    left: { x, y: y + h / 2 },
    right: { x: x + w, y: y + h / 2 },
    top: { x: x + w / 2, y },
    bottom: { x: x + w / 2, y: y + h },
  };
};

/**
 * Upper bound on the canvas scale, so an ultrawide monitor enlarges the plate
 * a little rather than turning it into billboard type.
 */
const MAX_SCALE = 1.12;

/**
 * Measures a wrapper and reports how much to scale the fixed-size canvas by.
 * One number drives the entire plate, which is what keeps it consistent.
 */
function useCanvasScale() {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const apply = (w: number) => {
      if (w > 0) setScale(Math.min(w / MAP_FIELD.width, MAX_SCALE));
    };
    apply(el.getBoundingClientRect().width);

    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([entry]) => apply(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { ref, scale };
}

export default function SchematicMap({
  onAnimState,
  onOpenChange,
}: {
  onAnimState: (s: AnimState | null) => void;
  onOpenChange: (title: string | null) => void;
}) {
  const isMobile = useIsMobile();
  // The plate needs real width to stay legible once scaled; narrower than this
  // it stacks instead.
  const wideEnoughForMap = useIsWideEnoughForMap();

  /*
   * Gate state lives in the session now rather than in this component, so a
   * member's unlocks survive a reload and belong to them rather than to the
   * browser tab.
   */
  const { isGateCleared } = useAuth();
  const [openId, setOpenId] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);

  const isLocked = useCallback(
    (s: Stage) => s.requires.some((r) => !isGateCleared(r)),
    [isGateCleared],
  );

  /**
   * The title of the stage actually holding this one shut, so the note names
   * it rather than describing a relationship with neither end named.
   */
  const blockedBy = useCallback(
    (s: Stage) => {
      const id = s.requires.find((r) => !isGateCleared(r));
      return id ? stageById(id)?.title : undefined;
    },
    [isGateCleared],
  );

  const openStage = (s: Stage) => {
    setClosing(false);
    setOpenId(s.id);
    onOpenChange(`${s.serial} ${s.title}`);
  };

  const closeStage = useCallback(() => {
    // Hold the panel mounted through the leave transition, so the animation
    // can actually play its fade before the node unmounts.
    setClosing(true);
    onOpenChange(null);
    window.setTimeout(() => {
      setOpenId(null);
      setClosing(false);
      onAnimState(null);
    }, 620);
  }, [onAnimState, onOpenChange]);

  const openStageData = openId ? STAGES.find((s) => s.id === openId) : undefined;
  const chain = useMemo(() => STAGES.filter((s) => !s.parallel), []);
  const parallel = useMemo(() => STAGES.find((s) => s.parallel), []);

  return (
    <BlueprintSection
      id={SECTION_IDS.map}
      sheet="SHEET 02 / 05"
      edgeNote="PLAN — LEARNING PATH"
      style={{ padding: isMobile ? '64px 0 72px' : '88px 0 104px' }}
    >
      <div
        style={{
          maxWidth: 1560,
          margin: '0 auto',
          padding: isMobile ? '0 24px' : '0 48px',
        }}
      >
        <header style={{ marginBottom: isMobile ? 34 : 48, maxWidth: 700 }}>
          <span style={{ ...label, color: alpha.line75 }}>PLATE 02</span>
          <h2 style={{ ...heading(isMobile ? 30 : 44), margin: '12px 0 14px' }}>
            Schematic Map
          </h2>
          <p style={{ ...body(isMobile ? 14 : 15), color: alpha.textPrimary }}>
            Four stages in sequence, plus one that runs alongside the whole way. Open
            any stage for its scope and checkpoints; two carry skill gates that hold the
            next stage shut until you mark them cleared.
          </p>
        </header>

        {wideEnoughForMap ? (
          <DesktopField
            chain={chain}
            parallel={parallel}
            isLocked={isLocked}
            blockedBy={blockedBy}
            onOpen={openStage}
          />
        ) : (
          <MobileStack
            stages={STAGES}
            isLocked={isLocked}
            blockedBy={blockedBy}
            onOpen={openStage}
          />
        )}
      </div>

      {openStageData && (
        <StagePanel
          stage={openStageData}
          open={!closing}
          locked={isLocked(openStageData)}
          onClose={closeStage}
          onAnimState={onAnimState}
        />
      )}
    </BlueprintSection>
  );
}

/* ------------------------------------------------------------------ */
/* Desktop: one fixed-size canvas, scaled as a single drawing          */
/* ------------------------------------------------------------------ */

function DesktopField({
  chain,
  parallel,
  isLocked,
  blockedBy,
  onOpen,
}: {
  chain: Stage[];
  parallel?: Stage;
  isLocked: (s: Stage) => boolean;
  blockedBy: (s: Stage) => string | undefined;
  onOpen: (s: Stage) => void;
}) {
  const { isGateCleared } = useAuth();
  const { ref: wrapRef, scale } = useCanvasScale();

  const byId = (id: string) => STAGES.find((s) => s.id === id)!;
  const s0 = anchors(byId('stage-0'));
  const s1 = anchors(byId('stage-1'));
  const s2 = anchors(byId('stage-2'));
  const s4 = anchors(byId('stage-4'));

  const band = parallel
    ? {
        x: parallel.coord.x,
        y: parallel.coord.y,
        w: BAND.width,
        h: BAND.height,
        midY: parallel.coord.y + BAND.height / 2,
        rightX: parallel.coord.x + BAND.width,
      }
    : null;

  /**
   * Orthogonal runs, none of which crosses a card or the band. An earlier
   * version sent the 2 -> 4 run straight through the band and bridged it with a
   * ground-colour casing; that erased gaps in the band's borders and read as
   * broken line work rather than as a crossing.
   */
  const connectors = [
    `M ${s0.right.x} ${s0.right.y} H ${s1.left.x}`,
    `M ${s1.right.x} ${s1.right.y} H ${s2.left.x}`,
    `M ${s2.bottom.x} ${s2.bottom.y} V ${s4.top.y}`,
  ];

  /**
   * One level dashed run from the band into Stage 4. The band's centre line is
   * set equal to Stage 4's precisely so this needs no dogleg.
   */
  const tie = band ? `M ${band.rightX} ${band.midY} H ${s4.left.x}` : null;

  const junctions = [
    s0.right,
    s1.left,
    s1.right,
    s2.left,
    s2.bottom,
    s4.top,
    ...(band ? [{ x: s4.left.x, y: band.midY }] : []),
  ];

  return (
    <DraftingReveal threshold={0.15}>
      {(drawn) => (
        <div
          ref={wrapRef}
          style={{
            position: 'relative',
            width: '100%',
            // The wrapper only reserves room; the canvas inside does the drawing.
            height: MAP_FIELD.height * scale,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              // Centred once the scale hits its ceiling on very wide screens.
              left: '50%',
              width: MAP_FIELD.width,
              height: MAP_FIELD.height,
              transform: `translateX(-50%) scale(${scale})`,
              transformOrigin: 'top center',
            }}
          >
            {band && parallel && (
              <div
                style={{
                  position: 'absolute',
                  left: band.x,
                  top: band.y,
                  width: band.w,
                  height: band.h,
                }}
              >
                <ParallelBand stage={parallel} onOpen={() => onOpen(parallel)} />
              </div>
            )}

            <svg
              // Tags the plate's own line work. Lucide's lock glyphs are also
              // <svg width=...>, so probes need something unambiguous.
              data-plate="field"
              width={MAP_FIELD.width}
              height={MAP_FIELD.height}
              aria-hidden
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                pointerEvents: 'none',
                overflow: 'visible',
              }}
            >
              {tie && (
                <path
                  d={tie}
                  data-line="tie"
                  fill="none"
                  stroke={blueprint.line}
                  strokeWidth={1.25}
                  strokeDasharray="7 6"
                  opacity={drawn ? 0.85 : 0}
                  style={{ transition: 'opacity 700ms ease 900ms' }}
                />
              )}

              {connectors.map((d, i) => (
                <path
                  key={d}
                  d={d}
                  data-line="chain"
                  fill="none"
                  stroke={blueprint.line}
                  strokeWidth={1.5}
                  {...revealStroke(drawn, { delay: 200 + i * 260, duration: 800 })}
                />
              ))}

              {junctions.map((pt) => (
                <circle
                  key={`${pt.x}-${pt.y}`}
                  cx={pt.x}
                  cy={pt.y}
                  r={3}
                  fill={blueprint.bg}
                  stroke={blueprint.line}
                  strokeWidth={1.5}
                  opacity={drawn ? 1 : 0}
                  style={{ transition: 'opacity 400ms ease 900ms' }}
                />
              ))}
            </svg>

            {chain.map((st) => (
              <div
                key={st.id}
                style={{
                  position: 'absolute',
                  left: st.coord.x,
                  top: st.coord.y,
                  width: CARD.width,
                  height: CARD.height,
                }}
              >
                <NodeCard
                  stage={st}
                  locked={isLocked(st)}
                  blockedBy={blockedBy(st)}
                  cleared={isGateCleared(st.id)}
                  onOpen={() => onOpen(st)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </DraftingReveal>
  );
}

/* ------------------------------------------------------------------ */
/* Mobile: vertical stack, already in numeric order                    */
/* ------------------------------------------------------------------ */

function MobileStack({
  stages,
  isLocked,
  blockedBy,
  onOpen,
}: {
  stages: Stage[];
  isLocked: (s: Stage) => boolean;
  blockedBy: (s: Stage) => string | undefined;
  onOpen: (s: Stage) => void;
}) {
  const { isGateCleared } = useAuth();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
      {stages.map((s, i) => (
        <div key={s.id}>
          <NodeCard
            stage={s}
            locked={isLocked(s)}
            blockedBy={blockedBy(s)}
            cleared={isGateCleared(s.id)}
            onOpen={() => onOpen(s)}
            compact
          />
          {i < stages.length - 1 && (
            <div
              aria-hidden
              style={{
                width: 1,
                height: 46,
                margin: '0 auto',
                background: blueprint.line,
                // Ties into and out of the parallel track are dashed, as on the plate.
                backgroundImage:
                  stages[i + 1].parallel || s.parallel
                    ? `repeating-linear-gradient(to bottom, ${blueprint.line} 0 6px, transparent 6px 12px)`
                    : undefined,
                opacity: stages[i + 1].parallel || s.parallel ? 0.75 : 1,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The parallel track band                                             */
/* ------------------------------------------------------------------ */

function ParallelBand({ stage, onOpen }: { stage: Stage; onOpen: () => void }) {
  return (
    <CrosshairCard
      weight={1}
      interactive
      onClick={onOpen}
      ariaLabel={`Open ${stage.serial}: ${stage.title} (parallel track)`}
      style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        // Left-aligned, NOT space-between: the Stage 2 -> 4 connector bridges
        // over this band's right-hand end, and its casing would erase anything
        // sitting under the crossing.
        justifyContent: 'flex-start',
        gap: 28,
        padding: '14px 22px',
        borderStyle: 'dashed',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
        <span style={{ ...label, color: alpha.line75 }}>{stage.serial}</span>
        <h3 style={{ ...heading(18), margin: 0, whiteSpace: 'nowrap' }}>{stage.title}</h3>
        <span
          style={{
            ...body(13),
            color: alpha.line75,
            fontStyle: 'italic',
            whiteSpace: 'nowrap',
          }}
        >
          {stage.subtitle}
        </span>
      </div>

      {/*
        The checkpoint count was dropped when the band narrowed to clear Stage
        4: its content needed about 892 units and only 816 were left. The count
        is in the panel anyway, and the chip carries what the count did not.
      */}
      <span
        style={{
          ...label,
          fontSize: 11,
          color: blueprint.bg,
          background: blueprint.line,
          padding: '4px 10px',
          flexShrink: 0,
          whiteSpace: 'nowrap',
        }}
      >
        RUNS THROUGHOUT
      </span>
    </CrosshairCard>
  );
}

/* ------------------------------------------------------------------ */
/* The node card                                                       */
/* ------------------------------------------------------------------ */

function NodeCard({
  stage,
  locked,
  blockedBy,
  cleared,
  onOpen,
  compact = false,
}: {
  stage: Stage;
  locked: boolean;
  blockedBy?: string;
  cleared: boolean;
  onOpen: () => void;
  compact?: boolean;
}) {
  return (
    <div style={{ position: 'relative', height: compact ? undefined : '100%' }}>
      <CrosshairCard
        weight={2}
        interactive
        onClick={onOpen}
        ariaLabel={`Open ${stage.serial}: ${stage.title}${locked ? ' (locked)' : ''}`}
        serial={stage.serial}
        readout={stage.pacing.focused.toUpperCase()}
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: compact ? 18 : 16,
          borderStyle: stage.parallel ? 'dashed' : 'solid',
          // A locked card keeps its full white line work and type. The lock
          // glyph and the note below say it is shut; dimming the whole card
          // only made it hard to read.
          background: cleared ? 'rgba(255,255,255,0.16)' : undefined,
        }}
      >
        <div>
          <h3
            style={{
              ...heading(compact ? 18 : 20),
              marginBottom: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {locked && <Lock size={14} strokeWidth={2.5} />}
            {cleared && !locked && <Unlock size={14} strokeWidth={2.5} />}
            {stage.title}
          </h3>
          <p style={{ ...body(13), color: alpha.line75, fontStyle: 'italic' }}>
            {stage.subtitle}
          </p>

          {/*
            Kept inside the card. As a floating margin note it overlapped
            whatever sat below and beside it.
          */}
          {locked && blockedBy && (
            <p
              style={{
                fontFamily: font.hand,
                fontSize: 16,
                lineHeight: 1.25,
                margin: '10px 0 0',
                color: REDLINE_INK,
                WebkitTextStroke: '0.4px currentColor',
              }}
            >
              {`locked — finish ${blockedBy} first`}
            </p>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: 10,
            marginTop: 12,
          }}
        >
          <span style={{ ...label, fontSize: 11, color: alpha.line75 }}>
            {stage.checkpoints.length} CHECKPOINT
            {stage.checkpoints.length > 1 ? 'S' : ''}
          </span>
          {stage.gate && (
            <span style={{ ...label, fontSize: 11, color: alpha.line75 }}>GATE</span>
          )}
          {stage.parallel && (
            <span style={{ ...label, fontSize: 11, color: alpha.line75 }}>ONGOING</span>
          )}
        </div>
      </CrosshairCard>
    </div>
  );
}
