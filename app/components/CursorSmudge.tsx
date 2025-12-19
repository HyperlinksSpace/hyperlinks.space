"use client";

import { useEffect, useRef, useState } from "react";

interface TrailPoint {
  x: number;
  y: number;
  time: number;
  intensity: number;
  vx: number;
  vy: number;
}

export default function CursorSmudge() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const trailsRef = useRef<TrailPoint[]>([]);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Track mouse position with velocity
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      const vx = e.clientX - lastMousePosRef.current.x;
      const vy = e.clientY - lastMousePosRef.current.y;
      
      setMousePos({ x: e.clientX, y: e.clientY });
      trailsRef.current.push({
        x: e.clientX,
        y: e.clientY,
        time: now,
        intensity: 1.0,
        vx,
        vy,
      });
      
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      
      // Keep only recent trails (last 30 points for smoother effect)
      if (trailsRef.current.length > 30) {
        trailsRef.current.shift();
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Animation loop
    const animate = (timestamp: number) => {
      timeRef.current = timestamp * 0.001;
      const now = Date.now();
      
      // Clear with slow fade effect (creates smudge trail)
      ctx.fillStyle = "rgba(255, 255, 255, 0.02)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw trails with wave effect
      trailsRef.current = trailsRef.current.filter((trail, index) => {
        const age = (now - trail.time) / 1000; // Age in seconds
        trail.intensity = Math.max(0, 1 - age * 1.5); // Fade over ~0.67 seconds
        
        if (trail.intensity <= 0) return false;

        // Add wave distortion based on time and position
        const waveX = Math.sin(timeRef.current * 2 + trail.x * 0.01) * 5 * trail.intensity;
        const waveY = Math.cos(timeRef.current * 1.5 + trail.y * 0.01) * 5 * trail.intensity;
        
        const x = trail.x + waveX;
        const y = trail.y + waveY;
        
        // Draw smudge effect with prism colors
        const radius = 120 * trail.intensity;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        
        // Prism-like color mixing - rainbow effect
        const hue1 = (timeRef.current * 50 + index * 10) % 360;
        const hue2 = (hue1 + 60) % 360;
        const hue3 = (hue1 + 120) % 360;
        
        gradient.addColorStop(0, `hsla(${hue1}, 70%, 60%, ${0.4 * trail.intensity})`);
        gradient.addColorStop(0.33, `hsla(${hue2}, 70%, 60%, ${0.3 * trail.intensity})`);
        gradient.addColorStop(0.66, `hsla(${hue3}, 70%, 60%, ${0.25 * trail.intensity})`);
        gradient.addColorStop(1, `hsla(${hue1}, 70%, 60%, ${0.05 * trail.intensity})`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        return true;
      });

      // Draw current cursor position with stronger wave effect
      if (mousePos.x > 0 && mousePos.y > 0) {
        const waveX = Math.sin(timeRef.current * 3) * 8;
        const waveY = Math.cos(timeRef.current * 2.5) * 8;
        
        const cursorRadius = 150;
        const cursorGradient = ctx.createRadialGradient(
          mousePos.x + waveX,
          mousePos.y + waveY,
          0,
          mousePos.x + waveX,
          mousePos.y + waveY,
          cursorRadius
        );
        
        // Dynamic prism effect - colors shift over time
        const baseHue = (timeRef.current * 30) % 360;
        cursorGradient.addColorStop(0, `hsla(${baseHue}, 80%, 65%, 0.5)`);
        cursorGradient.addColorStop(0.2, `hsla(${(baseHue + 60) % 360}, 80%, 65%, 0.4)`);
        cursorGradient.addColorStop(0.4, `hsla(${(baseHue + 120) % 360}, 80%, 65%, 0.35)`);
        cursorGradient.addColorStop(0.6, `hsla(${(baseHue + 180) % 360}, 80%, 65%, 0.3)`);
        cursorGradient.addColorStop(0.8, `hsla(${(baseHue + 240) % 360}, 80%, 65%, 0.2)`);
        cursorGradient.addColorStop(1, `hsla(${(baseHue + 300) % 360}, 80%, 65%, 0.1)`);

        ctx.fillStyle = cursorGradient;
        ctx.beginPath();
        ctx.arc(mousePos.x + waveX, mousePos.y + waveY, cursorRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Add additional wave rings
        for (let i = 1; i <= 3; i++) {
          const ringRadius = cursorRadius + i * 30;
          const ringIntensity = 0.2 / i;
          const ringWave = Math.sin(timeRef.current * 2 + i) * 5;
          
          ctx.strokeStyle = `hsla(${(baseHue + i * 40) % 360}, 70%, 60%, ${ringIntensity})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(
            mousePos.x + waveX,
            mousePos.y + waveY + ringWave,
            ringRadius,
            0,
            Math.PI * 2
          );
          ctx.stroke();
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate(0);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [mousePos]);

  return (
    <>
      {/* Canvas for color smudge effect */}
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 9999,
          mixBlendMode: "multiply",
        }}
      />
      {/* Prism overlay that distorts the view */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 9998,
          background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, 
            rgba(255, 0, 150, 0.1) 0%,
            rgba(0, 150, 255, 0.08) 25%,
            rgba(150, 255, 0, 0.06) 50%,
            rgba(255, 150, 0, 0.04) 75%,
            transparent 100%)`,
          backdropFilter: `blur(${mousePos.x > 0 ? 2 : 0}px)`,
          transition: "backdrop-filter 0.3s ease-out",
          mixBlendMode: "overlay",
        }}
      />
    </>
  );
}

