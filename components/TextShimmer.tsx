import React from 'react';

interface TextShimmerProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'loading' | 'purple';
  speed?: 'fast' | 'normal' | 'slow';
}

const TextShimmer: React.FC<TextShimmerProps> = ({ 
  children, 
  className = "", 
  variant = 'default',
  speed = 'normal'
}) => {
  const getShimmerClass = () => {
    switch (variant) {
      case 'loading':
        return 'animate-text-shimmer-loading';
      case 'purple':
        return 'animate-text-shimmer-purple';
      default:
        return 'animate-text-shimmer';
    }
  };

  const getSpeedStyle = () => {
    switch (speed) {
      case 'fast':
        return { animationDuration: '1s' };
      case 'slow':
        return { animationDuration: '3s' };
      default:
        return {};
    }
  };

  return (
    <span 
      className={`${getShimmerClass()} font-semibold ${className}`}
      style={getSpeedStyle()}
    >
      {children}
    </span>
  );
};

export default TextShimmer;