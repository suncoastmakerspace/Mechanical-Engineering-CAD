/**
 * Per-asset metadata for the SMIL animations in /public/assets.
 *
 * These are SMIL-animated SVGs, not video and not HTML. `durationMs` is the
 * measured length of one cycle, read off the longest `dur=` in each file, and
 * `loops` records whether the file actually repeats.
 */

export type AssetKey =
  | 'skyscraper'
  | 'writing'
  | 'house'
  | 'textLoop'
  | 'arm'
  | 'officeDude';

export type AssetMeta = {
  src: string;
  /** Length of one cycle in ms, used to time the enter -> idle transition. */
  durationMs: number;
  /** False means the clip plays once and freezes on its final frame. */
  loops: boolean;
  /** Intrinsic aspect ratio (w / h), so frames reserve the right box. */
  aspect: number;
  title: string;
};

export const ASSETS: Record<AssetKey, AssetMeta> = {
  skyscraper: {
    src: '/assets/skyscraper-construction.svg',
    durationMs: 6017,
    loops: true,
    aspect: 1080 / 1920,
    title: 'Skyscraper construction timelapse',
  },
  writing: {
    src: '/assets/writing-signature.svg',
    durationMs: 3500,
    loops: true,
    aspect: 1,
    title: 'Hand sketching with a pen',
  },
  house: {
    // 223 <set fill="freeze"> steps at 30fps that draw a house and then hold.
    // The only one-shot asset in the set: its frozen last frame is its idle.
    src: '/assets/house-construction.svg',
    durationMs: 2840,
    loops: false,
    aspect: 1920 / 1080,
    title: 'House construction line drawing',
  },
  textLoop: {
    src: '/assets/text-generation-loop.svg',
    durationMs: 3583,
    loops: true,
    aspect: 1,
    title: 'Continuous annotation loop',
  },
  arm: {
    src: '/assets/arm-machines.svg',
    durationMs: 4000,
    loops: true,
    aspect: 1920 / 1080,
    title: 'Robotic arms working',
  },
  officeDude: {
    src: '/assets/office-dude-planning.svg',
    durationMs: 5000,
    loops: true,
    aspect: 800 / 600,
    title: 'Planning at a desk',
  },
};


/**
 * Static line drawings. Unlike the animations these are plain images with no
 * clock to drive, so they carry no duration or loop flag.
 */
export type PlateKey = 'drone' | 'engineeringModel' | 'houseFinal';

export const PLATES: Record<PlateKey, { src: string; aspect: number; title: string }> = {
  drone: {
    src: '/assets/drone.png',
    aspect: 545 / 360,
    title: 'Wireframe quadcopter assembly',
  },
  engineeringModel: {
    src: '/assets/engineering-model.png',
    aspect: 620 / 708,
    title: 'Machine elevation drawing',
  },
  /*
   * The settled last frame of house-construction.svg, rasterised.
   *
   * That file is a Lottie draw-on export whose paths carry base `d` values
   * that are single movetos, so with SMIL unavailable it draws nothing at all
   * rather than degrading to a first frame. Several mobile browsers do not run
   * SMIL inside an <img>, which left the hero frame blank. This PNG has no
   * such dependency.
   */
  houseFinal: {
    src: '/assets/house-construction-final.png',
    aspect: 1280 / 496,
    title: 'Line drawing of a house under construction',
  },
};

/** The gear loop used in the sand band. */
export const COGS = { src: '/assets/cogs-wheel.svg', durationMs: 3000, title: 'Turning gears' };
