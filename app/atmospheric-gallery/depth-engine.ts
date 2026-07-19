import * as THREE from "three";
import type { World } from "../world-data";
import { backgroundFragmentShader, backgroundVertexShader } from "./shaders";

const PLANE_GAP = 5;
const SCROLL_TO_WORLD = 0.01;
const CAMERA_OFFSET = 5;
const MOBILE_BREAKPOINT = 700;
const TABLET_BREAKPOINT = 1100;
const TEXTURE_READY_TIMEOUT_MS = 4000;
const TEXTURE_BATCH_SIZE = 2;
const TEXTURE_RETRY_DELAY_MS = 900;
const MOBILE_DPR_LIMIT = 1.25;
const MOBILE_TOUCH_MULTIPLIER = 2.4;
const DEFAULT_TOUCH_MULTIPLIER = 1.8;
const MOBILE_SCROLL_SMOOTHING = 0.085;
const FRAME_AT_60_FPS = 1000 / 60;

const MOTION = {
  scrollSmoothing: 0.055,
  velocitySmoothing: 0.075,
  velocityLimit: 0.12,
  velocityDeadZone: 0.004,
  pointerSmoothing: 0.055,
  pointerParallaxX: 0.018,
  pointerParallaxY: 0.025,
  pointerSuppressionWhileMoving: 0.94,
  horizontalPositionSmoothing: 0.065,
  verticalPositionSmoothing: 0.14,
  maximumTilt: 0.007,
  tiltSmoothing: 0.08,
  breathScale: 0.014,
  breathSmoothing: 0.1,
  verticalSpringTarget: 0.2,
  verticalSpringLimit: 0.3,
  verticalSpringStiffness: 38,
  verticalSpringDamping: 4.8,
  verticalWheelImpulse: 0.15,
  verticalDragImpulse: 0.18,
  verticalSpringVelocityLimit: 1.6,
} as const;

type GalleryPlane = {
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  baseX: number;
  baseZ: number;
  aspect: number;
  opacity: number;
};

type Palette = { background: THREE.Color; blob1: THREE.Color; blob2: THREE.Color };
type ViewportTier = "mobile" | "tablet" | "desktop";

export type DepthEngineOptions = {
  initialIndex: number;
  reducedMotion: boolean;
  onActiveChange: (index: number) => void;
  onActivate: (index: number) => void;
  onReady: () => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function easeInOutCubic(value: number) {
  return value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function smootherStep(value: number) {
  const t = clamp(value, 0, 1);
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function frameRateIndependentAlpha(baseAlpha: number, deltaMs: number) {
  return 1 - Math.pow(1 - baseAlpha, clamp(deltaMs / FRAME_AT_60_FPS, 0.25, 3));
}

class LightTrail {
  private readonly group = new THREE.Group();
  private readonly material = new THREE.MeshStandardMaterial({
    color: "#f6f9ff",
    emissive: "#ffffff",
    emissiveIntensity: 1.35,
    roughness: 0.2,
    metalness: 0.05,
    transparent: true,
    opacity: 0,
    depthTest: false,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });
  private mesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial> | null = null;
  private points: THREE.Vector3[] = [];
  private lastCameraZ = Number.NaN;
  private direction = 1;
  private previousProgress: number | null = null;
  private opacity = 0.51;
  private hasMoved = false;
  private seeded = false;
  private lastBuildAt = 0;

  constructor(scene: THREE.Scene) {
    this.group.renderOrder = 20;
    scene.add(this.group);
  }

  update(cameraZ: number, progress: number, velocity: number, isMobile: boolean, time: number) {
    const progressDelta = this.previousProgress === null ? 0 : progress - this.previousProgress;
    const nextDirection = Math.abs(progressDelta) <= 0.0005 ? this.direction : Math.sign(progressDelta);
    const reversed = this.previousProgress !== null && nextDirection !== this.direction;
    this.direction = nextDirection || this.direction;
    this.previousProgress = progress;
    this.lastCameraZ = cameraZ;
    if (progress > 0.01) this.hasMoved = true;

    const widthScale = isMobile ? 0.35 : 1;
    const xOffset = isMobile ? 0.35 : 0;
    const depthProgress = -0.1 + clamp(progress, 0, 1) * 1.1;
    const point = new THREE.Vector3(
      (-0.96 + xOffset) + Math.sin(progress * Math.PI * 2 * 1.85) * 3 * widthScale,
      -1.05 + Math.sin(progress * Math.PI * 2 * 2.1) * 0.78,
      cameraZ + 1.65 - (4.78 + depthProgress * 6.52),
    );

    if (!this.seeded) {
      for (let index = 10; index >= 0; index -= 1) {
        this.points.push(point.clone().add(new THREE.Vector3(0, 0, -index * 0.12)));
      }
      this.seeded = true;
    }
    if (reversed) {
      this.points = [point.clone().add(new THREE.Vector3(0, 0, this.direction * 0.12))];
    }

    const lastPoint = this.points[this.points.length - 1];
    if (!lastPoint || point.distanceToSquared(lastPoint) > 0.006 * 0.006) {
      this.points.push(lastPoint ? lastPoint.clone().lerp(point, 0.53) : point);
    }
    const lengthProgress = this.direction < 0 ? progress * 0.55 : progress;
    const maxPoints = Math.round(THREE.MathUtils.lerp(14, 220, clamp(lengthProgress, 0, 1)));
    const trimBudget = this.direction < 0 ? 32 : 4;
    if (this.points.length > maxPoints) this.points.splice(0, Math.min(trimBudget, this.points.length - maxPoints));

    const startDistance = clamp(progress + 0.1, 0, 1);
    const closestEdgeDistance = Math.min(startDistance, 1 - progress);
    const edgeVisibility = THREE.MathUtils.smoothstep(closestEdgeDistance, 0.04, 0.2);
    const startupVisibility = !this.hasMoved && progress <= 0.01 ? 0.55 : 0;
    const targetOpacity = 0.51 * Math.max(edgeVisibility, startupVisibility);
    this.opacity += (targetOpacity - this.opacity) * 0.12;
    this.material.opacity = this.opacity;
    if (this.points.length < 2) return;
    if (time - this.lastBuildAt < 32) return;
    this.lastBuildAt = time;

    const curve = new THREE.CatmullRomCurve3(this.points, false, "centripetal", 0.67);
    const segments = Math.max(24, Math.min(220, this.points.length * 4));
    const geometry = this.createTaperedTube(curve, segments);
    if (!this.mesh) {
      this.mesh = new THREE.Mesh(geometry, this.material);
      this.mesh.renderOrder = 20;
      this.group.add(this.mesh);
    } else {
      this.mesh.geometry.dispose();
      this.mesh.geometry = geometry;
    }
    void velocity;
  }

  private createTaperedTube(curve: THREE.CatmullRomCurve3, segments: number) {
    const pathPoints = curve.getSpacedPoints(segments);
    const radialSegments = 8;
    const ringPoints = radialSegments + 1;
    const vertices: number[] = [];
    const indices: number[] = [];
    const up = new THREE.Vector3(0, 0, 1);
    const tangent = new THREE.Vector3();
    const normal = new THREE.Vector3();
    const binormal = new THREE.Vector3();
    const radialOffset = new THREE.Vector3();
    const vertexPosition = new THREE.Vector3();

    pathPoints.forEach((pathPoint: THREE.Vector3, index: number) => {
      const t = index / Math.max(pathPoints.length - 1, 1);
      const radius = 0.012 + (0.003 - 0.012) * Math.pow(t, 1.5);
      curve.getTangent(t, tangent).normalize();
      normal.crossVectors(up, tangent).normalize();
      if (normal.lengthSq() === 0) normal.set(1, 0, 0);
      binormal.crossVectors(tangent, normal).normalize();

      for (let side = 0; side <= radialSegments; side += 1) {
        const angle = (side / radialSegments) * Math.PI * 2;
        radialOffset.copy(normal).multiplyScalar(-Math.cos(angle) * radius)
          .addScaledVector(binormal, Math.sin(angle) * radius);
        vertexPosition.copy(pathPoint).add(radialOffset);
        vertices.push(vertexPosition.x, vertexPosition.y, vertexPosition.z);
      }
    });

    for (let segment = 0; segment < pathPoints.length - 1; segment += 1) {
      for (let side = 0; side < radialSegments; side += 1) {
        const base = segment * ringPoints + side;
        indices.push(base, base + ringPoints, base + 1);
        indices.push(base + ringPoints, base + ringPoints + 1, base + 1);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  }

  dispose(scene: THREE.Scene) {
    scene.remove(this.group);
    this.mesh?.geometry.dispose();
    this.material.dispose();
  }
}

export class DepthGalleryEngine {
  private readonly canvas: HTMLCanvasElement;
  private readonly worlds: World[];
  private readonly options: DepthEngineOptions;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  private readonly renderer: THREE.WebGLRenderer;
  private readonly backgroundScene = new THREE.Scene();
  private readonly backgroundCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private readonly backgroundMaterial: THREE.ShaderMaterial;
  private readonly raycaster = new THREE.Raycaster();
  private readonly pointerTarget = new THREE.Vector2();
  private readonly pointerCurrent = new THREE.Vector2();
  private readonly planes: GalleryPlane[] = [];
  private readonly palettes: Palette[];
  private readonly textureLoads = new Map<number, Promise<THREE.Texture | null>>();
  private readonly textureRetries = new Set<number>();
  private readonly textureRetryTimers = new Set<number>();
  private trail: LightTrail | null = null;
  private animationFrame = 0;
  private running = false;
  private isMobile = false;
  private viewportTier: ViewportTier = "desktop";
  private pointerParallaxScale = 1;
  private canvasVisible = true;
  private pageVisible = true;
  private resizeFrame = 0;
  private resizeObserver: ResizeObserver | null = null;
  private intersectionObserver: IntersectionObserver | null = null;
  private scrollTarget = 0;
  private scrollCurrent = 0;
  private scrollVelocity = 0;
  private previousScroll = 0;
  private minScroll = 0;
  private maxScroll = 0;
  private activeIndex = 0;
  private gestureDriftY = 0;
  private verticalSpringPosition = 0;
  private verticalSpringVelocity = 0;
  private pointerDown: { id: number; y: number; startX: number; startY: number; moved: number; edgeTravel: number } | null = null;
  private lastFrameTime = performance.now();
  private portal: { index: number; startedAt: number; callbackSent: boolean; cameraStart: number } | null = null;
  private disposed = false;

  constructor(canvas: HTMLCanvasElement, worlds: World[], options: DepthEngineOptions) {
    this.canvas = canvas;
    this.worlds = worlds;
    this.options = options;
    this.camera.position.set(0, 0, 6);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: window.innerWidth >= MOBILE_BREAKPOINT,
      powerPreference: "high-performance",
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.autoClear = false;

    this.palettes = worlds.map((world) => ({
      background: new THREE.Color(world.gallery.background),
      blob1: new THREE.Color(world.gallery.blob1),
      blob2: new THREE.Color(world.gallery.blob2),
    }));
    const firstPalette = this.palettes[0];
    this.backgroundMaterial = new THREE.ShaderMaterial({
      vertexShader: backgroundVertexShader,
      fragmentShader: backgroundFragmentShader,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uBackgroundColor: { value: firstPalette.background.clone() },
        uBlob1Color: { value: firstPalette.blob1.clone() },
        uBlob2Color: { value: firstPalette.blob2.clone() },
        uNoiseStrength: { value: 0.04 },
        uBlobRadius: { value: 0.65 },
        uBlobRadiusSecondary: { value: 0.65 * 0.78 },
        uBlobStrength: { value: 0.9 },
        uTime: { value: 0 },
        uVelocityIntensity: { value: 0 },
      },
    });
    const background = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.backgroundMaterial);
    this.backgroundScene.add(background);
  }

  async init() {
    const loader = new THREE.TextureLoader();
    const initialIndex = clamp(Math.round(this.options.initialIndex), 0, this.worlds.length - 1);
    const initialTexture = await this.loadTexture(loader, initialIndex);
    if (this.disposed) {
      initialTexture?.dispose();
      return;
    }

    this.worlds.forEach((world, index) => {
      const texture = index === initialIndex && initialTexture ? initialTexture : this.createPlaceholderTexture(index);
      const image = texture.image as { width?: number; height?: number };
      const aspect = index === initialIndex && initialTexture ? (image.width ?? 1) / (image.height ?? 1) : 0.8;
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: index === 0 ? 1 : 0,
        depthWrite: false,
        toneMapped: false,
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(3, 3), material);
      const baseZ = -index * PLANE_GAP;
      mesh.position.set(this.worlds[index].gallery.x, 0, baseZ);
      mesh.scale.x = aspect;
      mesh.renderOrder = index + 1;
      mesh.userData.worldIndex = index;
      this.scene.add(mesh);
      this.planes.push({ mesh, baseX: mesh.position.x, baseZ, aspect, opacity: index === 0 ? 1 : 0 });
    });

    this.maxScroll = Math.max(0, ((this.planes[0]?.baseZ ?? 0) - (this.planes.at(-1)?.baseZ ?? 0)) / SCROLL_TO_WORLD);
    this.resize();
    this.goToIndex(this.options.initialIndex, true);
    if (!this.options.reducedMotion && this.viewportTier === "desktop") this.trail = new LightTrail(this.scene);
    this.bindEvents();
    this.pageVisible = document.visibilityState !== "hidden";
    this.running = true;
    this.lastFrameTime = performance.now();
    this.animationFrame = requestAnimationFrame(this.update);
    this.options.onReady();
    void this.loadRemainingTextures(loader, initialIndex, Boolean(initialTexture));
  }

  private async loadTexture(loader: THREE.TextureLoader, index: number) {
    const existingLoad = this.textureLoads.get(index);
    if (existingLoad) return existingLoad;

    const source = window.innerWidth <= MOBILE_BREAKPOINT
      ? this.worlds[index].imageMobile
      : this.worlds[index].image;
    const textureLoad = new Promise<THREE.Texture | null>((resolve) => {
      let settled = false;
      const timeout = window.setTimeout(() => {
        settled = true;
        resolve(null);
      }, TEXTURE_READY_TIMEOUT_MS);

      loader.load(source, (texture) => {
        this.configureTexture(texture);
        if (this.disposed) {
          texture.dispose();
          if (!settled) {
            settled = true;
            window.clearTimeout(timeout);
            resolve(null);
          }
        } else if (settled) this.applyTexture(index, texture);
        else {
          settled = true;
          window.clearTimeout(timeout);
          resolve(texture);
        }
      }, undefined, () => {
        window.clearTimeout(timeout);
        this.textureLoads.delete(index);
        if (!settled) resolve(null);
        this.scheduleTextureRetry(loader, index);
      });
    });

    this.textureLoads.set(index, textureLoad);
    return textureLoad;
  }

  private configureTexture(texture: THREE.Texture) {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;
    texture.anisotropy = Math.min(2, this.renderer.capabilities.getMaxAnisotropy());
    texture.needsUpdate = true;
  }

  private applyTexture(index: number, texture: THREE.Texture) {
    const plane = this.planes[index];
    if (this.disposed || !plane) {
      texture.dispose();
      return;
    }

    const previousTexture = plane.mesh.material.map;
    const image = texture.image as { width?: number; height?: number };
    plane.aspect = (image.width ?? 1) / (image.height ?? 1);
    plane.mesh.material.map = texture;
    plane.mesh.material.needsUpdate = true;
    previousTexture?.dispose();
    this.applyPlaneScale(plane);
  }

  private scheduleTextureRetry(loader: THREE.TextureLoader, index: number) {
    if (this.disposed || this.textureRetries.has(index)) return;
    this.textureRetries.add(index);
    const timer = window.setTimeout(() => {
      this.textureRetryTimers.delete(timer);
      if (this.disposed) return;
      void this.loadTexture(loader, index).then((texture) => {
        if (texture) this.applyTexture(index, texture);
      });
    }, TEXTURE_RETRY_DELAY_MS);
    this.textureRetryTimers.add(timer);
  }

  private createPlaceholderTexture(index: number) {
    const color = this.palettes[index].blob1;
    const data = new Uint8Array([
      Math.round(color.r * 255),
      Math.round(color.g * 255),
      Math.round(color.b * 255),
      255,
    ]);
    const texture = new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }

  private async loadRemainingTextures(loader: THREE.TextureLoader, initialIndex: number, hasInitialTexture: boolean) {
    const order = this.worlds
      .map((_, index) => index)
      .filter((index) => index !== initialIndex || !hasInitialTexture)
      .sort((a, b) => Math.abs(a - initialIndex) - Math.abs(b - initialIndex));

    for (let start = 0; start < order.length; start += TEXTURE_BATCH_SIZE) {
      const batch = order.slice(start, start + TEXTURE_BATCH_SIZE);
      await Promise.all(batch.map(async (index) => {
        const texture = await this.loadTexture(loader, index);
        if (texture) this.applyTexture(index, texture);
      }));
      if (this.disposed) return;
    }
  }

  goToIndex(index: number, immediate = false) {
    const safeIndex = clamp(Math.round(index), 0, this.worlds.length - 1);
    const nextScroll = safeIndex * PLANE_GAP / SCROLL_TO_WORLD;
    this.scrollTarget = clamp(nextScroll, this.minScroll, this.maxScroll);
    if (immediate) {
      this.scrollCurrent = this.scrollTarget;
      this.previousScroll = this.scrollCurrent;
      this.camera.position.z = CAMERA_OFFSET - this.scrollCurrent * SCROLL_TO_WORLD;
      this.activeIndex = safeIndex;
      this.planes.forEach((plane, index) => {
        plane.opacity = index === safeIndex ? 1 : 0;
        plane.mesh.material.opacity = plane.opacity;
        plane.mesh.visible = index === safeIndex;
      });
      this.options.onActiveChange(safeIndex);
    }
  }

  step(direction: number) {
    if (this.portal) return;
    if (direction > 0 && this.activeIndex === this.worlds.length - 1 && this.scrollTarget >= this.maxScroll - 1) {
      this.handoffToIndex();
      return;
    }
    this.goToIndex(this.activeIndex + Math.sign(direction));
  }

  enterActive() {
    if (this.portal) return;
    this.portal = {
      index: this.activeIndex,
      startedAt: performance.now(),
      callbackSent: false,
      cameraStart: this.camera.position.z,
    };
  }

  dispose() {
    this.disposed = true;
    this.running = false;
    cancelAnimationFrame(this.animationFrame);
    cancelAnimationFrame(this.resizeFrame);
    this.textureRetryTimers.forEach(window.clearTimeout);
    this.textureRetryTimers.clear();
    this.textureLoads.clear();
    this.unbindEvents();
    this.trail?.dispose(this.scene);
    this.planes.forEach(({ mesh }) => {
      mesh.geometry.dispose();
      mesh.material.map?.dispose();
      mesh.material.dispose();
      this.scene.remove(mesh);
    });
    (this.backgroundScene.children[0] as THREE.Mesh).geometry.dispose();
    this.backgroundMaterial.dispose();
    this.renderer.dispose();
    document.body.dataset.canvasHover = "false";
  }

  private resize = () => {
    const width = Math.max(1, this.canvas.clientWidth || window.innerWidth);
    const height = Math.max(1, this.canvas.clientHeight || window.innerHeight);
    this.viewportTier = width < MOBILE_BREAKPOINT ? "mobile" : width < TABLET_BREAKPOINT ? "tablet" : "desktop";
    this.isMobile = this.viewportTier === "mobile";
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    this.pointerParallaxScale = coarsePointer ? 0.25 : this.viewportTier === "mobile" ? 0.35 : this.viewportTier === "tablet" ? 0.7 : 1;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    const dprLimit = this.viewportTier === "mobile" ? MOBILE_DPR_LIMIT : this.viewportTier === "tablet" ? 1.35 : 1.75;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, dprLimit));
    this.renderer.setSize(width, height, false);
    this.backgroundMaterial.uniforms.uNoiseStrength.value = this.viewportTier === "mobile" ? 0.022 : this.viewportTier === "tablet" ? 0.032 : 0.04;
    this.planes.forEach((plane) => this.applyPlaneScale(plane));

    const wantsTrail = !this.options.reducedMotion && this.viewportTier === "desktop";
    if (!wantsTrail && this.trail) {
      this.trail.dispose(this.scene);
      this.trail = null;
    } else if (wantsTrail && !this.trail && this.planes.length) {
      this.trail = new LightTrail(this.scene);
    }
  };

  private applyPlaneScale(plane: GalleryPlane) {
    const planeScale = this.viewportTier === "mobile" ? 0.66 : this.viewportTier === "tablet" ? 0.82 : 1;
    const xSpread = this.viewportTier === "mobile" ? 0.25 : this.viewportTier === "tablet" ? 0.62 : 1;
    plane.mesh.scale.set(plane.aspect * planeScale, planeScale, 1);
    plane.baseX = this.worlds[plane.mesh.userData.worldIndex as number].gallery.x * xSpread;
  }

  private scheduleResize = () => {
    if (this.resizeFrame) return;
    this.resizeFrame = requestAnimationFrame(() => {
      this.resizeFrame = 0;
      this.resize();
    });
  };

  private bindEvents() {
    window.addEventListener("resize", this.scheduleResize, { passive: true });
    window.visualViewport?.addEventListener("resize", this.scheduleResize, { passive: true });
    document.addEventListener("visibilitychange", this.onVisibilityChange);
    window.addEventListener("keydown", this.onKeyDown);
    this.canvas.addEventListener("wheel", this.onWheel, { passive: false });
    this.canvas.addEventListener("pointerdown", this.onPointerDown);
    this.canvas.addEventListener("pointermove", this.onPointerMove);
    this.canvas.addEventListener("pointerup", this.onPointerUp);
    this.canvas.addEventListener("pointercancel", this.onPointerUp);
    this.canvas.addEventListener("pointerleave", this.onPointerLeave);
    this.resizeObserver = new ResizeObserver(this.scheduleResize);
    this.resizeObserver.observe(this.canvas);
    this.intersectionObserver = new IntersectionObserver(([entry]) => {
      this.canvasVisible = entry?.isIntersecting ?? true;
      this.syncRenderLoop();
    }, { threshold: 0.01 });
    this.intersectionObserver.observe(this.canvas);
  }

  private unbindEvents() {
    window.removeEventListener("resize", this.scheduleResize);
    window.visualViewport?.removeEventListener("resize", this.scheduleResize);
    document.removeEventListener("visibilitychange", this.onVisibilityChange);
    window.removeEventListener("keydown", this.onKeyDown);
    this.canvas.removeEventListener("wheel", this.onWheel);
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    this.canvas.removeEventListener("pointermove", this.onPointerMove);
    this.canvas.removeEventListener("pointerup", this.onPointerUp);
    this.canvas.removeEventListener("pointercancel", this.onPointerUp);
    this.canvas.removeEventListener("pointerleave", this.onPointerLeave);
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.intersectionObserver?.disconnect();
    this.intersectionObserver = null;
  }

  private onVisibilityChange = () => {
    this.pageVisible = document.visibilityState !== "hidden";
    this.syncRenderLoop();
  };

  private syncRenderLoop() {
    const shouldRun = !this.disposed && this.pageVisible && this.canvasVisible;
    if (shouldRun && !this.running) {
      this.running = true;
      this.lastFrameTime = performance.now();
      this.animationFrame = requestAnimationFrame(this.update);
    } else if (!shouldRun && this.running) {
      this.running = false;
      cancelAnimationFrame(this.animationFrame);
    }
  }

  private onWheel = (event: WheelEvent) => {
    if (this.portal) return;
    const normalizedDelta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaMode === 2 ? event.deltaY * window.innerHeight : event.deltaY;
    const exitsAtStart = normalizedDelta < 0 && this.scrollTarget <= this.minScroll + 1;
    const exitsAtEnd = normalizedDelta > 0 && this.scrollTarget >= this.maxScroll - 1;
    if (exitsAtStart || exitsAtEnd) return;
    event.preventDefault();
    if (this.options.reducedMotion) {
      if (Math.abs(event.deltaY) > 5) this.step(event.deltaY > 0 ? 1 : -1);
      return;
    }
    this.verticalSpringVelocity -= clamp(normalizedDelta / 160, -1, 1) * MOTION.verticalWheelImpulse;
    this.scrollTarget = clamp(this.scrollTarget + normalizedDelta, this.minScroll, this.maxScroll);
  };

  private onPointerDown = (event: PointerEvent) => {
    if (this.portal || event.button !== 0) return;
    this.pointerDown = { id: event.pointerId, y: event.clientY, startX: event.clientX, startY: event.clientY, moved: 0, edgeTravel: 0 };
    this.canvas.setPointerCapture(event.pointerId);
    this.canvas.dataset.dragging = "true";
    this.updatePointer(event);
  };

  private onPointerMove = (event: PointerEvent) => {
    this.updatePointer(event);
    if (this.pointerDown && this.pointerDown.id === event.pointerId) {
      const deltaY = this.pointerDown.y - event.clientY;
      this.pointerDown.y = event.clientY;
      this.pointerDown.moved = Math.hypot(event.clientX - this.pointerDown.startX, event.clientY - this.pointerDown.startY);
      if (deltaY > 0 && this.scrollTarget >= this.maxScroll - 1) this.pointerDown.edgeTravel += deltaY;
      else if (deltaY < 0) this.pointerDown.edgeTravel = 0;
      const touchMultiplier = this.isMobile ? MOBILE_TOUCH_MULTIPLIER : DEFAULT_TOUCH_MULTIPLIER;
      this.scrollTarget = clamp(this.scrollTarget + deltaY * touchMultiplier, this.minScroll, this.maxScroll);
      this.gestureDriftY = clamp(deltaY / 80, -1, 1) * 0.035;
      this.verticalSpringVelocity -= clamp(deltaY / 60, -1, 1) * MOTION.verticalDragImpulse;
    }
    this.updateHover();
  };

  private onPointerUp = (event: PointerEvent) => {
    if (!this.pointerDown || this.pointerDown.id !== event.pointerId) return;
    const wasClick = this.pointerDown.moved < 8;
    const shouldHandoff = this.pointerDown.edgeTravel > 52 && this.scrollTarget >= this.maxScroll - 1;
    this.pointerDown = null;
    this.canvas.dataset.dragging = "false";
    if (this.canvas.hasPointerCapture(event.pointerId)) this.canvas.releasePointerCapture(event.pointerId);
    if (shouldHandoff) this.handoffToIndex();
    else if (wasClick) this.activateHitPlane();
  };

  private handoffToIndex() {
    const index = this.canvas.closest(".lobby")?.nextElementSibling;
    index?.scrollIntoView({ behavior: this.options.reducedMotion ? "auto" : "smooth", block: "start" });
  }

  private onPointerLeave = () => {
    document.body.dataset.canvasHover = "false";
  };

  private onKeyDown = (event: KeyboardEvent) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest("input, textarea, select, button, a") || this.portal) return;
    if (["ArrowDown", "ArrowRight", "PageDown"].includes(event.key)) {
      event.preventDefault();
      this.step(1);
    } else if (["ArrowUp", "ArrowLeft", "PageUp"].includes(event.key)) {
      event.preventDefault();
      this.step(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      this.goToIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      this.goToIndex(this.worlds.length - 1);
    } else if (event.key === "Enter" && document.activeElement === this.canvas) {
      event.preventDefault();
      this.enterActive();
    }
  };

  private updatePointer(event: PointerEvent) {
    const rect = this.canvas.getBoundingClientRect();
    this.pointerTarget.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -(((event.clientY - rect.top) / rect.height) * 2 - 1),
    );
  }

  private intersectPlane() {
    this.raycaster.setFromCamera(this.pointerTarget, this.camera);
    return this.raycaster.intersectObjects(this.planes.map((plane) => plane.mesh))[0];
  }

  private updateHover() {
    const hit = this.intersectPlane();
    const index = hit?.object.userData.worldIndex as number | undefined;
    const hovering = typeof index === "number" && this.planes[index].opacity > 0.28;
    document.body.dataset.canvasHover = String(hovering);
    this.canvas.dataset.hovering = String(hovering);
  }

  private activateHitPlane() {
    const hit = this.intersectPlane();
    const index = hit?.object.userData.worldIndex as number | undefined;
    if (typeof index !== "number" || this.planes[index].opacity < 0.28) return;
    if (index === this.activeIndex) this.enterActive();
    else this.goToIndex(index);
  }

  private update = (time: number) => {
    if (!this.running) return;
    const delta = Math.min(50, time - this.lastFrameTime);
    this.lastFrameTime = time;
    this.updateScroll(delta);
    this.updatePlanes(time, delta);
    this.updateBackground(time);
    this.updatePortal(time);

    this.renderer.clear();
    this.renderer.render(this.backgroundScene, this.backgroundCamera);
    this.renderer.clearDepth();
    this.renderer.render(this.scene, this.camera);
    this.animationFrame = requestAnimationFrame(this.update);
  };

  private updateScroll(delta: number) {
    if (!this.portal) {
      const scrollSmoothing = this.isMobile ? MOBILE_SCROLL_SMOOTHING : MOTION.scrollSmoothing;
      const scrollAlpha = frameRateIndependentAlpha(this.options.reducedMotion ? 0.2 : scrollSmoothing, delta);
      this.scrollCurrent += (this.scrollTarget - this.scrollCurrent) * scrollAlpha;
      const cameraDelta = (this.scrollCurrent - this.previousScroll) * SCROLL_TO_WORLD;
      const velocityAlpha = frameRateIndependentAlpha(MOTION.velocitySmoothing, delta);
      this.scrollVelocity += (clamp(cameraDelta, -MOTION.velocityLimit, MOTION.velocityLimit) - this.scrollVelocity) * velocityAlpha;
      if (Math.abs(this.scrollVelocity) < MOTION.velocityDeadZone) this.scrollVelocity = 0;
      this.previousScroll = this.scrollCurrent;
      this.camera.position.z = CAMERA_OFFSET - this.scrollCurrent * SCROLL_TO_WORLD;
    }

    const focus = clamp(Math.round(this.scrollCurrent * SCROLL_TO_WORLD / PLANE_GAP), 0, this.planes.length - 1);
    if (focus !== this.activeIndex) {
      this.activeIndex = focus;
      this.options.onActiveChange(focus);
    }
  }

  private updatePlanes(time: number, delta: number) {
    const sampledCameraZ = this.camera.position.z - CAMERA_OFFSET;
    const depth = clamp((0 - sampledCameraZ) / PLANE_GAP, 0, this.planes.length - 1);
    const currentIndex = Math.floor(depth);
    const nextIndex = Math.min(currentIndex + 1, this.planes.length - 1);
    const blend = depth - currentIndex;
    const velocity = clamp(this.scrollVelocity / MOTION.velocityLimit, -1, 1);
    const velocityEnergy = Math.min(1, Math.abs(velocity) * 1.1);

    const pointerAlpha = frameRateIndependentAlpha(this.options.reducedMotion ? 0.2 : MOTION.pointerSmoothing, delta);
    const horizontalPositionAlpha = frameRateIndependentAlpha(MOTION.horizontalPositionSmoothing, delta);
    const verticalPositionAlpha = frameRateIndependentAlpha(MOTION.verticalPositionSmoothing, delta);
    const tiltAlpha = frameRateIndependentAlpha(MOTION.tiltSmoothing, delta);
    const breathAlpha = frameRateIndependentAlpha(MOTION.breathSmoothing, delta);
    this.pointerCurrent.lerp(this.pointerTarget, pointerAlpha);
    this.gestureDriftY += (0 - this.gestureDriftY) * frameRateIndependentAlpha(0.04, delta);
    this.updateVerticalSpring(velocity, delta);
    const compositionX = THREE.MathUtils.lerp(
      this.planes[currentIndex].baseX,
      this.planes[nextIndex].baseX,
      smootherStep(blend),
    );

    this.planes.forEach((plane, index) => {
      let targetOpacity = 0;
      if (index === currentIndex) targetOpacity = 1 - blend;
      if (index === nextIndex) targetOpacity = Math.max(targetOpacity, blend);
      plane.opacity += (targetOpacity - plane.opacity) * (this.options.reducedMotion ? 0.24 : 0.14);
      plane.mesh.material.opacity = plane.opacity;
      plane.mesh.visible = plane.opacity > 0.005;

      const depthWeight = Math.max(0, 1 - Math.abs(plane.baseZ - sampledCameraZ) / (PLANE_GAP * 1.35));
      const motionWeight = plane.opacity * depthWeight;
      const breath = this.options.reducedMotion ? 0 : Math.sin(time * 0.0011 + index * 0.7) * 0.5 + velocityEnergy * 0.35;
      const pointerTravelWeight = 1 - velocityEnergy * MOTION.pointerSuppressionWhileMoving;
      const targetX = compositionX + this.pointerCurrent.x * MOTION.pointerParallaxX * this.pointerParallaxScale * motionWeight * pointerTravelWeight;
      const targetY = this.verticalSpringPosition
        + (this.pointerCurrent.y * MOTION.pointerParallaxY * this.pointerParallaxScale * pointerTravelWeight + this.gestureDriftY) * motionWeight;
      plane.mesh.position.x += (targetX - plane.mesh.position.x) * horizontalPositionAlpha;
      plane.mesh.position.y += (targetY - plane.mesh.position.y) * verticalPositionAlpha;
      plane.mesh.rotation.z += ((-velocity * MOTION.maximumTilt * motionWeight) - plane.mesh.rotation.z) * tiltAlpha;
      const baseScale = this.viewportTier === "mobile" ? 0.66 : this.viewportTier === "tablet" ? 0.82 : 1;
      const scaleBoost = 1 + breath * MOTION.breathScale * motionWeight;
      plane.mesh.scale.x += (plane.aspect * baseScale * scaleBoost - plane.mesh.scale.x) * breathAlpha;
      plane.mesh.scale.y += (baseScale * scaleBoost - plane.mesh.scale.y) * breathAlpha;
    });

    if (this.trail && !this.portal) {
      const progress = this.maxScroll ? this.scrollCurrent / this.maxScroll : 0;
      this.trail.update(this.camera.position.z, progress, velocity, this.isMobile, time);
    }
  }

  private updateVerticalSpring(velocity: number, delta: number) {
    if (this.options.reducedMotion) {
      this.verticalSpringPosition = 0;
      this.verticalSpringVelocity = 0;
      return;
    }
    const deltaSeconds = clamp(delta / 1000, 0.001, 0.05);
    const target = -velocity * MOTION.verticalSpringTarget;
    const acceleration = (target - this.verticalSpringPosition) * MOTION.verticalSpringStiffness
      - this.verticalSpringVelocity * MOTION.verticalSpringDamping;
    this.verticalSpringVelocity = clamp(
      this.verticalSpringVelocity + acceleration * deltaSeconds,
      -MOTION.verticalSpringVelocityLimit,
      MOTION.verticalSpringVelocityLimit,
    );
    this.verticalSpringPosition = clamp(
      this.verticalSpringPosition + this.verticalSpringVelocity * deltaSeconds,
      -MOTION.verticalSpringLimit,
      MOTION.verticalSpringLimit,
    );
  }

  private updateBackground(time: number) {
    const sampledCameraZ = this.camera.position.z - CAMERA_OFFSET;
    const depth = clamp((0 - sampledCameraZ) / PLANE_GAP, 0, this.palettes.length - 1);
    const currentIndex = Math.floor(depth);
    const nextIndex = Math.min(currentIndex + 1, this.palettes.length - 1);
    const blend = depth - currentIndex;
    const from = this.palettes[currentIndex];
    const to = this.palettes[nextIndex];
    const uniforms = this.backgroundMaterial.uniforms;
    (uniforms.uBackgroundColor.value as THREE.Color).copy(from.background).lerp(to.background, blend);
    (uniforms.uBlob1Color.value as THREE.Color).copy(from.blob1).lerp(to.blob1, blend);
    (uniforms.uBlob2Color.value as THREE.Color).copy(from.blob2).lerp(to.blob2, blend);
    const velocity = Math.min(1, Math.abs(this.scrollVelocity) / MOTION.velocityLimit);
    const radius = 0.65 + depth * 0.08;
    uniforms.uTime.value = time;
    uniforms.uVelocityIntensity.value += (velocity - uniforms.uVelocityIntensity.value) * 0.1;
    uniforms.uBlobRadius.value += (radius - uniforms.uBlobRadius.value) * 0.1;
    uniforms.uBlobRadiusSecondary.value = uniforms.uBlobRadius.value * 0.78;
    uniforms.uBlobStrength.value += ((0.9 + velocity * 0.1) - uniforms.uBlobStrength.value) * 0.1;
  }

  private updatePortal(time: number) {
    if (!this.portal) return;
    const progress = clamp((time - this.portal.startedAt) / 760, 0, 1);
    const eased = easeInOutCubic(progress);
    this.camera.position.z = this.portal.cameraStart - eased * 3.25;
    this.planes.forEach((plane, index) => {
      if (index === this.portal?.index) {
        const baseScale = this.viewportTier === "mobile" ? 0.66 : this.viewportTier === "tablet" ? 0.82 : 1;
        plane.mesh.scale.set(plane.aspect * baseScale * (1 + eased * 0.34), baseScale * (1 + eased * 0.34), 1);
      } else {
        plane.mesh.material.opacity *= 1 - eased;
      }
    });
    if (progress >= 0.72 && !this.portal.callbackSent) {
      this.portal.callbackSent = true;
      this.options.onActivate(this.portal.index);
    }
  }
}
