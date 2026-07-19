"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import AtmosphericDepthGallery, { type AtmosphericDepthGalleryHandle } from "./atmospheric-depth-gallery";
import { requestSchema } from "./request-schema";
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

async function submitToWeb3Forms(data: Record<string, string>): Promise<boolean> {
  const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;
  if (!accessKey) return false;

  // Same honeypot contract as the server route: a filled hidden field means a bot.
  if (typeof data.website === "string" && data.website !== "") return false;

  const parsed = requestSchema.safeParse(data);
  if (!parsed.success) return false;
  const fields = parsed.data;

  try {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: accessKey,
        subject: `New ELSEWHERE Sourcing Request: ${fields.request}`,
        from_name: "ELSEWHERE Sourcing Form",
        name: fields.name,
        email: fields.email,
        phone: fields.phone || "",
        location: fields.location,
        contactPreference: fields.contactPreference,
        category: fields.category,
        request: fields.request,
        reference: fields.reference || "",
        details: fields.details || "",
      }),
    });
    const result: unknown = await response.json().catch(() => null);
    return response.ok && Boolean(result && typeof result === "object" && (result as { success?: unknown }).success === true);
  } catch {
    return false;
  }
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
  const [hydrated, setHydrated] = useState(false);
  const [entered, setEntered] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [initialIndex, setInitialIndex] = useState<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [galleryReady, setGalleryReady] = useState(false);
  const [enteringWorld, setEnteringWorld] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { enabled, enable, disable } = useSiteSoundtrack();
  const formRef = useRef<HTMLFormElement>(null);
  const galleryRef = useRef<AtmosphericDepthGalleryHandle>(null);
  const mainRef = useViewportReveals<HTMLElement>();
  const activeWorld = useMemo(() => worlds[activeIndex], [activeIndex]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setHydrated(true);
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
    await new Promise<void>((resolve) => window.setTimeout(resolve, 260));
    setEntered(true);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setSubmissionStatus("idle");
    setErrorMessage(null);
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries()) as Record<string, string>;

    try {
      const [dbResponse, web3FormsDelivered] = await Promise.all([
        fetch("/api/requests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }),
        submitToWeb3Forms(data),
      ]);
      const result = await dbResponse.json().catch(() => ({}));

      if (dbResponse.status === 400) {
        setSubmissionStatus("error");
        setErrorMessage(result.error || "An error occurred. Please try again.");
        if (result.fields) {
          const formattedErrors: Record<string, string> = {};
          for (const key of Object.keys(result.fields)) {
            formattedErrors[key] = result.fields[key]?.[0] || "";
          }
          setFieldErrors(formattedErrors);
        }
        window.setTimeout(() => {
          document.querySelector<HTMLElement>(".request-error-status")?.focus();
        }, 100);
      } else if (dbResponse.ok || web3FormsDelivered) {
        setSubmissionStatus("success");
        formRef.current?.reset();
        window.setTimeout(() => {
          document.querySelector<HTMLElement>(".request-success-status")?.focus();
        }, 100);
      } else {
        setSubmissionStatus("error");
        setErrorMessage(result.error || "We could not deliver your request. Please try again shortly.");
        window.setTimeout(() => {
          document.querySelector<HTMLElement>(".request-error-status")?.focus();
        }, 100);
      }
    } catch {
      setSubmissionStatus("error");
      setErrorMessage("Network error. Please check your connection and try again.");
      window.setTimeout(() => {
        document.querySelector<HTMLElement>(".request-error-status")?.focus();
      }, 100);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <noscript><style>{`.entry-gate{display:none!important}`}</style></noscript>
      {!entered ? <EntryGate onEnter={enter} /> : null}
      <CursorAura />
      <main
        ref={mainRef}
        tabIndex={-1}
        className="spatial-site"
        aria-hidden={hydrated && !entered ? true : undefined}
        inert={hydrated && !entered ? true : undefined}
        data-entering={enteringWorld}
        data-gallery-ready={galleryReady}
      >
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

        <section className="world-index" id="explore" tabIndex={-1} aria-labelledby="explore-heading">
          <header data-reveal>
            <p>The index</p>
            <h2 id="explore-heading">Six categories,<br />one careful edit.</h2>
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
            <span>Share a link, reference, or specifications. Submissions are processed and stored securely.</span>
          </div>
          <form ref={formRef} onSubmit={submit} data-reveal style={{ "--reveal-delay": "90ms" } as React.CSSProperties}>
            {/* Honeypot field */}
            <input type="text" name="website" style={{ display: "none" }} tabIndex={-1} autoComplete="off" />

            <fieldset className="request-form-group" disabled={submitting}>
              <legend>Your details</legend>
              <div className="request-form-grid">
                <label>
                  <span>Full name</span>
                  <input name="name" required autoComplete="name" placeholder="Your name" aria-invalid={!!fieldErrors.name} aria-describedby={fieldErrors.name ? "error-name" : undefined} />
                  {fieldErrors.name && <span id="error-name" className="field-error-message" role="alert">{fieldErrors.name}</span>}
                </label>
                <label>
                  <span>Email address</span>
                  <input name="email" type="email" required inputMode="email" autoComplete="email" placeholder="you@example.com" aria-invalid={!!fieldErrors.email} aria-describedby={fieldErrors.email ? "error-email" : undefined} />
                  {fieldErrors.email && <span id="error-email" className="field-error-message" role="alert">{fieldErrors.email}</span>}
                </label>
                <label>
                  <span>Phone or WhatsApp</span>
                  <input name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+91 98765 43210" aria-invalid={!!fieldErrors.phone} aria-describedby={fieldErrors.phone ? "error-phone" : undefined} />
                  {fieldErrors.phone && <span id="error-phone" className="field-error-message" role="alert">{fieldErrors.phone}</span>}
                </label>
                <label>
                  <span>City and country</span>
                  <input name="location" required autoComplete="address-level2" placeholder="Mumbai, India" aria-invalid={!!fieldErrors.location} aria-describedby={fieldErrors.location ? "error-location" : undefined} />
                  {fieldErrors.location && <span id="error-location" className="field-error-message" role="alert">{fieldErrors.location}</span>}
                </label>
              </div>
              <label>
                <span>Preferred contact</span>
                <select name="contactPreference" defaultValue="email" aria-invalid={!!fieldErrors.contactPreference} aria-describedby={fieldErrors.contactPreference ? "error-contactPreference" : undefined}>
                  <option value="email">Email</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="phone">Phone call</option>
                </select>
                {fieldErrors.contactPreference && <span id="error-contactPreference" className="field-error-message" role="alert">{fieldErrors.contactPreference}</span>}
              </label>
            </fieldset>

            <fieldset className="request-form-group" disabled={submitting}>
              <legend>Your request</legend>
              <label>
                <span>World / Category</span>
                <select name="category" defaultValue={activeWorld.id} aria-invalid={!!fieldErrors.category} aria-describedby={fieldErrors.category ? "error-category" : undefined}>
                  {worlds.map((w) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
                {fieldErrors.category && <span id="error-category" className="field-error-message" role="alert">{fieldErrors.category}</span>}
              </label>
              <label>
                <span>What are you looking for?</span>
                <input name="request" required autoComplete="off" placeholder="A lamp I saw in Copenhagen" aria-invalid={!!fieldErrors.request} aria-describedby={fieldErrors.request ? "error-request" : undefined} />
                {fieldErrors.request && <span id="error-request" className="field-error-message" role="alert">{fieldErrors.request}</span>}
              </label>
              <label>
                <span>Reference link</span>
                <input name="reference" type="url" inputMode="url" autoComplete="url" placeholder="https://" aria-invalid={!!fieldErrors.reference} aria-describedby={fieldErrors.reference ? "error-reference" : undefined} />
                {fieldErrors.reference && <span id="error-reference" className="field-error-message" role="alert">{fieldErrors.reference}</span>}
              </label>
              <label>
                <span>Anything we should know?</span>
                <textarea name="details" rows={3} placeholder="Material, size, budget or where you found it" aria-invalid={!!fieldErrors.details} aria-describedby={fieldErrors.details ? "error-details" : undefined} />
                {fieldErrors.details && <span id="error-details" className="field-error-message" role="alert">{fieldErrors.details}</span>}
              </label>
            </fieldset>

            <div className="request-privacy-consent">
              <p>By submitting, you consent to ELSEWHERE checking and saving your request details, and to their delivery via Web3Forms, our email processor. We do not sell or share your data beyond fulfilling this request.</p>
            </div>

            <button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : submissionStatus === "success" ? "Submitted" : "Submit a request"}
              <span>↗</span>
            </button>

            {submissionStatus === "success" && (
              <p className="request-success-status" role="status" tabIndex={-1} style={{ color: "#b8ff45", marginTop: "1rem" }}>
                Your request has been successfully submitted. We will be in touch!
              </p>
            )}

            {submissionStatus === "error" && (
              <p className="request-error-status" role="alert" tabIndex={-1} style={{ color: "#ff9a71", marginTop: "1rem" }}>
                {errorMessage || "Submission failed. Please check the fields and try again."}
              </p>
            )}
          </form>
        </section>

        <footer className="site-footer"><span>ELSEWHERE</span><p>Independent products, checked before sourcing.</p><a href="#lobby">Back to top ↑</a></footer>
      </main>
    </>
  );
}
