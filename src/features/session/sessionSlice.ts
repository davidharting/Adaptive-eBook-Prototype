import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type SessionStatus = "unstarted" | "started";

interface SessionState {
  status: SessionStatus;
  id: String | null;
  playerName: String;
}

const initialState: SessionState = {
  status: "unstarted",
  id: null,
  playerName: "",
};

type StartSessionPayload = { playerName: string };

export const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    startSession: (state, action: PayloadAction<StartSessionPayload>) => {
      state.status = "started";
      state.id = "abc-123-in-the-future-randomly-generate-me";
      state.playerName = action.payload.playerName;
    },
  },
});

export default sessionSlice.reducer;

export const { startSession } = sessionSlice.actions;
