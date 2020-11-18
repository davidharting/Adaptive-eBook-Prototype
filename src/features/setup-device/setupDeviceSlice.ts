import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "app/store";
import { Mode } from "models/constants";

const shortid = require("shortid");

type SessionStatus = "unstarted" | "started";

export type Treatment = Mode | "mixed";

interface SetupDeviceState {
  setupId: string | null;
  parentName: string;
  childName: string;
  status: SessionStatus;
  treatment: Treatment | null;
  testType: string;
}

const initialState: SetupDeviceState = {
  setupId: null,
  childName: "",
  parentName: "",
  status: "unstarted",
  treatment: null,
  testType: "",
};

type StartSessionPayload = {
  childName: string;
  parentName: string;
  treatment: Treatment;
  testType: string;
};

export const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    startSession: (state, action: PayloadAction<StartSessionPayload>) => {
      state.setupId = shortid.generate();
      state.status = "started";
      state.treatment = action.payload.treatment;
      state.childName = action.payload.childName;
      state.parentName = action.payload.parentName;
      state.testType = action.payload.testType;
    },
    signOut: (state) => {
      state.setupId = initialState.setupId;
      state.childName = initialState.childName;
      state.parentName = initialState.parentName;
      state.status = initialState.status;
      state.treatment = initialState.treatment;
      state.testType = initialState.testType;
    },
  },
});

export default sessionSlice.reducer;

export const { signOut, startSession } = sessionSlice.actions;

export const selectTreatment = (state: RootState): Treatment | null => {
  return state.setupDevice.treatment;
};
