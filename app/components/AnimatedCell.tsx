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
  const [dimensions, setDimensions] = useState({ width: 400, height: 400 });

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
          }}
        >
          <WaveSVG
            svgContent={svgContent}
            width={dimensions.width}
            height={dimensions.height}
          />
        </div>
      </div>
    </a>
  );
}
