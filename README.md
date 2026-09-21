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

### Requirements

- Node.js 18 or newer (developed on Node 24)
- npm

### Getting started

```bash
npm install
npm run dev
```

The dev server runs at `http://localhost:5173`.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server. No Functions, so guest mode |
| `npm run dev:cf` | Build, then serve with Cloudflare Functions running |
| `npm run mock-sheet` | A fake roster sheet for local testing |
| `npm run add-member` | Generate a roster row for a new member |
| `npm run build` | Typecheck and build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | TypeScript across both the app and the Functions |

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
  auth/                sign-in dialog and the progress context
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
functions/             Cloudflare Pages Functions: login, progress, review
apps-script/           the Google Sheet half of the roster
scripts/               add a member, or run a fake sheet locally
```

All curriculum text lives in `src/content/path.ts`. Correcting or extending the course means editing that one file, not the components.

## The schematic map

The five stages are not a straight line. Stages 0, 1, 2, and 4 run in sequence, while Stage 3 covers design-for-purpose concepts that are layered in alongside the others rather than completed in order. It is drawn as a wide band beside Stage 4 and labelled as ongoing, so it never reads as the fifth thing to do.

Stages 1 and 2 carry skill gates. Until a gate is marked as cleared, the stage after it stays locked, with a note naming what is blocking it.

The map is authored as a single fixed size canvas and scaled as one drawing, so the text, cards, and connector lines always shrink together. Below 1180px wide it switches to a stacked layout instead.

## Checkpoint payoffs

No checkpoint ends with just "you're done". Each of the twelve finishes with a real step using
equipment the club actually has: print it and check the fit with the calipers, bolt the bracket
to a motor and drive it from an ESP32, hand your drawing to someone else and see what they have
to ask. The intent is that a project is worth finishing because something happens at the end of
it.

Rewards live beside their checkpoint in `src/content/path.ts`, so changing one is a text edit.

## Accounts and progress

Members can sign in, and their finished checkpoints are saved against their account rather than
the browser. Cleared skill gates unlock the next stage on the map for that person specifically.

- **Guest mode is the default.** With no backend configured the site still works and keeps
  progress in the browser. Signing in later carries that progress up.
- **The roster is a Google Sheet**, reached through an Apps Script Web App from a Cloudflare
  Pages Function. The sheet holds a salt and a PBKDF2 hash, never a password, and is never read
  by the browser.
- **Anyone can sign themselves up.** No approval step. The roster is capped, usernames and
  passwords are validated, and each account is limited to 20 design reviews per day so an open
  signup cannot run up an API bill.
- **Five checkpoints take a file upload** (0, 1c, 2a, 3 and 4c) and return feedback from the
  OpenAI API. The key lives only in the Function. Without a key the endpoint returns a
  placeholder that the page labels as such, so the whole flow is testable before you have one.

Setup is in [SETUP.md](SETUP.md). Nothing below `functions/` runs under `npm run dev`; use
`npm run dev:cf`.

## Assets and credits

Animations are SMIL animated SVGs exported from LottieFiles, plus two open source technical line drawings:

- `skyscraper-construction.svg` in the hero on desktop
- `house-construction.svg` in Stage 1's panel on desktop, with its final frame baked to `house-construction-final.png` for the hero on mobile
- `writing-signature.svg`, `text-generation-loop.svg`, `arm-machines.svg` in the stage panels
- `office-dude-planning.svg` and `cogs-wheel.svg` in the sand bands
- `drone.png` and `engineering-model.png` as static wireframe plates

Phones are served a lighter set. The skyscraper timelapse is 2.2MB carrying roughly 12,000 SMIL elements and never finishes decoding on a throttled device, so mobile gets the house drawing instead. Stage 1 then shows the machine elevation rather than repeating it, and the footer drops its copy of the elevation for the same reason.

The mobile hero uses a rasterised final frame rather than the SVG. These Lottie draw-on exports give their paths base `d` values that are single movetos, so a browser that does not run SMIL inside an `<img>`, which several mobile browsers do not, renders nothing at all instead of a sensible first frame. The baked PNG removes that dependency.

Each animation is embedded in a sandboxed iframe so its SMIL clock can be paused, reset, and restarted when a panel opens or closes. Source artwork is recoloured with CSS filters to match whichever palette its section uses, and the original files are left untouched.

## Notes

Claude Code was used to build and format the site from the curriculum document and a design brief.
