import type { AssetKey, PlateKey } from './assets';

/**
 * Curriculum content, transcribed from
 * "Mechanical Engineering CAD Curriculum: Tinkercad to Pre-Fusion".
 *
 * Every section renders from this module, so correcting the course means
 * editing data here rather than touching a component.
 *
 * Transcription repairs applied to the PDF text layer, which mangled some
 * glyphs on export: the tolerance symbol is restored to "+/- tolerance", the
 * printer clearance to "0.2-0.4mm", the material comparison to
 * "PLA != steel != aluminum", and a garbled run in the closing paragraph
 * ("you'lbhjnM ,Hl already") back to "you'll already". The pacing table was
 * column-shifted by its own header row on export and has been realigned.
 */

export type Checkpoint = {
  id: string;
  title: string;
  detail: string;
  /**
   * The real step that ends this checkpoint, never just "you're done".
   *
   * These name equipment the club actually owns or has on order: FDM and resin
   * printers, PLA and CF-nylon, calipers, M-series screws, flush cutters,
   * ESP32-S3 boards, breadboards and small DC motors. The laser cutter, CNC
   * router, band saw and heat-set inserts are still only under consideration,
   * so nothing here may send anyone looking for them.
   */
  reward: string;
  /** Set on the checkpoints that accept a file for review. */
  review?: {
    /** Accept attribute for the file input. */
    accepts: string;
    /** What the model is asked to judge. */
    rubric: string;
  };
};

export type Pacing = {
  casual: string;
  focused: string;
  /** Weeks used for the bar chart. null means open-ended ("ongoing"). */
  casualWeeks: number | null;
  focusedWeeks: number | null;
};

export type Stage = {
  id: string;
  serial: string;
  index: number;
  title: string;
  subtitle: string;
  intro: string;
  learn: string[];
  checkpoints: Checkpoint[];
  /** Only Stages 1 and 2 carry an explicit skill gate in the source. */
  gate?: string;
  pacing: Pacing;
  /** Stage 3 runs alongside the chain rather than inside it. */
  parallel?: boolean;
  /** Grid-snapped position in the schematic map field. */
  coord: { x: number; y: number };
  /** Stage ids that must be cleared first. Drives the skill-gate locks. */
  requires: string[];
  animation?: AssetKey;
  /**
   * A static line drawing for stages the brief assigned no animation, so the
   * panel shows real draughting rather than an empty slot.
   */
  plate?: PlateKey;
  /**
   * Shown instead of `animation` on phones. Used where the same artwork is
   * needed elsewhere on mobile, so the two never appear twice in one scroll.
   */
  mobilePlate?: PlateKey;
};

export const SITE = {
  name: 'Mechanical Engineering with CAD',
  docSerial: 'DOC-001',
  subtitle: 'Tinkercad to Pre-Fusion',
  tagline:
    'A progressive, checkpoint-based path from zero CAD experience to intermediate parametric modeling. Each stage ends with a project you can finish before moving on. It is designed to cover a wide variety of topics so that you can be prepared for creating more advanced projects later on in the year.',
  outro:
    "After this, Fusion 360 is a small jump because you'll already know sketch constraints, features, and assemblies; Fusion mainly adds better simulation, CAM, and generative design on top of what you've learned.",
} as const;

export const STAGES: Stage[] = [
  {
    id: 'stage-0',
    serial: 'NODE-00',
    index: 0,
    title: 'Foundations',
    subtitle: 'before touching software',
    intro:
      'Groundwork done on paper. Nothing here needs a computer, and skipping it is the most common reason later stages feel arbitrary.',
    learn: [
      'Learn to read a basic engineering drawing: orthographic views, dimensions, units.',
      'Learn the 3 primary planes (XY, XZ, YZ) and right-hand coordinate system.',
      'Learn basic units/tolerance concepts: mm vs in, +/- tolerance, fit (clearance vs press).',
    ],
    checkpoints: [
      {
        id: 'Checkpoint 0',
        title: 'Three-view sketch',
        detail:
          'Sketch three views (top/front/side) of a simple object on your desk.',
        reward:
          'Take the sketch and the object to Mr. Chroniak. Measure the real thing with the club calipers and write the actual numbers onto your three views. Anything off by more than a millimetre means you read the object wrong, not the drawing.',
        review: {
          accepts: 'image/*',
          rubric:
            'A hand-drawn three-view orthographic sketch (top, front, side). Judge whether all three views are present and correctly placed relative to each other, whether the views line up so features project between them, and whether dimensions are written with units. Say plainly if a view is missing or misplaced.',
        },
      },
    ],
    pacing: {
      casual: '1 day',
      focused: '1 day',
      casualWeeks: 0.2,
      focusedWeeks: 0.2,
    },
    coord: { x: 40, y: 20 },
    requires: [],
    animation: 'writing',
  },
  {
    id: 'stage-1',
    serial: 'NODE-01',
    index: 1,
    title: 'Tinkercad',
    subtitle: 'solid-based, beginner CAD',
    intro:
      'Tinkercad teaches solid modeling through boolean operations (add/subtract shapes) with no sketching required, which makes it the right entry point.',
    learn: [
      'Placing/moving/scaling primitive shapes',
      'Grouping (union) and hole objects (subtraction)',
      'Aligning and snapping',
      'Workplanes for angled features',
      'Exporting STL',
    ],
    checkpoints: [
      {
        id: 'Checkpoint 1a',
        title: 'Nameplate / Keychain',
        detail: 'Extruded text on a base plate with a mounting hole.',
        reward:
          'Ask Mr. Chroniak to walk you through slicing and starting a print. Run it in PLA, then trim the supports off with the flush cutters. The nameplate goes on your bin in the makerspace, so get the text height right.',
      },
      {
        id: 'Checkpoint 1b',
        title: 'Enclosure Box',
        detail:
          'A hollow box (union outer shell, subtract inner cavity) with a lid that has a lip/step so it seats correctly. This teaches boolean subtraction precision and wall thickness.',
        reward:
          'Print the box and the lid. If the lid does not seat, measure the gap with the calipers, change the clearance, and print it again. Getting the fit right on the second attempt is the whole point of this one.',
      },
      {
        id: 'Checkpoint 1c',
        title: 'Simple Bracket',
        detail:
          'An L-shaped bracket with 2 mounting holes on each face, correctly dimensioned to hold something (e.g., mount a 9g servo).',
        reward:
          'Print the bracket and bolt a small DC motor to it with M3 screws from the club hardware. Wire the motor to an ESP32-S3 on a breadboard and actually run it. If the bracket buzzes or walks across the table, your holes are too loose.',
        review: {
          accepts: 'image/*',
          rubric:
            'A 3D-printed or modelled L-bracket with two mounting holes per face, meant to carry a small motor. Judge whether the holes look placed by dimension rather than by eye, whether wall thickness looks adequate where the faces meet, and whether there is a fillet or gusset at the corner. Flag it if the corner is a sharp unsupported joint.',
        },
      },
    ],
    gate:
      'You can create a hollow part with consistent wall thickness and place holes precisely by number entry (not eyeballing).',
    pacing: {
      casual: '1 week',
      focused: '2-3 days',
      casualWeeks: 1,
      focusedWeeks: 0.4,
    },
    coord: { x: 500, y: 20 },
    // No gate is defined after Stage 0 in the source, so nothing holds this
    // node shut. Only Stages 1 and 2 gate what follows them.
    requires: [],
    animation: 'house',
    // On phones the house drawing is the hero's establishing shot, so this
    // panel shows the machine elevation rather than repeating it.
    mobilePlate: 'engineeringModel',
  },
  {
    id: 'stage-2',
    serial: 'NODE-02',
    index: 2,
    title: 'Onshape',
    subtitle: 'free, browser-based, parametric/sketch-driven',
    intro:
      'Onshape introduces real parametric CAD: 2D sketches + constraints + features, which is the industry-standard workflow (same logic as SolidWorks/Fusion).',
    learn: [
      '2D sketching: lines, circles, fillets, dimensions',
      'Sketch constraints (coincident, tangent, symmetric, equal) and fully-constrained sketches',
      'Extrude, Revolve, Sweep, Loft',
      'Fillet/Chamfer, Shell',
      'Mates/assemblies (basic): fastened, revolute, slider',
      'Feature tree editing (going back and editing a step without redoing the model)',
    ],
    checkpoints: [
      {
        id: 'Checkpoint 2a',
        title: 'Flat Bracket, redone parametrically',
        detail:
          'Rebuild your Tinkercad bracket as a sketch (not primitives), fully constrained, then extrude. Change one dimension and confirm the whole part updates correctly.',
        reward:
          'Change one parameter, export both versions, and print them side by side. Hand both to Mr. Chroniak and say which one you would actually use and why. If the model broke when you changed the number, your sketch was not fully constrained.',
        review: {
          accepts: 'image/*',
          rubric:
            'A screenshot of a parametric sketch or feature tree for a rebuilt bracket. Judge whether the sketch appears fully constrained (solved, with no free geometry), whether the feature tree is ordered sensibly, and whether dimensions look driven rather than drawn to size. Say which specific geometry still looks under-defined.',
        },
      },
      {
        id: 'Checkpoint 2b',
        title: 'Revolved Part',
        detail: 'Model a pulley, knob, or bottle using Revolve.',
        reward:
          'Print this one on the resin printer rather than FDM, then wash and cure it. Resin holds a curved surface that FDM layer lines will not. Do it with Mr. Chroniak supervising, because uncured resin needs gloves.',
      },
      {
        id: 'Checkpoint 2c',
        title: 'Two-Part Assembly',
        detail:
          'A shaft + a bearing/bushing hole that mates with proper clearance fit (not interference). Include a mate that allows rotation.',
        reward:
          'Print the shaft and the bushing. If it seizes or wobbles, measure both with the calipers and work out the clearance you actually got, not the one you asked for. Write that number down. You will reuse it for every fit you design this year.',
      },
      {
        id: 'Checkpoint 2d',
        title: 'Gear or Cam',
        detail:
          "Use Onshape's gear/involute tools or a swept profile to make a simple gear pair or cam-follower mechanism. This introduces mechanism motion.",
        reward:
          'Print the pair, mount them on the bracket you made in Checkpoint 1c, and drive them with the DC motor and the ESP32. A mechanism you designed yourself, turning under power, is the payoff for the whole Onshape stage.',
      },
    ],
    gate:
      "You can fully constrain a sketch (green/solved, no floating geometry) and build multi-feature parts where editing one dimension doesn't break downstream features.",
    pacing: {
      casual: '3-4 weeks',
      focused: '1-2 weeks',
      casualWeeks: 3.5,
      focusedWeeks: 1.5,
    },
    coord: { x: 960, y: 20 },
    requires: ['stage-1'],
    // The brief assigns no animation here, so this stage gets the drone
    // wireframe instead: a parametric assembly, which is what Onshape teaches.
    plate: 'drone',
  },
  {
    id: 'stage-3',
    serial: 'NODE-03',
    index: 3,
    title: 'Design-for-purpose concepts',
    subtitle: 'parallel, not software',
    intro: 'Layer these in as you do Stage 2 & 3 projects:',
    learn: [
      'Tolerancing & fits: clearance vs. press fit, why 3D printers need ~0.2-0.4mm clearance',
      'DFM (Design for Manufacturing): draft angles, min wall thickness, overhangs for 3D printing/injection molding',
      'Basic GD&T vocabulary: flatness, concentricity, datum, just enough to read a real drawing',
      'Material selection basics: why PLA != steel != aluminum for a given load',
    ],
    checkpoints: [
      {
        id: 'Checkpoint 3',
        title: 'Machinist-ready drawing',
        detail:
          'Take any Stage 2 part and produce a proper dimensioned 2D drawing (orthographic + one dimension set) from it, as if handing it to a machinist.',
        reward:
          'Hand the drawing to another club member and say nothing. Have them model the part from the drawing alone. Every question they have to ask you is a dimension or a note you left off. Fix those, then hand it over again.',
        review: {
          accepts: 'image/*',
          rubric:
            'A dimensioned orthographic engineering drawing intended for someone else to manufacture from. Judge whether it is fully dimensioned with no missing critical feature, whether units and a tolerance or general note are stated, whether there is a title block, and whether dimensions sit outside the part with proper extension lines. Name the specific feature that could not be made from this drawing as it stands.',
        },
      },
    ],
    pacing: {
      casual: 'ongoing',
      focused: 'ongoing',
      casualWeeks: null,
      focusedWeeks: null,
    },
    parallel: true,
    coord: { x: 40, y: 320 },
    // Deliberately gate-free: a parallel track you layer in, not a step you unlock.
    requires: [],
    animation: 'textLoop',
  },
  {
    id: 'stage-4',
    serial: 'NODE-04',
    index: 4,
    title: 'SolidWorks or Onshape Advanced',
    subtitle: 'parametric CAD, intermediate',
    intro:
      'This is the last stage before Fusion: full parametric assemblies with real engineering features.',
    learn: [
      'Patterns (linear, circular, mirror)',
      'Configurations / design tables (same part, multiple sizes)',
      'Assembly mates beyond basics: cam, gear, path mates',
      'Sheet metal basics (bends, flat pattern), optional but useful',
      'Simple FEA/stress check (if available), just to see stress concentrations at fillets vs. sharp corners',
    ],
    checkpoints: [
      {
        id: 'Checkpoint 4a',
        title: 'Patterned Part',
        detail:
          'A part with a circular bolt pattern (e.g., a flange) driven by one parameter (bolt count).',
        reward:
          'Drive the bolt count from the design table, print two versions with different counts, and check both against the real screws in the club hardware kit. Show Mr. Chroniak the table doing the work, not you editing the sketch twice.',
      },
      {
        id: 'Checkpoint 4b',
        title: 'Multi-Part Functional Assembly',
        detail:
          'A small working mechanism, e.g. a hinge, a linear slide, or a simple gearbox, with 4+ mated parts that move correctly when dragged/simulated.',
        reward:
          'Print every part and assemble the mechanism for real. Film it moving and add the clip to the club build log. If it binds, go back and fix the mates, not the printer. A mechanism that only works in CAD does not count.',
      },
      {
        id: 'Checkpoint 4c',
        title: 'Capstone',
        detail:
          'Design something real you actually need (a mount for a cap, or a coaster for a drink). Full flow: sketch to constrained features to assembly to dimensioned drawing.',
        reward:
          'Build it, then actually use it for a week. Bring it back and tell Mr. Chroniak what you would change now that you have lived with it. Then put the part and its drawing in the club showcase. A working part with a proper drawing beside it is a portfolio piece.',
        review: {
          accepts: 'image/*',
          rubric:
            'A capstone part someone designed for a real need of their own, ideally shown with its drawing. Judge whether the design shows evidence of the full flow (sketch, constrained features, assembly, dimensioned drawing), whether it looks printable without heroic support, and whether the part appears sized from real measurements. Give two concrete changes that would make it better.',
        },
      },
    ],
    pacing: {
      casual: '4-6 weeks',
      focused: '2-3 weeks',
      casualWeeks: 5,
      focusedWeeks: 2.5,
    },
    coord: { x: 960, y: 280 },
    requires: ['stage-2'],
    animation: 'arm',
  },
];

/** The main chain, in order. Stage 3 is excluded: it is a parallel rail. */
export const CHAIN: string[] = STAGES.filter((s) => !s.parallel).map((s) => s.id);

export const stageById = (id: string): Stage | undefined =>
  STAGES.find((s) => s.id === id);

/** The stage this one's skill gate holds shut, if any. */
export const unlocks = (id: string): Stage | undefined =>
  STAGES.find((s) => s.requires.includes(id));

/**
 * Dimensions of the schematic map field, in grid units.
 *
 * Wider and flatter than the first pass, with larger cards, which lifts card
 * area from 29% to 35% of the field -- roughly a 21% density gain -- without
 * crowding the connector routing.
 */
export const MAP_FIELD = { width: 1320, height: 560 } as const;

/** Fixed node-card geometry, so connector routing is predictable. */
export const CARD = { width: 320, height: 190 } as const;

/**
 * The parallel track is drawn as a wide, shallow band rather than a card.
 *
 * Laid out beside Stage 4, so scanning the plate reads 0, 1, 2, 3, 4 in order,
 * and shaped unlike every numbered step so nobody mistakes an "ongoing" track
 * for the fifth thing to do.
 *
 * Its width is bounded by Stage 4's left edge at x=960: the band runs 40..900,
 * leaving a 60-unit gap for the dashed tie. Nothing crosses anything, which is
 * what the earlier full-width band and its bridged connector got wrong.
 *
 * Its centre line (320 + 110/2 = 375) is set equal to Stage 4's
 * (280 + 190/2 = 375) so the tie is a level horizontal run rather than a
 * dogleg, while both tops stay on the 20px master grid.
 */
export const BAND = { width: 860, height: 110 } as const;

/**
 * The software ladder, for the sand band after the hero. Rungs 1-3 are read
 * off STAGES so they cannot drift from the curriculum; Fusion is hard-coded
 * because the source places it explicitly AFTER this path, not inside it.
 */
export const LADDER: { n: string; name: string; note: string; ahead?: boolean }[] = [
  { n: '01', name: 'Tinkercad', note: 'solids, booleans, no sketching' },
  { n: '02', name: 'Onshape', note: 'sketches, constraints, features' },
  { n: '03', name: 'SolidWorks / Onshape Advanced', note: 'assemblies, patterns, configurations' },
  { n: '04', name: 'Fusion 360', note: 'ahead of you, not part of this path', ahead: true },
];
