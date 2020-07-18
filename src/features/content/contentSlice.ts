import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getEntries } from "lib/contentful/client";
import { AppThunk, RootState } from "app/store";
import {
  IBook,
  IBookFields,
  IPageFields,
  IChoiceFields,
  IQuestionFields,
} from "types/generated/contentful";
import { Entry } from "contentful";

interface ContentState {
  books: Array<IBook>;
  status: LoadingState;
}

type Fields = IBookFields | IPageFields | IChoiceFields | IQuestionFields;
type LoadingState = "idle" | "loading" | "done" | "error";
export type SetContentPayload = Array<Entry<Fields>>;

const initialState: ContentState = { books: [], status: "idle" };

function reduceSetContent(
  state: ContentState,
  action: PayloadAction<SetContentPayload>
) {
  let books = action.payload.filter(
    (entry: Entry<Fields>) => entry.sys.contentType.sys.id === "book"
  );

  // Dear TypeScript compiler, I promise you that I have filtered down the list of Entries to only Books
  // However, I do not know how to do this correctly right now
  // @ts-ignore
  state.books = books;
  state.status = "done";
}

function reduceSetStatus(
  state: ContentState,
  action: PayloadAction<LoadingState>
) {
  state.status = action.payload;
}

export const contentSlice = createSlice({
  name: "content",
  initialState,
  reducers: {
    setContent: reduceSetContent,
    setStatus: reduceSetStatus,
  },
});

export default contentSlice.reducer;

const { setContent, setStatus } = contentSlice.actions;

export const fetchContent = (): AppThunk => async (dispatch) => {
  dispatch(setStatus("loading"));

  try {
    const response = await getEntries();
    dispatch(setContent(response.items));
  } catch (err) {
    // TODO: Report to sentry
    console.log("Unable to fetch content.");
    console.error(err);
    dispatch(setStatus("error"));
  }
};

export function selectLoadingState(state: RootState): LoadingState {
  return state.content.status;
}
