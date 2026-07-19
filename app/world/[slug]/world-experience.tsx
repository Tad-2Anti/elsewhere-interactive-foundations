"use client";

/* Static project art must bypass the unavailable Vinext image-optimizer route. */
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { TransitionLink } from "../../route-transition";
import { useViewportReveals } from "../../use-viewport-reveals";
import { worlds, type World } from "../../world-data";

export default function WorldExperience({ world }: { world: World }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [department, setDepartment] = useState<string>("All");
  const mainRef = useViewportReveals<HTMLElement>();
  const worldIndex = worlds.findIndex((item) => item.id === world.id);
  const nextWorld = worlds[(worldIndex + 1) % worlds.length];

  return (
    <main
      ref={mainRef}
      tabIndex={-1}
      className="world-page"
      data-world={world.id}
      style={{ "--world-accent": world.accent, "--world-deep": world.accentSoft } as React.CSSProperties}
    >
      <div className="world-atmosphere" aria-hidden="true"><i /><i /><i /></div>
      <header className="world-header">
        <TransitionLink href={`/?world=${world.id}`} className="world-back">← Back to the index</TransitionLink>
        <span className="world-logo">ELSEWHERE</span>
        <span>{world.number} / 06</span>
      </header>

      <section className="world-hero">
        <div className="world-title-wrap">
          <p>{world.kicker}</p>
          <h1>{world.name}</h1>
          <span className="world-coordinate">WORLD {world.number}</span>
        </div>
        <figure className="world-hero-art">
          <span className="hero-orbit hero-orbit-a" aria-hidden="true" />
          <span className="hero-orbit hero-orbit-b" aria-hidden="true" />
          <picture>
            <source media="(max-width: 760px)" srcSet={world.heroImageMobile} />
            <img
              src={world.heroImage}
              alt={world.heroAlt}
              width={1120}
              height={1400}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              style={{ objectPosition: world.heroFocalPoint }}
            />
          </picture>
          <figcaption><span>{world.number}</span>{world.heroCaption}</figcaption>
        </figure>
        <p className="world-manifesto">{world.manifesto}</p>
        <a href="#objects" className="world-scroll">Enter the collection ↓</a>
      </section>

      <section className={`object-section ${world.catalog ? "catalog-section" : ""}`} id="objects">
        <div className="object-heading" data-reveal>
          <p>{world.catalog?.eyebrow ?? "Objects in transmission"}</p>
          <h2>{world.catalog?.heading ?? <>Four possibilities,<br />ready to be sourced.</>}</h2>
        </div>
        {world.catalog && (
          <div className="catalog-toolbar" data-reveal>
            <p>Browse the collection</p>
            <div className="catalog-filters" aria-label="Filter catalog">
              {["All", ...world.catalog.filters].map((item) => <button key={item} type="button" data-active={department === item} onClick={() => { setDepartment(item); setSelected(null); }}>{item}</button>)}
            </div>
          </div>
        )}
        <div className="object-list" data-reveal style={{ "--reveal-delay": "90ms" } as React.CSSProperties}>
          {world.products.map((product, index) => (department === "All" || product.department === department) && (
            <button
              type="button"
              key={product.name}
              data-open={selected === index}
              aria-expanded={selected === index}
              aria-controls={`${world.id}-product-${index}`}
              onClick={() => setSelected(selected === index ? null : index)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <span className="object-meta">{product.brand && <small>{product.brand}</small>}<strong>{product.name}</strong><em>{product.type}{product.price ? ` · ${product.price}` : ""}</em></span>
              <i aria-hidden="true">{selected === index ? "−" : "+"}</i>
              <p id={`${world.id}-product-${index}`} aria-hidden={selected !== index}>
                {product.note}
                {product.signal && <span className="catalog-signal">{product.signal}</span>}
                {product.palette && <span className="catalog-palette" aria-label="Colour direction">{product.palette.map((colour) => <i key={colour} style={{ background: colour }} />)}</span>}
              </p>
            </button>
          ))}
        </div>
      </section>

      {world.supportingImages && (
        <section className="world-editorial" aria-label={`${world.name} visual edit`}>
          {world.supportingImages.map((item, index) => (
            <figure key={item.src} data-reveal style={{ "--reveal-delay": `${index * 90}ms` } as React.CSSProperties}>
              <div><img src={item.src} alt={item.alt} width={1200} height={800} loading="lazy" decoding="async" /></div>
              <figcaption><span>0{index + 1}</span><strong>{item.label}</strong></figcaption>
            </figure>
          ))}
        </section>
      )}

      <section className="world-request" data-reveal>
        <p>Looking for something else in this category?</p>
        <h2>Send a reference.<br />We’ll check the source.</h2>
        <TransitionLink href="/#request">Request something <span>↗</span></TransitionLink>
      </section>

      <footer className="world-footer">
        <TransitionLink href={`/?world=${world.id}`}>All worlds</TransitionLink>
        <span>{world.name} · ELSEWHERE</span>
        <TransitionLink href={`/world/${nextWorld.id}`}>
          Next world →
        </TransitionLink>
      </footer>
    </main>
  );
}
