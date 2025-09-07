import React from 'react';

interface TimeoutModalProps {
  onTryAgain: () => void;
  onEndGame: () => void;
}

const TimeoutModal: React.FC<TimeoutModalProps> = ({ onTryAgain, onEndGame }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-pop-in p-4" style={{ animationDuration: '0.5s' }}>
      <div className="w-full max-w-md p-8 rounded-2xl border-2 border-red-500 bg-gray-900 bg-opacity-95 shadow-2xl shadow-red-500/20 text-center">
        
        {/* Timeout Icon */}
        <div className="mb-6 animate-fade-in-up">
          <div className="text-8xl mb-4">⏰</div>
          <h2 className="text-4xl font-extrabold text-red-400 mb-2">Time's Up!</h2>
          <p className="text-lg text-gray-300">
            You didn't submit your mashup idea in time.
          </p>
        </div>

        {/* Message */}
        <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '200ms', opacity: 0 }}>
          <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/30">
            <p className="text-red-200 font-medium">
              Don't worry! Creativity takes time. 
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Try another mashup challenge or end the game to see your final score.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onEndGame}
            className="px-6 py-3 bg-gray-600 text-white font-bold rounded-lg shadow-lg hover:bg-gray-700 transform hover:scale-105 transition-all duration-300 animate-fade-in-up"
            style={{ animationDelay: '400ms', opacity: 0 }}
          >
            🏁 End Game
          </button>
          <button
            onClick={onTryAgain}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg shadow-lg hover:from-purple-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 animate-fade-in-up"
            style={{ animationDelay: '300ms', opacity: 0 }}
          >
            🎨 Try Another Mashup!
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeoutModal;