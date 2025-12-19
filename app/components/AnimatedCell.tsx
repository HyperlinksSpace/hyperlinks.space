"use client";

import { useAnimation } from "./AnimatedGrid";
import { useEffect, useRef } from "react";

interface AnimatedCellProps {
  n: number;
  href: string;
  svgContent: string;
}

export default function AnimatedCell({ n, href, svgContent }: AnimatedCellProps) {
  const { imageScales, transitionDurations } = useAnimation();
  const svgRef = useRef<HTMLDivElement>(null);
  const scaleX = imageScales[n - 1] ?? 1;
  // Use different scale for Y to create flatten/expand effect
  const scaleY = imageScales[(n - 1 + 2) % 4] ?? 1;
  const transitionDuration = transitionDurations[n - 1] ?? '0.4s';

  useEffect(() => {
    if (svgRef.current) {
      const svgElement = svgRef.current.querySelector('svg') as SVGSVGElement;
      if (svgElement) {
        // Apply CSS transform directly to SVG to animate paths
        // Constrain scale to prevent overflow
        const constrainedScaleX = Math.min(scaleX, 1.5);
        const constrainedScaleY = Math.min(scaleY, 1.5);
        svgElement.style.transform = `scale(${constrainedScaleX}, ${constrainedScaleY})`;
        svgElement.style.transformOrigin = 'center';
        svgElement.style.transition = `transform ${transitionDuration} cubic-bezier(0.34, 1.56, 0.64, 1)`;
        svgElement.style.maxWidth = '100%';
        svgElement.style.maxHeight = '100%';
        svgElement.style.overflow = 'visible';
      }
    }
  }, [scaleX, scaleY, transitionDuration]);

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
          <div
            ref={svgRef}
            className={`hyperlinksImage hyperlinksPos${n}`}
            style={{
              width: '100%',
              height: '100%',
              maxWidth: '100%',
              maxHeight: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        </div>
      </div>
    </a>
  );
}

