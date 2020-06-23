import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { AppThunk, RootState } from "app/store";
import { IQuestion, IBook } from "types/generated/contentful";
import { AnswerDocument, recordAnswer } from "db";
import Book from "models/Book";
import Question from "models/Question";

import { signOut } from "../setup-device/setupDeviceSlice";

interface ReadState {
  pageNumber: number;
  // For now, only saving the current read-throughs answers
  // In the future I may want to save all of them indefinitely to make them easier to persist while play continues
  // If I do that, however, I will need to "namespace" the answers by some sort of "read-through" ID.
  answers: Answer[];
}

interface Answer {
  questionId: string;
  stimulusId: string;
}

const initialState: ReadState = {
  // The pageNumber corresponds to the book.pages array and is 0-indexed
  pageNumber: 0,
  answers: [],
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
    },
    chooseAnswer: (state, action: PayloadAction<Answer>) => {
      state.answers.push(action.payload);
    },
  },
  extraReducers: {
    [signOut.toString()]: (state) => {
      state.pageNumber = initialState.pageNumber;
      state.answers = initialState.answers;
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

export const chooseAnswerAsync = (answer: Answer): AppThunk => (
  dispatch,
  getState
) => {
  const state = getState();
  const hasAnsweredQuestion = !!state.read.answers.find(
    (a) => a.questionId === answer.questionId
  );
  if (!hasAnsweredQuestion) {
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
  const isCorrect = Question.isChoiceCorrect(question, answer.stimulusId);

  // TODO: Really need a randomly generated "playthrough" ID
  // To represent a single session within the book

  return {
    setupId: state.setupDevice.setupId,
    userName: state.setupDevice.playerName,
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

interface GetQuestion {
  pageNumber: number | null;
  question: IQuestion | null;
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
  if (Question.isChoiceCorrect(question, answer.stimulusId)) {
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
