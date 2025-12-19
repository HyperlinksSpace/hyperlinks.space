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
  const [transitionDurations, setTransitionDurations] = useState<string[]>(['0.4s', '0.4s', '0.4s', '0.4s']);
  const [cellOrder, setCellOrder] = useState<number[]>([0, 1, 2, 3]);

  // Shuffle array function
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Generate random proportion between min and max (ensuring they sum to 2)
  const generateRandomProportions = () => {
    const min = 0.3;
    const max = 1.7;
    
    // Generate two random values
    const val1 = Math.random() * (max - min) + min;
    const val2 = 2 - val1; // Ensure they sum to 2
    
    // Clamp val2 to valid range
    const clampedVal2 = Math.max(min, Math.min(max, val2));
    const clampedVal1 = 2 - clampedVal2;
    
    return [clampedVal1, clampedVal2];
  };

  // Update grid proportions randomly
  useEffect(() => {
    const updateGrid = () => {
      const [col1, col2] = generateRandomProportions();
      const [row1, row2] = generateRandomProportions();
      
      setGridStyle({
        gridTemplateColumns: `${col1}fr ${col2}fr`,
        gridTemplateRows: `${row1}fr ${row2}fr`,
      });
    };

    // Initial update
    updateGrid();

    // Random interval between 1.2s and 3.5s
    const scheduleNext = () => {
      const delay = Math.random() * 2300 + 1200;
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

  // Randomly shuffle cell positions
  useEffect(() => {
    const shufflePositions = () => {
      setCellOrder(shuffleArray([0, 1, 2, 3]));
    };

    // Initial shuffle after a short delay
    const initialDelay = setTimeout(shufflePositions, 1000);

    // Random interval between 2s and 5s for position shuffling
    const scheduleNext = () => {
      const delay = Math.random() * 3000 + 2000;
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
            transition: 'grid-row 0.8s cubic-bezier(0.4, 0, 0.2, 1), grid-column 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {child}
        </div>
      );
    }).filter(Boolean);
  }, [childrenArray, cellOrder]);

  return (
    <AnimationContext.Provider value={{ imageScales, transitionDurations }}>
      <main className="hyperlinksGrid" style={gridStyle}>
        {orderedChildren}
      </main>
    </AnimationContext.Provider>
  );
}

