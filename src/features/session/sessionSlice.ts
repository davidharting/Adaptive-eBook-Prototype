import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type SessionStatus = "unstarted" | "started";

interface SessionState {
  status: SessionStatus;
  id: string | null;
  playerName: string;
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
    signOut: (state) => {
      state.status = "unstarted";
      state.id = null;
      state.playerName = "";
    },
  },
});

export default sessionSlice.reducer;

export const { signOut, startSession } = sessionSlice.actions;
