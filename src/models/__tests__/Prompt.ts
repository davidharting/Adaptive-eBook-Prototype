import Prompt from "../Prompt";
import { IPrompt, IPromptFields } from "types/generated/contentful";

describe("#getText", () => {
  it("should return the LongText field when it has a value", () => {
    const prompt = createPrompt({
      text: "I am short!",
      longText: "And I am very very long (potentially)",
    });
    expect(Prompt.getText(prompt)).toBe(
      "And I am very very long (potentially)"
    );
  });

  it("should return the text field when LongText is empty string", () => {
    const prompt = createPrompt({ text: "I am short", longText: "" });
    expect(Prompt.getText(prompt)).toBe("I am short");
  });

  it("should return the text field when LongText is undefined", () => {
    const prompt = createPrompt({ text: "I am short" });
    expect(Prompt.getText(prompt)).toBe("I am short");
  });
});

function createPrompt(fields: IPromptFields): IPrompt {
  return {
    fields: fields,
    sys: {
      id: "XYZ",
      type: "prompt",
      createdAt: "now",
      updatedAt: "now",
      locale: "en-us",
      contentType: {
        sys: {
          id: "prompt",
          linkType: "ContentType",
          type: "Link",
        },
      },
    },
    toPlainObject() {
      return fields;
    },
    update() {
      return Promise.resolve(createPrompt(fields));
    },
  };
}
