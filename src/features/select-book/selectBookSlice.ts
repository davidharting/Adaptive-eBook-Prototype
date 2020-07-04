import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import shortid from "shortid";

import { IBook } from "types/generated/contentful";

import Book, { BookValidation } from "models/Book";

import { RootState } from "../../app/store";
import { signOut } from "../setup-device/setupDeviceSlice";

// Could turn this into a book progress slice and also keep track of current page
// But there will also be book variants and options in the future so maybe keep this narrow

interface SelectBookState {
  bookId: string | null;
  readThroughId: string | null; // This could live on the read slice but doesn't really matter
}

const initialState: SelectBookState = {
  bookId: null,
  readThroughId: null,
};

export const selectBookSlice = createSlice({
  name: "selectBook",
  initialState,
  reducers: {
    chooseBook: (state, action: PayloadAction<string>) => {
      state.bookId = action.payload;
      state.readThroughId = shortid.generate();
    },
    finishBook: (state) => {
      state.bookId = null;
      state.readThroughId = null;
    },
  },
  extraReducers: {
    // TODO: Rename "signOut" to "reset"
    [signOut.toString()]: (state) => {
      state.bookId = null;
      state.readThroughId = null;
    },
  },
});

export default selectBookSlice.reducer;

export const { chooseBook, finishBook } = selectBookSlice.actions;

export const selectAvailableBooks = (state: RootState) => {
  return state.content.books;
};

export const selectBook = (state: RootState) => {
  const bookId = state.selectBook.bookId;
  if (!bookId) {
    return null;
  }
  return getBook(state, bookId);
};

function getBook(state: RootState, bookId: string): IBook | null {
  const books = state.content.books;
  if (!books || !books.length) {
    return null;
  }
  const book = books.find((b) => b.sys.id === bookId);
  return book || null;
}

export const selectBookValidation = (state: RootState): BookValidation => {
  const book = selectBook(state);
  if (book) {
    return Book.validate(book);
  }
  return { status: "ok" };
};
