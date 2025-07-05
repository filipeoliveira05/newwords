import { Word } from "../types/database";

interface Sm2Result {
  newEasinessFactor: number;
  newInterval: number;
  newRepetitions: number;
}

/**
 * Implements the SM-2 algorithm for spaced repetition.
 * @param word The word object with its current SM-2 stats.
 * @param quality The quality of the user's response (0-5). A value < 3 means the answer was incorrect.
 * @returns An object with the new easinessFactor, interval, and repetitions.
 */
export function calculateSm2Factors(
  word: Pick<Word, "easinessFactor" | "repetitions" | "interval">,
  quality: number
): Sm2Result {
  if (quality < 0 || quality > 5) {
    throw new Error("Quality must be between 0 and 5.");
  }

  let { easinessFactor, repetitions, interval } = word;

  // 1. If quality is below 3, reset progress.
  if (quality < 3) {
    repetitions = 0;
    interval = 1; // Review again tomorrow
  } else {
    // 2. If quality is 3 or above, it's a correct response.
    // Increment repetitions
    repetitions += 1;

    // Calculate new interval
    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.ceil(interval * easinessFactor);
    }

    // Calculate new easiness factor
    easinessFactor =
      easinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

    // The easiness factor cannot be less than 1.3
    if (easinessFactor < 1.3) {
      easinessFactor = 1.3;
    }
  }

  return {
    newEasinessFactor: easinessFactor,
    newInterval: interval,
    newRepetitions: repetitions,
  };
}
