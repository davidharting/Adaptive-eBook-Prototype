import { last } from "lib/array";
import { flipCoin } from "lib/math/random";
import { Mode } from "models/constants";
import { Answer } from "./readSlice";

export function nextMode(history: Answer[]): Mode {
  if (history.length >= 2) {
    const modeHistory = history.map((h) => h.mode);
    const latest = last(modeHistory, 2);
    if (latest[0] === latest[1]) {
      return oppositeMode(latest[0]);
    }
  }

  return flipCoin("number", "size");
}

function oppositeMode(mode: Mode): Mode {
  return mode === "number" ? "size" : "number";
}
