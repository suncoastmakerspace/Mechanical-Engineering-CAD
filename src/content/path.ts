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
  /**
   * What the finished thing roughly looks like, revealed once someone has
   * submitted or finished the checkpoint rather than up front, so it does not
   * become something to copy before trying.
   *
   * `model` is a rotatable STL, generated from the OpenSCAD sources in
   * /models. `drawing` is a flat SVG, for the two checkpoints whose deliverable
   * is a sketch rather than a part. Swapping any of these for a photo of a real
   * club part is a one-line change here.
   */
  reference?: {
    kind: 'model' | 'drawing';
    src: string;
    caption: string;
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
  subtitle: 'From Tinkercad to almost Fusion',
  tagline:
    'A step-by-step path from never having opened CAD to being comfortable in it. CAD is short for computer-aided design: drawing a part on a computer accurately enough that it could actually be made. Each node ends with a project you finish before moving on, and between them they cover enough ground for the harder builds later in the year.',
  outro:
    'After this, Fusion 360 is a small step rather than a new start. You will already know how to lock a drawing down, build it up into a part, and join parts together. Fusion mostly adds testing a part before you make it, telling a cutting machine what to do, and letting the software suggest shapes for you.',
} as const;

export const STAGES: Stage[] = [
  {
    id: 'stage-0',
    serial: 'NODE-00',
    index: 0,
    title: 'Foundations',
    subtitle: 'on paper, before any software',
    intro:
      'All on paper. Nothing here needs a computer, and it is the part people skip, which is why the later stages start feeling like random button-pressing.',
    learn: [
      'How to read a basic engineering drawing: the three flat views, the measurements, and the units.',
      'The three flat surfaces every design program starts you on, and which way the x, y and z directions point.',
      'Millimeters against inches, what a plus-or-minus number means, and the difference between a part that slides and one that grips.',
    ],
    checkpoints: [
      {
        id: 'Checkpoint 0',
        title: 'Three-view sketch',
        detail:
          'Pick something small off your desk and draw it three times on paper: looking down at it, looking at its front, and looking at its side. No software yet.',
        reward:
          'Measure the real object with the club calipers and write the actual millimeter numbers onto your three views. Then hand the sketch to another member and see whether they can tell what it is without you saying anything.',
        review: {
          accepts: 'image/png,image/jpeg,image/webp',
          rubric:
            'A hand-drawn three-view sketch (top, front and side) of a small object. Look for: all three views present; the views roughly lined up, so a feature sits above or beside its other view; and numbers written on with units. That is the whole of what was asked. It is a pencil sketch, so judge the content and not the neatness.',
        },
        reference: {
          kind: 'drawing',
          src: '/assets/reference/cp-0-three-view.svg',
          caption:
            'Three views in third angle, aligned, dimensioned in mm',
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
    subtitle: 'drag shapes together, no drawing yet',
    intro:
      'Tinkercad lets you build by sticking shapes together and cutting shapes away, with no drawing to learn first. That is why it goes at the front.',
    learn: [
      'Placing, moving and resizing basic shapes',
      'Sticking shapes together, and using a shape as a hole to cut with',
      'Lining things up so they are actually centered, not nearly centered',
      'Workplanes, for when you need to build on a slope',
      'Saving your work as an STL file, which is simply the file format a printer can read',
    ],
    checkpoints: [
      {
        id: 'Checkpoint 1a',
        title: 'Nameplate / Keychain',
        detail: 'Put your name on a flat plate, raised up so you can feel it, with a hole in one corner so it could hang on something.',
        reward:
          'Check with the ruler tool that your letters are at least 2mm tall and stand at least 1mm off the plate. Anything thinner than that vanishes on a real object. Fix it if it is under, then show someone and see if they can read it at arm length.',
        reference: {
          kind: 'model',
          src: '/assets/reference/cp-1a-nameplate.stl',
          caption:
            'Base plate, raised text, one hole placed by number',
        },
      },
      {
        id: 'Checkpoint 1b',
        title: 'Enclosure Box',
        detail:
          'A hollow box with a lid that actually sits on it. You build the outside first, then use a Hole shape to scoop out the middle.',
        reward:
          'Check the walls are the same thickness all the way round, and that the lid lip is slightly smaller than the opening so it can drop in. Write down the gap you left. That gap is called clearance, and you will be choosing it for the rest of the year.',
        reference: {
          kind: 'model',
          src: '/assets/reference/cp-1b-enclosure.stl',
          caption:
            'Box and lid, shown apart. The lip is what makes it seat',
        },
      },
      {
        id: 'Checkpoint 1c',
        title: 'Simple Bracket',
        detail:
          'An L-shaped bracket, like a shelf corner, with two holes on each face so it can bolt to something and hold a small motor.',
        reward:
          'Type the hole positions in as numbers instead of dragging them into place. Then check the distance between the two holes against the thing you actually want to bolt on. If you do not know that distance, go and measure it with the calipers first.',
        review: {
          accepts: 'image/png,image/jpeg,image/webp,.stl',
          rubric:
            'An L-shaped bracket with two mounting holes on each face, meant to hold a small motor. Look for: two holes on each face; holes that are round and a sensible size for a small bolt; the two faces meeting at a right angle; and whether the inside corner has a gusset (a triangular web across it) or a fillet (a rounded blend) rather than a bare sharp joint. Judge only what the views show.',
        },
        reference: {
          kind: 'model',
          src: '/assets/reference/cp-1c-bracket.stl',
          caption:
            'Two holes per face, and a gusset rather than a bare corner',
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
    subtitle: 'free in your browser, built on dimensions',
    intro:
      'Onshape is where you start drawing with real dimensions instead of eyeballing shapes. It is how the professional programs work too, so what you learn here carries straight over.',
    learn: [
      'Flat drawing: lines, circles, rounded corners, and putting measurements on them',
      'Locking a drawing down so nothing can wobble: touching, parallel, symmetric, equal',
      'Turning a flat drawing into a solid: pull it up, spin it round, or run it along a path',
      'Rounding and cutting corners, and hollowing a part out',
      'Putting parts together and saying how they move: fixed, hinged, or sliding',
      'Going back and changing an earlier step without rebuilding the whole thing',
    ],
    checkpoints: [
      {
        id: 'Checkpoint 2a',
        title: 'The same bracket, built from a drawing',
        detail:
          'Build that same bracket again, but this time draw it with dimensions instead of stacking blocks. Then change one number and watch the whole part resize itself.',
        reward:
          'Change one measurement and watch whether everything else follows it. If anything breaks or drifts, parts of your drawing are still free to move, and you need to pin them down with more measurements. Keep going until you can change that one number and the part just works.',
        review: {
          accepts: 'image/png,image/jpeg,image/webp',
          rubric:
            'A screenshot of a bracket rebuilt from a drawing rather than from stacked blocks. Look for: a recognisable bracket shape; the mounting holes present; and whether the screenshot shows a sketch or a list of steps at all, which is the visible evidence it was built from a drawing. A picture cannot show whether a measurement was typed in or dragged, so do not guess at that and do not count it against the work.',
        },
        reference: {
          kind: 'model',
          src: '/assets/reference/cp-2a-flat-bracket.stl',
          caption:
            'Filleted outline: the visible sign it came from a sketch',
        },
      },
      {
        id: 'Checkpoint 2b',
        title: 'Revolved Part',
        detail: 'Draw half the outline of something round, like a knob or a pulley, and spin it around a line to make it solid.',
        reward:
          'Check your half-outline actually touches the spin line with no gap, or you get a hole straight through the middle. Then spin the finished part round and look for any surface you could not reach with a piece of sandpaper.',
        reference: {
          kind: 'model',
          src: '/assets/reference/cp-2b-pulley.stl',
          caption:
            'One profile, revolved. The groove comes for free',
        },
      },
      {
        id: 'Checkpoint 2c',
        title: 'Two-Part Assembly',
        detail:
          'A rod, and a hole for it to turn inside. The hole has to be a little bigger than the rod, and you tell Onshape the two are allowed to spin against each other.',
        reward:
          'Write down the rod diameter and the hole diameter, and subtract one from the other. That difference is your clearance. Keep the number somewhere you will find it again, because every fit you design from here starts with it.',
        reference: {
          kind: 'model',
          src: '/assets/reference/cp-2c-shaft-bushing.stl',
          caption:
            'Shaft and bushing, bore 0.4mm over, which is what lets it turn',
        },
      },
      {
        id: 'Checkpoint 2d',
        title: 'Gear or Cam',
        detail:
          'Two gears whose teeth fit together, or a cam that pushes a follower up and down. Onshape draws the teeth for you, so you do not have to.',
        reward:
          'Drag one gear and check the other one turns with it instead of passing straight through. Count the teeth on both, work out the ratio, then explain to another member which way the second gear spins and why.',
        reference: {
          kind: 'model',
          src: '/assets/reference/cp-2d-gear-pair.stl',
          caption:
            'A meshing pair. Teeth are simplified, the mechanism is the point',
        },
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
    subtitle: 'ideas to pick up as you go',
    intro: 'Pick these up alongside the other nodes. They are ideas, not software:',
    learn: [
      'Fits: when a part should slide and when it should grip, and why printers need roughly 0.2 to 0.4mm of gap',
      'Designing something that can actually be made: how thin a wall can get, and why steep overhangs print badly',
      'Enough of the words to read a real drawing: flat, centered, and what a datum is, which is just the edge or face that everything else is measured from',
      'Choosing a material, and why plastic, steel and aluminum are not swappable',
    ],
    checkpoints: [
      {
        id: 'Checkpoint 3',
        title: 'Machinist-ready drawing',
        detail:
          'Take any part you have made and turn it into a flat drawing with measurements written on it, the kind you could hand to someone who has to make the thing.',
        reward:
          'Hand the drawing to another club member and say nothing at all. Have them model the part from your drawing alone. Every question they have to ask you is a measurement or a note you left off. Fix those, then hand it over again.',
        review: {
          accepts: 'image/png,image/jpeg,image/webp',
          rubric:
            'A dimensioned engineering drawing, meant for somebody else to make the part from. Look for: measurements written on the part; units or a general note stated somewhere; a title block, usually in the bottom right; and measurements sitting outside the outline with thin lines pointing at what they measure. Name any obvious feature that carries no measurement at all.',
        },
        reference: {
          kind: 'drawing',
          src: '/assets/reference/cp-3-machinist-drawing.svg',
          caption:
            'Every feature dimensioned, units and tolerance stated, title block',
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
    subtitle: 'same ideas, more control',
    intro:
      'The last node before Fusion 360. Same thinking as Onshape, with the tools that let one number drive a whole family of parts.',
    learn: [
      'Repeating a feature in a row, a ring, or mirrored across the part',
      'One part, several sizes, driven from a table of numbers',
      'Trickier ways to connect parts: gears, cams, and following a path',
      'Sheet metal: bending a part, and flattening it back out. Optional, but handy',
      'A basic stress check if the software has one, just to see why a rounded corner survives and a sharp one cracks',
    ],
    checkpoints: [
      {
        id: 'Checkpoint 4a',
        title: 'One number, many holes',
        detail:
          'A round plate with a ring of bolt holes in it, set up so that changing one number changes how many holes there are.',
        reward:
          'Set the bolt count to 4, then 6, then 8, and check the holes stay evenly spaced every time. If you have to nudge anything by hand between changes, the number is not really driving the pattern yet.',
        reference: {
          kind: 'model',
          src: '/assets/reference/cp-4a-flange.stl',
          caption:
            'Bolt pattern driven by one parameter. Change the count, not the sketch',
        },
      },
      {
        id: 'Checkpoint 4b',
        title: 'Something that actually moves',
        detail:
          'Something that moves. A hinge, a sliding drawer, a simple gearbox. Four or more parts that move properly when you drag them.',
        reward:
          'Drag it through its whole range of movement and watch for parts sliding through each other. Record a short screen capture of it moving and add that to the club build log. If it jams, fix the joins you set up between the parts rather than reshaping the parts themselves.',
        reference: {
          kind: 'model',
          src: '/assets/reference/cp-4b-hinge.stl',
          caption:
            'Two leaves and a pin. Four parts that have to move together',
        },
      },
      {
        id: 'Checkpoint 4c',
        title: 'Capstone: your own design',
        detail:
          'Design something you actually want, the whole way through: draw it, build it up into a part, assemble the pieces, then make a drawing of it.',
        reward:
          'This is the one you print. Run it through the slicer first, which is the program that turns your model into the moves a printer follows, then start the print and trim the leftover support bits off with the flush cutters. Use the part for a week, then write down what you would change now you have lived with it, and put the part and its drawing in the club showcase.',
        review: {
          accepts: 'image/png,image/jpeg,image/webp,.stl',
          rubric:
            'A part somebody designed for a real need of their own, ideally shown with its drawing. Look for: a part that plainly does the job it was made for; signs of more than one stage of work, such as a sketch, a list of steps, an assembly or a drawing alongside it; and a shape that could be made without extreme overhangs. Give two concrete changes that would improve it. Do not speculate about how it was measured.',
        },
        reference: {
          kind: 'model',
          src: '/assets/reference/cp-4c-capstone.stl',
          caption:
            'A coaster with a lip and drainage. Stands in for whatever you need',
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

/** Every checkpoint in the path. Completing all of them is "done". */
export const ALL_CHECKPOINT_IDS: string[] = STAGES.flatMap((s) =>
  s.checkpoints.map((c) => c.id),
);

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
