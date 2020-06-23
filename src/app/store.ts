import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";

import contentReducer from "../features/content/contentSlice";
import counterReducer from "../features/counter/counterSlice";
import readReducer from "../features/read/readSlice";
import selectBookReducer from "../features/select-book/selectBookSlice";
import setupDeviceReducer from "../features/setup-device/setupDeviceSlice";

// Approach for persisting state came from Dan Abramov himself 🙏
// https://egghead.io/lessons/javascript-redux-persisting-the-state-to-the-local-storage
const saveState = (state: {
  read: Object;
  selectBook: Object;
  setupDevice: Object;
  counter: Object;
}) => {
  try {
    const serializedState = JSON.stringify({
      read: state.read,
      selectBook: state.selectBook,
      setupDevice: state.setupDevice,
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
    content: contentReducer,
    counter: counterReducer,
    read: readReducer,
    selectBook: selectBookReducer,
    setupDevice: setupDeviceReducer,
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
