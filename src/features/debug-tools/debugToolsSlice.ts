import { RootState } from "app/store";
import {
  selectDifficulty,
  selectHistory,
  selectMode,
} from "features/read/readSlice";
import { selectTreatment } from "features/setup-device/setupDeviceSlice";

export function selectDebugData(state: RootState): Datum[] {
  const mode = selectMode(state);
  const treatment = selectTreatment(state);
  const difficulty = selectDifficulty(state);
  const history = selectHistory(state);

  const numberCorrect = history.filter((i) => i.grade === "CORRECT").length;
  const numberWrong = history.filter((i) => i.grade === "WRONG").length;

  return [
    { key: "Treatment", value: treatment },
    { key: "Mode", value: mode },
    { key: "Difficulty", value: difficulty },
    { key: "Correct", value: numberCorrect },
    { key: "Wrong", value: numberWrong },
  ];
}

interface Datum {
  key: string;
  value?: string | number | null;
}
