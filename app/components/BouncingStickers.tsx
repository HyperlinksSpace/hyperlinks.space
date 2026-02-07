"use client";

import { useEffect, useRef, useState } from "react";

const STICKER_SIZE = 44;
const SPEED = 3.6; // moderate speed in px per frame

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

/** Mirror reflection: reflect velocity across surface normal (like light on a mirror). */
function reflectVelocity(vx: number, vy: number, nx: number, ny: number): { vx: number; vy: number } {
  const dot = vx * nx + vy * ny;
  return {
    vx: vx - 2 * dot * nx,
    vy: vy - 2 * dot * ny,
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

  // Sticker–sticker: AABB collision (respects dimensions), mirror reflection on hit
  for (let i = 0; i < stickers.length; i++) {
    for (let j = i + 1; j < stickers.length; j++) {
      const a = stickers[i];
      const b = stickers[j];

      // AABB overlap - rectangles don't overlay
      const aLeft = a.x;
      const aRight = a.x + STICKER_SIZE;
      const aTop = a.y;
      const aBottom = a.y + STICKER_SIZE;
      const bLeft = b.x;
      const bRight = b.x + STICKER_SIZE;
      const bTop = b.y;
      const bBottom = b.y + STICKER_SIZE;

      const overlapX = Math.min(aRight, bRight) - Math.max(aLeft, bLeft);
      const overlapY = Math.min(aBottom, bBottom) - Math.max(aTop, bTop);

      if (overlapX <= 0 || overlapY <= 0) continue;

      // Determine collision normal from smallest overlap axis (surface we hit)
      let nx: number;
      let ny: number;
      let overlap: number;
      if (overlapX < overlapY) {
        nx = a.x + STICKER_SIZE / 2 < b.x + STICKER_SIZE / 2 ? -1 : 1;
        ny = 0;
        overlap = overlapX;
      } else {
        nx = 0;
        ny = a.y + STICKER_SIZE / 2 < b.y + STICKER_SIZE / 2 ? 1 : -1;
        overlap = overlapY;
      }

      // Mirror reflection: each sticker reflects its velocity across the contact normal (like light on a mirror)
      const aReflected = reflectVelocity(a.vx, a.vy, nx, ny);
      const bReflected = reflectVelocity(b.vx, b.vy, -nx, -ny);

      a.vx = aReflected.vx;
      a.vy = aReflected.vy;
      b.vx = bReflected.vx;
      b.vy = bReflected.vy;

      // Separate so they never overlay - push apart along normal by overlap amount
      const half = overlap / 2;
      a.x -= nx * half;
      a.y -= ny * half;
      b.x += nx * half;
      b.y += ny * half;
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
  const [positions, setPositions] = useState<StickerData[] | null>(null);
  const rafRef = useRef<number>(0);
  const linksList = links.length >= 5 ? links.slice(0, 5) : [...links, "/"];

  // Initialize stickers and start animation loop
  useEffect(() => {
    const w = typeof window !== "undefined" ? window.innerWidth : 400;
    const h = typeof window !== "undefined" ? window.innerHeight : 400;
    const stickers = STICKER_SOURCES.map((src) => initSticker(src, w, h));
    stickersRef.current = stickers;

    function loop() {
      const current = stickersRef.current;
      if (!current) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      tickStickers(current, w, h);
      setPositions(current.map((s) => ({ ...s })));
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

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
