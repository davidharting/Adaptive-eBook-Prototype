import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";

// Could turn this into a book progress slice and also keep track of current page
// But there will also be book variants and options in the future so maybe keep this narrow

interface SelectBookState {
  bookId: string | null;
}

const initialState: SelectBookState = {
  bookId: null,
};

export const selectBookSlice = createSlice({
  name: "selectBook",
  initialState,
  reducers: {
    chooseBook: (state, action: PayloadAction<string>) => {
      state.bookId = action.payload;
    },
  },
});

export default selectBookSlice.reducer;

export const { chooseBook } = selectBookSlice.actions;

export const selectAvailableBooks = (state: RootState) => {
  return state.content.books;
};
