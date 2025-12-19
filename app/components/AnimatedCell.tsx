"use client";

import { useEffect, useRef, useState } from "react";
import WaveSVG from "./WaveSVG";

interface AnimatedCellProps {
  n: number;
  href: string;
  svgContent: string;
}

export default function AnimatedCell({ n, href, svgContent }: AnimatedCellProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgWrapperRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 400 });
  const [aspectRatio, setAspectRatio] = useState({ scaleX: 1, scaleY: 1 });

  // Update dimensions based on container size
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width,
          height: rect.height,
        });
      }
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Dynamically change SVG aspect ratio to fill maximum space (±22%)
  useEffect(() => {
    const updateAspectRatio = () => {
      // Random aspect ratio changes within ±22% range
      const scaleX = 0.78 + Math.random() * 0.44; // 0.78 to 1.22 (±22%)
      const scaleY = 0.78 + Math.random() * 0.44; // 0.78 to 1.22 (±22%)
      
      setAspectRatio({ scaleX, scaleY });
    };

    // Initial update
    updateAspectRatio();

    // Update every 1-3 seconds for dynamic competition
    const scheduleNext = () => {
      const delay = Math.random() * 2000 + 1000; // 1-3 seconds
      setTimeout(() => {
        updateAspectRatio();
        scheduleNext();
      }, delay);
    };

    scheduleNext();
  }, []);

  return (
    <a
      className="hyperlinksCell"
      href={href}
      aria-label={`Open link ${n}`}
      target={href === "#" ? undefined : "_blank"}
      rel={href === "#" ? undefined : "noopener noreferrer"}
    >
      <div className="hyperlinksImagePad">
        <div
          ref={containerRef}
          className="hyperlinksImageContainer"
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <div
            ref={svgWrapperRef}
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `scale(${aspectRatio.scaleX}, ${aspectRatio.scaleY})`,
              transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              transformOrigin: 'center center',
            }}
          >
            <WaveSVG
              svgContent={svgContent}
              width={dimensions.width}
              height={dimensions.height}
            />
          </div>
        </div>
      </div>
    </a>
  );
}
