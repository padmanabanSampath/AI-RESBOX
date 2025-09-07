import { Type, Modality } from "@google/genai";

import { VerificationResult, Puzzle, SubmissionPart, Difficulty, WordMashupPuzzle, MashupJudgment } from "../types";
import { getAiClient } from './geminiClient';
import { logDev } from "./devLogger";

// 🚫 WORD REPETITION PREVENTION: Track generated words per session
const generatedWords = new Set<string>();
const mashupWords = new Set<string>();
const shrinkerWords = new Set<string>();

// 🎯 BIAS REDUCTION: Reduce overused words
const overusedWords = new Set(['STARFISH', 'FOOTBALL', 'BASKETBALL', 'BASEBALL']);

// 📊 API REQUEST TRACKING: Monitor API usage per model
const apiRequestCounts = {
  'gemini-2.5-pro': 0,
  'gemini-2.5-flash': 0,
  'gemini-2.5-flash-image-preview': 0
};

// 🔒 CONCURRENCY CONTROL: Prevent race conditions
const activeRequests = new Map<string, Promise<any>>();

export function clearGeneratedWords() {
  generatedWords.clear();
  mashupWords.clear();
  shrinkerWords.clear();
}

export function getGeneratedWordsCount(): number {
  return generatedWords.size;
}

// 📊 API TRACKING FUNCTIONS
export function getApiRequestCounts() {
  return { ...apiRequestCounts };
}

export function resetApiRequestCounts() {
  Object.keys(apiRequestCounts).forEach(key => {
    apiRequestCounts[key as keyof typeof apiRequestCounts] = 0;
  });
}

function logApiRequest(model: string, operation: string) {
  if (model in apiRequestCounts) {
    apiRequestCounts[model as keyof typeof apiRequestCounts]++;
  }
  console.log(`🔥 API Request #${apiRequestCounts[model as keyof typeof apiRequestCounts]} - Model: ${model}, Operation: ${operation}`);
}

// 🎨 MASHUP SPECIFIC TRACKING
export function getMashupWordsCount(): number {
  return mashupWords.size;
}

export function getShrinkerWordsCount(): number {
  return shrinkerWords.size;
}

export function getGeneratedWordsList(): string[] {
  return Array.from(generatedWords).sort();
}

export function getMashupWordsList(): string[] {
  return Array.from(mashupWords).sort();
}

export function getShrinkerWordsList(): string[] {
  return Array.from(shrinkerWords).sort();
}

// 🎯 GAME-SPECIFIC WORD TRACKING
function addShrinkerWord(word: string): void {
  const wordUpper = word.toUpperCase();
  generatedWords.add(wordUpper);
  shrinkerWords.add(wordUpper);
}

function addMashupWord(word: string): void {
  const wordUpper = word.toUpperCase();
  generatedWords.add(wordUpper);
  mashupWords.add(wordUpper);
}

// ✅ SCHEMA UPGRADE: Enforce 3+ letter parts in solutions
const puzzleSchema = {
  type: Type.OBJECT,
  properties: {
    word: { type: Type.STRING },
    deconstructions: {
      type: Type.ARRAY,
      items: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    },
    solutions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          part: { 
            type: Type.STRING,
            minLength: 3 // 🚫 NO 2-letter parts allowed in solutions
          },
          alternatives: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["part", "alternatives"]
      }
    }
  },
  required: ["word", "deconstructions", "solutions"]
};

export async function generatePuzzle(difficulty: Difficulty, maxRetries: number = 3): Promise<Puzzle> {
    const ai = getAiClient();
    if (!ai) throw new Error("AI client not initialized.");

    const systemInstruction = `You are a creative puzzle generator. Output ONLY a single, valid JSON object. Follow instructions EXACTLY.`;

    // 🚫 Create exclusion list for prompt
    const usedWordsArray = Array.from(generatedWords);
    const exclusionText = usedWordsArray.length > 0 
        ? `\n\nIMPORTANT: DO NOT use these already generated words: ${usedWordsArray.join(', ')}`
        : '';

    // ✅ PROMPT UPGRADE: Crystal clear rules, ban 2-letter groups
    const easyPrompt = `Generate an EASY puzzle.
RULES:
1. Choose a common 6-12 letter word.
2. Create 1-2 deconstructions.
   - MUST contain exactly ONE picturable part (3+ letters, concrete noun like "CAR", "SUN").
   - ALL other parts MUST be SINGLE LETTERS (e.g., "T", "E", "R" — NEVER "ER", "IN", "AS").
   - Example: "CARPENTER" → ["CAR", "P", "E", "N", "T", "E", "R"] ✅
   - BAD: ["CAR", "PEN", "T", "ER"] ❌ — "ER" is invalid.
3. For the picturable part, provide 3+ alternatives (include itself first).
4. FINAL CHECK: Concatenation MUST equal word. Only picturable part needs solution.${exclusionText}

Example:
{
  "word": "BACKPACK",
  "deconstructions": [["BACK", "P", "A", "C", "K"]],
  "solutions": [{"part": "BACK", "alternatives": ["BACK", "REAR", "SPINE"]}]
}

Generate a new EASY puzzle.`;

    const hardPrompt = `Generate a HARD puzzle.
RULES:
1. Choose a common 8-15 letter word.
2. Create 1-2 deconstructions.
   - MUST contain MAX TWO picturable parts (3+ letters, concrete nouns like "KEY", "BOARD").
   - ALL other parts MUST be SINGLE LETTERS (e.g., "T", "E", "R" — NEVER "ER", "IN", "AS").
   - CRITICAL: Deconstructions must NOT be just two whole words like ["BACK", "GROUND"]. Must include letters!
   - Example: "CARPENTER" → ["CAR", "P", "E", "N", "T", "E", "R"] ✅
   - Example: "BACKGROUND" → ["B", "A", "C", "K", "GROUND"] ✅ or ["BACK", "G", "R", "O", "U", "N", "D"] ✅
   - BAD: ["BACK", "GROUND"] ❌ — No individual letters!
   - BAD: ["CAR", "PEN", "TER"] ❌ — "TER" is invalid.
3. For EACH picturable part, provide 3+ alternatives (include itself first).
4. FINAL CHECK: Concatenation MUST equal word. Only picturable parts need solutions.${exclusionText}

Example:
{
  "word": "KEYBOARD",
  "deconstructions": [["K", "E", "Y", "BOARD"]],
  "solutions": [
    {"part": "BOARD", "alternatives": ["BOARD", "PLANK", "PANEL"]}
  ]
}

Generate a new HARD puzzle.`;
  
    const prompt = difficulty === 'Hard' ? hardPrompt : easyPrompt;
    const model = 'gemini-2.5-flash'; // 🚀 SWITCHED TO FLASH: Better rate limits

    for (let i = 0; i < maxRetries; i++) {
        let jsonStr = "{}";
        try {
            logApiRequest(model, `generatePuzzle-${difficulty}`);
            const response = await ai.models.generateContent({
                model: model,
                contents: prompt,
                config: {
                    systemInstruction: systemInstruction,
                    responseMimeType: "application/json",
                    responseSchema: puzzleSchema,
                }
            });
            jsonStr = response.text.trim();
            
            const puzzle = JSON.parse(jsonStr) as Puzzle;
            const wordUpper = puzzle.word.toUpperCase();
            const solutionPartsSet = new Set(puzzle.solutions.map(s => s.part.toUpperCase()));
            
            // ✅ VALIDATION UPGRADE: Only check 3+ letter parts for solutions
            const validDeconstructions = puzzle.deconstructions.filter(decon => {
                // Check concatenation
                if (decon.map(p => p.toUpperCase()).join('') !== wordUpper) {
                    return false;
                }
                // Only 3+ letter parts need solutions
                const picturableParts = decon.filter(p => p.length >= 3).map(p => p.toUpperCase());
                return picturableParts.every(part => solutionPartsSet.has(part));
            });

            if (validDeconstructions.length > 0) {
                // 🔥 HARD MODE VALIDATION: Ensure deconstructions contain letters
                if (difficulty === 'Hard') {
                    const hasValidHardDeconstruction = validDeconstructions.some(decon => {
                        const picturableParts = decon.filter(p => p.length >= 3);
                        const singleLetters = decon.filter(p => p.length === 1);
                        // Hard mode must have at least some single letters AND max 2 picturable parts
                        return singleLetters.length > 0 && picturableParts.length <= 2;
                    });
                    
                    if (!hasValidHardDeconstruction) {
                        const errorMsg = "Hard mode puzzle must contain individual letters, not just whole words.";
                        console.warn(`Attempt ${i + 1} failed: ${errorMsg}`, puzzle);
                        logDev({ attempt: i + 1, data: jsonStr, success: false, error: errorMsg });
                        continue;
                    }
                }

                puzzle.word = wordUpper;
                puzzle.deconstructions = validDeconstructions.map(decon => decon.map(p => p.toUpperCase()));
                
                // Filter solutions to only used parts
                const allUsedParts = new Set<string>();
                validDeconstructions.forEach(decon => {
                    decon.forEach(part => {
                        if (part.length >= 3) {
                            allUsedParts.add(part.toUpperCase());
                        }
                    });
                });

                puzzle.solutions = puzzle.solutions
                    .filter(sol => allUsedParts.has(sol.part.toUpperCase()))
                    .map(solution => ({
                        part: solution.part.toUpperCase(),
                        alternatives: solution.alternatives.map(alt => alt.toUpperCase())
                    }));
                
                // 🎯 TRACK GENERATED WORD to prevent repetition
                addShrinkerWord(wordUpper);
                
                logDev({ attempt: i + 1, data: JSON.stringify(puzzle, null, 2), success: true });
                return puzzle;
            }
            
            const errorMsg = "Deconstruction failed: bad concat or missing solutions for 3+ letter parts.";
            console.warn(`Attempt ${i + 1} failed: ${errorMsg}`, puzzle);
            logDev({ attempt: i + 1, data: jsonStr, success: false, error: errorMsg });

        } catch (error) {
            const errorMsg = "Exception during generation/parsing.";
            console.warn(`Attempt ${i + 1} failed: ${errorMsg}`, error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            logDev({ attempt: i + 1, data: jsonStr, success: false, error: `${errorMsg}\n${errorMessage}` });
        }
    }

    // 🆘 FALLBACK: Return demo puzzle if all retries fail (for hackathon safety)
    const demoPuzzle: Puzzle = {
        word: "STARFISH",
        deconstructions: [["STAR", "F", "I", "S", "H"]],
        solutions: [
            { part: "STAR", alternatives: ["STAR", "SUN", "CELESTIAL"] }
        ]
    };
    console.warn("All retries failed. Returning demo puzzle.");
    
    // Track demo puzzle word too
    addShrinkerWord("STARFISH");
    
    return demoPuzzle;
}

// 🎨 WORD MASHUP GAME: Generate mashup puzzles with concurrency control
export async function generateWordMashupPuzzle(maxRetries: number = 3): Promise<WordMashupPuzzle> {
    const ai = getAiClient();
    if (!ai) throw new Error("AI client not initialized.");

    // 🔒 CONCURRENCY CONTROL: Prevent multiple simultaneous mashup generations
    const requestKey = 'generateWordMashupPuzzle';
    if (activeRequests.has(requestKey)) {
        console.log('⚠️ Waiting for existing mashup generation to complete...');
        return await activeRequests.get(requestKey)!;
    }

    // Create exclusion list for mashup words too
    const usedWordsArray = Array.from(generatedWords);
    const biasReductionWords = Array.from(overusedWords);
    const allExcludedWords = [...usedWordsArray, ...biasReductionWords];
    console.log(`📊 Mashup Generation - Excluding ${allExcludedWords.length} words:`, allExcludedWords);
    const exclusionText = allExcludedWords.length > 0 
        ? `\n\nIMPORTANT: DO NOT use these already generated or overused words: ${allExcludedWords.join(', ')}`
        : '';

    const prompt = `Generate a WORD MASHUP puzzle.

RULES:
1. Choose a compound word (6-12 letters) that clearly contains TWO picturable objects.
2. The word must be decomposable into exactly TWO concrete nouns.
3. Pick one of the two objects as the "starter" - this will be given to the player as a starting image.
4. The other object is what the player must add/mashup into the image.

EXAMPLES:
- "SUNFLOWER" → objects: ["SUN", "FLOWER"], starter could be "SUN"
- "KEYBOARD" → objects: ["KEY", "BOARD"], starter could be "KEY"
- "DOGHOUSE" → objects: ["DOG", "HOUSE"], starter could be "DOG"
- "SNOWMAN" → objects: ["SNOW", "MAN"], starter could be "SNOW"
- "FIREWORKS" → objects: ["FIRE", "WORKS"], starter could be "FIRE"
- "BUTTERFLY" → objects: ["BUTTER", "FLY"], starter could be "BUTTER"${exclusionText}

Respond with JSON:
{
  "word": "SUNFLOWER",
  "objects": ["SUN", "FLOWER"],
  "starterWord": "SUN"
}

Generate a new mashup puzzle.`;

    const requestPromise = (async () => {

    for (let i = 0; i < maxRetries; i++) {
        try {
            logApiRequest('gemini-2.5-flash', 'generateWordMashupPuzzle');
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash', // 🚀 SWITCHED TO FLASH
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            word: { type: Type.STRING },
                            objects: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING }
                            },
                            starterWord: { type: Type.STRING }
                        },
                        required: ["word", "objects", "starterWord"]
                    }
                }
            });

            const puzzleData = JSON.parse(response.text.trim());
            
            // Validate the puzzle
            if (puzzleData.objects.length === 2 && 
                puzzleData.objects.includes(puzzleData.starterWord.toUpperCase())) {
                
                // Generate starter image using mashup-specific style
                const starterImageUrl = await generateMashupStarterImage(puzzleData.starterWord);
                
                const mashupPuzzle: WordMashupPuzzle = {
                    word: puzzleData.word.toUpperCase(),
                    starterWord: puzzleData.starterWord.toUpperCase(),
                    starterImageUrl,
                    objects: puzzleData.objects.map((obj: string) => obj.toUpperCase())
                };
                
                // Track generated word
                addMashupWord(mashupPuzzle.word);
                
                logDev({ attempt: i + 1, data: JSON.stringify(mashupPuzzle, null, 2), success: true });
                return mashupPuzzle;
            }
            
            const errorMsg = "Invalid mashup puzzle: objects must be exactly 2 and include starter word.";
            logDev({ attempt: i + 1, data: response.text.trim(), success: false, error: errorMsg });
            
        } catch (error) {
            const errorMsg = "Exception during mashup puzzle generation.";
            console.warn(`Attempt ${i + 1} failed: ${errorMsg}`, error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            logDev({ attempt: i + 1, data: "{}", success: false, error: `${errorMsg}\n${errorMessage}` });
        }
    }

    // Fallback mashup puzzle
    const fallbackPuzzle: WordMashupPuzzle = {
        word: "STARFISH",
        starterWord: "STAR", 
        starterImageUrl: await generateMashupStarterImage("STAR"),
        objects: ["STAR", "FISH"]
    };
    
    addMashupWord("STARFISH");
    console.warn("All mashup retries failed. Returning fallback puzzle.");
    return fallbackPuzzle;
    })();
    
    activeRequests.set(requestKey, requestPromise);
    try {
        const result = await requestPromise;
        return result;
    } finally {
        activeRequests.delete(requestKey);
    }
}

// 🎨 WORD MASHUP: Generate edited image based on user prompt
export async function generateEditedMashupImage(
    userEditPrompt: string,
    starterImageUrl: string
): Promise<string> {
    const ai = getAiClient();
    if (!ai) throw new Error("AI client not initialized.");

    try {
        // Extract base64 data from the starter image URL
        const base64Data = starterImageUrl.split(',')[1]; // Remove data:image/png;base64, prefix
        const mimeType = starterImageUrl.split(';')[0].split(':')[1]; // Extract mime type
        
        const prompt = [
            { 
                text: userEditPrompt
            },
            {
                inlineData: {
                    mimeType: mimeType,
                    data: base64Data,
                },
            },
        ];

        logApiRequest('gemini-2.5-flash-image-preview', 'generateEditedMashupImage');
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: prompt,
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
                const base64ImageBytes: string = part.inlineData.data;
                const responseMimeType = part.inlineData.mimeType;
                return `data:${responseMimeType};base64,${base64ImageBytes}`;
            }
        }
        
        throw new Error("No edited image returned.");
    } catch (error) {
        console.error("Mashup image edit error:", error);
        throw new Error("Failed to generate edited mashup image.");
    }
}

// 🎨 WORD MASHUP: Judge user's creative image edit
export async function judgeMashupCreation(
    puzzle: WordMashupPuzzle, 
    userEditPrompt: string, 
    finalImageUrl: string
): Promise<MashupJudgment> {
    const ai = getAiClient();
    if (!ai) throw new Error("AI client not initialized.");

    try {
        // Extract base64 data from the final image URL
        const base64Data = finalImageUrl.split(',')[1]; // Remove data:image/png;base64, prefix
        const mimeType = finalImageUrl.split(';')[0].split(':')[1]; // Extract mime type
        
        const prompt = [
            { 
                text: `You are a fun, creative judge for a word mashup game! 

TASK: Rate the user's creative image mashup by analyzing the PROVIDED IMAGE.

GAME CONTEXT:
- Target word: "${puzzle.word}"
- Required objects: ${puzzle.objects.join(' + ')}
- User's edit prompt: "${userEditPrompt}"

JUDGING RULES (analyze the IMAGE, not just the prompt):
1. Image must contain TWO clear objects from the word.
2. Objects must be VISUALLY MASHED (not just placed together).
3. Creativity, humor, and surprise earn bonus points.
4. Judge based on what you SEE in the image, not just the description.

SCORING GUIDE:
- 8-10: Amazing mashup! Creative, clear objects, well-integrated
- 6-7: Good mashup with clear objects, decent integration
- 4-5: Objects present but basic integration
- 1-3: Weak mashup, unclear objects or poor integration
- 0: No clear mashup or missing objects

Respond with JSON:
{
  "score": 0-10,
  "feedback": "Short, fun feedback (e.g., 'Fish biting star? Hilarious! 9/10')",
  "objectsFound": ["STAR", "FISH"],
  "mashupQuality": "low/medium/high"
}

Be encouraging and fun in your feedback!`
            },
            {
                inlineData: {
                    mimeType: mimeType,
                    data: base64Data,
                },
            },
        ];

        logApiRequest('gemini-2.5-flash', 'judgeMashupCreation');
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", // 🚀 SWITCHED TO FLASH
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.INTEGER },
                        feedback: { type: Type.STRING },
                        objectsFound: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        },
                        mashupQuality: { type: Type.STRING }
                    },
                    required: ["score", "feedback", "objectsFound", "mashupQuality"]
                }
            }
        });

        const judgment = JSON.parse(response.text.trim()) as MashupJudgment;
        
        // Ensure score is within bounds
        judgment.score = Math.max(0, Math.min(10, judgment.score));
        
        return judgment;

    } catch (error) {
        console.error("Mashup judgment error:", error);
        return {
            score: 5,
            feedback: "Couldn't judge properly, but nice try! Keep experimenting!",
            objectsFound: puzzle.objects,
            mashupQuality: "medium"
        };
    }
}
export async function generateImageForPart(prompt: string): Promise<string> {
    const ai = getAiClient();
    if (!ai) throw new Error("AI client not initialized.");

    try {
        // 🎯 WORD SHRINKER STYLE: Clean, minimal icons (original style)
        const descriptivePrompt = `Create a clean, simple, icon-style image representing "${prompt}", minimalist vector art, transparent background.`;

        logApiRequest('gemini-2.5-flash-image-preview', 'generateImageForPart');
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image-preview',
          contents: {
            parts: [{ text: descriptivePrompt }],
          },
          config: {
              responseModalities: [Modality.IMAGE, Modality.TEXT],
          },
        });
        
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
                const base64ImageBytes: string = part.inlineData.data;
                const mimeType = part.inlineData.mimeType;
                return `data:${mimeType};base64,${base64ImageBytes}`;
            }
        }
        
        throw new Error("No image returned.");
    } catch (error) {
        console.error("Image gen error:", error);
        throw new Error("Image generation failed.");
    }
}

// 🎨 MASHUP SPECIFIC: Generate kawaii sticker images for mashup starter images
export async function generateMashupStarterImage(prompt: string): Promise<string> {
    const ai = getAiClient();
    if (!ai) throw new Error("AI client not initialized.");

    try {
        // 🎨 KAWAII STICKER TEMPLATE: Use consistent sticker format for mashup images
        const descriptivePrompt = `A kawaii-style sticker of a ${prompt.toLowerCase()}. The design should have bold, clean outlines, simple cel-shading, and a vibrant color palette. The background must be white.`;

        logApiRequest('gemini-2.5-flash-image-preview', 'generateMashupStarterImage');
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image-preview',
          contents: {
            parts: [{ text: descriptivePrompt }],
          },
          config: {
              responseModalities: [Modality.IMAGE, Modality.TEXT],
          },
        });
        
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
                const base64ImageBytes: string = part.inlineData.data;
                const mimeType = part.inlineData.mimeType;
                return `data:${mimeType};base64,${base64ImageBytes}`;
            }
        }
        
        throw new Error("No image returned.");
    } catch (error) {
        console.error("Mashup image gen error:", error);
        throw new Error("Mashup image generation failed.");
    }
}

// ✅ VERIFICATION — unchanged
export async function verifyAnswer(puzzle: Puzzle, submissions: SubmissionPart[]): Promise<VerificationResult> {
    const ai = getAiClient();
    if (!ai) throw new Error("AI client not initialized.");

    try {
        const submissionValues = submissions.map(s => s.value || '');
        const prompt = `You are the judge in a creative word puzzle game. The target word is "${puzzle.word}".
The user was given the word and ${submissionValues.length} boxes to fill.
The user submitted the following deconstruction: [${submissionValues.map(s => `"${s}"`).join(', ')}].

Your task is to determine if the user's submission is a valid and creative deconstruction of the target word.

Follow these rules for judging:
1.  **CRITICAL: Concatenation Check.** The submitted parts, when joined together, MUST perfectly spell the target word. If they don't, the answer is incorrect. No exceptions. (e.g., for "GOLDFISH", ["G", "O", "L", "D", "FISH"] is correct because "G"+"O"+"L"+"D"+"FISH" = "GOLDFISH").
2.  **Word Validity Check.** Any submitted part that is longer than a single letter must be a real, meaningful English word. (e.g., "FISH" is a valid word).
3.  **Creative Merit.** The deconstruction should be logical and clever. Reward creative but valid interpretations.

Example Judgment:
- Word: "GOLDFISH"
- Submission: ["GOLD", "F", "I", "S", "H"]
- Judgment: Correct. Concatenation is perfect, and "GOLD" is a valid word.

Example Judgment:
- Word: "GOLDFISH"
- Submission: ["G", "O", "L", "D", "FISH"]
- Judgment: Correct. Concatenation is perfect, and "FISH" is a valid word. This is an excellent alternative solution.

Example Judgment:
- Word: "KEYBOARD"
- Submission: ["KEY", "B", "OAR", "D"]
- Judgment: Correct. Concatenation is perfect, and both "KEY" and "OAR" are valid words. While unusual, it's a valid creative interpretation.

Example Judgment:
- Word: "GOLDFISH"
- Submission: ["GO", "OLD", "FISH"]
- Judgment: Incorrect. "GO"+"OLD"+"FISH" does not equal "GOLDFISH". The concatenation fails.

Now, evaluate the user's submission for "${puzzle.word}": [${submissionValues.map(s => `"${s}"`).join(', ')}].

Respond ONLY with a single JSON object with two keys: {"correct": boolean, "reasoning": "A brief, encouraging explanation for the user. If they were correct, praise their creativity. If incorrect, gently explain which rule they broke."}.`;

        logApiRequest('gemini-2.5-flash', 'verifyAnswer');
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", // 🚀 SWITCHED TO FLASH
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        correct: { type: Type.BOOLEAN },
                        reasoning: { type: Type.STRING }
                    },
                    required: ["correct", "reasoning"]
                }
            }
        });

        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr) as VerificationResult;
    } catch (error) {
        console.error("Verification error:", error);
        return { correct: false, reasoning: "Verification failed." };
    }
}