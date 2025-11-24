import { DriftAnalysisResult, Difficulty } from "../types";

const ENCOURAGEMENTS = [
  "Круто прошел спот🔥",
  "Отличный угол! 🏎️💨",
  "Чисто сработано!",
  "Король дрифта 👑",
  "Мощно! Продолжай в том же духе.",
  "Стильно, модно, молодежно 😎",
  "Асфальт плавится 🔥",
  "Epic Run! 🚀",
  "Sideways Master 🌪️"
];

/**
 * Analyzes a drift run (Mocked).
 * Replaces expensive AI call with simple encouraging logic.
 */
export const analyzeDriftRun = async (
  description: string,
  duration: number,
  base64Image?: string
): Promise<DriftAnalysisResult> => {
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  const randomScore = Math.floor(Math.random() * 500) + 500;
  const randomMsg = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];

  return {
    score: randomScore,
    difficulty: Difficulty.MEDIUM, // Mocked
    commentary: randomMsg,
    technicalDetails: {
      angle: Math.floor(Math.random() * 40) + 20,
      speed: Math.floor(Math.random() * 80) + 40,
      continuity: Math.floor(Math.random() * 30) + 70
    }
  };
};
