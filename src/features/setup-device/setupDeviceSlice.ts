import { createSlice, PayloadAction } from "@reduxjs/toolkit";
const shortid = require("shortid");

type SessionStatus = "unstarted" | "started";

type Treatment = "size" | "number" | "mixed";

interface SetupDeviceState {
  deviceId: string | null;
  ipAddressHash: string | null;
  playerName: string;
  status: SessionStatus;
  treatment: Treatment | null;
}

const initialState: SetupDeviceState = {
  deviceId: null,
  ipAddressHash: null,
  playerName: "",
  status: "unstarted",
  treatment: null,
};

type StartSessionPayload = { playerName: string };

export const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    startSession: (state, action: PayloadAction<StartSessionPayload>) => {
      state.deviceId = shortid.generate();
      state.status = "started";
      state.playerName = action.payload.playerName;
    },
    signOut: (state) => {
      state.deviceId = initialState.deviceId;
      state.ipAddressHash = initialState.ipAddressHash;
      state.playerName = initialState.playerName;
      state.status = initialState.status;
      state.treatment = initialState.treatment;
    },
  },
});

export default sessionSlice.reducer;

export const { signOut, startSession } = sessionSlice.actions;
