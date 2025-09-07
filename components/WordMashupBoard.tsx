import React, { useState } from 'react';
import { WordMashupPuzzle } from '../types';
import Loader from './Loader';
import TextShimmer from './TextShimmer';

interface WordMashupBoardProps {
  puzzle: WordMashupPuzzle;
  onSubmit: (editPrompt: string) => void;
  isLoading: boolean;
  timeLeft?: number;
  score?: number;
  puzzlesCorrect?: number;
}

const WordMashupBoard: React.FC<WordMashupBoardProps> = ({ puzzle, onSubmit, isLoading, timeLeft = 0, score = 0, puzzlesCorrect = 0 }) => {
  const [editPrompt, setEditPrompt] = useState('');

  const handleSubmit = () => {
    if (editPrompt.trim()) {
      onSubmit(editPrompt.trim());
    }
  };

  const getOtherObject = () => {
    return puzzle.objects.find(obj => obj !== puzzle.starterWord) || '';
  };

  const otherObject = getOtherObject();

  return (
    <div className="flex flex-col lg:flex-row items-start gap-8 p-4 md:p-6 w-full max-w-7xl mx-auto">
      {/* Left Column: Scoring Rules */}
      <div className="w-full lg:w-80 sticky top-4 self-start animate-fade-in-up" style={{ animationDelay: '500ms', opacity: 0 }}>
        <div className="bg-white/5 rounded-lg p-6 border border-gray-700">
          <h4 className="text-xl font-semibold text-purple-400 mb-4 flex items-center">
            <span className="mr-2">🏆</span> Scoring Rules
          </h4>
          <ul className="text-sm text-gray-300 space-y-3">
            <li className="flex items-start">
              <span className="text-green-400 mr-2">•</span>
              <span>Both objects must be clearly visible in the image</span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-400 mr-2">•</span>
              <span>Objects should be creatively mashed together, not just side-by-side</span>
            </li>
            <li className="flex items-start">
              <span className="text-orange-400 mr-2">•</span>
              <span>Creativity, humor, and surprise earn bonus points!</span>
            </li>
            <li className="flex items-start">
              <span className="text-cyan-400 mr-2">•</span>
              <span>Score: 0-10 points based on creativity and execution</span>
            </li>
          </ul>
          <div className="mt-6 p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
            <p className="text-xs text-purple-300 text-center font-medium">
              🎨 The more imaginative, the better your score!
            </p>
          </div>
        </div>
        
        {/* Status Card */}
        <div className="bg-white/5 rounded-lg p-6 border border-gray-700 mt-6 animate-fade-in-up" style={{ animationDelay: '600ms', opacity: 0 }}>
          <h4 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center">
            <span className="mr-2">📊</span> Game Stats
          </h4>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-2xl font-bold text-amber-400">{score}</div>
              <div className="text-xs text-gray-400">Total Score</div>
            </div>
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-400">{puzzlesCorrect}</div>
              <div className="text-xs text-gray-400">Puzzles Solved</div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
            <p className="text-xs text-cyan-300 text-center font-medium">
              🎯 Keep creating to boost your score!
            </p>
          </div>
        </div>
      </div>
      
      {/* Right Column: Main Game Area */}
      <div className="flex-1 flex flex-col items-center">
        {/* Game Instructions */}
        <div className="text-center mb-8 animate-fade-in-up" style={{ animationDelay: '100ms', opacity: 0 }}>
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-400 mb-2">Word Mashup Challenge!</h2>
          <p className="text-5xl md:text-7xl font-extrabold tracking-widest mb-4">
            <TextShimmer 
              variant="purple" 
              speed="slow"
              className="bg-gradient-to-r from-purple-400 to-indigo-600 bg-clip-text text-transparent"
            >
              {puzzle.word}
            </TextShimmer>
          </p>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            You have <span className="text-cyan-400 font-bold">{puzzle.starterWord}</span>. 
            Now turn it into <span className="text-purple-400 font-bold">{puzzle.word}</span>!
          </p>
        </div>

        {/* Starter Image Display */}
        <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '200ms', opacity: 0 }}>
          <div className="bg-white/10 rounded-xl p-6 border-2 border-dashed border-indigo-500">
            <h3 className="text-xl text-gray-300 mb-4 text-center">Your Starting Image:</h3>
            <div className="w-48 h-48 mx-auto bg-white/5 rounded-lg flex items-center justify-center border border-gray-600">
              {puzzle.starterImageUrl ? (
                <img 
                  src={puzzle.starterImageUrl} 
                  alt={`Starting image: ${puzzle.starterWord}`}
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              ) : (
                <Loader message="Loading starter image..." />
              )}
            </div>
            <p className="text-center text-gray-400 mt-2">"{puzzle.starterWord}"</p>
          </div>
        </div>

        {/* Time Warning - Moved between image and text box */}
        {timeLeft <= 30 && timeLeft > 0 && (
          <div className={`w-full max-w-2xl mb-6 animate-fade-in-up ${
            timeLeft <= 10 ? 'bg-red-500/20 border border-red-500 text-red-300 animate-pulse' :
            timeLeft <= 20 ? 'bg-orange-500/20 border border-orange-500 text-orange-300' :
            'bg-yellow-500/20 border border-yellow-500 text-yellow-300'
          } text-center p-3 rounded-lg`}>
            ⏰ Hurry up! Only {timeLeft} seconds left!
          </div>
        )}

        {/* Edit Prompt Input */}
        <div className="w-full max-w-2xl mb-8 animate-fade-in-up" style={{ animationDelay: '300ms', opacity: 0 }}>
          <div className="bg-white/10 rounded-xl p-6 border border-gray-600">
            <h3 className="text-xl text-gray-300 mb-4">Describe your mashup idea:</h3>
            
            {/* Example Prompt */}
            <div className="bg-purple-500/10 rounded-lg p-4 mb-4 border border-purple-500/30">
              <p className="text-sm text-purple-300 mb-2 font-medium">💡 Example format:</p>
              <p className="text-xs text-gray-300 italic">
                "Using the provided image of _______, please add _______ to/from the scene. Ensure the change is creative and seamlessly integrated into a single cohesive image."
              </p>
            </div>
            
            <textarea
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              placeholder="Describe how to combine the objects creatively..."
              className="w-full h-24 bg-gray-800 text-white rounded-lg p-3 border border-gray-600 focus:border-indigo-500 focus:outline-none resize-none"
              disabled={isLoading || timeLeft <= 0}
            />
            <div className="flex justify-between items-center mt-3">
              <span className="text-sm text-gray-500">{editPrompt.length}/200</span>
              <div className="text-xs text-gray-500">
                💡 Tip: The more creative and visual, the better!
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!editPrompt.trim() || isLoading || timeLeft <= 0}
          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg shadow-lg hover:from-purple-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none animate-fade-in-up"
          style={{ animationDelay: '400ms', opacity: 0 }}
        >
          {timeLeft <= 0 ? "⏰ Time's Up!" : isLoading ? 'Creating Mashup...' : '🎨 Create Mashup!'}
        </button>
      </div>
    </div>
  );
};

export default WordMashupBoard;