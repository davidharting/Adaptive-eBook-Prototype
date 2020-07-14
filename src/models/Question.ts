import { IQuestion } from "types/generated/contentful";
import { Difficulty, Mode } from "./constants";
import Choice from "./Choice";
import { Validation } from "types/validation";

class Question {
  static isSelectionCorrect(
    question: IQuestion,
    mode: Mode,
    difficulty: Difficulty,
    stimulusId: string
  ): boolean {
    const choice = Question.getChoice(question, difficulty);
    return Choice.isSelectionCorrect(choice, mode, stimulusId);
  }

  static validate(question: IQuestion): Validation {
    const counts = { easy: 0, medium: 0, hard: 0 };
    const difficulties = question.fields.choices.map(
      (c) => c.fields.difficulty
    );
    difficulties.forEach((d) => {
      counts[d]++;
    });

    const problems = Object.entries(counts)
      .filter(([_, count]) => count !== 1)
      .map(
        ([d, count]) =>
          `There should be exactly one "${d}" Choice, but instead there are ${count}`
      );

    return { status: problems.length > 0 ? "error" : "ok", problems };
  }

  /**
   * Note: In "assessment" books, the difficulty will not be relevant - there should only be one Choice per Question.
   */
  static getChoice(question: IQuestion, difficulty: Difficulty) {
    const validation = Question.validate(question);
    if (validation.status === "error") {
      throw new InvalidQuestionError(question, validation.problems);
    }

    const choice = question.fields.choices.find(
      (c) => c.fields.difficulty === difficulty
    );

    if (!choice) {
      throw new InvalidQuestionError(question);
    }

    return choice;
  }

  static getPrompt(question: IQuestion, mode: Mode): string {
    if (mode === "number") {
      return question.fields.numberPrompt.fields.text;
    }

    return question.fields.sizePrompt.fields.text;
  }
}

export default Question;

class InvalidQuestionError extends Error {
  questionId: string;
  problems: Array<string>;

  constructor(question: IQuestion, problems: Array<string> = []) {
    super("Invalid Question Error");
    this.questionId = question.sys.id;
    this.problems = problems;
  }
}
