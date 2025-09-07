import React, { useState, useEffect, useCallback } from 'react';
import GameBoard from './components/GameBoard';
import WordMashupBoard from './components/WordMashupBoard';
import Scoreboard from './components/Scoreboard';
import Timer from './components/Timer';
import Modal from './components/Modal';
import WordMashupResultModal from './components/WordMashupResultModal';
import TimeoutModal from './components/TimeoutModal';
import Loader from './components/Loader';
import SessionWordTracker from './components/SessionWordTracker';
import { GameState, BoxContent, Puzzle, SolutionPart, SubmissionPart, Difficulty, GameMode, WordMashupPuzzle, MashupJudgment } from './types';
import { generatePuzzle, verifyAnswer, generateImageForPart, clearGeneratedWords, generateWordMashupPuzzle, generateEditedMashupImage, judgeMashupCreation } from './services/geminiService';
import { initializeAiClient } from './services/geminiClient';

const GAME_DURATION = 90;

export default function App() {
  const [isClientInitialized, setIsClientInitialized] = useState(false);
  const [gameState, setGameState] = useState<GameState>(GameState.Start);
  const [currentGameMode, setCurrentGameMode] = useState<GameMode | null>(null);
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [mashupPuzzle, setMashupPuzzle] = useState<WordMashupPuzzle | null>(null);
  const [boxes, setBoxes] = useState<BoxContent[]>([]);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(GAME_DURATION);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [solution, setSolution] = useState<SolutionPart[] | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [prefetchedImages, setPrefetchedImages] = useState<Map<string, string>>(new Map());
  const [prefetchedPuzzles, setPrefetchedPuzzles] = useState<{ Easy: Puzzle | null; Hard: Puzzle | null }>({ Easy: null, Hard: null });
  const [prefetchedMashupPuzzle, setPrefetchedMashupPuzzle] = useState<WordMashupPuzzle | null>(null);
  const [startScreenAnimated, setStartScreenAnimated] = useState(false);
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty | null>(null);
  const [isPrefetching, setIsPrefetching] = useState(true);
  const [isMashupPrefetching, setIsMashupPrefetching] = useState(false);
  const [puzzlesAttended, setPuzzlesAttended] = useState<number>(0);
  const [puzzlesCorrect, setPuzzlesCorrect] = useState<number>(0);
  
  // Word Mashup specific states
  const [userEditPrompt, setUserEditPrompt] = useState<string>('');
  const [finalMashupImage, setFinalMashupImage] = useState<string | null>(null);
  const [mashupJudgment, setMashupJudgment] = useState<MashupJudgment | null>(null);

  useEffect(() => {
    const initClient = async () => {
      try {
        await initializeAiClient();
        setIsClientInitialized(true);
      } catch (error) {
        console.error("Failed to initialize AI Client:", error);
      }
    };
    initClient();
  }, []);

  useEffect(() => {
    if (gameState === GameState.Start) {
      const timer = setTimeout(() => setStartScreenAnimated(true), 100);
      return () => clearTimeout(timer);
    } else {
      setStartScreenAnimated(false);
    }
  }, [gameState]);

  useEffect(() => {
    if (isClientInitialized && gameState === GameState.Start && !prefetchedPuzzles.Easy && !prefetchedPuzzles.Hard && !prefetchedMashupPuzzle) {
      console.log("Pre-fetching initial puzzles...");
      setIsPrefetching(true);

      Promise.all([
        generatePuzzle('Easy'),
        generatePuzzle('Hard'),
        generateWordMashupPuzzle()
      ]).then(([easyPuzzle, hardPuzzle, mashupPuzzle]) => {
        setPrefetchedPuzzles({ Easy: easyPuzzle, Hard: hardPuzzle });
        setPrefetchedMashupPuzzle(mashupPuzzle);
      }).catch(err => {
        console.error("Failed to pre-fetch initial puzzles:", err);
      }).finally(() => {
        setIsPrefetching(false);
      });
    }
  }, [gameState, isClientInitialized]);

  const handleStartGame = useCallback(async (difficulty: Difficulty) => {
    if (gameState === GameState.Start) {
      setScore(0);
      setPuzzlesAttended(0);
      setPuzzlesCorrect(0);
    }
    setCurrentGameMode('WordShrinker');
    setCurrentDifficulty(difficulty);
    setPuzzlesAttended(prev => prev + 1);

    const setupGameWithPuzzle = (puzzleToStart: Puzzle) => {
      setPuzzle(puzzleToStart);
      setBoxes(Array.from({ length: puzzleToStart.deconstructions[0].length }, () => ({ inputText: '', content: null, isLetter: false, isLoading: false })));
      setGameState(GameState.Playing);
      setTimeLeft(GAME_DURATION);
      setPrefetchedImages(new Map());
      setIsCorrect(null);
      setSolution(null);
    };

    const fetchNextPuzzle = (diff: Difficulty) => {
      console.log(`Pre-fetching next ${diff} puzzle...`);
      generatePuzzle(diff)
        .then(nextPuzzle => {
          setPrefetchedPuzzles(prev => ({ ...prev, [diff]: nextPuzzle }));
          console.log(`Next ${diff} puzzle has been prefetched.`);
        })
        .catch(err => console.error(`Failed to pre-fetch next ${diff} puzzle:`, err));
    };

    const prefetched = prefetchedPuzzles[difficulty];
    if (prefetched) {
      console.log(`Starting game with prefetched ${difficulty} puzzle.`);
      setupGameWithPuzzle(prefetched);
      setPrefetchedPuzzles(prev => ({ ...prev, [difficulty]: null }));
      fetchNextPuzzle(difficulty);
    } else {
      console.log(`No prefetched puzzle for ${difficulty}, generating on-demand.`);
      setGameState(GameState.Loading);
      setLoadingMessage('Generating a new creative puzzle...');
      try {
        const newPuzzle = await generatePuzzle(difficulty);
        setupGameWithPuzzle(newPuzzle);
        fetchNextPuzzle(difficulty);
      } catch (error) {
        console.error("Failed to start game:", error);
        setLoadingMessage('Error starting game. Please try again.');
        setGameState(GameState.Start);
      }
    }
  }, [prefetchedPuzzles, gameState]);

  const handleStartWordMashup = useCallback(async () => {
    if (gameState === GameState.Start) {
      setScore(0);
      setPuzzlesAttended(0);
      setPuzzlesCorrect(0);
    }
    setCurrentGameMode('WordMashup');
    setPuzzlesAttended(prev => prev + 1);
    
    const setupMashupGame = (puzzleToStart: WordMashupPuzzle) => {
      setMashupPuzzle(puzzleToStart);
      setGameState(GameState.WordMashupPlaying);
      setTimeLeft(GAME_DURATION);
      setUserEditPrompt('');
      setFinalMashupImage(null);
      setMashupJudgment(null);
    };

    const fetchNextMashupPuzzle = () => {
      console.log('Pre-fetching next mashup puzzle...');
      setIsMashupPrefetching(true);
      generateWordMashupPuzzle()
        .then(nextPuzzle => {
          setPrefetchedMashupPuzzle(nextPuzzle);
          console.log('Next mashup puzzle has been prefetched.');
        })
        .catch(err => console.error('Failed to pre-fetch next mashup puzzle:', err))
        .finally(() => setIsMashupPrefetching(false));
    };

    if (prefetchedMashupPuzzle) {
      console.log('Starting mashup game with prefetched puzzle.');
      setupMashupGame(prefetchedMashupPuzzle);
      setPrefetchedMashupPuzzle(null);
      fetchNextMashupPuzzle();
    } else {
      console.log('No prefetched mashup puzzle, generating on-demand.');
      setGameState(GameState.Loading);
      setLoadingMessage('Creating a creative mashup puzzle...');
      
      try {
        const newMashupPuzzle = await generateWordMashupPuzzle();
        setupMashupGame(newMashupPuzzle);
        fetchNextMashupPuzzle();
      } catch (error) {
        console.error("Failed to start Word Mashup:", error);
        setLoadingMessage('Error starting mashup game. Please try again.');
        setGameState(GameState.Start);
      }
    }
  }, [gameState, prefetchedMashupPuzzle]);

  const handleMashupSubmit = useCallback(async (editPrompt: string) => {
    if (!mashupPuzzle) return;
    
    // ⚠️ CHECK TIME REMAINING: Don't proceed if time already expired
    if (timeLeft <= 0) {
      setGameState(GameState.WordMashupTimeout);
      return;
    }
    
    // 🛑 STOP TIMER: User has submitted, no more time pressure
    // The timer will naturally stop when gameState changes to WordMashupResult
    
    // Show modal immediately with loading states
    setUserEditPrompt(editPrompt);
    setFinalMashupImage(null); // Will show loading in modal
    setMashupJudgment(null); // Will show waiting state in modal
    setGameState(GameState.WordMashupResult);
    
    try {
      // 🎯 NO TIMEOUT: AI has unlimited time to process once user submits
      // Generate the edited mashup image
      const editedImageUrl = await generateEditedMashupImage(
        editPrompt,
        mashupPuzzle.starterImageUrl
      );
      setFinalMashupImage(editedImageUrl);
      
      // Get AI judgment
      const judgment = await judgeMashupCreation(
        mashupPuzzle,
        editPrompt,
        editedImageUrl
      );
      setMashupJudgment(judgment);
      
      // Add score based on judgment
      const bonusScore = Math.round(judgment.score * 2); // 0-20 bonus points
      setScore(prev => prev + bonusScore);
      
      if (judgment.score >= 6) {
        setPuzzlesCorrect(prev => prev + 1);
      }
      
    } catch (error) {
      console.error("Failed to create mashup:", error);
      // Show error message - no timeout since user already submitted
      setMashupJudgment({
        score: 0,
        feedback: "Oops! Something went wrong during processing. But your creativity counts!",
        objectsFound: [],
        mashupQuality: 'low'
      });
    }
  }, [mashupPuzzle]); // 📍 Removed timeLeft dependency since timer stops on submit

  useEffect(() => {
    if (gameState === GameState.Playing && puzzle) {
      const allPicturableParts = new Set<string>();
      puzzle.deconstructions.forEach(decon => {
        decon.forEach(part => {
          if (part.length > 1) {
            allPicturableParts.add(part);
          }
        });
      });

      allPicturableParts.forEach(part => {
        generateImageForPart(part)
          .then(imageUrl => {
            setPrefetchedImages(prev => new Map(prev).set(part, imageUrl));
          })
          .catch(err => console.error(`Failed to pre-fetch image for "${part}":`, err));
      });
    }
  }, [puzzle, gameState]);

  useEffect(() => {
    if (gameState === GameState.Playing && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft <= 0 && gameState === GameState.Playing) {
      if (!puzzle) return;
      setIsCorrect(false);
      setGameState(GameState.Result);
      const correctSolution: SolutionPart[] = puzzle.deconstructions[0].map(part => {
        if (part.length === 1) {
          return { part, type: 'letter', value: part };
        }
        return { part, type: 'image', value: prefetchedImages.get(part) || '' };
      });
      setSolution(correctSolution);
    }
  }, [gameState, timeLeft, puzzle, prefetchedImages]);
  useEffect(() => {
    if (gameState === GameState.WordMashupPlaying && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft <= 0 && gameState === GameState.WordMashupPlaying) {
      // Time's up for mashup game - show timeout modal instead of result modal
      setGameState(GameState.WordMashupTimeout);
    }
  }, [gameState, timeLeft, mashupPuzzle]);

  const handleVerificationSuccess = () => {
      setIsCorrect(true);
      setScore(prev => prev + 5 + timeLeft);
      setPuzzlesCorrect(prev => prev + 1);
      setGameState(GameState.Result);
  }

  const handleSubmit = async () => {
    if (!puzzle) return;
    setGameState(GameState.Loading);
    setLoadingMessage('Checking your answer...');

    const userSubmissionParts = boxes.map(box => box.inputText.trim().toUpperCase());
    let localCheckPassed = false;

    for (const deconstruction of puzzle.deconstructions) {
        if (deconstruction.length !== userSubmissionParts.length) {
            continue;
        }

        let currentDeconstructionMatch = true;
        for (let i = 0; i < deconstruction.length; i++) {
            const expectedPart = deconstruction[i];
            const userPart = userSubmissionParts[i];

            if (expectedPart.length === 1) {
                if (expectedPart !== userPart) {
                    currentDeconstructionMatch = false;
                    break;
                }
            } else {
                const solutionEntry = puzzle.solutions.find(s => s.part === expectedPart);
                const acceptableAnswers = solutionEntry ? solutionEntry.alternatives : [];
                if (!acceptableAnswers.includes(userPart)) {
                    currentDeconstructionMatch = false;
                    break;
                }
            }
        }

        if (currentDeconstructionMatch) {
            localCheckPassed = true;
            break;
        }
    }

    if (localCheckPassed) {
        handleVerificationSuccess();
        return;
    }

    setLoadingMessage("That's a creative answer! Let's see what the AI thinks...");
    try {
      const submissions: SubmissionPart[] = boxes.map(box => ({
        type: box.isLetter ? 'letter' : 'word',
        value: box.inputText.trim().toUpperCase(),
      }));

      if (boxes.some(b => b.content === null)) {
          throw new Error("Not all boxes are filled.");
      }

      const result = await verifyAnswer(puzzle, submissions);
      setIsCorrect(result.correct);
      if (result.correct) {
        handleVerificationSuccess();
      } else {
        setLoadingMessage('Generating the correct solution...');
        const correctSolution: SolutionPart[] = puzzle.deconstructions[0].map(part => {
            if (part.length === 1) {
              return { part, type: 'letter', value: part };
            }
            return { part, type: 'image', value: prefetchedImages.get(part) || '' };
        });
        setSolution(correctSolution);
        setGameState(GameState.Result);
      }
    } catch (error) {
      console.error("Failed to verify answer:", error);
      setLoadingMessage('Could not verify answer. Please try again.');
      setGameState(GameState.Playing);
    }
  };
  
  const handleEndGame = () => {
    setGameState(GameState.GameOver);
  };

  const handlePlayAgainFromEnd = () => {
    // Clear generated words when starting a completely new session
    clearGeneratedWords();
    // Reset prefetched puzzles
    setPrefetchedPuzzles({ Easy: null, Hard: null });
    setPrefetchedMashupPuzzle(null);
    setGameState(GameState.Start);
  };

  const allBoxesFilled = puzzle ? boxes.every(box => box.content !== null) : false;

  const renderGameContent = () => {
    switch (gameState) {
      case GameState.Loading:
        return <Loader message={loadingMessage} />;
      case GameState.Playing:
        if (!puzzle) return <Loader message="Loading puzzle..." />;
        return (
          <>
            <div className="flex justify-between items-center w-full max-w-4xl mx-auto px-4">
              <Scoreboard score={score} />
              <Timer timeLeft={timeLeft} />
            </div>
            <GameBoard
              puzzle={puzzle}
              boxes={boxes}
              setBoxes={setBoxes}
              prefetchedImages={prefetchedImages}
            />
            <button
              onClick={handleSubmit}
              disabled={!allBoxesFilled}
              className="mt-8 px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 transition-all duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed disabled:shadow-none"
            >
              Submit Answer
            </button>
          </>
        );
      case GameState.WordMashupPlaying:
        if (!mashupPuzzle) return <Loader message="Loading mashup puzzle..." />;
        return (
          <>
            <div className="flex justify-between items-center w-full max-w-4xl mx-auto px-4">
              <Scoreboard score={score} />
              <Timer timeLeft={timeLeft} />
            </div>
            <WordMashupBoard
              puzzle={mashupPuzzle}
              onSubmit={handleMashupSubmit}
              isLoading={false}
              timeLeft={timeLeft}
              score={score}
              puzzlesCorrect={puzzlesCorrect}
            />
          </>
        );
      case GameState.WordMashupTimeout:
        return (
          <TimeoutModal
            onTryAgain={() => handleStartWordMashup()}
            onEndGame={handleEndGame}
          />
        );
      case GameState.Result:
         if (!puzzle) return <Loader message="Loading results..." />;
        return (
          <Modal
            isCorrect={isCorrect}
            word={puzzle.word}
            solution={solution}
            onEndGame={handleEndGame}
            onPlayAgain={
              isCorrect && currentDifficulty
                ? () => handleStartGame(currentDifficulty)
                : () => setGameState(GameState.Start)
            }
          />
        );
      case GameState.WordMashupResult:
        if (!mashupPuzzle) return <Loader message="Loading results..." />;
        return (
          <WordMashupResultModal
            puzzle={mashupPuzzle}
            userPrompt={userEditPrompt}
            finalImageUrl={finalMashupImage}
            judgment={mashupJudgment}
            timeLeft={timeLeft}
            onPlayAgain={() => handleStartWordMashup()}
            onEndGame={handleEndGame}
          />
        );
      case GameState.GameOver:
        return (
          <div className="text-center w-full max-w-2xl bg-gray-900 bg-opacity-70 backdrop-blur-md p-8 rounded-2xl shadow-2xl border-2 border-indigo-500 animate-pop-in">
            <h2 className="text-5xl font-extrabold text-white mb-4 animate-fade-in-up" style={{ animationDelay: '100ms', opacity: 0 }}>Game Over!</h2>
            <p className="text-lg text-gray-300 mb-8 animate-fade-in-up" style={{ animationDelay: '200ms', opacity: 0 }}>Here are your final stats:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center mb-8">
              <div className="bg-white/10 p-4 rounded-lg animate-fade-in-up" style={{ animationDelay: '300ms', opacity: 0 }}>
                <p className="text-4xl font-bold text-amber-400">{score}</p>
                <p className="text-sm text-gray-400">Total Score</p>
              </div>
              <div className="bg-white/10 p-4 rounded-lg animate-fade-in-up" style={{ animationDelay: '400ms', opacity: 0 }}>
                <p className="text-4xl font-bold text-cyan-400">{puzzlesAttended}</p>
                <p className="text-sm text-gray-400">Puzzles Attended</p>
              </div>
              <div className="bg-white/10 p-4 rounded-lg animate-fade-in-up" style={{ animationDelay: '500ms', opacity: 0 }}>
                <p className="text-4xl font-bold text-green-400">{puzzlesCorrect}</p>
                <p className="text-sm text-gray-400">Puzzles Solved</p>
              </div>
            </div>
            <button onClick={handlePlayAgainFromEnd} className="mt-4 px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 transform hover:scale-105 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '600ms', opacity: 0 }}>
              Play Again
            </button>
          </div>
        );
      case GameState.Start:
      default:
        return (
          <div className="text-center">
            <div
              style={{ transitionDelay: '100ms' }}
              className={`opacity-0 ${startScreenAnimated ? 'animate-fade-in-up' : ''}`}
            >
              <h1 className="text-6xl font-extrabold tracking-tighter mb-4" style={{ textShadow: '0 0 15px rgba(79, 70, 229, 0.8)' }}>AI RESBOX</h1>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">Shrink Words. Mash Meanings.<br />Not a Game. A New Way to See Words.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              {/* Word Shrinker Game */}
              <div className="bg-white/10 rounded-xl p-6 border border-gray-600 max-w-sm">
                <div
                  style={{ transitionDelay: '200ms' }}
                  className={`opacity-0 ${startScreenAnimated ? 'animate-fade-in-up' : ''}`}
                >
                  <h3 className="text-2xl font-bold text-cyan-400 mb-3">🧩 Word Shrinker</h3>
                  <p className="text-gray-300 mb-4 text-sm">Break down words into pictures and letters. Perfect your deconstruction skills!</p>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => handleStartGame('Easy')}
                      disabled={isPrefetching}
                      className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700 transform hover:scale-105 transition-all duration-300 disabled:bg-gray-500 disabled:cursor-wait"
                    >
                      {isPrefetching ? 'Preparing Puzzle...' : 'Easy Mode'}
                    </button>
                    <button
                      onClick={() => handleStartGame('Hard')}
                      disabled={isPrefetching}
                      className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg shadow-lg hover:bg-red-700 transform hover:scale-105 transition-all duration-300 disabled:bg-gray-500 disabled:cursor-wait"
                    >
                      {isPrefetching ? 'Preparing Puzzle...' : 'Hard Mode'}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Word Mashup Game */}
              <div className="bg-white/10 rounded-xl p-6 border border-gray-600 max-w-sm">
                <div
                  style={{ transitionDelay: '300ms' }}
                  className={`opacity-0 ${startScreenAnimated ? 'animate-fade-in-up' : ''}`}
                >
                  <h3 className="text-2xl font-bold text-purple-400 mb-3">🎨 Word Mashup</h3>
                  <p className="text-gray-300 mb-4 text-sm">Get a starter image and creatively mashup it with another object to form a word!</p>
                  <button
                    onClick={handleStartWordMashup}
                    disabled={isPrefetching || isMashupPrefetching}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg shadow-lg hover:from-purple-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 disabled:bg-gray-500 disabled:cursor-wait disabled:from-gray-500 disabled:to-gray-500 disabled:transform-none"
                  >
                    {isPrefetching ? 'Preparing Mashup...' : isMashupPrefetching ? 'Preparing Mashup...' : '🎨 Start Mashup!'}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Hackathon Attribution */}
            <div className="mt-12 text-center max-w-2xl mx-auto">
              <div
                style={{ transitionDelay: '400ms' }}
                className={`opacity-0 ${startScreenAnimated ? 'animate-fade-in-up' : ''}`}
              >
                <div className="bg-white/5 rounded-xl p-6 border border-gray-600">
                  <p className="text-sm text-gray-400 mb-3 font-medium">
                    Hackathon-born. Concept-driven. Nano Banana-powered.
                  </p>
                  <p className="text-sm text-gray-400 mb-3">
                    "Made for Nano Banana Hackathon — but built to outlive it."
                  </p>
                  <p className="text-sm text-gray-400 mb-4">
                    "Hackathon project? Yes. Final form? Not even close."
                  </p>
                  <p className="text-xs text-gray-500 italic">
                    imagined by <span className="text-purple-400 font-medium">PADMANABAN SAMPATH</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  const renderAppContent = () => {
    if (!isClientInitialized) {
      return <Loader message="Initializing AI Client..." />;
    }

    return (
      <>
        {renderGameContent()}
        <SessionWordTracker />
      </>
    );
  };
  
  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-gray-900 bg-grid-white/[0.05] relative">
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-gray-900 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      {renderAppContent()}
    </main>
  );
}