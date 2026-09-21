# Mechanical Engineering with CAD

A progressive, checkpoint-based path from zero CAD experience to intermediate parametric modeling. Each stage ends with a project you can finish before moving on.

## About

This website was built to showcase the Mechanical Engineering CAD Curriculum. It presents the curriculum as an interactive schematic map instead of a plain list, so members can see how the stages connect, what each one covers, and what they need to finish before moving on.

It uses animations from LottieFiles and other open source images. The whole thing is a neo-brutalist, blueprint style site, designed to entice users and make the curriculum feel like something worth working through rather than a syllabus to read.

## Who it's for

Built for makerspace club members. The path takes them from Tinkercad through Onshape and into intermediate parametric CAD, so that by the end they can design their own models and execute their own projects.

The curriculum deliberately stops just short of Fusion 360. Once someone has finished Stage 4 they already know sketch constraints, features, and assemblies, which makes Fusion a small jump rather than a fresh start.

## Build

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

## The schematic map

The five stages are not a straight line. Stages 0, 1, 2, and 4 run in sequence, while Stage 3 covers design-for-purpose concepts that are layered in alongside the others rather than completed in order. It is drawn as a wide band beside Stage 4 and labelled as ongoing, so it never reads as the fifth thing to do.

Stages 1 and 2 carry skill gates. Until a gate is marked as cleared, the stage after it stays locked, with a note naming what is blocking it.

The map is authored as a single fixed size canvas and scaled as one drawing, so the text, cards, and connector lines always shrink together. Below 1180px wide it switches to a stacked layout instead.

## Assets and credits

Animations are SMIL animated SVGs exported from LottieFiles, plus two open source technical line drawings and one GIF:


Each animation is embedded in a sandboxed iframe so its SMIL clock can be paused, reset, and restarted when a panel opens or closes. Source artwork is recoloured with CSS filters to match whichever palette its section uses, and the original files are left untouched.
