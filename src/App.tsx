import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import { AuthProvider } from './auth/AuthContext';
import StatusPanel from './components/StatusPanel';
import type { AnimState } from './components/SmilAnimation';
import Hero from './sections/Hero';
import Ladder from './sections/Ladder';
import SchematicMap from './sections/SchematicMap';
import Pacing from './sections/Pacing';
import BreakSection from './sections/BreakSection';
import Footer from './sections/Footer';
import { SECTION_IDS } from './design/tokens';

/** What the status readout calls each section. Reader-facing names, matching
 *  the navbar -- not the working names used while designing the layout. */
const SECTION_TITLES: Record<string, string> = {
  [SECTION_IDS.hero]: 'Overview',
  [SECTION_IDS.ladder]: 'The Ladder',
  [SECTION_IDS.map]: 'Schematic Map',
  [SECTION_IDS.pacing]: 'Suggested Pacing',
  [SECTION_IDS.brk]: 'Advice',
  [SECTION_IDS.footer]: "What's Next",
};

/**
 * The status readout reports whatever sits in a narrow band across the middle
 * of the viewport, rather than whatever happens to touch the top edge. Two
 * sections can share that band while one scrolls into the other, and both get
 * named.
 */
const BAND_TOP = 0.42;
const BAND_BOTTOM = 0.58;

export default function App() {
  const [activeSection, setActiveSection] = useState<string>(SECTION_IDS.hero);
  const [visibleSections, setVisibleSections] = useState<string[]>([SECTION_IDS.hero]);
  const [openStage, setOpenStage] = useState<string | null>(null);
  const [animState, setAnimState] = useState<AnimState | null>(null);

  useEffect(() => {
    const ids = Object.values(SECTION_IDS);
    let frame = 0;

    const measure = () => {
      frame = 0;
      const vh = window.innerHeight;
      const bandTop = vh * BAND_TOP;
      const bandBottom = vh * BAND_BOTTOM;

      // How much of the centre band each section actually occupies.
      const hits: { id: string; overlap: number; top: number }[] = [];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        const overlap = Math.min(r.bottom, bandBottom) - Math.max(r.top, bandTop);
        if (overlap > 0) hits.push({ id, overlap, top: r.top });
      }
      if (hits.length === 0) return;

      // Pick by how much band each one covers, then show them in the order
      // they appear down the page, which is how they are being read.
      const picked = [...hits]
        .sort((a, b) => b.overlap - a.overlap)
        .slice(0, 2)
        .sort((a, b) => a.top - b.top)
        .map((h) => h.id);

      setVisibleSections((prev) =>
        prev.length === picked.length && prev.every((v, i) => v === picked[i]) ? prev : picked,
      );
      // The navbar marks a single pill, so it follows whichever covers most.
      setActiveSection(hits.reduce((a, b) => (b.overlap > a.overlap ? b : a)).id);
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <AuthProvider>
      <Navbar activeSection={activeSection} />

      <main>
        <Hero />
        <Ladder />
        <SchematicMap onAnimState={setAnimState} onOpenChange={setOpenStage} />
        <Pacing />
        <BreakSection />
        <Footer />
      </main>

      <StatusPanel
        viewing={
          openStage
            ? [openStage]
            : visibleSections.map((id) => SECTION_TITLES[id]).filter(Boolean)
        }
        animState={openStage ? (animState ?? undefined) : undefined}
      />
    </AuthProvider>
  );
}
