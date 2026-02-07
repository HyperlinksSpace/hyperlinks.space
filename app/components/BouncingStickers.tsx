"use client";

import { useEffect, useRef, useState } from "react";

const STICKER_SIZE = 44;
const SPEED = 1.8; // moderate speed in px per frame

type StickerData = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  src: string;
};

function randomVelocity(): { vx: number; vy: number } {
  const angle = Math.random() * Math.PI * 2;
  return {
    vx: Math.cos(angle) * SPEED,
    vy: Math.sin(angle) * SPEED,
  };
}

function initSticker(src: string, w: number, h: number): StickerData {
  const vel = randomVelocity();
  return {
    src,
    x: Math.random() * Math.max(0, w - STICKER_SIZE),
    y: Math.random() * Math.max(0, h - STICKER_SIZE),
    vx: vel.vx,
    vy: vel.vy,
  };
}

function tickStickers(stickers: StickerData[], w: number, h: number): void {
  const maxX = w - STICKER_SIZE;
  const maxY = h - STICKER_SIZE;

  // Move and bounce off walls (reflect velocity, clamp position)
  for (const s of stickers) {
    s.x += s.vx;
    s.y += s.vy;

    if (s.x <= 0) {
      s.x = 0;
      s.vx = Math.abs(s.vx);
    }
    if (s.x >= maxX) {
      s.x = maxX;
      s.vx = -Math.abs(s.vx);
    }
    if (s.y <= 0) {
      s.y = 0;
      s.vy = Math.abs(s.vy);
    }
    if (s.y >= maxY) {
      s.y = maxY;
      s.vy = -Math.abs(s.vy);
    }
  }

  // Sticker–sticker: on collision, rebound with a clear change in trajectory (swap velocity components along collision normal)
  for (let i = 0; i < stickers.length; i++) {
    for (let j = i + 1; j < stickers.length; j++) {
      const a = stickers[i];
      const b = stickers[j];
      const ax = a.x + STICKER_SIZE / 2;
      const ay = a.y + STICKER_SIZE / 2;
      const bx = b.x + STICKER_SIZE / 2;
      const by = b.y + STICKER_SIZE / 2;
      const dx = bx - ax;
      const dy = by - ay;
      const distSq = dx * dx + dy * dy;
      const minDist = STICKER_SIZE;
      if (distSq >= minDist * minDist || distSq < 1e-10) continue;
      const dist = Math.sqrt(distSq);
      const nx = dx / dist;
      const ny = dy / dist;
      const vrel = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
      if (vrel >= 0) continue; // not approaching
      // Equal-mass elastic bounce: swap normal components so both change trajectory
      a.vx -= vrel * nx;
      a.vy -= vrel * ny;
      b.vx += vrel * nx;
      b.vy += vrel * ny;
      // Separate so they don't stay overlapping
      const overlap = minDist - dist;
      a.x -= overlap * nx * 0.5;
      a.y -= overlap * ny * 0.5;
      b.x += overlap * nx * 0.5;
      b.y += overlap * ny * 0.5;
    }
  }
}

const STICKER_SOURCES = [
  "/hyperlinks/Stikars/4iza.svg",
  "/hyperlinks/Stikars/maska.svg",
  "/hyperlinks/Stikars/walley.svg",
] as const;

export default function BouncingStickers({ links }: { links: string[] }) {
  const stickersRef = useRef<StickerData[] | null>(null);
  const [tick, setTick] = useState(0);
  const rafRef = useRef<number>(0);
  const [ready, setReady] = useState(false);
  const linksList = links.length >= 5 ? links.slice(0, 5) : [...links, "/"];

  // Initialize stickers once on mount, then start animation
  useEffect(() => {
    const w = typeof window !== "undefined" ? window.innerWidth : 400;
    const h = typeof window !== "undefined" ? window.innerHeight : 400;
    stickersRef.current = STICKER_SOURCES.map((src) => initSticker(src, w, h));
    setReady(true);
  }, []);

  // Single animation loop: runs once when ready, updates ref and forces re-render each frame
  useEffect(() => {
    if (!ready) return;

    function loop() {
      const current = stickersRef.current;
      if (!current) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      tickStickers(current, w, h);
      setTick((t) => t + 1);
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [ready]);

  const positions = ready ? stickersRef.current : null;
  if (!positions || positions.length === 0) {
    return null;
  }

  return (
    <div
      className="bouncing-stickers-wrapper"
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 2147483647,
      }}
    >
      {positions.map((sticker, i) => (
        <a
          key={i}
          href="#"
          className="bouncing-sticker"
          style={{
            position: "absolute",
            left: sticker.x,
            top: sticker.y,
            width: STICKER_SIZE,
            height: STICKER_SIZE,
            pointerEvents: "auto",
            cursor: "pointer",
            display: "block",
          }}
          onClick={(e) => {
            e.preventDefault();
            const href = linksList[Math.floor(Math.random() * linksList.length)] ?? "/";
            if (href.startsWith("http")) {
              window.open(href, "_blank", "noopener,noreferrer");
            } else {
              window.location.href = href;
            }
          }}
        >
          <img
            src={sticker.src}
            alt=""
            width={STICKER_SIZE}
            height={STICKER_SIZE}
            style={{ display: "block", width: "100%", height: "100%", pointerEvents: "none" }}
          />
        </a>
      ))}
    </div>
  );
}
