import { useCallback, useEffect, useRef, useState } from 'react';
import { ASSETS, type AssetKey } from '../content/assets';
import { ART_FILTER } from '../design/tokens';

/**
 * Animation state machine for the stage-node panels.
 *
 * The assets are SMIL-animated SVGs, not video, so the usual media API
 * (`load()`, `readyState >= 2`, `canplay`, `currentTime`) does not exist. The
 * SMIL equivalents on the root <svg> element do, and map one-for-one:
 *
 *   video.play()              -> svg.unpauseAnimations()
 *   video.pause()             -> svg.pauseAnimations()
 *   video.currentTime = 0     -> svg.setCurrentTime(0)
 *   video.readyState >= 2     -> contentDocument.documentElement resolves
 *   'canplay' event           -> the iframe 'load' event
 *
 * Reaching the SMIL clock requires `contentDocument`, which a bare `sandbox`
 * attribute would block. These SVGs contain no <script>, so the iframe is
 * sandboxed with `allow-same-origin` only: scripts stay denied, the clock
 * stays reachable.
 */

export type AnimState = 'enter' | 'idle' | 'leave' | 'hidden';

/** Length of the fade that substitutes for a leave clip, which no asset has. */
const LEAVE_MS = 420;

type Props = {
  asset: AssetKey;
  open: boolean;
  height?: number;
  onStateChange?: (state: AnimState) => void;
};

export default function SmilAnimation({
  asset,
  open,
  height = 220,
  onStateChange,
}: Props) {
  const meta = ASSETS[asset];

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const readyRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  /**
   * The machine's state is held in BOTH a ref and React state, deliberately.
   * The iframe load handler and the timeout callbacks are closures created
   * before the next open/close happens; reading `state` inside them would read
   * a stale value. Every transition writes the ref first, and the callbacks
   * only ever consult the ref.
   */
  const nodeStateRef = useRef<AnimState>('hidden');
  const [state, setState] = useState<AnimState>('hidden');

  /** Set if contentDocument is unreachable: fall back to an uncontrolled <img>. */
  const [fallback, setFallback] = useState(false);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const transition = useCallback(
    (next: AnimState) => {
      nodeStateRef.current = next;
      setState(next);
      onStateChange?.(next);
    },
    [onStateChange],
  );

  const playEnter = useCallback(() => {
    const svg = svgRef.current;

    // Mark the intent even when the asset has not loaded yet. The load handler
    // reads nodeStateRef and starts playback then, which is this component's
    // equivalent of waiting on 'canplay'.
    transition('enter');
    if (!svg || !readyRef.current) return;

    clearTimer();
    try {
      svg.setCurrentTime(0);
      svg.unpauseAnimations();
    } catch {
      setFallback(true);
      return;
    }

    timerRef.current = window.setTimeout(() => {
      if (nodeStateRef.current !== 'enter') return;
      // A looping asset keeps running under SMIL's own repeatCount="indefinite".
      // The one-shot asset has frozen on its final frame by now, so its clock is
      // stopped to spare the compositor: that frozen frame is its idle.
      if (!meta.loops) {
        try {
          svg.pauseAnimations();
        } catch {
          /* clock already gone; the frozen frame is still correct */
        }
      }
      transition('idle');
    }, meta.durationMs);
  }, [meta.durationMs, meta.loops, transition]);

  const playLeave = useCallback(() => {
    clearTimer();
    const svg = svgRef.current;
    transition('leave');

    timerRef.current = window.setTimeout(() => {
      if (nodeStateRef.current !== 'leave') return;
      try {
        svg?.pauseAnimations();
        svg?.setCurrentTime(0);
      } catch {
        /* nothing to reset */
      }
      transition('hidden');
    }, LEAVE_MS);
  }, [transition]);

  const handleLoad = useCallback(() => {
    try {
      const doc = iframeRef.current?.contentDocument;
      const root = doc?.documentElement as unknown as SVGSVGElement | undefined;

      if (!root || typeof root.pauseAnimations !== 'function') {
        setFallback(true);
        return;
      }

      svgRef.current = root;
      // Park the clock immediately so nothing burns frames before the panel opens.
      root.pauseAnimations();
      root.setCurrentTime(0);
      readyRef.current = true;

      // The open may have been requested while the asset was still loading.
      if (nodeStateRef.current === 'enter') playEnter();
    } catch {
      setFallback(true);
    }
  }, [playEnter]);

  useEffect(() => {
    if (open) {
      playEnter();
    } else if (nodeStateRef.current !== 'hidden') {
      playLeave();
    }
  }, [open, playEnter, playLeave]);

  useEffect(() => clearTimer, []);

  const frameStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    height: '100%',
    border: 'none',
    // The panel beneath owns all interaction; the artwork is decorative.
    pointerEvents: 'none',
    // Flatten the asset's own colours into the blueprint palette.
    filter: ART_FILTER.blueprint,
    opacity: 0.9,
  };

  return (
    <div
      data-anim-state={state}
      data-anim-asset={asset}
      style={{
        position: 'relative',
        width: '100%',
        height,
        overflow: 'hidden',
        opacity: open ? 1 : 0,
        transition: `opacity ${LEAVE_MS}ms ease`,
      }}
    >
      {fallback ? (
        <img src={meta.src} alt={meta.title} style={frameStyle} />
      ) : (
        <iframe
          ref={iframeRef}
          src={meta.src}
          title={meta.title}
          onLoad={handleLoad}
          loading="lazy"
          scrolling="no"
          sandbox="allow-same-origin"
          style={frameStyle}
        />
      )}
    </div>
  );
}
