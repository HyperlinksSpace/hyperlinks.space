"use client";

import { useEffect, useRef } from "react";

interface SimpleWaveSVGProps {
  svgContent: string;
  width?: number;
  height?: number;
}

// Simple approach: render SVG and add CSS wave animation
export default function SimpleWaveSVG({
  svgContent,
  width = 400,
  height = 400,
}: SimpleWaveSVGProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Inject the SVG directly
    containerRef.current.innerHTML = svgContent;

    // Get the SVG element and style it
    const svg = containerRef.current.querySelector("svg");
    if (svg) {
      // Make SVG responsive
      svg.setAttribute("width", "100%");
      svg.setAttribute("height", "100%");
      svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
      
      // Apply styles
      svg.style.width = "100%";
      svg.style.height = "100%";
      svg.style.display = "block";
      svg.style.overflow = "visible";

      // Add wave animation to the entire SVG
      svg.style.animation = "svgWave 4s ease-in-out infinite";
      svg.style.transformOrigin = "center center";

      // Add keyframes for SVG wave
      if (!document.getElementById("svg-wave-styles")) {
        const style = document.createElement("style");
        style.id = "svg-wave-styles";
        style.textContent = `
          @keyframes svgWave {
            0%, 100% {
              transform: translateY(0px) rotate(0deg) scale(1);
            }
            25% {
              transform: translateY(-8px) rotate(0.5deg) scale(1.02);
            }
            50% {
              transform: translateY(0px) rotate(0deg) scale(1);
            }
            75% {
              transform: translateY(8px) rotate(-0.5deg) scale(0.98);
            }
          }
        `;
        document.head.appendChild(style);
      }

      // Add individual wave animations to paths
      const paths = svg.querySelectorAll("path");
      paths.forEach((path, index) => {
        const pathEl = path as SVGPathElement;
        const delay = index * 0.15;
        const duration = 2.5 + (index % 3) * 0.5;
        
        pathEl.style.animation = `pathWave ${duration}s ease-in-out infinite`;
        pathEl.style.animationDelay = `${delay}s`;
        pathEl.style.transformOrigin = "center center";
        pathEl.style.willChange = "transform";
      });

      // Add keyframes for path waves
      if (!document.getElementById("path-wave-styles")) {
        const style = document.createElement("style");
        style.id = "path-wave-styles";
        style.textContent = `
          @keyframes pathWave {
            0%, 100% {
              transform: translate(0, 0) scale(1);
            }
            33% {
              transform: translate(3px, -4px) scale(1.015);
            }
            66% {
              transform: translate(-3px, 4px) scale(0.985);
            }
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, [svgContent]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "visible",
      }}
    />
  );
}
