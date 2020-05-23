import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Could turn this into a book progress slice and also keep track of current page

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
