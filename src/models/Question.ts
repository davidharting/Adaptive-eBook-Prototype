import { IQuestion } from "types/generated/contentful";
import { Mode } from "./constants";
import Choice from "./Choice";

class Question {
  static isSelectionCorrect(
    question: IQuestion,
    mode: Mode,
    stimulusId: string
  ): boolean {
    const choice = Question.getChoice(question);
    return Choice.isSelectionCorrect(choice, mode, stimulusId);
  }

  static areChoicesValid(question: IQuestion) {
    return question.fields.choices.length === 1;
  }

  static getChoice(question: IQuestion) {
    if (!Question.areChoicesValid(question)) {
      throw new InvalidChoiceError(question);
    }

    return question.fields.choices[0];
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
