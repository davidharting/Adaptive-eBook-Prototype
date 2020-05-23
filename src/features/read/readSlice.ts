import { createSlice, PayloadAction } from "@reduxjs/toolkit";
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
      // TODO: Make this a thunk
      // From state, figure out what book we are reading
      // to determine if the page turn is valid
      // Page turn should also only be allowed after they have selected the correct response
      state.pageNumber++;
    },
  },
});

export const { nextPage } = readSlice.actions;

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

export const selectPage = (state: RootState) => {
  const book = selectBook(state);
  const pageNumber = selectPageNumber(state);

  if (!book) {
    return null;
  }

  const pages: IPage[] | undefined = book.fields.pages;
  if (!pages || !pages.length || pages.length < pageNumber) {
    return null;
  }

  return pages[pageNumber];
};
