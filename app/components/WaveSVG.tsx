"use client";

import { useEffect, useRef } from "react";

interface WaveSVGProps {
  svgContent: string;
  width?: number;
  height?: number;
}

// Parse SVG path and apply wave distortion
const applyWaveToPath = (
  pathData: string,
  time: number,
  waveIntensity: number = 1,
  pathIndex: number = 0
): string => {
  // Extract all numbers from the path
  const numberRegex = /(-?\d+\.?\d*)/g;
  const matches: Array<{ value: number; index: number; length: number }> = [];
  let match;

  while ((match = numberRegex.exec(pathData)) !== null) {
    matches.push({
      value: parseFloat(match[0]),
      index: match.index,
      length: match[0].length,
    });
  }

  if (matches.length === 0) return pathData;

  // Build new path with wave distortion
  let result = "";
  let lastIndex = 0;

  matches.forEach((num, index) => {
    // Add text before this number
    result += pathData.substring(lastIndex, num.index);

    // Apply wave distortion with multiple frequencies for more complex waves
    const isY = index % 2 === 1;
    
    // Multiple wave frequencies for organic, balanced effect
    const wave1 = isY
      ? Math.sin(time * 2.5 + num.value * 0.012 + pathIndex) * waveIntensity
      : Math.cos(time * 2.0 + num.value * 0.012 + pathIndex) * waveIntensity * 0.6;
    
    const wave2 = isY
      ? Math.sin(time * 1.5 + num.value * 0.018 + pathIndex * 0.5) * waveIntensity * 0.5
      : Math.cos(time * 1.2 + num.value * 0.018 + pathIndex * 0.5) * waveIntensity * 0.35;
    
    const wave3 = isY
      ? Math.sin(time * 3.5 + num.value * 0.006) * waveIntensity * 0.3
      : Math.cos(time * 3.0 + num.value * 0.006) * waveIntensity * 0.25;

    // Combine waves for smooth, balanced motion
    const combinedWave = wave1 + wave2 + wave3;
    
    // Subtle position-based variation for natural feel
    const positionFactor = 1 + Math.abs(num.value) * 0.0003;
    const finalWave = combinedWave * positionFactor;

    const newValue = num.value + finalWave;
    result += newValue.toFixed(2);

    lastIndex = num.index + num.length;
  });

  // Add remaining text
  result += pathData.substring(lastIndex);

  return result;
};

export default function WaveSVG({
  svgContent,
  width = 400,
  height = 400,
}: WaveSVGProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const originalPathsRef = useRef<Map<SVGPathElement, string>>(new Map());

  useEffect(() => {
    if (!containerRef.current) return;

    // Parse and inject SVG
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, "image/svg+xml");
    const svgElement = doc.querySelector("svg");

    if (!svgElement) {
      console.error("No SVG element found");
      return;
    }

    // Clone and inject SVG
    const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;

    // Set SVG to fill container
    clonedSvg.setAttribute("width", "100%");
    clonedSvg.setAttribute("height", "100%");
    clonedSvg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    clonedSvg.style.width = "100%";
    clonedSvg.style.height = "100%";
    clonedSvg.style.display = "block";
    clonedSvg.style.overflow = "visible";

    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(clonedSvg);
    svgRef.current = clonedSvg;

    // Get all paths and store original path data
    const paths = clonedSvg.querySelectorAll("path");
    paths.forEach((path) => {
      const originalPath = path.getAttribute("d");
      if (originalPath) {
        originalPathsRef.current.set(path, originalPath);
      }
    });

    // Animation loop for wave effect
    const startTime = Date.now();
    const animate = () => {
      const elapsed = (Date.now() - startTime) * 0.001;

      paths.forEach((path, index) => {
        const originalPath = originalPathsRef.current.get(path);
        if (!originalPath) return;

        // Apply wave distortion with balanced, varying intensity per path
        // Moderate base intensity with smooth variation
        const baseIntensity = 6;
        const variation = Math.sin(elapsed * 0.6 + index * 0.5) * 3;
        const waveIntensity = baseIntensity + variation;
        
        // Add per-path phase offset for organic movement
        const phaseOffset = index * 0.3;
        
        const distortedPath = applyWaveToPath(
          originalPath, 
          elapsed + phaseOffset, 
          waveIntensity,
          index
        );
        path.setAttribute("d", distortedPath);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      originalPathsRef.current.clear();
    };
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
