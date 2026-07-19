"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AnchorHTMLAttributes,
  MouseEvent,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type RoutePhase = "idle" | "leaving" | "entering";

type RouteTransitionContextValue = {
  navigate: (href: string) => void;
  phase: RoutePhase;
};

const RouteTransitionContext = createContext<RouteTransitionContextValue | null>(null);

export function RouteTransitionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const previousPath = useRef(pathname);
  const navigationTimer = useRef<number | null>(null);
  const entranceTimer = useRef<number | null>(null);
  const releaseTimer = useRef<number | null>(null);
  const focusFrame = useRef<number | null>(null);
  const [phase, setPhase] = useState<RoutePhase>("idle");
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    if (navigationTimer.current !== null) window.clearTimeout(navigationTimer.current);
    if (releaseTimer.current !== null) window.clearTimeout(releaseTimer.current);
    setPhase("entering");
    focusFrame.current = window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>("main")?.focus({ preventScroll: true });
    });
    entranceTimer.current = window.setTimeout(() => setPhase("idle"), 320);
    return () => {
      if (entranceTimer.current !== null) window.clearTimeout(entranceTimer.current);
      if (focusFrame.current !== null) window.cancelAnimationFrame(focusFrame.current);
    };
  }, [pathname]);

  useEffect(() => () => {
    if (navigationTimer.current !== null) window.clearTimeout(navigationTimer.current);
    if (entranceTimer.current !== null) window.clearTimeout(entranceTimer.current);
    if (releaseTimer.current !== null) window.clearTimeout(releaseTimer.current);
    if (focusFrame.current !== null) window.cancelAnimationFrame(focusFrame.current);
  }, []);

  const navigate = useCallback((href: string) => {
    if (phase === "leaving") return;
    const destination = new URL(href, window.location.href);
    const sameDocument = destination.pathname === window.location.pathname;

    // Hash-only and same-document moves must never wait for a pathname change.
    if (sameDocument) {
      router.push(href);
      setPhase("idle");
      return;
    }
    if (reducedMotion) {
      router.push(href);
      return;
    }
    router.prefetch(href);
    setPhase("leaving");
    navigationTimer.current = window.setTimeout(() => router.push(href), 160);
    // A failed or unusually slow navigation must not leave the page behind a curtain.
    releaseTimer.current = window.setTimeout(() => setPhase("idle"), 1400);
  }, [phase, reducedMotion, router]);

  return (
    <RouteTransitionContext.Provider value={{ navigate, phase }}>
      <div className="route-shell" data-route-phase={phase} aria-busy={phase === "leaving"}>
        {children}
      </div>
      <div className="route-curtain" data-route-phase={phase} aria-hidden="true">
        <span>ELSEWHERE</span>
        <i />
      </div>
    </RouteTransitionContext.Provider>
  );
}

export function useRouteTransition() {
  const context = useContext(RouteTransitionContext);
  if (!context) throw new Error("useRouteTransition must be used within RouteTransitionProvider");
  return context;
}

type TransitionLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
};

export function TransitionLink({ href, onClick, target, ...props }: TransitionLinkProps) {
  const { navigate } = useRouteTransition();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (
      event.defaultPrevented
      || event.button !== 0
      || event.metaKey
      || event.ctrlKey
      || event.shiftKey
      || event.altKey
      || target === "_blank"
      || href.startsWith("#")
    ) return;
    event.preventDefault();
    navigate(href);
  }

  return <Link href={href} target={target} onClick={handleClick} {...props} />;
}
