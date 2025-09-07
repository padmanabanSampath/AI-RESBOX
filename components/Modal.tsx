import React from 'react';
import Loader from './Loader';
import { SolutionPart } from '../types';

interface ModalProps {
  isCorrect: boolean | null;
  word: string;
  solution: SolutionPart[] | null;
  onPlayAgain: () => void;
  onEndGame: () => void;
}

const Modal: React.FC<ModalProps> = ({ isCorrect, word, solution, onPlayAgain, onEndGame }) => {
  const bgColor = isCorrect ? 'bg-green-500/20 border-green-500' : 'bg-red-500/20 border-red-500';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-pop-in" style={{ animationDuration: '0.5s' }}>
      <div className={`w-full max-w-2xl p-8 rounded-2xl border-2 ${bgColor} bg-gray-900 shadow-2xl shadow-indigo-500/20 text-center`}>
        {isCorrect === null && <Loader message="Time's up!" />}
        {isCorrect === true && (
          <div className="animate-fade-in-up">
            <h2 className="text-5xl font-extrabold text-green-400 mb-2 animate-pop-in" style={{ animationDelay: '200ms' }}>CORRECT!</h2>
            <p className="text-lg text-gray-300 mb-6" style={{ animationDelay: '300ms' }}>You are a creative genius! The word was <span className="font-bold text-white">{word}</span>.</p>
          </div>
        )}
        {isCorrect === false && (
          <div className="animate-fade-in-up">
            <h2 className="text-5xl font-extrabold text-red-400 mb-2 animate-pop-in" style={{ animationDelay: '200ms' }}>Not Quite...</h2>
            <p className="text-lg text-gray-300 mb-4">The word was <span className="font-bold text-white">{word}</span>.</p>
            <p className="text-md text-gray-400 mb-4">Here's one possible solution:</p>
            <div className="flex justify-center gap-4 my-6">
              {solution === null ? (
                <Loader message="Generating solution..." />
              ) : solution.length > 0 ? (
                solution.map((item, index) => (
                  <div 
                    key={index} 
                    className="w-24 h-24 bg-white/10 rounded-lg overflow-hidden flex items-center justify-center p-1 animate-pop-in"
                    style={{ animationDelay: `${400 + index * 150}ms`, opacity: 0 }}
                  >
                    {item.type === 'image' ? (
                        <img src={item.value} alt={`Solution for "${item.part}"`} className="max-w-full max-h-full object-contain" />
                    ) : (
                        <span className="text-6xl font-bold text-white font-mono select-none">{item.value}</span>
                    )}
                  </div>
                ))
              ) : (
                 <div className="w-full text-center text-gray-400 bg-gray-800 p-4 rounded-lg">
                    <p>Oops! We couldn't generate a solution this time.</p>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="flex justify-center gap-4 mt-4">
          {isCorrect ? (
            <>
              <button
                onClick={onEndGame}
                className="px-8 py-3 bg-gray-600 text-white font-bold rounded-lg shadow-lg hover:bg-gray-700 transform hover:scale-105 transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: '600ms', opacity: 0 }}
              >
                End Game
              </button>
              <button
                onClick={onPlayAgain}
                className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 transform hover:scale-105 transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: '500ms', opacity: 0 }}
              >
                Next Round
              </button>
            </>
          ) : (
            <button
              onClick={onPlayAgain}
              className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 transform hover:scale-105 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: '600ms', opacity: 0 }}
            >
              Play Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;