import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Check, CheckSquare, Lock, Square, X } from 'lucide-react';
import CrosshairCard from '../components/primitives/CrosshairCard';
import ReviewPanel from '../components/ReviewPanel';
import { useAuth } from '../auth/AuthContext';
import DimensionDivider from '../components/primitives/DimensionDivider';
import Redline from '../components/primitives/Redline';
import StampButton from '../components/primitives/StampButton';
import SmilAnimation, { type AnimState } from '../components/SmilAnimation';
import { PLATES } from '../content/assets';
import { unlocks, type Stage } from '../content/path';
import {
  ART_FILTER,
  REDLINE_INK,
  alpha,
  blueprint,
  body,
  coord as fmtCoord,
  font,
  heading,
  label,
} from '../design/tokens';
import { useIsMobile } from '../hooks/useMediaQuery';

/**
 * The detail panel for one node.
 *
 * Mounted only while a node is open, because the animations total ~3.9MB and
 * eager-mounting all five would download the lot on first paint. It is kept
 * mounted through the close transition so the leave state can actually play.
 */

type Props = {
  stage: Stage;
  open: boolean;
  locked: boolean;
  onClose: () => void;
  onAnimState: (s: AnimState) => void;
};

export default function StagePanel({ stage, open, locked, onClose, onAnimState }: Props) {
  const isMobile = useIsMobile();
  const { isCheckpointDone, toggleCheckpoint, isGateCleared, toggleGate } = useAuth();
  const cleared = isGateCleared(stage.id);
  /** Named in the gate annotation, so the note says what it actually opens. */
  const nextStage = unlocks(stage.id);
  /** Set only on phones, and only for stages that declare a replacement. */
  const mobileOverride = isMobile ? stage.mobilePlate : undefined;

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
      aria-label={`${stage.serial}: ${stage.title}`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? 16 : 40,
        background: 'rgba(0,0,0,0.42)',
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)',
        opacity: open ? 1 : 0,
        transition: 'opacity 420ms ease',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 960,
          maxHeight: '88vh',
          overflowY: 'auto',
          background: blueprint.bg,
          border: `2px solid ${blueprint.line}`,
          transform: open ? 'translateY(0)' : 'translateY(10px)',
          transition: 'transform 420ms ease',
          boxShadow: '0 30px 70px rgba(0,0,0,0.35)',
        }}
      >
        {/* ---- Panel title bar ---- */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
            padding: isMobile ? '18px 18px 14px' : '22px 26px 18px',
            borderBottom: `1px solid ${alpha.line35}`,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ ...label, color: alpha.line75 }}>{stage.serial}</span>
              <span style={{ width: 20, height: 1, background: alpha.line55 }} />
              <span style={{ ...label, color: alpha.line55 }}>
                {fmtCoord(stage.coord)}
              </span>
              {stage.parallel && (
                <span style={{ ...label, color: alpha.line75 }}>· PARALLEL</span>
              )}
            </div>
            <h3 style={{ ...heading(isMobile ? 23 : 30), marginBottom: 6 }}>
              {stage.title}
            </h3>
            <p style={{ ...body(13.5), color: alpha.line75, fontStyle: 'italic' }}>
              {stage.subtitle}
            </p>
          </div>

          <button
            type="button"
            aria-label="Close panel"
            onClick={onClose}
            style={{
              flexShrink: 0,
              width: 34,
              height: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${blueprint.line}`,
              background: 'transparent',
              color: blueprint.line,
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* ---- Animation, or a static plate where one is specified ---- */}
        {mobileOverride ? (
          // This stage's animation is used elsewhere on mobile, so the panel
          // shows a still drawing instead of repeating it.
          <div
            style={{
              borderBottom: `1px solid ${alpha.line35}`,
              background: alpha.line08,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '14px 0',
            }}
          >
            <img
              src={PLATES[mobileOverride].src}
              alt={PLATES[mobileOverride].title}
              decoding="async"
              style={{
                display: 'block',
                maxWidth: '82%',
                height: 190,
                objectFit: 'contain',
                filter: ART_FILTER.wireframe,
                opacity: 0.95,
              }}
            />
          </div>
        ) : stage.animation ? (
          <div
            style={{
              borderBottom: `1px solid ${alpha.line35}`,
              background: alpha.line08,
            }}
          >
            <SmilAnimation
              asset={stage.animation}
              open={open}
              height={isMobile ? 180 : 240}
              onStateChange={onAnimState}
            />
          </div>
        ) : stage.plate ? (
          // The brief assigns no animation to this stage, so it gets a static
          // line drawing instead of borrowing another node's clip. The source
          // art is black on transparent, so a straight invert makes it a white
          // wireframe with no plate behind it to fight.
          <div
            style={{
              borderBottom: `1px solid ${alpha.line35}`,
              background: alpha.line08,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: isMobile ? '14px 0' : '18px 0',
            }}
          >
            <img
              src={PLATES[stage.plate].src}
              alt={PLATES[stage.plate].title}
              style={{
                display: 'block',
                maxWidth: '82%',
                height: isMobile ? 160 : 210,
                objectFit: 'contain',
                filter: ART_FILTER.wireframe,
                opacity: 0.95,
              }}
            />
          </div>
        ) : null}

        {/* ---- Body ---- */}
        <div style={{ padding: isMobile ? 18 : 26 }}>
          <p
            style={{
              ...body(isMobile ? 14.5 : 16),
              marginBottom: 22,
              color: alpha.textPrimary,
            }}
          >
            {stage.intro}
          </p>

          <DimensionDivider
            measure={`${stage.pacing.casual.toUpperCase()} CASUAL / ${stage.pacing.focused.toUpperCase()} FOCUSED`}
            animate={false}
          />

          {/* Learn */}
          <h4 style={{ ...heading(15), margin: '28px 0 14px', color: alpha.line75 }}>
            Scope
          </h4>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {stage.learn.map((item, i) => (
              <li
                key={item}
                style={{
                  display: 'flex',
                  gap: 12,
                  padding: '9px 0',
                  borderTop: i === 0 ? undefined : `1px dashed ${alpha.line20}`,
                }}
              >
                <span
                  style={{
                    ...label,
                    fontSize: 11,
                    color: alpha.line55,
                    flexShrink: 0,
                    paddingTop: 4,
                    minWidth: 26,
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span style={{ ...body(isMobile ? 13.5 : 14.5), color: alpha.textPrimary }}>
                  {item}
                </span>
              </li>
            ))}
          </ul>

          {/* Checkpoints */}
          <h4 style={{ ...heading(15), margin: '30px 0 14px', color: alpha.line75 }}>
            Checkpoints
          </h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))',
              gap: 20,
            }}
          >
            {stage.checkpoints.map((cp) => {
              const done = isCheckpointDone(cp.id);
              return (
                <CrosshairCard
                  key={cp.id}
                  serial={cp.id.toUpperCase()}
                  readout={done ? 'DONE' : undefined}
                  style={{
                    padding: 16,
                    background: done ? 'rgba(255,255,255,0.16)' : undefined,
                  }}
                >
                  <h5 style={{ ...heading(14), marginBottom: 8 }}>{cp.title}</h5>
                  <p style={{ ...body(14), color: alpha.textPrimary }}>{cp.detail}</p>

                  {/*
                    The payoff. Every checkpoint ends with something real to go
                    and do, not just a finished task.
                  */}
                  <div
                    style={{
                      marginTop: 14,
                      paddingTop: 12,
                      borderTop: `1px dashed ${alpha.line35}`,
                    }}
                  >
                    <span
                      style={{
                        ...label,
                        fontSize: 10,
                        display: 'inline-block',
                        marginBottom: 8,
                        padding: '3px 8px',
                        color: blueprint.bg,
                        background: blueprint.line,
                      }}
                    >
                      Next step
                    </span>
                    <p style={{ ...body(13.5), color: alpha.textPrimary, margin: 0 }}>
                      {cp.reward}
                    </p>
                  </div>

                  {cp.review && <ReviewPanel checkpoint={cp} />}

                  <button
                    type="button"
                    onClick={() => toggleCheckpoint(cp.id, !done)}
                    aria-pressed={done}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 9,
                      marginTop: 14,
                      padding: '9px 12px',
                      width: '100%',
                      border: `1px solid ${done ? blueprint.line : alpha.line55}`,
                      background: 'transparent',
                      color: blueprint.line,
                      cursor: 'pointer',
                      fontFamily: font.mono,
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {done ? (
                      <CheckSquare size={15} strokeWidth={2.5} />
                    ) : (
                      <Square size={15} strokeWidth={2.5} />
                    )}
                    {done ? 'Finished' : 'Mark finished'}
                  </button>
                </CrosshairCard>
              );
            })}
          </div>

          {/* Skill gate */}
          {stage.gate && (
            <div
              style={{
                marginTop: 34,
                padding: 18,
                border: `1px solid ${REDLINE_INK}`,
                background: 'rgba(144,73,51,0.12)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                <Lock size={13} strokeWidth={2.5} color={REDLINE_INK} />
                <span style={{ ...label, color: REDLINE_INK }}>
                  Skill gate — clear before moving on
                </span>
              </div>
              <p
                style={{
                  ...body(isMobile ? 14 : 15),
                  marginBottom: 16,
                  color: alpha.textPrimary,
                }}
              >
                {stage.gate}
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 18,
                  flexWrap: 'wrap',
                }}
              >
                <StampButton
                  rotate={cleared ? 0 : -1.5}
                  color={REDLINE_INK}
                  solid={cleared}
                  onClick={() => toggleGate(stage.id, !cleared)}
                >
                  {cleared ? (
                    <>
                      <Check size={13} strokeWidth={3} />
                      Gate cleared
                    </>
                  ) : (
                    'Mark gate cleared'
                  )}
                </StampButton>

                {!cleared && nextStage && (
                  <Redline rotate={-2} size={17}>
                    {`tick this to unlock ${nextStage.title}`}
                  </Redline>
                )}
              </div>
            </div>
          )}

          {locked && (
            <p
              style={{
                ...body(12),
                marginTop: 22,
                color: REDLINE_INK,
                fontFamily: font.mono,
              }}
            >
              This node is still gated by an earlier stage. You can read it, but the
              path expects that gate cleared first.
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
