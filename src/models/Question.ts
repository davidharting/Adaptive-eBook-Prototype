import { IQuestion } from "types/generated/contentful";

class Question {
  static isChoiceCorrect(question: IQuestion, stimulusId: string): boolean {
    const isLeftCorrect = question.fields.correctStimulus; // TODO: "correctStimulus" is not a well-named field
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
}

export default Question;
