import { shouldAdvanceDifficulty, GradeHistoryItem } from "./adaptivity";

describe("Adaptivity", () => {
  describe("#shouldAdvanceDifficulty", () => {
    it("should return false if there is no answer history", () => {
      const answers: GradeHistoryItem[] = [];
      expect(shouldAdvanceDifficulty(answers, 4, 5)).toBe(false);
    });

    it("should return false if there are fewer answers than required to advance", () => {
      const answers: GradeHistoryItem[] = [
        { difficulty: "easy", grade: "CORRECT" },
        { difficulty: "easy", grade: "CORRECT" },
        { difficulty: "easy", grade: "CORRECT" },
      ];
      expect(shouldAdvanceDifficulty(answers, 4, 5)).toBe(false);
    });

    it("should return false if there are an insufficient number of correct responses", () => {
      let answers: GradeHistoryItem[] = [
        { difficulty: "easy", grade: "CORRECT" },
        { difficulty: "easy", grade: "CORRECT" },
        { difficulty: "easy", grade: "WRONG" },
        { difficulty: "easy", grade: "CORRECT" },
      ];
      expect(shouldAdvanceDifficulty(answers, 4, 5)).toBe(false);

      answers = [
        { difficulty: "easy", grade: "CORRECT" },
        { difficulty: "easy", grade: "CORRECT" },
        { difficulty: "easy", grade: "CORRECT" },
        { difficulty: "easy", grade: "CORRECT" },
        { difficulty: "medium", grade: "CORRECT" },
        { difficulty: "medium", grade: "CORRECT" },
        { difficulty: "medium", grade: "CORRECT" },
        // Still needs one more medium correct to advance!
      ];
      expect(shouldAdvanceDifficulty(answers, 4, 5)).toBe(false);
    });

    it("should return true if there are four correct answers in a row at a difficulty level", () => {
      let answers: Array<GradeHistoryItem> = [
        { difficulty: "easy", grade: "CORRECT" },
        { difficulty: "easy", grade: "CORRECT" },
        { difficulty: "easy", grade: "CORRECT" },
        { difficulty: "easy", grade: "CORRECT" },
      ];
      expect(shouldAdvanceDifficulty(answers, 4, 5)).toBe(true);
    });

    it("should return true if there are enough answers correct out of the look back at a difficulty level", () => {
      let answers: Array<GradeHistoryItem> = [
        { difficulty: "easy", grade: "CORRECT" },
        { difficulty: "easy", grade: "CORRECT" },
        { difficulty: "easy", grade: "WRONG" },
        { difficulty: "easy", grade: "CORRECT" },
        { difficulty: "easy", grade: "CORRECT" },
      ];
      expect(shouldAdvanceDifficulty(answers, 4, 5)).toBe(true);

      answers = [
        { difficulty: "easy", grade: "CORRECT" },
        { difficulty: "easy", grade: "CORRECT" },
        { difficulty: "easy", grade: "WRONG" },
        { difficulty: "easy", grade: "CORRECT" },
        { difficulty: "easy", grade: "CORRECT" },
        { difficulty: "medium", grade: "WRONG" },
        { difficulty: "medium", grade: "CORRECT" },
        { difficulty: "medium", grade: "CORRECT" },
        { difficulty: "medium", grade: "CORRECT" },
        { difficulty: "medium", grade: "CORRECT" },
      ];

      expect(shouldAdvanceDifficulty(answers, 4, 5)).toBe(true);
    });
  });
});
