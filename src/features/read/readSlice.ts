import { createSlice } from "@reduxjs/toolkit";
import { AppThunk, RootState } from "../../app/store";
import { IPage, IQuestion } from "../../types/generated/contentful";

import { signOut } from "../session/sessionSlice";

interface ReadState {
  pageNumber: number;
}

const initialState: ReadState = {
  // This will correspond to the book.pages array and is 0-indexed
  pageNumber: 0,
};

export const readSlice = createSlice({
  name: "read",
  initialState,
  reducers: {
    finishBook: (state) => {
      state.pageNumber = initialState.pageNumber;
    },
    nextPage: (state) => {
      state.pageNumber++;
    },
  },
  extraReducers: {
    [signOut.toString()]: (state) => {
      state.pageNumber = initialState.pageNumber;
    },
  },
});

const { nextPage } = readSlice.actions;
export const { finishBook } = readSlice.actions;

// The name nextPage is taken by the basic action
export const goToNextPage = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  const hasNextPage = selectHasNextPage(state);
  if (hasNextPage) {
    dispatch(nextPage());
  }
};

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

export const selectPage = (state: RootState) => {
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
  console.log(pages.length - 1, pageNumber);
  return pageNumber < pages.length - 1;
};
