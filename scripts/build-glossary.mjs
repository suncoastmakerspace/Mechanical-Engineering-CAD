/**
 * Builds public/assets/cad-glossary.pdf.
 *
 * A one-page-ish handout of the words a beginner meets on the path, each with
 * a plain explanation beside it. Generated rather than hand-made so it can be
 * regenerated when the curriculum wording changes:
 *
 *   npm run build:glossary
 *
 * Rendered through Chromium because Playwright is already a dev dependency for
 * the verification harness, so this needs nothing new installed. Deliberately
 * dark-on-white rather than the site's white-on-blue: this one gets printed,
 * and a blueprint background would empty a toner cartridge.
 */
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

// The project path contains a space, which stays percent-encoded otherwise.
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const require = createRequire(path.join(root, 'package.json'));
const { chromium } = require('playwright');

const GROUPS = [
  {
    heading: 'Getting started',
    terms: [
      ['CAD', 'Computer-aided design. Drawing a part on a computer accurately enough that it could actually be made.'],
      ['Model', 'The part as it exists on the computer. Not a physical thing yet.'],
      ['STL', 'A file format that holds a finished shape. It is what you save out when you want something printed.'],
      ['Slicer', 'The program that turns your model into the moves a 3D printer follows. You open your STL in it just before printing.'],
      ['Millimeter (mm)', 'The unit almost all of this uses. A US nickel is about 2mm thick, and a credit card just under 1mm. Always write the unit down.'],
    ],
  },
  {
    heading: 'Drawing the shape',
    terms: [
      ['Sketch', 'A flat drawing of lines and circles. It is the starting point: you draw the outline first, then turn it into something solid.'],
      ['Feature', 'The solid thing you make from a sketch. Pulling a rectangle up into a block is a feature.'],
      ['Extrude', 'Pulling a flat shape straight up to give it thickness. A circle extruded becomes a cylinder.'],
      ['Revolve', 'Spinning a flat outline around a line to make something round, like a knob or a pulley.'],
      ['Dimension', 'A measurement written onto a drawing, fixing how big something is or where it sits.'],
      ['Constrained (locked down)', 'When you have given a drawing enough measurements that nothing in it can wobble or slide. If a line still moves when you drag it, it is not locked down yet.'],
      ['Feature tree', 'The list of every step you took, in order. You can go back and change an early step without redoing everything after it.'],
      ['Workplane', 'A flat surface you choose to draw on. Useful when a feature needs to sit at an angle.'],
      ['Pattern', 'Repeating one feature several times automatically, in a row, a ring, or mirrored across the part.'],
    ],
  },
  {
    heading: 'Edges, walls and corners',
    terms: [
      ['Fillet', 'A rounded-off inside or outside corner. Rounded corners are stronger than sharp ones because stress spreads out instead of concentrating.'],
      ['Chamfer', 'A corner cut off at an angle rather than rounded. Often used so a part slides into place more easily.'],
      ['Gusset', 'A triangular web across an inside corner, bracing two faces so the joint does not bend.'],
      ['Shell', 'Hollowing a solid part out, leaving walls of an even thickness.'],
      ['Wall thickness', 'How thick the solid material is. Too thin and it snaps or fails to print; too thick and it wastes material and time.'],
    ],
  },
  {
    heading: 'Fitting parts together',
    terms: [
      ['Assembly', 'Two or more parts put together, with rules about how they are allowed to move.'],
      ['Mate (or joint)', 'The rule you set between two parts: fixed in place, hinged so it rotates, or sliding along a line.'],
      ['Clearance', 'The deliberate gap between two parts so one can move inside the other. A rod 5mm across in a 5.4mm hole has 0.4mm of clearance.'],
      ['Press fit', 'The opposite of clearance: the part is very slightly too big, so it grips when pushed in.'],
      ['Tolerance', 'How far off the stated size a part is allowed to be and still work. Nothing is ever made exactly to size.'],
    ],
  },
  {
    heading: 'Drawings for other people',
    terms: [
      ['Three-view drawing', 'The same object drawn from three directions, usually top, front and side, lined up so features match across them.'],
      ['Datum', 'The edge or face that everything else is measured from. Pick one and measure from it consistently.'],
      ['Title block', 'The box, usually bottom right, saying what the part is, who drew it, the scale and the units.'],
      ['Extension line', 'The thin line running out from the part to where a measurement is written, so numbers sit outside the shape rather than on top of it.'],
    ],
  },
  {
    heading: 'Making it real',
    terms: [
      ['Overhang', 'Part of a shape that sticks out over thin air. Steep overhangs print badly because there is nothing underneath holding them up.'],
      ['Support', 'Temporary printed scaffolding under an overhang, snapped off afterwards.'],
      ['Calipers', 'The measuring tool for reading a real object accurately. Use these rather than a ruler when the number matters.'],
    ],
  },
];

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>CAD words, in plain English</title>
<style>
  @page { size: A4; margin: 16mm 14mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    color: #15181d;
    font-size: 10pt;
    line-height: 1.45;
  }
  header { border-bottom: 2px solid #15181d; padding-bottom: 8px; margin-bottom: 14px; }
  h1 { font-size: 19pt; margin: 0 0 4px; letter-spacing: 0.01em; }
  .sub { color: #555c66; font-size: 9pt; margin: 0; }
  h2 {
    font-size: 8.5pt;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #46506a;
    margin: 14px 0 6px;
    border-bottom: 1px solid #c9cfda;
    padding-bottom: 3px;
    /* Never leave a group heading stranded at the foot of a page. */
    break-after: avoid;
  }
  dl { margin: 0; }
  .row { display: flex; gap: 10px; padding: 3px 0; break-inside: avoid; }
  dt { flex: 0 0 34%; font-weight: 700; }
  dd { flex: 1; margin: 0; color: #2b3138; }
  footer { margin-top: 16px; border-top: 1px solid #c9cfda; padding-top: 6px; color: #6b7280; font-size: 8pt; }
</style>
</head>
<body>
  <header>
    <h1>CAD words, in plain English</h1>
    <p class="sub">
      Mechanical Engineering with CAD &mdash; makerspace club. Keep this beside you.
      Nothing here needs memorizing; look it up when a word turns up and carry on.
    </p>
  </header>

  ${GROUPS.map(
    (g) => `<section>
    <h2>${g.heading}</h2>
    <dl>
      ${g.terms
        .map(
          ([term, meaning]) =>
            `<div class="row"><dt>${term}</dt><dd>${meaning}</dd></div>`,
        )
        .join('\n      ')}
    </dl>
  </section>`,
  ).join('\n  ')}

  <footer>
    If a word you need is not here, use the question box on any project and ask.
  </footer>
</body>
</html>`;

const out = path.join(root, 'public', 'assets', 'cad-glossary.pdf');
fs.mkdirSync(path.dirname(out), { recursive: true });

// --html <path> also writes the source page, which is the only practical way
// to eyeball the result: headless Chromium downloads a PDF rather than
// rendering one, and there is no poppler on this machine.
const htmlFlag = process.argv.indexOf('--html');
if (htmlFlag !== -1 && process.argv[htmlFlag + 1]) {
  fs.writeFileSync(process.argv[htmlFlag + 1], html);
}

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'load' });
await page.pdf({ path: out, format: 'A4', printBackground: true });
await browser.close();

const terms = GROUPS.reduce((n, g) => n + g.terms.length, 0);
const kb = (fs.statSync(out).size / 1024).toFixed(0);
console.log(`cad-glossary.pdf  ${terms} terms in ${GROUPS.length} groups  ${kb}KB`);
