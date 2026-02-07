"use client";

import { useEffect, useState, useMemo, createContext, useContext } from "react";

interface AnimationContextType {
  imageScales: number[];
  transitionDurations: string[];
}

const AnimationContext = createContext<AnimationContextType>({
  imageScales: [1, 1, 1, 1],
  transitionDurations: ['0.4s', '0.4s', '0.4s', '0.4s'],
});

export const useAnimation = () => useContext(AnimationContext);

export default function AnimatedGrid({ children }: { children: React.ReactNode }) {
  const [gridStyle, setGridStyle] = useState<React.CSSProperties>({});
  const [imageScales, setImageScales] = useState<number[]>([1, 1, 1, 1]);
  const [transitionDurations, setTransitionDurations] = useState<string[]>([
    "0.4s",
    "0.4s",
    "0.4s",
    "0.4s",
  ]);
  const [cellOrder, setCellOrder] = useState<number[]>([0, 1, 2, 3]);
  // Animation durations for each cell.
  // IMPORTANT: start with deterministic values to avoid SSR/CSR hydration mismatch.
  const [animationDurations, setAnimationDurations] = useState<string[]>([
    "3s",
    "3s",
    "3s",
    "3s",
  ]);

  // Shuffle array function
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Generate competitive proportions - cells fight for space
  const generateCompetitiveProportions = () => {
    // More extreme range for competitive effect
    const min = 0.2;
    const max = 1.8;
    
    // Generate two random values with more variation
    const val1 = Math.random() * (max - min) + min;
    const val2 = 2 - val1; // Ensure they sum to 2
    
    // Clamp val2 to valid range
    const clampedVal2 = Math.max(min, Math.min(max, val2));
    const clampedVal1 = 2 - clampedVal2;
    
    return [clampedVal1, clampedVal2];
  };

  // After mount on the client, randomize animation durations once.
  // This runs only on the client, so it won't cause hydration mismatch.
  useEffect(() => {
    setAnimationDurations(
      [0, 1, 2, 3].map(() => `${2 + Math.random() * 2}s`)
    );
  }, []);

  // Update grid proportions competitively - cells fight for space
  useEffect(() => {
    const updateGrid = () => {
      const [col1, col2] = generateCompetitiveProportions();
      const [row1, row2] = generateCompetitiveProportions();
      
      setGridStyle({
        gridTemplateColumns: `${col1}fr ${col2}fr`,
        gridTemplateRows: `${row1}fr ${row2}fr`,
      });
    };

    // Initial update
    updateGrid();

    // Faster, more aggressive updates - cells compete more frequently
    const scheduleNext = () => {
      const delay = Math.random() * 800 + 400; // 0.4s to 1.2s (much faster)
      setTimeout(() => {
        updateGrid();
        scheduleNext();
      }, delay);
    };

    scheduleNext();
  }, []);

  // Update image scales randomly - these will flatten and expand the SVG paths
  useEffect(() => {
    const updateImageScales = () => {
      // Wider range for more dramatic effect: 0.4 to 1.6 (flatten to expand)
      // Different scales for X and Y to create flatten/expand morphing
      setImageScales([
        Math.random() * 1.2 + 0.4, // 0.4 to 1.6
        Math.random() * 1.2 + 0.4,
        Math.random() * 1.2 + 0.4,
        Math.random() * 1.2 + 0.4,
      ]);
      
      // Generate random transition durations for each image
      setTransitionDurations([
        `${Math.random() * 0.6 + 0.4}s`, // 0.4s to 1.0s
        `${Math.random() * 0.6 + 0.4}s`,
        `${Math.random() * 0.6 + 0.4}s`,
        `${Math.random() * 0.6 + 0.4}s`,
      ]);
    };

    // Initial update
    updateImageScales();

    // Random interval between 0.4s and 1.8s for path animations
    const scheduleNext = () => {
      const delay = Math.random() * 1400 + 400;
      setTimeout(() => {
        updateImageScales();
        scheduleNext();
      }, delay);
    };

    scheduleNext();
  }, []);

  // More aggressive position shuffling - cells compete for positions
  useEffect(() => {
    const shufflePositions = () => {
      setCellOrder(shuffleArray([0, 1, 2, 3]));
    };

    // Initial shuffle after a short delay
    const initialDelay = setTimeout(shufflePositions, 500);

    // Faster, more frequent shuffling for competitive effect
    const scheduleNext = () => {
      const delay = Math.random() * 1500 + 800; // 0.8s to 2.3s (faster competition)
      setTimeout(() => {
        shufflePositions();
        scheduleNext();
      }, delay);
    };

    scheduleNext();

    return () => clearTimeout(initialDelay);
  }, []);

  const childrenArray = useMemo(() => {
    return Array.isArray(children) ? children : [children];
  }, [children]);

  // Reorder children based on cellOrder and assign grid positions
  const orderedChildren = useMemo(() => {
    return cellOrder.map((originalIndex, gridPosition) => {
      const child = childrenArray[originalIndex];
      if (!child) return null;
      
      // Calculate grid row and column (0-indexed)
      const row = Math.floor(gridPosition / 2) + 1;
      const col = (gridPosition % 2) + 1;
      
      return (
        <div
          key={originalIndex}
          style={{
            gridRow: row,
            gridColumn: col,
            // Faster, more aggressive transitions for competitive effect
            transition: 'grid-row 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55), grid-column 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            // Add scale animation to make cells "push" for space
            // Use longhand animation properties to avoid React shorthand/longhand conflict warnings
            animationName: 'cellFight',
            animationDuration: animationDurations[originalIndex],
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDelay: `${originalIndex * 0.2}s`,
          }}
        >
          {child}
        </div>
      );
    }).filter(Boolean);
  }, [childrenArray, cellOrder, animationDurations]);

  return (
    <AnimationContext.Provider value={{ imageScales, transitionDurations }}>
      <main className="hyperlinksGrid" style={gridStyle}>
        {orderedChildren}
      </main>
    </AnimationContext.Provider>
  );
}

