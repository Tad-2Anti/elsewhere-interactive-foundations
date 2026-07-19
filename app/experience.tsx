"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import AtmosphericDepthGallery, { type AtmosphericDepthGalleryHandle } from "./atmospheric-depth-gallery";
import { TransitionLink, useRouteTransition } from "./route-transition";
import { useSiteSoundtrack } from "./use-site-soundtrack";
import { useViewportReveals } from "./use-viewport-reveals";
import { worlds } from "./world-data";

function EntryGate({ onEnter }: { onEnter: (withSound: boolean) => Promise<void> }) {
  const [step, setStep] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const lines = ["Looking beyond local retail", "Checking availability", "Preparing the edit"];

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setStep(1), 220),
      window.setTimeout(() => setStep(2), 440),
      window.setTimeout(() => setStep(3), 660),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, []);

  async function choose(withSound: boolean) {
    setLeaving(true);
    await onEnter(withSound);
  }

  return (
    <div className="entry-gate" data-leaving={leaving} role="dialog" aria-modal="true" aria-label="Enter Elsewhere">
      <div className="grain" aria-hidden="true" />
      <p className="entry-wordmark">ELSEWHERE</p>
      <p className="entry-status" aria-live="polite">{lines[Math.min(step, 2)]}<span aria-hidden="true">…</span></p>
      <div className="entry-actions" data-visible={step >= 3}>
        <button type="button" disabled={leaving} onClick={() => void choose(true)}>Enter with music</button>
        <button type="button" disabled={leaving} onClick={() => void choose(false)}>Enter quietly</button>
      </div>
    </div>
  );
}

function CursorAura() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cursor = ref.current;
    if (!cursor) return;
    let frame = 0;
    let running = false;
    let tx = -100;
    let ty = -100;
    let x = -100;
    let y = -100;
    const render = () => {
      x += (tx - x) * 0.24;
      y += (ty - y) * 0.24;
      cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (Math.abs(tx - x) + Math.abs(ty - y) > 0.08) frame = requestAnimationFrame(render);
      else running = false;
    };
    const move = (event: globalThis.PointerEvent) => {
      tx = event.clientX;
      ty = event.clientY;
      cursor.dataset.visible = "true";
      cursor.dataset.active = String(
        Boolean((event.target as Element | null)?.closest("a, button, [data-dragging]")) ||
        document.body.dataset.canvasHover === "true",
      );
      if (!running) {
        running = true;
        frame = requestAnimationFrame(render);
      }
    };
    const leave = () => { cursor.dataset.visible = "false"; };
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, []);
  return <div className="cursor-aura" ref={ref} aria-hidden="true" />;
}

export default function Experience() {
  const { navigate } = useRouteTransition();
  const [entered, setEntered] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [initialIndex, setInitialIndex] = useState<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [galleryReady, setGalleryReady] = useState(false);
  const [enteringWorld, setEnteringWorld] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { enabled, enable, disable } = useSiteSoundtrack();
  const galleryRef = useRef<AtmosphericDepthGalleryHandle>(null);
  const mainRef = useViewportReveals<HTMLElement>();
  const activeWorld = useMemo(() => worlds[activeIndex], [activeIndex]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const requestedWorld = new URLSearchParams(window.location.search).get("world")
        ?? window.sessionStorage.getItem("elsewhere:lastWorld");
      const requestedIndex = worlds.findIndex((world) => world.id === requestedWorld);
      const startIndex = requestedIndex >= 0 ? requestedIndex : 0;
      setActiveIndex(startIndex);
      setInitialIndex(startIndex);
      setEntered(window.sessionStorage.getItem("elsewhere:entered") === "true");
    });
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(motionQuery.matches);
    updateMotion();
    motionQuery.addEventListener("change", updateMotion);
    return () => {
      window.cancelAnimationFrame(frame);
      motionQuery.removeEventListener("change", updateMotion);
    };
  }, []);

  function enterWorld(id: string) {
    const index = worlds.findIndex((world) => world.id === id);
    if (index !== activeIndex) {
      galleryRef.current?.goToIndex(index);
      return;
    }
    window.sessionStorage.setItem("elsewhere:lastWorld", id);
    setEnteringWorld(true);
    if (galleryReady) galleryRef.current?.enterActive();
    else navigate(`/world/${id}`);
  }

  function finishWorldTransition(index: number) {
    const world = worlds[index];
    window.sessionStorage.setItem("elsewhere:lastWorld", world.id);
    setEnteringWorld(true);
    navigate(`/world/${world.id}`);
  }

  async function enter(withSound: boolean) {
    if (withSound) {
      try {
        await Promise.race([
          enable(),
          new Promise<void>((resolve) => window.setTimeout(resolve, 450)),
        ]);
      } catch { /* Audio is optional; entry must never fail. */ }
    }
    window.sessionStorage.setItem("elsewhere:entered", "true");
    window.setTimeout(() => setEntered(true), 260);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <>
      {!entered ? <EntryGate onEnter={enter} /> : null}
      <CursorAura />
      <main ref={mainRef} tabIndex={-1} className="spatial-site" aria-hidden={!entered} inert={!entered ? true : undefined} data-entering={enteringWorld} data-gallery-ready={galleryReady}>
        <a className="skip-link" href="#explore">Skip the spatial gallery</a>
        <header className="site-header">
          <a className="wordmark" href="#lobby">ELSEWHERE</a>
          <a className="header-mode" href="#explore">Browse the index · six worlds</a>
          <button
            className="sound-toggle"
            type="button"
            aria-pressed={enabled}
            aria-label={enabled ? "Mute the soundtrack" : "Play the soundtrack"}
            onClick={() => void (enabled ? disable() : enable())}
          >
            <span className="sound-bars" aria-hidden="true"><i /><i /><i /><i /></span>
            {enabled ? "Music on" : "Music off"}
          </button>
        </header>

        <section className="lobby" id="lobby">
          {initialIndex !== null ? (
            <AtmosphericDepthGallery
              ref={galleryRef}
              worlds={worlds}
              initialIndex={initialIndex}
              reducedMotion={reducedMotion}
              onActiveWorldChange={setActiveIndex}
              onWorldActivate={finishWorldTransition}
              onReady={() => setGalleryReady(true)}
            />
          ) : null}
          <div className="gallery-loading" aria-hidden="true"><i /><span>Preparing the index</span></div>
          <div className="lobby-vignette" aria-hidden="true" />
          <div className="lobby-intro">
            <p>Independent brands · personal sourcing</p>
            <h1>Find what<br />isn’t here yet.</h1>
          </div>
          <p className="move-hint"><span aria-hidden="true">↕</span> Scroll, drag or use arrow keys</p>
          <a className="lobby-index-link" href="#explore">Browse the six worlds <span aria-hidden="true">↓</span></a>
          <div className="active-world" aria-live="polite" aria-atomic="true" style={{ "--active-accent": activeWorld.accent } as React.CSSProperties}>
            <div className="active-world-content" key={activeWorld.id}>
              <span>{activeWorld.number} / 06</span>
              <p>{activeWorld.kicker}</p>
              <h2>{activeWorld.name}</h2>
              <em>{activeWorld.description}</em>
              <button type="button" onClick={() => enterWorld(activeWorld.id)}>
                Enter this world <span aria-hidden="true">↗</span>
              </button>
            </div>
          </div>
          <nav className="world-dots" aria-label="Choose a product world">
            {worlds.map((world, index) => (
              <button
                type="button"
                key={world.id}
                aria-label={`Show ${world.name}`}
                aria-pressed={activeIndex === index}
                onClick={() => galleryRef.current?.goToIndex(index)}
              ><span>{world.number}</span><i /></button>
            ))}
          </nav>
        </section>

        <section className="world-index" id="explore">
          <header data-reveal>
            <p>The index</p>
            <h2>Six categories,<br />one careful edit.</h2>
          </header>
          <div className="index-list">
            {worlds.map((world, index) => (
              <TransitionLink href={`/world/${world.id}`} key={world.id} data-reveal style={{ "--reveal-delay": `${index * 45}ms` } as React.CSSProperties}>
                <span>{world.number}</span>
                <strong>{world.name}</strong>
                <em>{world.kicker}</em>
                <i aria-hidden="true">↗</i>
              </TransitionLink>
            ))}
          </div>
        </section>

        <section className="request-section" id="request">
          <div className="request-copy" data-reveal>
            <p>Looking for something specific?</p>
            <h2>Tell us what you are trying to find.</h2>
            <span>Share a link, a reference image, or the details that matter. This prototype stores nothing and does not send requests.</span>
          </div>
          <form onSubmit={submit} data-reveal style={{ "--reveal-delay": "90ms" } as React.CSSProperties}>
            <fieldset className="request-form-group">
              <legend>Your details</legend>
              <div className="request-form-grid">
                <label><span>Full name</span><input name="name" required autoComplete="name" placeholder="Your name" /></label>
                <label><span>Email address</span><input name="email" type="email" required inputMode="email" autoComplete="email" placeholder="you@example.com" /></label>
                <label><span>Phone or WhatsApp</span><input name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+91 98765 43210" /></label>
                <label><span>City and country</span><input name="location" required autoComplete="address-level2" placeholder="Mumbai, India" /></label>
              </div>
              <label><span>Preferred contact</span><select name="contactPreference" defaultValue="email"><option value="email">Email</option><option value="whatsapp">WhatsApp</option><option value="phone">Phone call</option></select></label>
            </fieldset>
            <fieldset className="request-form-group">
              <legend>Your request</legend>
              <label><span>What are you looking for?</span><input name="request" required autoComplete="off" placeholder="A lamp I saw in Copenhagen" /></label>
              <label><span>Reference link</span><input name="reference" type="url" inputMode="url" autoComplete="url" placeholder="https://" /></label>
              <label><span>Anything we should know?</span><textarea name="details" rows={3} placeholder="Material, size, budget or where you found it" /></label>
            </fieldset>
            <button type="submit">{submitted ? "Request noted" : "Submit a request"}<span>↗</span></button>
            {submitted ? <p role="status">Prototype complete — no information was transmitted.</p> : null}
          </form>
        </section>

        <footer className="site-footer"><span>ELSEWHERE</span><p>Independent products, checked before sourcing.</p><a href="#lobby">Back to top ↑</a></footer>
      </main>
    </>
  );
}
