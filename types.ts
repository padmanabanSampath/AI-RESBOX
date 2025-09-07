export enum GameState {
  Start,
  GameModeSelection,
  Loading,
  Playing,
  WordMashupPlaying,
  WordMashupTimeout,
  Result,
  WordMashupResult,
  GameOver
}

export type Difficulty = 'Easy' | 'Hard';
export type GameMode = 'WordShrinker' | 'WordMashup';

export interface BoxContent {
  inputText: string;
  content: string | null; // A letter OR a base64 image URL
  isLetter: boolean;
  isLoading: boolean;
}

export interface SolutionEntry {
  part: string;
  alternatives: string[];
}

export interface Puzzle {
  word: string;
  deconstructions: string[][]; // e.g., [["BACK", "P", "A", "C", "K"], ["B", "A", "C", "K", "PACK"]]
  solutions: SolutionEntry[]; // e.g., [{part: "BACK", alternatives: [...]}, {part: "PACK", alternatives: [...]}]
}

export interface VerificationResult {
    correct: boolean;
    reasoning: string;
}

export interface SubmissionPart {
    type: 'letter' | 'word';
    value: string | null;
}

export interface SolutionPart {
    part: string; // The original word part, e.g., "KEY"
    type: 'letter' | 'image';
    value: string; // The letter itself or the image URL
}

export interface WordMashupPuzzle {
    word: string;
    starterWord: string;
    starterImageUrl: string;
    objects: string[]; // The two main objects that should be in the final image
}

export interface MashupJudgment {
    score: number; // 0-10
    feedback: string;
    objectsFound: string[];
    mashupQuality: 'low' | 'medium' | 'high';
}
