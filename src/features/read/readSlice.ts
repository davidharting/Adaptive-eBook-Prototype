import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { AppThunk, RootState } from "app/store";
import { IQuestion, IBook, IChoice, IPrompt } from "types/generated/contentful";
import { AnswerDocument, recordAnswer } from "db";
import Book from "models/Book";
import Question from "models/Question";

import { shouldAdvanceDifficulty } from "./adaptivity";
import { signOut, selectTreatment } from "../setup-device/setupDeviceSlice";
import { finishBook, selectBook } from "../select-book/selectBookSlice";
import { Mode } from "models/constants";
import { lastItem } from "lib/array";
import { IBookPage } from "models/BookPage";

type Difficulty = "easy" | "medium" | "hard";

interface ReadState {
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
   * This mode property describes the randomly generated mode for the current page.
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
  randomMode: randomMode(),
};

export const readSlice = createSlice({
  name: "read",
  initialState,
  reducers: {
    nextPage: (state) => {
      state.pageNumber++;
      state.randomMode = randomMode();
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
  if (treatment === "mixed") {
    return state.read.randomMode;
  }
  return treatment;
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
function selectDifficulty(state: RootState): Difficulty {
  const NUMBER_CORRECT_TO_ADVANCE = 4;
  /**
   * How many answers do we "peek back" when we assess if they got NUMBER_CORRECT_TO_ADVANCE
   */
  const OUT_OF = 5;

  const STARTING_DIFFICULTY = "easy";

  const book = selectBook(state);
  const answers = state.read.answers;

  if (!book || answers.length < NUMBER_CORRECT_TO_ADVANCE) {
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

  const history: Array<GradeHistoryItem> = answers.map((ans) => {
    return {
      difficulty: ans.difficulty,
      grade: gradeAnswer(book, ans),
    };
  });

  const latestDifficulty = lastItem(history)?.difficulty || STARTING_DIFFICULTY;

  return shouldAdvanceDifficulty(history, NUMBER_CORRECT_TO_ADVANCE, OUT_OF)
    ? nextDifficulty(latestDifficulty)
    : latestDifficulty;
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

type Grade = "CORRECT" | "WRONG";
type QuestionStatus = "NOT_QUESTION" | "UNANSWERED" | Grade;

function randomMode(): Mode {
  const r = Math.random();
  if (r <= 0.5) {
    return "number";
  }
  return "size";
}

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
