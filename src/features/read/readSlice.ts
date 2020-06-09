import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { AppThunk, RootState } from "app/store";
import { IPage, IQuestion, IBook } from "types/generated/contentful";
import { AnswerDocument, recordAnswer } from "db";

import { signOut } from "../session/sessionSlice";

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

  const { question, pageNumber } = getQuestion(book, answer.questionId);
  if (!question) {
    throw new Error("AAAaaaahhhhhh");
  }

  // This is messy as heck that I have to re-implement this logic for a given question ID as opposed to "current"
  // Would be better if I could either safely just use the current info
  // Or if I could share abstractions to use the same logic for "current" or "given ID"
  const leftIsCorrect = question.fields.correctStimulus;
  const leftStimulusId = question.fields.left.sys.id;
  const isCorrect = leftIsCorrect
    ? leftStimulusId === answer.stimulusId
    : leftStimulusId !== answer.stimulusId;

  // TODO: Really need a randomly generated "playthrough" ID
  // To represent a single session within the book
  return {
    userId: state.session.id,
    userName: state.session.playerName,
    bookId: book.sys.id,
    bookTitle: book.fields.title,
    pageNumber: pageNumber || -1,
    questionId: answer.questionId,
    stimulusId: answer.stimulusId,
    questionText: question.fields.prompt,
    isCorrect,
  };
}

interface GetQuestion {
  pageNumber: number | null;
  question: IQuestion | null;
}
function getQuestion(book: IBook, questionId: string): GetQuestion {
  const pages = book.fields.pages || [];
  const page = pages.find(
    (p) => p.sys.contentType.sys.id === "question" && p.sys.id === questionId
  );
  const question = page as IQuestion;
  const pageNumber = pages.indexOf(question);
  return { pageNumber, question };
}

export default readSlice.reducer;

export const selectBook = (state: RootState) => {
  const bookId = state.selectBook.bookId;
  if (!bookId) {
    return null;
  }
  const books = state.content.books;
  if (!books || !books.length) {
    return null;
  }
  const book = books.find((b) => b.sys.id === bookId);
  return book || null;
};

export const selectPageNumber = (state: RootState) => state.read.pageNumber;

// I don't love the naming here. I probably want to rename Page and Question content types to:
// NarrativePage and QuestionPage so that they are both "page"s
// This will disambiguate things. When I say "page" then I can actually mean both quite clearly.
type BookPage = IPage | IQuestion;

const selectBookPages = (state: RootState) => {
  const book = selectBook(state);

  if (!book) {
    return null;
  }

  const pages: BookPage[] | undefined = book.fields.pages;
  if (!pages || !pages.length) {
    return null;
  }

  return pages;
};

export const selectPage = (state: RootState, questionId?: string) => {
  const pages = selectBookPages(state);
  if (!pages) {
    return null;
  }

  const pageNumber = selectPageNumber(state);

  if (!pages || !pages.length || pages.length < pageNumber) {
    return null;
  }

  return pages[pageNumber];
};

export const selectHasNextPage = (state: RootState) => {
  const pages = selectBookPages(state);
  const pageNumber = selectPageNumber(state);
  if (!pages || !pages.length) {
    return false;
  }
  return pageNumber < pages.length - 1;
};

export const selectOnLastPage = (state: RootState): boolean => {
  const hasNextPage = selectHasNextPage(state);
  return !hasNextPage;
};

/**
 * Select the _current_ question
 */
const selectQuestion = (state: RootState): IQuestion | null => {
  const page = selectPage(state);
  if (!page || page.sys.contentType.sys.id === "page") {
    return null;
  }
  const question = page as IQuestion;
  return question;
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

  // TODO: "correctStimulus" is not a well-named field
  const isLeftCorrect = question.fields.correctStimulus;

  const leftStimulusId = question.fields.left.sys.id;
  const rightStimulusId = question.fields.right.sys.id;

  if (isLeftCorrect && leftStimulusId === answer.stimulusId) {
    return "CORRECT";
  }

  if (!isLeftCorrect && rightStimulusId === answer.stimulusId) {
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
