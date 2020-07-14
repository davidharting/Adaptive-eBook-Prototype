import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { AppThunk, RootState } from "app/store";
import { IQuestion, IBook, IChoice } from "types/generated/contentful";
import { AnswerDocument, recordAnswer } from "db";
import Book from "models/Book";
import Question from "models/Question";

import { signOut, selectTreatment } from "../setup-device/setupDeviceSlice";
import { finishBook, selectBook } from "../select-book/selectBookSlice";
import { Mode } from "models/constants";
import { last, uniqueCount, lastItem } from "lib/array";

type Difficulty = "easy" | "medium" | "hard";

// TODO: Now I have a bug where once you change difficulty settings, the feedback page is broken.
// e.g., get something right, difficulty increments. You should be seeing Good Job! Overlayed on your latest choice
// But instead, the difficulty advances on the _current page_ instead of waiting for the next page.

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

const { chooseAnswer, nextPage } = readSlice.actions;

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
    questionText: Question.getPrompt(question, answer.mode),
    isCorrect: grade === "CORRECT",
  };
}

export default readSlice.reducer;

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

/**
 * Note: In "assessment" books, the difficulty is irrelevant - we just play through the book as-is.
 */
function selectDifficulty(state: RootState): Difficulty {
  const CONSECUTIVE_CORRECT_TO_INCREASE_DIFFICULTY = 1;
  const CONSECUTIVE_WRONG_TO_DECREASE_DIFFICULTY = 1;

  const STARTING_DIFFICULTY = "easy";

  const book = selectBook(state);
  const answers = state.read.answers;

  if (
    !book ||
    answers.length < 1 ||
    (answers.length < CONSECUTIVE_CORRECT_TO_INCREASE_DIFFICULTY &&
      answers.length < CONSECUTIVE_WRONG_TO_DECREASE_DIFFICULTY)
  ) {
    return STARTING_DIFFICULTY;
  }

  const latestAnswer = lastItem(answers);
  if (latestAnswer && latestAnswer.pageNumber === selectPageNumber(state)) {
    return latestAnswer.difficulty;
  }

  const history: Array<GradeHistoryItem> = answers.map((ans) => {
    return {
      difficulty: ans.difficulty,
      grade: gradeAnswer(book, ans),
    };
  });

  const difficultiesMatch = (items: Array<GradeHistoryItem>) => {
    const difficulties = items.map((h) => h.difficulty);
    return uniqueCount(difficulties) === 1;
  };

  const allCorrect = (items: Array<GradeHistoryItem>) => {
    return items.every((item) => item.grade === "CORRECT");
  };

  const allWrong = (items: Array<GradeHistoryItem>) => {
    return items.every((item) => item.grade === "WRONG");
  };

  const latestDifficulty = lastItem(history)?.difficulty || STARTING_DIFFICULTY;

  if (history.length >= CONSECUTIVE_CORRECT_TO_INCREASE_DIFFICULTY) {
    const recent = last(history, CONSECUTIVE_CORRECT_TO_INCREASE_DIFFICULTY);
    if (difficultiesMatch(recent) && allCorrect(recent)) {
      return nextDifficulty(latestDifficulty);
    }
  }

  if (history.length >= CONSECUTIVE_WRONG_TO_DECREASE_DIFFICULTY) {
    const recent = last(history, CONSECUTIVE_CORRECT_TO_INCREASE_DIFFICULTY);
    if (difficultiesMatch(recent) && allWrong(recent)) {
      return previousDifficulty(latestDifficulty);
    }
  }

  return latestDifficulty;
}

export const selectChoice = (state: RootState): IChoice | null => {
  const question = selectQuestion(state);
  const difficulty = selectDifficulty(state);
  console.log("Selecting choice with difficulty", difficulty);
  return question ? Question.getChoice(question, difficulty) : null;
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
  const hasNextPage = selectHasNextPage(state);
  const questionStatus = selectQuestionStatus(state);

  if (questionStatus === "NOT_QUESTION") {
    return hasNextPage;
  }
  return hasNextPage && questionStatus !== "UNANSWERED";
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

function previousDifficulty(difficulty: Difficulty): Difficulty {
  if (difficulty === "hard") {
    return "medium";
  }
  return "easy";
}

interface GradeHistoryItem {
  difficulty: Difficulty;
  grade: Grade | "ERROR";
}
