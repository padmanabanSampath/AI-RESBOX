
import React from 'react';

interface TimerProps {
  timeLeft: number;
}

const Timer: React.FC<TimerProps> = ({ timeLeft }) => {
  const urgencyClass = timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-cyan-400';
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="text-center">
      <div className={`text-5xl font-bold ${urgencyClass}`}>{`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`}</div>
      <div className="text-sm text-gray-400">TIME LEFT</div>
    </div>
  );
};

export default Timer;
