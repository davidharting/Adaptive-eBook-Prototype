import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import shortid from "shortid";

import { RootState } from "../../app/store";

import { finishBook } from "../read/readSlice";
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
  },
  extraReducers: {
    [finishBook.toString()]: (state) => {
      state.bookId = null;
    },
    [signOut.toString()]: (state) => {
      state.bookId = null;
    },
  },
});

export default selectBookSlice.reducer;

export const { chooseBook } = selectBookSlice.actions;

export const selectAvailableBooks = (state: RootState) => {
  return state.content.books;
};
