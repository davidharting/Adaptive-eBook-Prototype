import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";

import counterReducer from "../features/counter/counterSlice";
import sessionReducer from "../features/session/sessionSlice";

// Approach for persisting state came from Dan Abramov himself 🙏
// https://egghead.io/lessons/javascript-redux-persisting-the-state-to-the-local-storage
const saveState = (state: { session: Object; counter: Object }) => {
  try {
    const serializedState = JSON.stringify({
      session: state.session,
    });
    localStorage.setItem("state", serializedState);
  } catch (err) {
    console.error("Unable to persist state to local storage.", err);
  }
};

const loadState = () => {
  try {
    const serializedState = localStorage.getItem("state");
    return serializedState ? JSON.parse(serializedState) : undefined;
  } catch (err) {
    return undefined;
  }
};

export const store = configureStore({
  preloadedState: loadState(),
  reducer: {
    counter: counterReducer,
    session: sessionReducer,
  },
});

store.subscribe(() => {
  saveState(store.getState());
});

export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
