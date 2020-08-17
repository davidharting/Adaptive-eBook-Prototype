import { IPrompt } from "types/generated/contentful";

class Prompt {
  static getText(prompt: IPrompt): string {
    const { text, longText } = prompt.fields;
    return longText ? longText : text;
  }
}

export default Prompt;
