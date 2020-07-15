import { Difficulty } from "models/constants";
import { last, lastItem } from "lib/array";

export function shouldAdvanceDifficulty(
  history: Array<GradeHistoryItem>,
  numberToAdvance: number,
  outOf: number
): boolean {
  if (history.length < numberToAdvance) {
    return false;
  }

  const latestDifficulty = lastItem(history)?.difficulty;

  // First see if we got enough right in a row correct of the same difficulty
  let recentHistory = last(history, numberToAdvance);
  if (
    recentHistory.every(
      (h) => h.difficulty === latestDifficulty && h.grade === "CORRECT"
    )
  ) {
    return true;
  }

  // Okay, now we need to peek back by outOf
  // Are they all the same difficulty?
  // If so, did we got enough out of those correct to advance
  recentHistory = last(history, outOf);

  if (!recentHistory.every((h) => h.difficulty === latestDifficulty)) {
    return false;
  }

  let numberCorrect = 0;
  recentHistory.forEach((h) => {
    if (h.grade === "CORRECT") {
      numberCorrect++;
    }
  });
  return numberCorrect >= numberToAdvance;
}

export interface GradeHistoryItem {
  difficulty: Difficulty;
  grade: Grade | "ERROR";
}

type Grade = "CORRECT" | "WRONG";
