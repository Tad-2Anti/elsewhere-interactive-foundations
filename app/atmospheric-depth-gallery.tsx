"use client";

/* Static project art must bypass the unavailable Vinext image-optimizer route. */

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { DepthGalleryEngine as DepthGalleryEngineInstance } from "./atmospheric-gallery/depth-engine";
import type { World } from "./world-data";
import { TransitionLink } from "./route-transition";

export type AtmosphericDepthGalleryHandle = {
  goToIndex: (index: number) => void;
  enterActive: () => void;
};

type Props = {
  worlds: World[];
  initialIndex: number;
  reducedMotion: boolean;
  onActiveWorldChange: (index: number) => void;
  onWorldActivate: (index: number) => void;
  onReady: () => void;
};

const AtmosphericDepthGallery = forwardRef<AtmosphericDepthGalleryHandle, Props>(function AtmosphericDepthGallery(
  { worlds, initialIndex, reducedMotion, onActiveWorldChange, onWorldActivate, onReady },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<DepthGalleryEngineInstance | null>(null);
  const callbackRef = useRef({ onActiveWorldChange, onWorldActivate, onReady });
  const [failed, setFailed] = useState(false);

  callbackRef.current = { onActiveWorldChange, onWorldActivate, onReady };

  useImperativeHandle(ref, () => ({
    goToIndex(index) {
      engineRef.current?.goToIndex(index);
    },
    enterActive() {
      engineRef.current?.enterActive();
    },
  }), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    let engine: DepthGalleryEngineInstance | null = null;
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      if (!cancelled) {
        setFailed(true);
        callbackRef.current.onReady();
      }
    };
    canvas.addEventListener("webglcontextlost", handleContextLost);
    void import("./atmospheric-gallery/depth-engine").then(async ({ DepthGalleryEngine }) => {
      if (cancelled) return;
      engine = new DepthGalleryEngine(canvas, worlds, {
        initialIndex,
        reducedMotion,
        onActiveChange: (index) => callbackRef.current.onActiveWorldChange(index),
        onActivate: (index) => callbackRef.current.onWorldActivate(index),
        onReady: () => callbackRef.current.onReady(),
      });
      engineRef.current = engine;
      await engine.init();
    }).catch(() => {
      if (!cancelled) {
        setFailed(true);
        callbackRef.current.onReady();
      }
    });
    return () => {
      cancelled = true;
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      engine?.dispose();
      engineRef.current = null;
    };
  }, [initialIndex, reducedMotion, worlds]);

  if (failed) {
    return (
      <div className="depth-gallery-fallback" role="group" aria-label="Product worlds">
        {worlds.map((world) => (
          <TransitionLink href={`/world/${world.id}`} key={world.id}>
            <picture>
              <source media="(max-width: 760px)" srcSet={world.imageMobile} />
              <img src={world.image} alt="" width={1120} height={1400} loading="lazy" decoding="async" />
            </picture>
            <span>{world.number}</span>
            <strong>{world.name}</strong>
          </TransitionLink>
        ))}
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="depth-gallery-canvas"
      tabIndex={0}
      aria-label="Atmospheric gallery. Scroll or drag vertically to move between worlds; press Enter to open the active world."
    />
  );
});

export default AtmosphericDepthGallery;
