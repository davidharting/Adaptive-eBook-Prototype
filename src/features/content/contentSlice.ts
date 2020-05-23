import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  IBook,
  IOption,
  IPage,
  IStimulus,
} from "../../types/generated/contentful";

interface ContentState {
  books: Array<IBook>;
}

type Entry = IBook | IOption | IPage | IStimulus;
export type SetContentPayload = Array<Entry>;

const initialState: ContentState = { books: [] };

function reduceSetContent(
  state: ContentState,
  action: PayloadAction<SetContentPayload>
) {
  let books = action.payload.filter(
    (entry: Entry) => entry.sys.contentType.sys.id === "book"
  );

  // Dear TypeScript compiler, I promise you that I have filtered down the list of Entries to only Books
  // However, I do not know how to do this correctly right now
  // @ts-ignore
  state.books = books;
}

export const contentSlice = createSlice({
  name: "content",
  initialState,
  reducers: {
    setContent: reduceSetContent,
  },
});

export default contentSlice.reducer;

export const { setContent } = contentSlice.actions;
