import { IPage, IPrompt } from "types/generated/contentful";
import { Treatment } from "features/setup-device/setupDeviceSlice";

class Page {
  static getAudio(page: IPage): string[] {
    const promptAudio = page.fields.narrative.fields.audio?.fields.file.url;
    return promptAudio ? [promptAudio] : [];
  }

  static getPrompt(page: IPage, treatment: Treatment): IPrompt | null {
    switch (treatment) {
      case "mixed": {
        // Originally, the page only had a single narrative field.
        // When we added fields that are specific to the treatment,
        // the original field was repurposes to be the "mixed treatment" narrative field
        return page.fields.narrative;
      }
      case "number": {
        return page.fields.numberNarrative || null;
      }
      case "size": {
        return page.fields.sizeNarrative || null;
      }
    }
  }
}

export default Page;
