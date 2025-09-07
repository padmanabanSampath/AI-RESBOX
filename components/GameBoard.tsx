import React from 'react';
import CanvasBox from './CanvasBox';
import { BoxContent, Puzzle } from '../types';

interface GameBoardProps {
  puzzle: Puzzle;
  boxes: BoxContent[];
  setBoxes: React.Dispatch<React.SetStateAction<BoxContent[]>>;
  prefetchedImages: Map<string, string>;
}

const GameBoard: React.FC<GameBoardProps> = ({ puzzle, boxes, setBoxes, prefetchedImages }) => {
  // 📱 RESPONSIVE GRID: Calculate optimal columns based on screen size and box count
  const getOptimalColumns = (boxCount: number): number => {
    // For mobile (assumed width < 768px), max 2 boxes per row
    // For tablet (768px - 1024px), max 4 boxes per row  
    // For desktop (> 1024px), max 6 boxes per row
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
    
    let maxColumns: number;
    if (isMobile) {
      maxColumns = 2;
    } else if (isTablet) {
      maxColumns = 4;
    } else {
      maxColumns = 6;
    }
    
    // Use the minimum of box count and max columns for the device
    return Math.min(boxCount, maxColumns);
  };

  const optimalColumns = getOptimalColumns(boxes.length);

  const gridContainerStyle = {
    display: 'grid',
    gap: '1rem', // Reduced gap for better fit
    gridTemplateColumns: `repeat(${optimalColumns}, minmax(0, 1fr))`,
    width: '100%',
    maxWidth: '100%',
    justifyContent: 'center',
    // Ensure boxes wrap to new rows when needed
    gridAutoRows: 'minmax(144px, auto)', // min-height for boxes (9rem = 144px)
  };

  return (
    <div className="flex flex-col items-center p-4 md:p-6 w-full">
      <div className="text-center mb-8 animate-fade-in-up" style={{ animationDelay: '100ms', opacity: 0 }}>
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-400 mb-2">Your word is:</h2>
        <p className="text-5xl md:text-7xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
          {puzzle.word}
        </p>
      </div>
      
      {/* 🎯 RESPONSIVE GRID: Automatically wraps to multiple rows */}
      <div style={gridContainerStyle} className="w-full max-w-4xl mx-auto">
        {boxes.map((box, index) => (
          <div key={index} className="animate-fade-in-up flex justify-center" style={{ animationDelay: `${200 + index * 100}ms`, opacity: 0 }}>
            <CanvasBox
              boxContent={box}
              prefetchedImages={prefetchedImages}
              onContentUpdate={(newContent) => {
                setBoxes(currentBoxes => {
                  const newBoxes = [...currentBoxes];
                  newBoxes[index] = { ...newBoxes[index], ...newContent };
                  return newBoxes;
                });
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameBoard;