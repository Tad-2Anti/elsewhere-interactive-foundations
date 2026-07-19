"use client";

import { useEffect, useRef } from "react";

export function useViewportReveals<T extends HTMLElement>() {
  const rootRef = useRef<T>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!items.length) return;
    root.dataset.revealReady = "true";

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || !("IntersectionObserver" in window)) {
      items.forEach((item) => { item.dataset.revealed = "true"; });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        (entry.target as HTMLElement).dataset.revealed = "true";
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -10%", threshold: 0.08 });

    items.forEach((item) => observer.observe(item));
    return () => {
      observer.disconnect();
      delete root.dataset.revealReady;
    };
  }, []);

  return rootRef;
}
