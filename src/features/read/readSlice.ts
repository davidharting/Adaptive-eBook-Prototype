import { createSlice } from "@reduxjs/toolkit";
import { AppThunk, RootState } from "../../app/store";
import { IPage } from "../../types/generated/contentful";

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
    nextPage: (state) => {
      state.pageNumber++;
    },
  },
});

const { nextPage } = readSlice.actions;

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

const selectBookPages = (state: RootState) => {
  const book = selectBook(state);

  if (!book) {
    return null;
  }

  const pages: IPage[] | undefined = book.fields.pages;
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
