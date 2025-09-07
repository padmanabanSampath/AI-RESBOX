import React from 'react';

interface ShimmerLoaderProps {
  width?: string;
  height?: string;
  className?: string;
}

const ShimmerLoader: React.FC<ShimmerLoaderProps> = ({ 
  width = "w-full", 
  height = "h-4", 
  className = "" 
}) => {
  return (
    <div className={`${width} ${height} ${className} bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 bg-[length:200%_100%] animate-shimmer rounded`}>
    </div>
  );
};

export default ShimmerLoader;