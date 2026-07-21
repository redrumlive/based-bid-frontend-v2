"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

const TWO_PI = Math.PI * 2;

type Point = { x: number; y: number };
type Rgb = { r: number; g: number; b: number };

type EnergySparksOptions = {
  accent?: string;
  intensity?: number;
  boltCount?: number;
  coreScale?: number;
  reach?: number;
  titleTop?: string;
  titleBottom?: string;
  centerMark?: string;
  logoSrc?: string;
};

export type EnergySparksHandle = {
  updateOptions: (options: Partial<EnergySparksOptions>) => void;
};

type NormalizedOptions = Required<EnergySparksOptions> & {
  reducedMotion: boolean;
};

type Bolt = {
  points: Point[];
  alpha: number;
  width: number;
  life: number;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  ttl: number;
  size: number;
};

type Dust = {
  angle: number;
  radius: number;
  size: number;
  alpha: number;
  speed: number;
};

class RNG {
  private seed: number;

  constructor(seed = 1) {
    this.seed = seed >>> 0;
  }

  next() {
    this.seed = (1664525 * this.seed + 1013904223) >>> 0;
    return this.seed / 4294967296;
  }

  range(min: number, max: number) {
    return min + (max - min) * this.next();
  }
}

function hexToRgb(hex: string): Rgb {
  const cleaned = hex.replace("#", "").trim();
  const value =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((x) => x + x)
          .join("")
      : cleaned;
  const int = Number.parseInt(value, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
}

function rgba(rgb: Rgb, alpha: number) {
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

function pointAt(cx: number, cy: number, radius: number, angle: number): Point {
  return {
    x: cx + Math.cos(angle) * radius,
    y: cy + Math.sin(angle) * radius,
  };
}

function clampPointToCircle(point: Point, cx: number, cy: number, radius: number): Point {
  const dx = point.x - cx;
  const dy = point.y - cy;
  const distance = Math.hypot(dx, dy);

  if (distance <= radius || distance === 0) return point;

  const scale = radius / distance;
  return {
    x: cx + dx * scale,
    y: cy + dy * scale,
  };
}

function drawCurvedLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  radius: number,
  centerAngle: number,
  options: {
    direction?: number;
    rotationOffset?: number;
    spacing?: number;
    alpha?: number;
    strokeStyle?: string;
    strokeWidth?: number;
  } = {},
) {
  if (!text) return;

  const direction = options.direction ?? 1;
  const rotationOffset = options.rotationOffset ?? Math.PI / 2;
  const spacing = options.spacing ?? 1.1;
  const chars = text.split("");
  const widths = chars.map((char) => ctx.measureText(char).width * spacing);
  const totalWidth = widths.reduce((sum, width) => sum + width, 0);
  let cursor = -totalWidth / 2;

  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.globalAlpha = options.alpha ?? 1;

  chars.forEach((char, index) => {
    const advance = widths[index];
    const angle = centerAngle + direction * ((cursor + advance / 2) / radius);
    const p = pointAt(cx, cy, radius, angle);

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(angle + rotationOffset);
    if (options.strokeStyle && options.strokeWidth && options.strokeWidth > 0) {
      ctx.strokeStyle = options.strokeStyle;
      ctx.lineWidth = options.strokeWidth;
      ctx.strokeText(char, 0, 0);
    }
    ctx.fillText(char, 0, 0);
    ctx.restore();

    cursor += advance;
  });

  ctx.restore();
}

class EnergySparksEffect {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private options: NormalizedOptions;
  private accentRgb: Rgb;
  private dpr = 1;
  private frame = 0;
  private lastBoltTime = -999;
  private bolts: Bolt[] = [];
  private particles: Particle[] = [];
  private dust: Dust[] = [];
  private raf: number | null = null;
  private logoImage: HTMLCanvasElement | null = null;
  private logoLoaded = false;
  private resizeObserver: ResizeObserver;
  private width = 1;
  private height = 1;
  private cx = 0;
  private cy = 0;
  private radius = 1;
  private coreRadius = 1;
  private core: Point = { x: 0, y: 0 };
  private energy = {
    intensity: 1,
    boltCount: 14,
    coreScale: 1,
    reach: 1,
  };

  constructor(canvas: HTMLCanvasElement, options: EnergySparksOptions = {}) {
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) throw new Error("EnergySparksEffect needs a 2D canvas context.");

    this.canvas = canvas;
    this.ctx = ctx;
    this.options = this.normalizeOptions(options);
    this.energy = {
      intensity: this.options.intensity,
      boltCount: this.options.boltCount,
      coreScale: this.options.coreScale,
      reach: this.options.reach,
    };
    this.accentRgb = hexToRgb(this.options.accent);
    this.dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    this.loadLogo(this.options.logoSrc);
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.canvas);
    this.resize();
    this.seedDust();
    this.animate = this.animate.bind(this);
    this.animate(performance.now());
  }

  private normalizeOptions(options: EnergySparksOptions = {}): NormalizedOptions {
    return {
      accent: options.accent || "#52DFB2",
      intensity: Number(options.intensity || 1),
      boltCount: Number(options.boltCount || 14),
      coreScale: Number(options.coreScale || 1),
      reach: Number(options.reach || 1),
      titleTop: options.titleTop || "",
      titleBottom: options.titleBottom || "",
      centerMark: options.centerMark || "",
      logoSrc: options.logoSrc || "",
      reducedMotion:
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || false,
    };
  }

  updateOptions(options: EnergySparksOptions = {}) {
    const previousAccent = this.options.accent;
    const previousLogo = this.options.logoSrc;
    this.options = this.normalizeOptions({ ...this.options, ...options });

    if (this.options.accent !== previousAccent) {
      this.accentRgb = hexToRgb(this.options.accent);
    }

    if (this.options.logoSrc !== previousLogo) {
      this.loadLogo(this.options.logoSrc);
    }
  }

  destroy() {
    if (this.raf !== null) cancelAnimationFrame(this.raf);
    this.resizeObserver.disconnect();
  }

  private loadLogo(src: string) {
    this.logoLoaded = false;
    this.logoImage = null;

    if (!src) return;

    const image = new Image();
    image.onload = () => {
      this.logoImage = this.makeTransparentLogo(image);
      this.logoLoaded = true;
    };
    image.src = src;
  }

  private makeTransparentLogo(image: HTMLImageElement) {
    const canvas = document.createElement("canvas");
    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return canvas;

    ctx.drawImage(image, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);
    const { data } = imageData;
    const visited = new Uint8Array(width * height);
    const queue: Array<[number, number]> = [];
    const isWhite = (index: number) =>
      data[index] > 242 &&
      data[index + 1] > 242 &&
      data[index + 2] > 242 &&
      data[index + 3] > 0;
    const push = (x: number, y: number) => {
      if (x < 0 || y < 0 || x >= width || y >= height) return;
      const pixelIndex = y * width + x;
      const dataIndex = pixelIndex * 4;
      if (!visited[pixelIndex] && isWhite(dataIndex)) {
        visited[pixelIndex] = 1;
        queue.push([x, y]);
      }
    };

    for (let x = 0; x < width; x++) {
      push(x, 0);
      push(x, height - 1);
    }
    for (let y = 0; y < height; y++) {
      push(0, y);
      push(width - 1, y);
    }

    while (queue.length) {
      const [x, y] = queue.shift() as [number, number];
      const dataIndex = (y * width + x) * 4;
      data[dataIndex + 3] = 0;
      push(x + 1, y);
      push(x - 1, y);
      push(x, y + 1);
      push(x, y - 1);
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
  }

  private resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.width = Math.max(1, rect.width);
    this.height = Math.max(1, rect.height);
    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.cx = this.width / 2;
    this.cy = this.height / 2;
    this.radius = Math.min(this.width, this.height) * 0.405;
    this.coreRadius = this.radius * (0.29 * this.energy.coreScale);
    this.core = {
      x: this.cx + this.radius * 0.035,
      y: this.cy - this.radius * 0.005,
    };
    this.seedDust();
  }

  private easeEnergy() {
    const ease = this.options.reducedMotion ? 1 : 0.085;
    this.energy.intensity += (this.options.intensity - this.energy.intensity) * ease;
    this.energy.boltCount += (this.options.boltCount - this.energy.boltCount) * ease;
    this.energy.coreScale += (this.options.coreScale - this.energy.coreScale) * ease;
    this.energy.reach += (this.options.reach - this.energy.reach) * ease;
    this.coreRadius = this.radius * (0.29 * this.energy.coreScale);
  }

  private seedDust() {
    const rng = new RNG(9917);
    this.dust = Array.from({ length: 118 }, () => ({
      angle: rng.range(0, TWO_PI),
      radius: rng.range(this.radius * 0.15, this.radius * 1.08),
      size: rng.range(0.45, 1.25),
      alpha: rng.range(0.06, 0.24),
      speed: rng.range(-0.0009, 0.0011),
    }));
  }

  private makeBoltBundle(time: number): Bolt[] {
    const rng = new RNG(Math.floor(time * 2.1) + this.frame * 13);
    const count = this.options.reducedMotion
      ? 5
      : Math.min(24, Math.round(this.energy.boltCount * this.energy.intensity));
    const bolts: Bolt[] = [];
    const edgeEnergy = Math.max(0, Math.min(1, (this.energy.reach - 1.32) / 1.1));

    for (let i = 0; i < count; i++) {
      const angle = rng.range(0, TWO_PI);
      const edgeSeeking = edgeEnergy > 0.12 && i < 12;
      const length =
        this.radius *
        rng.range(edgeSeeking ? 0.7 : 0.42, edgeSeeking ? 1.1 : 0.98) *
        this.energy.reach *
        (edgeSeeking ? 1.28 : i < 6 ? 1.12 : 1);
      const segments = Math.floor(rng.range(7, 12 + this.energy.reach));
      const points: Point[] = [];
      const originJitter = this.radius * 0.017 * this.energy.coreScale;
      const start = {
        x: this.core.x + rng.range(-originJitter, originJitter),
        y: this.core.y + rng.range(-originJitter, originJitter),
      };
      const normal = angle + Math.PI / 2;
      const tangentDirection = i % 2 === 0 ? 1 : -1;

      for (let s = 0; s <= segments; s++) {
        const t = s / segments;
        const drift =
          Math.sin(t * Math.PI) *
          this.radius *
          rng.range(-0.065, 0.065) *
          this.energy.reach;
        const jitter =
          rng.range(-1, 1) * this.radius * (0.024 + t * 0.044 * this.energy.reach);
        const taper = 1 - Math.abs(t - 0.58) * 0.7;
        const rawPoint = {
          x:
            start.x +
            Math.cos(angle) * length * t +
            Math.cos(normal) * (drift + jitter * taper),
          y:
            start.y +
            Math.sin(angle) * length * t +
            Math.sin(normal) * (drift + jitter * taper),
        };
        const edgeBias = edgeSeeking ? Math.max(0, (t - 0.5) / 0.5) * edgeEnergy : 0;
        const edgePoint = pointAt(
          this.cx,
          this.cy,
          this.radius * (0.92 + edgeEnergy * 0.06),
          angle + tangentDirection * edgeBias * 0.58,
        );
        const blendedPoint = {
          x: rawPoint.x * (1 - edgeBias * 0.92) + edgePoint.x * edgeBias * 0.92,
          y: rawPoint.y * (1 - edgeBias * 0.92) + edgePoint.y * edgeBias * 0.92,
        };
        points.push(
          clampPointToCircle(
            blendedPoint,
            this.cx,
            this.cy,
            this.radius * 0.985,
          ),
        );
      }

      bolts.push({
        points,
        alpha: rng.range(0.42, 1),
        width: rng.range(0.72, 1.34),
        life: rng.range(0.65, 1),
      });
    }

    return bolts;
  }

  private spawnParticles(time: number) {
    const rng = new RNG(Math.floor(time * 11));
    const spawnCount = this.options.reducedMotion
      ? 1
      : Math.floor(2 + this.energy.intensity * 3 + this.energy.coreScale);

    for (let i = 0; i < spawnCount; i++) {
      const angle = rng.range(0, TWO_PI);
      const speed = rng.range(0.35, 1.35) * this.energy.intensity;
      this.particles.push({
        x: this.core.x + rng.range(-5, 5) * this.energy.coreScale,
        y: this.core.y + rng.range(-5, 5) * this.energy.coreScale,
        vx: Math.cos(angle) * speed * this.energy.reach + rng.range(-0.12, 0.12),
        vy: Math.sin(angle) * speed * this.energy.reach + rng.range(-0.12, 0.12),
        age: 0,
        ttl: rng.range(46, 104) * Math.max(1, this.energy.reach * 0.92),
        size: rng.range(0.65, 1.8) * Math.max(1, this.energy.coreScale * 0.9),
      });
    }

    this.particles = this.particles
      .filter((particle) => {
        particle.age += 1;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.986;
        particle.vy *= 0.988;
        return particle.age < particle.ttl;
      })
      .slice(-170);
  }

  private drawBackground(ctx: CanvasRenderingContext2D, time: number) {
    ctx.clearRect(0, 0, this.width, this.height);
    const bg = ctx.createRadialGradient(
      this.cx,
      this.cy,
      0,
      this.cx,
      this.cy,
      this.radius * (1.2 + this.energy.reach * 0.12),
    );
    bg.addColorStop(0, "rgba(255, 255, 255, 0.018)");
    bg.addColorStop(0.34, "rgba(30, 38, 36, 0.075)");
    bg.addColorStop(0.72, "rgba(10, 15, 14, 0.18)");
    bg.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, this.width, this.height);

    const surface = ctx.createRadialGradient(
      this.cx,
      this.cy,
      this.radius * 0.08,
      this.cx,
      this.cy,
      this.radius * 1.28,
    );
    surface.addColorStop(0, "rgba(42, 52, 49, 0.12)");
    surface.addColorStop(0.52, "rgba(26, 34, 32, 0.14)");
    surface.addColorStop(0.84, "rgba(12, 18, 17, 0.16)");
    surface.addColorStop(1, "rgba(7, 10, 10, 0)");
    ctx.fillStyle = surface;
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.save();
    ctx.translate(this.cx, this.cy);
    ctx.rotate(time * 0.000055);
    ctx.translate(-this.cx, -this.cy);
    this.dust.forEach((dust) => {
      const angle = dust.angle + time * dust.speed;
      const p = pointAt(this.cx, this.cy, dust.radius, angle);
      ctx.fillStyle = rgba(this.accentRgb, dust.alpha * 0.72);
      ctx.fillRect(p.x, p.y, dust.size, dust.size);
    });
    ctx.restore();
  }

  private drawRing(ctx: CanvasRenderingContext2D, time: number) {
    const r = this.radius;
    const pulse = 0.5 + Math.sin(time * 0.0016) * 0.5;

    ctx.save();
    ctx.lineCap = "round";

    ctx.strokeStyle = rgba(this.accentRgb, 0.18);
    ctx.lineWidth = 0.75;
    ctx.beginPath();
    ctx.arc(this.cx, this.cy, r * 1.1, 0, TWO_PI);
    ctx.stroke();

    ctx.strokeStyle = "rgba(210, 230, 224, 0.32)";
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    ctx.arc(this.cx, this.cy, r, 0, TWO_PI);
    ctx.stroke();

    const sweep = time * 0.00034;
    const ringGradient = ctx.createLinearGradient(this.cx - r, this.cy, this.cx + r, this.cy);
    ringGradient.addColorStop(0, "rgba(255, 255, 255, 0.018)");
    ringGradient.addColorStop(0.5, rgba(this.accentRgb, 0.28));
    ringGradient.addColorStop(1, rgba(this.accentRgb, 0.26));
    ctx.strokeStyle = ringGradient;
    ctx.lineWidth = 1.1;
    ctx.shadowColor = rgba(this.accentRgb, 0.32);
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(this.cx, this.cy, r, -0.26 + sweep, 1.24 + sweep);
    ctx.stroke();
    ctx.shadowBlur = 0;

    for (let i = 0; i < 96; i++) {
      const a = (i / 96) * TWO_PI + time * 0.00008;
      const strength = i % 8 === 0 ? 0.16 : 0.065;
      const len = i % 8 === 0 ? 10 : 4.5;
      const inner = pointAt(this.cx, this.cy, r + 5, a);
      const outer = pointAt(this.cx, this.cy, r + len, a);
      ctx.strokeStyle = `rgba(210, 230, 224, ${strength * (0.72 + pulse * 0.28)})`;
      ctx.lineWidth = i % 8 === 0 ? 0.78 : 0.5;
      ctx.beginPath();
      ctx.moveTo(inner.x, inner.y);
      ctx.lineTo(outer.x, outer.y);
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawOrbitText(ctx: CanvasRenderingContext2D) {
    const r = this.radius;
    if (!this.options.titleTop && !this.options.titleBottom) return;

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.shadowColor = rgba(this.accentRgb, 0.34);
    ctx.shadowBlur = 5;
    ctx.fillStyle = rgba(this.accentRgb, 0.88);
    ctx.font = `650 ${Math.max(20, r * 0.078)}px "Segoe UI Variable Display", "Aptos Display", ui-sans-serif, system-ui, sans-serif`;
    drawCurvedLabel(ctx, this.options.titleTop, this.cx, this.cy, r * 1.16, -Math.PI / 2, {
      alpha: 0.9,
      direction: 1,
      spacing: 1.62,
      rotationOffset: Math.PI / 2,
      strokeStyle: "rgba(3, 8, 13, 0.42)",
      strokeWidth: 2.2,
    });

    ctx.shadowColor = "rgba(246, 218, 148, 0.3)";
    ctx.shadowBlur = 5;
    ctx.fillStyle = "rgba(246, 218, 148, 0.82)";
    ctx.font = `600 ${Math.max(14, r * 0.054)}px "Segoe UI Variable Display", "Aptos Display", ui-sans-serif, system-ui, sans-serif`;
    drawCurvedLabel(ctx, this.options.titleBottom, this.cx, this.cy, r * 0.92, Math.PI / 2, {
      alpha: 0.86,
      direction: -1,
      spacing: 1.5,
      rotationOffset: -Math.PI / 2,
      strokeStyle: "rgba(3, 8, 13, 0.46)",
      strokeWidth: 1.8,
    });
    ctx.restore();
  }

  private drawCenterMark(ctx: CanvasRenderingContext2D) {
    const r = this.radius;
    const markRadius = Math.max(26, r * 0.18 * this.energy.coreScale);

    ctx.save();
    ctx.translate(this.core.x, this.core.y);
    ctx.globalCompositeOperation = "source-over";
    ctx.shadowColor = rgba(this.accentRgb, 0.46);
    ctx.shadowBlur = Math.max(5, 12 * Math.min(1.6, this.energy.coreScale));

    if (this.logoLoaded && this.logoImage) {
      const aspect = this.logoImage.width / this.logoImage.height;
      const width = markRadius * 1.12;
      const height = width / aspect;
      ctx.globalAlpha = 0.96;
      ctx.drawImage(this.logoImage, -width / 2, -height / 2, width, height);
    } else if (this.options.centerMark) {
      ctx.fillStyle = "rgba(236, 255, 246, 0.88)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `800 ${Math.max(12, r * 0.05)}px ui-sans-serif, system-ui, sans-serif`;
      ctx.fillText(this.options.centerMark, 0, 0);
    }

    ctx.restore();
  }

  private drawCoreGlow(ctx: CanvasRenderingContext2D, time: number) {
    const glow = 0.72 + Math.sin(time * 0.006) * 0.17;
    const coreGradient = ctx.createRadialGradient(
      this.core.x,
      this.core.y,
      0,
      this.core.x,
      this.core.y,
      this.coreRadius,
    );
    coreGradient.addColorStop(0, rgba(this.accentRgb, 0.72 * glow));
    coreGradient.addColorStop(0.08, rgba(this.accentRgb, 0.62 * glow));
    coreGradient.addColorStop(0.24, rgba(this.accentRgb, 0.28 * glow));
    coreGradient.addColorStop(1, rgba(this.accentRgb, 0));
    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(this.core.x, this.core.y, this.coreRadius, 0, TWO_PI);
    ctx.fill();
  }

  private strokePath(ctx: CanvasRenderingContext2D, points: Point[]) {
    if (points.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const current = points[i];
      const previous = points[i - 1];
      const midX = (previous.x + current.x) / 2;
      const midY = (previous.y + current.y) / 2;
      ctx.quadraticCurveTo(previous.x, previous.y, midX, midY);
    }
    const last = points[points.length - 1];
    ctx.lineTo(last.x, last.y);
    ctx.stroke();
  }

  private boltGradient(points: Point[], color: (alpha: number) => string, alpha: number) {
    const first = points[0];
    const last = points[points.length - 1];
    const gradient = this.ctx.createLinearGradient(first.x, first.y, last.x, last.y);
    gradient.addColorStop(0, color(0));
    gradient.addColorStop(0.08, color(alpha * 0.24));
    gradient.addColorStop(0.22, color(alpha * 0.86));
    gradient.addColorStop(0.5, color(alpha));
    gradient.addColorStop(0.78, color(alpha * 0.82));
    gradient.addColorStop(0.94, color(alpha * 0.16));
    gradient.addColorStop(1, color(0));
    return gradient;
  }

  private drawBolts(ctx: CanvasRenderingContext2D, time: number) {
    if (time - this.lastBoltTime > (this.options.reducedMotion ? 160 : 64)) {
      this.bolts = this.makeBoltBundle(time);
      this.lastBoltTime = time;
    }

    const flicker = 0.72 + Math.random() * 0.28;
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalCompositeOperation = "screen";
    ctx.beginPath();
    ctx.arc(this.cx, this.cy, this.radius * 0.995, 0, TWO_PI);
    ctx.clip();

    this.bolts.forEach((bolt) => {
      const a = bolt.alpha * bolt.life * flicker;
      ctx.shadowColor = rgba(this.accentRgb, 0.88);
      ctx.shadowBlur = 22;
      ctx.strokeStyle = this.boltGradient(bolt.points, (alpha) => rgba(this.accentRgb, alpha * 0.22), a);
      ctx.lineWidth = bolt.width * 7.2;
      this.strokePath(ctx, bolt.points);

      ctx.shadowBlur = 12;
      ctx.strokeStyle = this.boltGradient(bolt.points, (alpha) => rgba(this.accentRgb, alpha * 0.76), a);
      ctx.lineWidth = bolt.width * 2.1;
      this.strokePath(ctx, bolt.points);

      ctx.shadowBlur = 4;
      ctx.strokeStyle = this.boltGradient(
        bolt.points,
        (alpha) => `rgba(234, 255, 246, ${Math.min(0.96, alpha)})`,
        a,
      );
      ctx.lineWidth = Math.max(0.55, bolt.width * 0.7);
      this.strokePath(ctx, bolt.points);
    });

    ctx.restore();
  }

  private drawParticles(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    this.particles.forEach((particle) => {
      const life = 1 - particle.age / particle.ttl;
      ctx.fillStyle = rgba(this.accentRgb, life * 0.75);
      ctx.shadowColor = rgba(this.accentRgb, life * 0.82);
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * life, 0, TWO_PI);
      ctx.fill();
    });
    ctx.restore();
  }

  private animate(time: number) {
    this.frame += 1;
    const ctx = this.ctx;
    this.easeEnergy();
    this.drawBackground(ctx, time);
    this.drawRing(ctx, time);
    this.drawCoreGlow(ctx, time);
    this.drawOrbitText(ctx);
    this.drawCenterMark(ctx);
    this.drawBolts(ctx, time);
    this.spawnParticles(time);
    this.drawParticles(ctx);
    this.raf = requestAnimationFrame(this.animate);
  }
}

const EnergySparksCanvas = forwardRef<EnergySparksHandle, EnergySparksOptions & { className?: string }>(function EnergySparksCanvas({
  accent = "#52DFB2",
  intensity = 1,
  boltCount = 16,
  coreScale = 1,
  reach = 1,
  titleTop = "",
  titleBottom = "",
  centerMark = "",
  logoSrc = "",
  className = "",
}, ref) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const effectRef = useRef<EnergySparksEffect | null>(null);

  useImperativeHandle(ref, () => ({
    updateOptions: (options) => {
      effectRef.current?.updateOptions(options);
    },
  }), []);

  useEffect(() => {
    if (!canvasRef.current) return;

    effectRef.current = new EnergySparksEffect(canvasRef.current, {
      accent,
      intensity,
      boltCount,
      coreScale,
      reach,
      titleTop,
      titleBottom,
      centerMark,
      logoSrc,
    });

    return () => {
      effectRef.current?.destroy();
      effectRef.current = null;
    };
  }, []);

  useEffect(() => {
    effectRef.current?.updateOptions({
      accent,
      intensity,
      boltCount,
      coreScale,
      reach,
      titleTop,
      titleBottom,
      centerMark,
      logoSrc,
    });
  }, [accent, intensity, boltCount, coreScale, reach, titleTop, titleBottom, centerMark, logoSrc]);

  return (
    <div className={`energy-sparks-frame ${className}`} aria-label="Animated energy sparks globe">
      <canvas ref={canvasRef} className="energy-sparks-canvas" aria-hidden="true" />
      <div className="energy-sparks-vignette" />
    </div>
  );
});

EnergySparksCanvas.displayName = "EnergySparksCanvas";

export default EnergySparksCanvas;
