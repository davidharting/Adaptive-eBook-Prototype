import { IChoice } from "types/generated/contentful";
import { Mode, StimuliLabel } from "./constants";
import { Asset } from "contentful";

class Choice {
  static isSelectionCorrect(
    choice: IChoice,
    mode: Mode,
    stimulusId: string
  ): boolean {
    const correctStimulus = getCorrectStimulus(choice, mode);
    return stimulusId === correctStimulus.sys.id;
  }
}

export default Choice;

/* Private */

function getCorrectStimulus(choice: IChoice, mode: Mode): Asset {
  const correctLabel = getCorrectStimulusLabel(choice, mode);
  return correctLabel === "A"
    ? choice.fields.stimulusA
    : choice.fields.stimulusB;
}

function getCorrectStimulusLabel(choice: IChoice, mode: Mode): StimuliLabel {
  const label =
    mode === "number"
      ? choice.fields.quantityCorrectStimulus
      : choice.fields.sizeCorrectStimulus;

  if (!label) {
    throw new Error(`Missing correct stimulus for mode ${mode}`);
  }

  return label;
}
