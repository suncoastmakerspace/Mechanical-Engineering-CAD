# Mechanical Engineering with CAD

A learning path for the makerspace club, built as an architectural blueprint drawing. Live at [https://mech-engineering-web.pages.dev](https://mech-engineering-web.pages.dev)

## What it is

Five nodes covering 12 projects, from hand sketching through Tinkercad and Onshape to a capstone. Each project ends with a real step to go and do, like printing the part or handing a drawing to someone else to model from.

Two nodes sit behind skill gates. You decide when you have cleared a gate and tick it yourself. Nothing is timed and nothing is checked. A gated node is chained shut on the map until its gate is ticked.

Finish all 12 and you get a badge STL to print, plus the keyphrase.

## Features

- **Accounts:** Progress saved per member.
- **AI Feedback:** Upload your work on 5 of the projects and get it scored out of 100, with specific notes on what to fix.
- **STL Upload:** Interactive STL preview in the browser before review, so you do not have to screenshot.
- **Reference Models:** Revealed only after you finish a project, so they are not something to copy first.
- **Offline Support:** Works with no backend at all. Progress falls back to local storage, and signing in later carries it over.

## Stack

- **Frontend:** React, Vite, TypeScript, Lucide Icons, Three.js
- **Styling:** Tailwind CSS (base reset) with custom inline style objects
- **Hosting:** Cloudflare Pages
- **Backend / Storage:** Cloudflare Pages Functions backed by a Google Sheet via Google Apps Script
- **3D Generation:** Reference models generated from OpenSCAD sources in `/models`

## Security

- Passwords are hashed server side with PBKDF2-SHA256. The sheet stores a salt and a hash, never a plain password, and is never read by the browser.
- Sessions use an HMAC-signed token stored in an `httpOnly`, `Secure`, `SameSite=Lax` cookie.
- The OpenAI API key lives strictly inside Pages Functions and is never exposed to the client.
- AI reviews are rate-limited per member per day.
