import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "app/store";
import { Mode } from "models/Question";

const shortid = require("shortid");

type SessionStatus = "unstarted" | "started";

export type Treatment = Mode | "mixed";

interface SetupDeviceState {
  setupId: string | null;
  playerName: string;
  status: SessionStatus;
  treatment: Treatment | null;
}

const initialState: SetupDeviceState = {
  setupId: null,
  playerName: "",
  status: "unstarted",
  treatment: null,
};

type StartSessionPayload = { playerName: string; treatment: Treatment };

export const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    startSession: (state, action: PayloadAction<StartSessionPayload>) => {
      state.setupId = shortid.generate();
      state.status = "started";
      state.treatment = action.payload.treatment;
      state.playerName = action.payload.playerName;
    },
    signOut: (state) => {
      state.setupId = initialState.setupId;
      state.playerName = initialState.playerName;
      state.status = initialState.status;
      state.treatment = initialState.treatment;
    },
  },
});

export default sessionSlice.reducer;

export const { signOut, startSession } = sessionSlice.actions;

export const selectTreatment = (state: RootState): Treatment | null => {
  return state.setupDevice.treatment;
};
