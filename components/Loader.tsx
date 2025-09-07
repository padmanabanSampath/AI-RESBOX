
import React from 'react';

interface LoaderProps {
  message: string;
}

const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-4">
      <div className="w-12 h-12 border-4 border-t-transparent border-indigo-500 rounded-full animate-spin mb-4"></div>
      {message && <p className="text-lg text-gray-300">{message}</p>}
    </div>
  );
};

export default Loader;
