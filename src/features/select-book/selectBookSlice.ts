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
  previewBookId: string | null;
  readThroughId: string | null; // This could live on the read slice but doesn't really matter
}

const initialState: SelectBookState = {
  bookId: null,
  previewBookId: null,
  readThroughId: null,
};

export const selectBookSlice = createSlice({
  name: "selectBook",
  initialState,
  reducers: {
    clearPreview: (state) => {
      state.previewBookId = null;
    },
    previewBook: (state, action: PayloadAction<string>) => {
      state.previewBookId = action.payload;
      state.bookId = null;
    },
    chooseBook: (state, action: PayloadAction<string>) => {
      state.previewBookId = null;
      state.bookId = action.payload;
      state.readThroughId = shortid.generate();
    },
    finishBook: (state, action: PayloadAction<{ repeat: boolean }>) => {
      state.readThroughId = null;
      if (action.payload.repeat === false) {
        state.bookId = null;
      }
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

export const {
  clearPreview,
  chooseBook,
  previewBook,
  finishBook,
} = selectBookSlice.actions;

export const selectAvailableBooks = (state: RootState) => {
  return state.content.books.filter(
    (book) =>
      (Book.isAssessment(book) &&
        book.fields.testType === state.setupDevice.testType) ||
      book.fields.type === undefined ||
      book.fields.type === "normal"
  );
};

export const selectBook = (state: RootState) => {
  const bookId = state.selectBook.bookId;
  if (!bookId) {
    return null;
  }
  return getBook(state, bookId);
};

export const selectPreviewBook = (state: RootState) => {
  const bookId = state.selectBook.previewBookId;
  return bookId ? getBook(state, bookId) : null;
};

function getBook(state: RootState, bookId: string): IBook | null {
  const books = state.content.books;
  if (!books || !books.length) {
    return null;
  }
  const book = books.find((b) => b.sys.id === bookId);
  return book || null;
}

type SelectBookStatus = "idle" | "preview" | "selected";
export function selectStatus(state: RootState): SelectBookStatus {
  const bookId = state.selectBook.bookId;
  const previewBookId = state.selectBook.previewBookId;
  if (bookId === null && previewBookId === null) {
    return "idle";
  }
  if (previewBookId) {
    return "preview";
  }
  return "selected";
}

export const selectBookValidation = (state: RootState): BookValidation => {
  const book = selectBook(state);
  if (book) {
    return Book.validate(book);
  }
  return { status: "ok" };
};
