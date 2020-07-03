import { IQuestion } from "types/generated/contentful";
import { Difficulty, Mode } from "./constants";
import Choice from "./Choice";

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

  static areChoicesValid(question: IQuestion) {
    // TODO: Validate that it has a hard, easy, and medium
    return question.fields.choices.length === 3;
  }

  /**
   * Note: In "assessment" books, the difficulty will not be relevant - there should only be one Choice per Question.
   */
  static getChoice(question: IQuestion, difficulty: Difficulty) {
    if (!Question.areChoicesValid(question)) {
      throw new InvalidChoiceError(question);
    }

    const choice = question.fields.choices.find(
      (c) => c.fields.difficulty === difficulty
    );

    if (!choice) {
      throw new InvalidChoiceError(question);
    }

    return choice;
  }

  static getPrompt(question: IQuestion, mode: Mode): string {
    if (mode === "number") {
      return question.fields.quantityPrompt;
    }

    return question.fields.sizePrompt;
  }
}

export default Question;

class InvalidChoiceError extends Error {
  questionId: string;

  constructor(question: IQuestion) {
    super("Question has invalid choices.");
    this.questionId = question.sys.id;
  }
}
