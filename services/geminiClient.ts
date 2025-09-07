import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

// FIX: Initialize client using environment variables as per guidelines.
// The API key must not be handled in the UI.
export const initializeAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable not set. Please configure it before running the application.");
  }
  // The API key is sourced from process.env.API_KEY as per the requirements.
  aiClient = new GoogleGenAI({ apiKey });
  console.log("AI Client Initialized Successfully.");
};


export const getAiClient = (): GoogleGenAI | null => {
  return aiClient;
};

export const clearAiClient = () => {
    aiClient = null;
    console.log("AI Client Cleared.");
};