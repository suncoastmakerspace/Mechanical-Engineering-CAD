# Mechanical Engineering with CAD

A progressive, checkpoint-based path from zero CAD experience to intermediate parametric modeling. Each stage ends with a project you can finish before moving on. It's designed to cover a wide variety of topics so that you can be prepared for creating more advanced projects later on in the year.

## About

This website was built to showcase the Mechanical Engineering CAD Curriculum. It presents the curriculum as an interactive schematic map instead of a plain list, so members can see how the stages connect, what each one covers, and what they need to finish before moving on.

It uses animations from LottieFiles and other open source images. The whole thing is a neo-brutalist, blueprint style site, designed to entice users and make the curriculum feel like something worth working through rather than a syllabus to read.

## Who it's for

Built for makerspace club members. The path takes them from Tinkercad through Onshape and into intermediate parametric CAD, so that by the end they can design their own models and execute their own projects.

The curriculum deliberately stops just short of Fusion 360. Once someone has finished Stage 4 they already know sketch constraints, features, and assemblies, which makes Fusion a small jump rather than a fresh start.

## Design

The interface is styled as a technical drawing still in the drafting stage:

- White line work on a blueprint blue field, with a 20px / 100px master grid running underneath
- Cards outlined with crosshair marks at each corner, kept semi transparent so the grid reads through them
- Dividers drawn as dimension lines, with a real measurement in the middle such as a stage's time estimate
- Buttons styled as approval stamps
- Handwritten redline notes in the margins, the way someone would mark up a print
- Line work that draws itself in on first scroll, and a crosshair that follows the cursor with a live coordinate readout

Two palettes are used and never mixed inside the same section. The blueprint palette (`#778db2` with white and black) covers the hero, the schematic map, the pacing chart, and the footer. A sand palette (`#b9a07c`, `#90887c`, `#e8dac6`, `#ae8037`, `#904933`) is used for the two interlude bands.

## Build

### Getting started

```bash
npm install
npm run dev
```

The dev server runs at `http://localhost:5173`.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Typecheck and build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | Run TypeScript with no emit |

### Stack

- React 18 with TypeScript
- Vite
- Tailwind CSS, used only for its base reset. Every component style is an inline style object
- lucide-react for icons
- Playwright as a dev dependency, used for layout and contrast checks

## Website structure

The site is divided into six sections, in reading order:

| Section | Purpose |
| --- | --- |
| Overview | Title block, the curriculum summary, and the establishing animation |
| The Ladder | The four software rungs, from Tinkercad up to Fusion 360 |
| Schematic Map | The five stages as an interactive plate, with skill gates and detail panels |
| Suggested Pacing | A hatched bar chart comparing casual and focused schedules |
| Advice | A short interlude on planning before modeling |
| What's Next | Drawing sheet title block, and where the path leads after Stage 4 |

### Source layout

```
src/
  App.tsx              section order and scroll tracking
  content/
    path.ts            all curriculum copy, stages, checkpoints, gates
    assets.ts          per asset duration, loop and aspect metadata
  design/
    tokens.ts          palettes, grid, type scale, filters
  components/
    SmilAnimation.tsx  animation state machine for the stage panels
    primitives/        crosshair cards, dimension dividers, stamps, redlines
  sections/            the six sections above
public/assets/         animations and images
```

All curriculum text lives in `src/content/path.ts`. Correcting or extending the course means editing that one file, not the components.

## The schematic map

The five stages are not a straight line. Stages 0, 1, 2, and 4 run in sequence, while Stage 3 covers design-for-purpose concepts that are layered in alongside the others rather than completed in order. It is drawn as a wide band beside Stage 4 and labelled as ongoing, so it never reads as the fifth thing to do.

Stages 1 and 2 carry skill gates. Until a gate is marked as cleared, the stage after it stays locked, with a note naming what is blocking it.

The map is authored as a single fixed size canvas and scaled as one drawing, so the text, cards, and connector lines always shrink together. Below 1180px wide it switches to a stacked layout instead.

## Assets and credits

Animations are SMIL animated SVGs exported from LottieFiles, plus two open source technical line drawings and one GIF:

- `skyscraper-construction.svg` in the hero
- `writing-signature.svg`, `house-construction.svg`, `text-generation-loop.svg`, `arm-machines.svg` in the stage panels
- `office-dude-planning.svg` and `cogs-wheel.svg` in the sand bands
- `pencil-writing.gif` as an accent on the map
- `drone.png` and `engineering-model.png` as static wireframe plates

Each animation is embedded in a sandboxed iframe so its SMIL clock can be paused, reset, and restarted when a panel opens or closes. Source artwork is recoloured with CSS filters to match whichever palette its section uses, and the original files are left untouched.

## Notes

Claude Code was used to build and format the site from the curriculum document and a design brief.
