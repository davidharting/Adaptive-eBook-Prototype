import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { AppThunk, RootState } from "app/store";
import { IQuestion, IBook, IChoice } from "types/generated/contentful";
import { AnswerDocument, recordAnswer } from "db";
import Book from "models/Book";
import Question from "models/Question";

import { signOut, selectTreatment } from "../setup-device/setupDeviceSlice";
import { Mode } from "models/constants";

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

interface Answer extends AnswerPayload {
  mode: Mode;
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
    finishBook: (state) => {
      state.pageNumber = initialState.pageNumber;
      state.answers = initialState.answers;
    },
    nextPage: (state) => {
      state.pageNumber++;
      state.randomMode = randomMode();
    },
    chooseAnswer: (state, action: PayloadAction<Answer>) => {
      state.answers.push(action.payload);
    },
  },
  extraReducers: {
    [signOut.toString()]: (state) => {
      state.pageNumber = initialState.pageNumber;
      state.answers = initialState.answers;
      state.randomMode = initialState.randomMode;
    },
  },
});

const { chooseAnswer, nextPage } = readSlice.actions;
export const { finishBook } = readSlice.actions;

// The name nextPage is taken by the basic action
export const goToNextPage = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  const hasNextPage = selectHasNextPage(state);
  if (hasNextPage) {
    dispatch(nextPage());
  }
};

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
    const answer: Answer = { ...payload, mode };
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

  const getQuestion = Book.getQuestionById(book, answer.questionId);
  if (!getQuestion) {
    throw new Error("AAAaaaahhhhhh");
  }

  const { question, pageNumber } = getQuestion;

  const isCorrect = Question.isSelectionCorrect(
    question,
    answer.mode,
    answer.stimulusId
  );

  // TODO: Really need a randomly generated "playthrough" ID
  // To represent a single session within the book

  return {
    setupId: state.setupDevice.setupId,
    treatment: state.setupDevice.treatment,
    mode: answer.mode,
    childName: state.setupDevice.childName,
    parentName: state.setupDevice.parentName,
    readThroughId: state.selectBook.readThroughId,
    bookId: book.sys.id,
    bookTitle: book.fields.title,
    pageNumber: pageNumber ? pageNumber + 1 : -1,
    questionId: answer.questionId,
    stimulusId: answer.stimulusId,
    questionText: question.fields.quantityPrompt,
    isCorrect,
  };
}

export default readSlice.reducer;

export const selectBook = (state: RootState) => {
  const bookId = state.selectBook.bookId;
  if (!bookId) {
    return null;
  }
  return getBook(state, bookId);
};

export const selectPageNumber = (state: RootState) => state.read.pageNumber;

export const selectPage = (state: RootState) => {
  const book = selectBook(state);
  const pageNumber = selectPageNumber(state);
  return book ? Book.getPage(book, pageNumber) : null;
};

export const selectHasNextPage = (state: RootState): boolean => {
  const book = selectBook(state);
  const pageNumber = selectPageNumber(state);
  if (!book) {
    return false;
  }
  return Book.hasNextPage(book, pageNumber);
};

export const selectOnLastPage = (state: RootState): boolean => {
  const hasNextPage = selectHasNextPage(state);
  return !hasNextPage;
};

/**
 * Select the _current_ question
 */
const selectQuestion = (state: RootState): IQuestion | null => {
  const book = selectBook(state);
  const pageNumber = selectPageNumber(state);
  return book ? Book.getQuestion(book, pageNumber) : null;
};

const selectMode = (state: RootState): Mode | null => {
  const treatment = selectTreatment(state);
  if (treatment === "mixed") {
    return state.read.randomMode;
  }
  return treatment;
};

export const selectPrompt = (state: RootState): string | null => {
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

export const selectChoice = (state: RootState): IChoice | null => {
  const question = selectQuestion(state);
  return question ? Question.getChoice(question) : null;
};

// I need to apply the mode when determining if a choice is correct

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
  if (Question.isSelectionCorrect(question, answer.mode, answer.stimulusId)) {
    return "CORRECT";
  }
  return "WRONG";
};

export const selectCanPageForward = (state: RootState): boolean => {
  const hasNextPage = selectHasNextPage(state);
  const questionStatus = selectQuestionStatus(state);

  if (questionStatus === "NOT_QUESTION") {
    return hasNextPage;
  }
  return hasNextPage && questionStatus !== "UNANSWERED";
};

type QuestionStatus = "NOT_QUESTION" | "UNANSWERED" | "CORRECT" | "WRONG";

function getBook(state: RootState, bookId: string): IBook | null {
  const books = state.content.books;
  if (!books || !books.length) {
    return null;
  }
  const book = books.find((b) => b.sys.id === bookId);
  return book || null;
}

function randomMode(): Mode {
  const r = Math.random();
  if (r <= 0.5) {
    return "number";
  }
  return "size";
}
