import { IQuestion, IPrompt } from "types/generated/contentful";
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
      .filter(([_, count]) => count > 1)
      .map(
        ([d, count]) =>
          `There should be at most one "${d}" Choice, but instead there are ${count}`
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

  static getPromptText(question: IQuestion, mode: Mode): string {
    const prompt = Question.getPrompt(question, mode);
    return prompt.fields.text;
  }

  static getPrompt(question: IQuestion, mode: Mode): IPrompt {
    const prompt =
      mode === "number"
        ? question.fields.numberPrompt
        : question.fields.sizePrompt;

    if (!prompt) {
      throw new Error(
        `Missing prompt for mode ${mode} for question ${question.sys.id}`
      );
    }

    return prompt;
  }

  static getPromptType(
    question: IQuestion
  ): "number" | "size" | "both" | "none" {
    const numberPrompt = question.fields.numberPrompt;
    const sizePrompt = question.fields.sizePrompt;
    if (numberPrompt && sizePrompt) {
      return "both";
    }
    if (numberPrompt) {
      return "number";
    }
    if (sizePrompt) {
      return "size";
    }
    return "none";
  }

  static getAudio(question: IQuestion, mode: Mode): string[] {
    const audio = [];
    const narrativeAudio =
      question.fields.narrative?.fields.audio?.fields.file.url;
    if (narrativeAudio) {
      audio.push(narrativeAudio);
    }

    const prompt = Question.getPrompt(question, mode);
    const promptAudio = prompt.fields.audio?.fields.file.url;
    if (promptAudio) {
      audio.push(promptAudio);
    }
    return audio;
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
