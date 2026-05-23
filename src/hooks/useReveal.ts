import { useEffect, useRef } from "react";

/**
 * Triggers a `data-revealed="true"` attribute on the element
 * the first time it scrolls into view. Pair with the `.reveal`
 * CSS utility in styles.css (fade + slide on data-revealed).
 *
 * Reduced-motion users see the content immediately — handled in CSS.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(rootMargin = "0px 0px -10% 0px") {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (el.dataset.revealed === "true") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            (e.target as HTMLElement).dataset.revealed = "true";
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin, threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);
  return ref;
}
