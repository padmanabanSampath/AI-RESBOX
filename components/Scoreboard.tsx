import React, { useState, useEffect } from 'react';

interface ScoreboardProps {
  score: number;
}

const Scoreboard: React.FC<ScoreboardProps> = ({ score }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  // Trigger animation on score change
  useEffect(() => {
    if (score > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300); // Duration of animation
      return () => clearTimeout(timer);
    }
  }, [score]);

  return (
    <div className="text-center">
      <div className={`text-5xl font-bold text-amber-400 transition-transform duration-300 ${isAnimating ? 'animate-score-pop' : ''}`}>
        {score}
      </div>
      <div className="text-sm text-gray-400">SCORE</div>
    </div>
  );
};

export default Scoreboard;