import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { lastItem } from "lib/array";
import { AppThunk, RootState } from "app/store";
import { IQuestion, IBook, IChoice, IPrompt } from "types/generated/contentful";
import { AnswerDocument, recordAnswer } from "db";
import { Mode } from "models/constants";
import Book from "models/Book";
import { IBookPage } from "models/BookPage";
import BookPage from "models/BookPage";
import Question from "models/Question";

import { shouldAdvanceDifficulty } from "./adaptivity";
import { nextMode } from "./mixed-treatment";
import { signOut, selectTreatment } from "../setup-device/setupDeviceSlice";
import { finishBook, selectBook } from "../select-book/selectBookSlice";

type Difficulty = "easy" | "medium" | "hard";

export interface ReadState {
  /**
   * The **current** page in the book.
   */
  pageNumber: number;
  /**
   * For now, only saving the current read-throughs answers
   * In the future I may want to save all of them indefinitely to make them easier to persist while play continues
   * If I do that, however, I will need to "namespace" the answers by some sort of "read-through" ID.
   */
  answers: Answer[];
  /**
   * The "randomMode" property is only relevant when in the Mixed Treatment.
   * This mode property describes the "randomly" generated mode for the current page.
   * "Random" is in quotes because of course we are using a pseudo-random number generator.
   * But more importantly, because there are constraints. Because chance is clumpy, we want to cap how many in a row of a given mode a child may experience.
   * See `./mixed-treatment.js#nextMode` for implementation details
   * If in the Number or Size Treatment, this value will be ignored.
   * In the Mixed treatment, we will take on the random mode as the current mode of the page.
   */
  randomMode: Mode;
}

interface AnswerPayload {
  questionId: string;
  stimulusId: string;
}

export interface Answer extends AnswerPayload {
  difficulty: Difficulty;
  mode: Mode;
  pageNumber: number;
}

const initialState: ReadState = {
  // The pageNumber corresponds to the book.pages array and is 0-indexed
  pageNumber: 0,
  answers: [],
  randomMode: nextMode([]),
};

export const readSlice = createSlice({
  name: "read",
  initialState,
  reducers: {
    nextPage: (state) => {
      state.pageNumber++;
      state.randomMode = nextMode(state.answers);
    },
    chooseAnswer: (state, action: PayloadAction<Answer>) => {
      state.answers.push(action.payload);
    },
  },
  extraReducers: {
    [finishBook.toString()]: (state) => {
      state.pageNumber = initialState.pageNumber;
      state.answers = initialState.answers;
    },
    [signOut.toString()]: (state) => {
      state.pageNumber = initialState.pageNumber;
      state.answers = initialState.answers;
      state.randomMode = initialState.randomMode;
    },
  },
});

const { chooseAnswer } = readSlice.actions;
export const { nextPage } = readSlice.actions;

export const chooseAnswerAsync = (payload: AnswerPayload): AppThunk => (
  dispatch,
  getState
) => {
  const state = getState();
  const hasAnsweredQuestion = !!state.read.answers.find(
    (a) => a.questionId === payload.questionId
  );
  if (!hasAnsweredQuestion) {
    const mode = selectMode(state);
    if (!mode) {
      throw new Error("What in the heck is going on");
    }
    const difficulty = selectDifficulty(state);
    const pageNumber = selectPageNumber(state);
    const answer: Answer = { ...payload, mode, difficulty, pageNumber };
    dispatch(chooseAnswer(answer));
    const record = enrichAnswer(answer, state);
    return recordAnswer(record);
  }
};

function enrichAnswer(answer: Answer, state: RootState): AnswerDocument {
  const book = selectBook(state);
  if (!book) {
    // TODO: Sentry
    // TODO: Debuggable error message
    // TODO: Recover from error, don't just throw it
    throw new Error("Cannot find book for answer");
  }

  const grade = gradeAnswer(book, answer);

  const getQuestion = Book.getQuestionById(book, answer.questionId);
  if (!getQuestion) {
    throw new Error("AAAaaaahhhhhh");
  }

  const { question, pageNumber } = getQuestion;

  return {
    setupId: state.setupDevice.setupId,
    treatment: state.setupDevice.treatment,
    mode: answer.mode,
    difficulty: answer.difficulty,
    childName: state.setupDevice.childName,
    parentName: state.setupDevice.parentName,
    readThroughId: state.selectBook.readThroughId,
    bookId: book.sys.id,
    bookType: Book.getType(book),
    bookTitle: book.fields.title,
    pageNumber: pageNumber ? pageNumber + 1 : -1,
    questionId: answer.questionId,
    stimulusId: answer.stimulusId,
    questionText: Question.getPromptText(question, answer.mode),
    isCorrect: grade === "CORRECT",
  };
}

export default readSlice.reducer;

export const selectPageNumber = (state: RootState) => state.read.pageNumber;

export const selectPage = (state: RootState): IBookPage | null => {
  const book = selectBook(state);
  const pageNumber = selectPageNumber(state);
  return book ? Book.getPage(book, pageNumber) : null;
};

export const selectOnCredits = (state: RootState): boolean => {
  const book = selectBook(state);
  const pageNumber = selectPageNumber(state);
  if (!book) {
    return false;
  }
  const pages = book.fields.pages;
  if (!pages || pages.length < 1) {
    return true;
  }
  return pageNumber >= pages.length;
};

/**
 * Select the _current_ question
 */
const selectQuestion = (state: RootState): IQuestion | null => {
  const book = selectBook(state);
  const pageNumber = selectPageNumber(state);
  return book ? Book.getQuestion(book, pageNumber) : null;
};

export const selectMode = (state: RootState): Mode | null => {
  const treatment = selectTreatment(state);
  const book = selectBook(state);

  if (!book) {
    return null;
  }

  if (!Book.isAssessment(book)) {
    if (treatment === "mixed") {
      return state.read.randomMode;
    }

    return treatment;
  }

  const bookPage = Book.getPage(book, selectPageNumber(state));
  if (!bookPage) {
    return null;
  }

  const determine = BookPage.determineType(bookPage);
  if (determine.type === "page" || determine.type === "error") {
    return null;
  }
  const question = determine.question;

  if (!question) {
    throw new Error(`Missing question. Current questions is of type null.`);
  }

  const promptType = Question.getPromptType(question);
  if (promptType === "number") {
    return "number";
  }
  if (promptType === "size") {
    return "size";
  }
  if (promptType === "both") {
    throw new Error(
      "Pre- or post-test question had two prompts instead of one."
    );
  }
  if (promptType === "none") {
    throw new Error("Pre- or post-test question missing prompt.");
  }

  return null;
};

export const selectPrompt = (state: RootState): IPrompt | null => {
  // Getting prompt based on treatment could get pushed down into Question model
  const question = selectQuestion(state);
  const mode = selectMode(state);
  if (!question || !mode) {
    return null;
  }
  return Question.getPrompt(question, mode);
};

/**
 * Select the user's answer to the _current_ question
 */
export const selectAnswer = (state: RootState): Answer | undefined => {
  const question = selectQuestion(state);
  if (!question) {
    return undefined;
  }

  return state.read.answers.find((a) => a.questionId === question.sys.id);
};

/**
 * Note: In "assessment" books, the difficulty is irrelevant - we just play through the book as-is.
 *
 * You cannot "backslide" in difficulty.
 * To advance difficulty, you must get 4 out of the last 5 questions at the current difficulty level correct.
 */
export function selectDifficulty(state: RootState): Difficulty {
  const NUMBER_CORRECT_TO_ADVANCE = 4;
  /**
   * How many answers do we "peek back" when we assess if they got NUMBER_CORRECT_TO_ADVANCE
   */
  const OUT_OF = 5;

  const STARTING_DIFFICULTY = "easy";

  const book = selectBook(state);
  const answers = state.read.answers;

  if (
    !book ||
    answers.length < NUMBER_CORRECT_TO_ADVANCE ||
    Book.isAssessment(book)
  ) {
    return STARTING_DIFFICULTY;
  }

  const latestAnswer = lastItem(answers);
  if (latestAnswer && latestAnswer.pageNumber === selectPageNumber(state)) {
    // This next section is very important!
    // If we didn't have this check, then after you pick an answer, the content on the page you could change on you!
    // After the child answers, we stay on that page to show feedback. We want the the difficulty to advance on the _next_ page,
    // not the current one that they just answered!
    return latestAnswer.difficulty;
  }

  const history = selectHistory(state);

  const latestDifficulty = lastItem(history)?.difficulty || STARTING_DIFFICULTY;

  return shouldAdvanceDifficulty(history, NUMBER_CORRECT_TO_ADVANCE, OUT_OF)
    ? nextDifficulty(latestDifficulty)
    : latestDifficulty;
}

export function selectHistory(state: RootState): GradeHistoryItem[] {
  const book = selectBook(state);
  const answers = state.read.answers;
  if (!book || answers.length < 1) {
    return [];
  }
  return answers.map((ans) => {
    return {
      difficulty: ans.difficulty,
      grade: gradeAnswer(book, ans),
    };
  });
}

export const selectChoice = (state: RootState): IChoice | null => {
  const question = selectQuestion(state);
  const difficulty = selectDifficulty(state);
  return question ? Question.getChoice(question, difficulty) : null;
};

/**
 * Status of the _current_ question
 */
export const selectQuestionStatus = (state: RootState): QuestionStatus => {
  const question = selectQuestion(state);
  if (!question) {
    return "NOT_QUESTION";
  }
  const answer = selectAnswer(state);
  if (!answer) {
    return "UNANSWERED";
  }
  if (
    Question.isSelectionCorrect(
      question,
      answer.mode,
      answer.difficulty,
      answer.stimulusId
    )
  ) {
    return "CORRECT";
  }
  return "WRONG";
};

export const selectCanPageForward = (state: RootState): boolean => {
  const questionStatus = selectQuestionStatus(state);

  if (questionStatus === "NOT_QUESTION") {
    return true;
  }
  return questionStatus !== "UNANSWERED";
};

export type Grade = "CORRECT" | "WRONG";
type QuestionStatus = "NOT_QUESTION" | "UNANSWERED" | Grade;

function gradeAnswer(book: IBook, answer: Answer): Grade | "ERROR" {
  const questionAndPage = Book.getQuestionById(book, answer.questionId);
  if (!questionAndPage || !questionAndPage.question) {
    console.warn("Sentry I need to tell you that something bad happened!");
    return "ERROR";
  }
  const isSelectionCorrect = Question.isSelectionCorrect(
    questionAndPage.question,
    answer.mode,
    answer.difficulty,
    answer.stimulusId
  );
  return isSelectionCorrect ? "CORRECT" : "WRONG";
}

function nextDifficulty(difficulty: Difficulty): Difficulty {
  if (difficulty === "easy") {
    return "medium";
  }
  return "hard";
}

interface GradeHistoryItem {
  difficulty: Difficulty;
  grade: Grade | "ERROR";
}
