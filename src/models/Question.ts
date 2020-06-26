import { IQuestion } from "types/generated/contentful";

export type Mode = "number" | "size";

class Question {
  // This should take a "mode"
  static isChoiceCorrect(
    question: IQuestion,
    mode: Mode,
    stimulusId: string
  ): boolean {
    // TODO: Refactor content model - how we determine which is correct is garbo!
    const isLeftCorrect =
      mode === "number"
        ? question.fields.quantityWhichIsCorrect
        : question.fields.correctStimulus;

    const leftStimulusId = question.fields.left.sys.id;
    const rightStimulusId = question.fields.right.sys.id;

    if (isLeftCorrect && leftStimulusId === stimulusId) {
      return true;
    }

    if (!isLeftCorrect && rightStimulusId === stimulusId) {
      return true;
    }

    return false;
  }

  static getPrompt(question: IQuestion, mode: Mode): string {
    if (mode === "number") {
      return question.fields.quantityPrompt;
    }

    return question.fields.sizePrompt;
  }
}

export default Question;
