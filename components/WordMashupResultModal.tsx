import React from 'react';
import { MashupJudgment, WordMashupPuzzle } from '../types';
import ShimmerLoader from './ShimmerLoader';
import TextShimmer from './TextShimmer';
import Loader from './Loader';

interface WordMashupResultModalProps {
  puzzle: WordMashupPuzzle;
  userPrompt: string;
  finalImageUrl: string | null;
  judgment: MashupJudgment | null;
  timeLeft: number;
  onPlayAgain: () => void;
  onEndGame: () => void;
}

const WordMashupResultModal: React.FC<WordMashupResultModalProps> = ({
  puzzle,
  userPrompt,
  finalImageUrl,
  judgment,
  timeLeft,
  onPlayAgain,
  onEndGame
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 6) return 'text-yellow-400';
    if (score >= 4) return 'text-orange-400';
    return 'text-red-400';
  };

  const getQualityEmoji = (quality: string) => {
    switch (quality) {
      case 'high': return '🔥';
      case 'medium': return '👍';
      case 'low': return '💪';
      default: return '🎨';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-pop-in p-4" style={{ animationDuration: '0.5s' }}>
      <div className="w-full max-w-4xl p-6 rounded-2xl border-2 border-purple-500 bg-gray-900 bg-opacity-95 shadow-2xl shadow-purple-500/20 text-center max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="animate-fade-in-up mb-6">
          <h2 className="text-4xl font-extrabold text-purple-400 mb-2">
            {judgment ? `${judgment.score}/10` : 'Results'} 🎨
          </h2>
          <p className="text-lg text-gray-300">
            Word: <span className="font-bold text-white">{puzzle.word}</span>
          </p>
        </div>

        {/* Images Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Original Starter Image */}
          <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <h3 className="text-lg font-semibold text-gray-300 mb-3">Starting Image</h3>
            <div className="bg-white/10 rounded-lg p-4 border border-gray-600">
              <img 
                src={puzzle.starterImageUrl} 
                alt={`Starter: ${puzzle.starterWord}`}
                className="w-full h-48 object-contain rounded-lg mx-auto"
              />
              <p className="text-gray-400 mt-2">"{puzzle.starterWord}"</p>
            </div>
          </div>

          {/* Final Mashup Image */}
          <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <h3 className="text-lg font-semibold text-gray-300 mb-3">Your Mashup</h3>
            <div className="bg-white/10 rounded-lg p-4 border border-gray-600">
              {finalImageUrl ? (
                <img 
                  src={finalImageUrl} 
                  alt="Your mashup creation"
                  className="w-full h-48 object-contain rounded-lg mx-auto"
                />
              ) : (
                <div className="w-full h-48 flex flex-col items-center justify-center bg-gray-800 rounded-lg border-2 border-dashed border-gray-600">
                  <Loader message="" />
                  <p className="text-sm text-gray-400 mt-2">Creating your mashup...</p>
                </div>
              )}
              <p className="text-gray-400 mt-2 text-sm">"{userPrompt}"</p>
            </div>
          </div>
        </div>

        {/* Judgment Results */}
        <div className="animate-fade-in-up mb-6" style={{ animationDelay: '400ms' }}>
          <div className="bg-white/10 rounded-lg p-6 border border-gray-600">
            {!finalImageUrl ? (
              // Waiting for mashup
              <div className="text-center">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="text-4xl">🎨</div>
                </div>
                <div className="space-y-3">
                  <ShimmerLoader width="w-48" height="h-6" className="mx-auto" />
                  <TextShimmer 
                    variant="loading" 
                    speed="normal"
                    className="text-lg font-semibold inline-block"
                  >
                    Creating your mashup...
                  </TextShimmer>
                  <p className="text-sm text-gray-400">AI is generating your creative mashup</p>
                  <ShimmerLoader width="w-32" height="h-4" className="mx-auto" />
                </div>
              </div>
            ) : !judgment ? (
              // Judging creativity
              <div className="text-center">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="text-4xl">🤔</div>
                </div>
                <div className="space-y-3">
                  <ShimmerLoader width="w-56" height="h-6" className="mx-auto" />
                  <TextShimmer 
                    variant="purple" 
                    speed="fast"
                    className="text-lg font-semibold inline-block"
                  >
                    AI is analyzing your creative mashup...
                  </TextShimmer>
                  <p className="text-sm text-gray-400">Examining the image for objects and creativity</p>
                  <ShimmerLoader width="w-40" height="h-4" className="mx-auto" />
                </div>
              </div>
            ) : (
              // Show results
              <>
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className={`text-6xl font-bold ${getScoreColor(judgment.score)}`}>
                    {judgment.score}
                  </div>
                  <div className="text-4xl">
                    {getQualityEmoji(judgment.mashupQuality)}
                  </div>
                </div>
                
                <p className="text-xl text-gray-300 mb-4 italic">
                  "{judgment.feedback}"
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="bg-white/5 rounded-lg p-3">
                    <h4 className="font-semibold text-gray-300 mb-2">Objects Found:</h4>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {judgment.objectsFound.map((obj, index) => (
                        <span key={index} className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">
                          {obj}
                        </span>
                      ))}
                    </div>
                    
                    {/* Object Combination Display */}
                    <div className="bg-white/10 rounded p-2 text-center">
                      <h5 className="text-xs text-gray-400 mb-1">Word Formation:</h5>
                      <div className="flex items-center justify-center gap-2 text-sm">
                        <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                          {puzzle.objects[0]}
                        </span>
                        <span className="text-gray-400">+</span>
                        <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                          {puzzle.objects[1]}
                        </span>
                        <span className="text-gray-400">=</span>
                        <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded font-bold">
                          {puzzle.word}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-3">
                    <h4 className="font-semibold text-gray-300 mb-2">Mashup Quality:</h4>
                    <span className={`font-bold ${
                      judgment.mashupQuality === 'high' ? 'text-green-400' :
                      judgment.mashupQuality === 'medium' ? 'text-yellow-400' : 'text-orange-400'
                    }`}>
                      {judgment.mashupQuality.toUpperCase()}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {(judgment || timeLeft <= 0) && (
          <div className="flex justify-center gap-4">
            <button
              onClick={onEndGame}
              className="px-6 py-3 bg-gray-600 text-white font-bold rounded-lg shadow-lg hover:bg-gray-700 transform hover:scale-105 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: '600ms', opacity: 0 }}
            >
              End Game
            </button>
            <button
              onClick={onPlayAgain}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg shadow-lg hover:from-purple-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: '500ms', opacity: 0 }}
            >
              🎨 Try Another Mashup!
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WordMashupResultModal;