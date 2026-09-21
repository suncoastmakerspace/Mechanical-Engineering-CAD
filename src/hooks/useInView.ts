import { useEffect, useRef, useState } from 'react';

/**
 * Fires once, the first time the element enters the viewport.
 * Used by the drafting-reveal line animations, which should draw themselves
 * exactly once rather than replaying on every scroll pass.
 */
export function useInView<T extends Element>(
  options: IntersectionObserverInit = { threshold: 0.2 },
): [React.RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      }
    }, options);

    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [ref, inView];
}
