import { BookOpen, ExternalLink } from 'lucide-react';
import { alpha, blueprint, body, font, heading, label } from '../design/tokens';
import { useIsMobile } from '../hooks/useMediaQuery';

/**
 * Where to go and get the software, and what the words mean.
 *
 * Sits under the node field on the same plate, because both are things you
 * reach for while looking at the path rather than after finishing with it. The
 * glossary is a PDF on purpose: it is meant to be printed and left on the
 * bench next to whoever is working.
 */

/** Built by `npm run build:glossary` from scripts/build-glossary.mjs. */
export const GLOSSARY_PDF = '/assets/cad-glossary.pdf';

const TOOLS: { name: string; href: string; note: string }[] = [
  {
    name: 'Tinkercad',
    href: 'https://www.tinkercad.com/',
    note: 'Free. Runs in the browser, no install. Where NODE-01 happens.',
  },
  {
    name: 'Onshape',
    href: 'https://www.onshape.com/en/education/',
    note: 'Free for students. Also browser-based. NODE-02 and NODE-04.',
  },
  {
    name: 'SolidWorks',
    href: 'https://www.solidworks.com/solidworks-education',
    note: 'The paid one schools tend to have. An alternative for NODE-04.',
  },
  {
    name: 'Fusion 360',
    href: 'https://www.autodesk.com/products/fusion-360/personal',
    note: 'Free for personal use. Where this path is pointing you next.',
  },
];

export default function ResourceBoxes() {
  const isMobile = useIsMobile();

  const box: React.CSSProperties = {
    padding: isMobile ? '18px 18px 20px' : '22px 24px 24px',
    border: `1px solid ${blueprint.line}`,
    background: alpha.line08,
  };

  const linkRow: React.CSSProperties = {
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
    color: blueprint.line,
    textDecoration: 'none',
    fontFamily: font.mono,
    fontSize: isMobile ? 14 : 15,
    fontWeight: 700,
    letterSpacing: '0.04em',
  };

  return (
    <div
      style={{
        display: 'grid',
        // Stacked on a phone; side by side once there is room for two columns.
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))',
        gap: isMobile ? 18 : 24,
        marginTop: isMobile ? 34 : 48,
      }}
    >
      <section style={box}>
        <span style={{ ...label, fontSize: 10, color: alpha.line75 }}>The software</span>
        <h3 style={{ ...heading(isMobile ? 17 : 20), margin: '10px 0 6px' }}>
          Where to get it
        </h3>
        <p style={{ ...body(isMobile ? 12.5 : 13), color: alpha.line75, margin: '0 0 16px' }}>
          Everything on this path runs free for students. Nothing here needs a school license.
        </p>

        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {TOOLS.map((tool) => (
            <li key={tool.name} style={{ marginBottom: 14 }}>
              <a
                href={tool.href}
                target="_blank"
                rel="noopener noreferrer"
                style={linkRow}
                // Underlined only on hover, so the list reads as drawn type.
                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
              >
                {tool.name}
                <ExternalLink size={12} strokeWidth={2.5} aria-hidden />
              </a>
              <p style={{ ...body(isMobile ? 12 : 12.5), color: alpha.line55, margin: '3px 0 0' }}>
                {tool.note}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section style={box}>
        <span style={{ ...label, fontSize: 10, color: alpha.line75 }}>If a word is new</span>
        <h3 style={{ ...heading(isMobile ? 17 : 20), margin: '10px 0 6px' }}>
          CAD words, in plain English
        </h3>
        <p style={{ ...body(isMobile ? 12.5 : 13), color: alpha.line75, margin: '0 0 16px' }}>
          Every term you will meet on the path, with what it actually means next to it. Sketch,
          fillet, clearance, datum, tolerance and the rest. One page, made to be printed and left
          on the bench beside you.
        </p>

        <a
          href={GLOSSARY_PDF}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 9,
            padding: '10px 16px',
            border: `2px solid ${blueprint.line}`,
            background: blueprint.line,
            color: blueprint.bg,
            textDecoration: 'none',
            fontFamily: font.mono,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          <BookOpen size={14} strokeWidth={2.5} aria-hidden />
          Open the word list (PDF)
        </a>

        <p style={{ ...body(12), color: alpha.line55, margin: '12px 0 0' }}>
          Opens in a new tab. Nothing on it needs memorizing, look it up and carry on.
        </p>
      </section>
    </div>
  );
}
