import React, { useState, useEffect } from 'react';
import { getGeneratedWordsList, getMashupWordsList, getShrinkerWordsList, getGeneratedWordsCount, getMashupWordsCount, getShrinkerWordsCount, getApiRequestCounts } from '../services/geminiService';

const SessionWordTracker: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [allWords, setAllWords] = useState<string[]>([]);
  const [mashupWords, setMashupWords] = useState<string[]>([]);
  const [shrinkerWords, setShrinkerWords] = useState<string[]>([]);
  const [counts, setCounts] = useState({ total: 0, mashup: 0, shrinker: 0 });
  const [apiCounts, setApiCounts] = useState({ 'gemini-2.5-pro': 0, 'gemini-2.5-flash': 0, 'gemini-2.5-flash-image-preview': 0 });

  const updateWordLists = () => {
    setAllWords(getGeneratedWordsList());
    setMashupWords(getMashupWordsList());
    setShrinkerWords(getShrinkerWordsList());
    setCounts({
      total: getGeneratedWordsCount(),
      mashup: getMashupWordsCount(),
      shrinker: getShrinkerWordsCount()
    });
    setApiCounts(getApiRequestCounts());
  };

  useEffect(() => {
    // Update word lists when component mounts
    updateWordLists();
    
    // Set up interval to refresh word lists periodically
    const interval = setInterval(updateWordLists, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      updateWordLists(); // Refresh when opening
    }
  };

  const panelAnimation = isOpen ? 'translate-x-0' : 'translate-x-full';

  return (
    <>
      <button
        onClick={toggleOpen}
        className="fixed bottom-20 right-4 z-[60] bg-purple-600 text-white rounded-full p-3 shadow-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-transform hover:scale-110"
        aria-label="Toggle Session Word Tracker"
        title={`Session Words: ${counts.total} | API Calls: Flash=${apiCounts['gemini-2.5-flash']}, Pro=${apiCounts['gemini-2.5-pro']}, Image=${apiCounts['gemini-2.5-flash-image-preview']}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {counts.total > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-6 h-6 flex items-center justify-center">
            {counts.total}
          </span>
        )}
      </button>
      
      <div className={`fixed top-0 right-0 bottom-0 w-80 bg-gray-900/95 backdrop-blur-sm border-l-2 border-purple-500 z-50 p-4 text-white text-sm font-mono overflow-hidden flex flex-col transition-transform duration-300 ease-in-out ${panelAnimation}`}>
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h3 className="text-lg font-bold text-purple-400">Session Words</h3>
          <button 
            onClick={toggleOpen}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>
        
        {/* Summary Stats */}
        <div className="bg-black/50 rounded p-3 mb-4 flex-shrink-0">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-2xl font-bold text-cyan-400">{counts.total}</div>
              <div className="text-xs text-gray-400">Total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">{counts.mashup}</div>
              <div className="text-xs text-gray-400">Mashup</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">{counts.shrinker}</div>
              <div className="text-xs text-gray-400">Shrinker</div>
            </div>
          </div>
        </div>
        
        {/* API Request Stats */}
        <div className="bg-black/50 rounded p-3 mb-4 flex-shrink-0">
          <h4 className="text-sm font-bold text-cyan-400 mb-2">🔥 API Requests by Model</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Gemini 2.5 Flash:</span>
              <span className="text-green-400 font-bold">{apiCounts['gemini-2.5-flash']}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Flash Image:</span>
              <span className="text-blue-400 font-bold">{apiCounts['gemini-2.5-flash-image-preview']}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Gemini 2.5 Pro:</span>
              <span className="text-red-400 font-bold">{apiCounts['gemini-2.5-pro']}</span>
            </div>
            <div className="border-t border-gray-600 pt-1 mt-1">
              <div className="flex justify-between">
                <span className="text-gray-300 font-semibold">Total:</span>
                <span className="text-cyan-400 font-bold">
                  {apiCounts['gemini-2.5-flash'] + apiCounts['gemini-2.5-flash-image-preview'] + apiCounts['gemini-2.5-pro']}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Word Lists */}
        <div className="flex-grow overflow-y-auto space-y-4">
          {/* Mashup Words */}
          <div>
            <h4 className="text-sm font-bold text-purple-400 mb-2 flex items-center">
              🎨 Mashup Words ({mashupWords.length})
            </h4>
            <div className="bg-black/30 rounded p-2 max-h-32 overflow-y-auto">
              {mashupWords.length === 0 ? (
                <p className="text-gray-500 text-xs">No mashup words generated yet</p>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {mashupWords.map((word, index) => (
                    <span 
                      key={index} 
                      className="bg-purple-600/20 text-purple-300 px-2 py-1 rounded text-xs border border-purple-500/30"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Shrinker Words */}
          <div>
            <h4 className="text-sm font-bold text-green-400 mb-2 flex items-center">
              🧩 Shrinker Words ({shrinkerWords.length})
            </h4>
            <div className="bg-black/30 rounded p-2 max-h-32 overflow-y-auto">
              {shrinkerWords.length === 0 ? (
                <p className="text-gray-500 text-xs">No shrinker words generated yet</p>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {shrinkerWords.map((word, index) => (
                    <span 
                      key={index} 
                      className="bg-green-600/20 text-green-300 px-2 py-1 rounded text-xs border border-green-500/30"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* All Words (Combined) */}
          <div>
            <h4 className="text-sm font-bold text-cyan-400 mb-2 flex items-center">
              📋 All Session Words ({allWords.length})
            </h4>
            <div className="bg-black/30 rounded p-2 max-h-40 overflow-y-auto">
              {allWords.length === 0 ? (
                <p className="text-gray-500 text-xs">No words generated in this session</p>
              ) : (
                <div className="space-y-1">
                  {allWords.map((word, index) => {
                    const isMashup = mashupWords.includes(word);
                    const isShrinker = shrinkerWords.includes(word);
                    return (
                      <div 
                        key={index} 
                        className={`px-2 py-1 rounded text-xs flex justify-between items-center ${
                          isMashup ? 'bg-purple-600/10 border-l-2 border-purple-500' : 
                          isShrinker ? 'bg-green-600/10 border-l-2 border-green-500' : 
                          'bg-gray-600/10 border-l-2 border-gray-500'
                        }`}
                      >
                        <span className="text-gray-200">{word}</span>
                        <span className={`text-xs ${
                          isMashup ? 'text-purple-400' : 
                          isShrinker ? 'text-green-400' : 
                          'text-gray-400'
                        }`}>
                          {isMashup ? '🎨' : isShrinker ? '🧩' : '?'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-xs text-gray-500 flex-shrink-0">
          Words are tracked per session to prevent repetition
        </div>
      </div>
    </>
  );
};

export default SessionWordTracker;