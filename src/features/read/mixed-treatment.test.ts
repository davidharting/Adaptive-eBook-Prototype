import { Mode, Difficulty } from "models/constants";
import { Answer } from "./readSlice";
import { nextMode } from "./mixed-treatment";

describe("#nextMode", () => {
  it("should pick a random mode if there is not enough history", () => {
    expectToBeRandom([]);
    expectToBeRandom(makeAnswers(["number"]));
  });

  it("should pick a random mode if the latest two modes are not repeats two of the same in a row", () => {
    expectToBeRandom(makeAnswers(["number", "size"]));
    expectToBeRandom(
      makeAnswers([
        "number",
        "size",
        // only last two should be relevant
        "size",
        "number",
      ])
    );
    expectToBeRandom(
      makeAnswers([
        "number",
        "number",
        "size",
        "size",
        "number",
        "size",
        "number",
        "number",
        "size",
        // These last two should be the only relevant ones
        "size",
        "number",
      ])
    );
  });

  it("should pick the opposite mode if there are two in a row that are the same", () => {
    expect(nextMode(makeAnswers(["size", "size"]))).toBe("number");
    expect(nextMode(makeAnswers(["number", "number"]))).toBe("size");

    expect(
      nextMode(
        makeAnswers([
          "size",
          "size",
          "number",
          "number",
          "size",
          "number",
          "number",
          "size",
          "size",
        ])
      )
    ).toBe("number");

    expect(
      nextMode(
        makeAnswers([
          "number",
          "size",
          "number",
          "size",
          "size",
          "number",
          "number",
          "size",
          "size",
          "number",
          "number",
        ])
      )
    ).toBe("size");
  });
});

function expectToBeRandom(history: Answer[]) {
  const actuals: Mode[] = [];

  for (let i = 0; i < 100; i++) {
    actuals.push(nextMode(history));
  }

  expect(actuals).toContain<Mode>("number");
  expect(actuals).toContain<Mode>("size");
}

function makeAnswers(modeHistory: Mode[]): Answer[] {
  function getDifficulty(index: number): Difficulty {
    if (index <= 5) {
      return "easy";
    }
    if (index <= 10) {
      return "medium";
    }
    return "hard";
  }

  return modeHistory.map((m, i) => {
    return {
      mode: m,
      // These fields are not relevant to picking the next mode, so it's fine to fake them
      difficulty: getDifficulty(i),
      pageNumber: i + 1,
      questionId: `q-${i}`,
      stimulusId: `s-${i}`,
    };
  });
}
