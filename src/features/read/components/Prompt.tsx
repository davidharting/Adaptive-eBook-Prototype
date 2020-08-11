import React from "react";
import { IPrompt } from "types/generated/contentful";

function Prompt({ prompt }: PromptProps) {
  return (
    <p className="mb-0 text-center" style={{ fontSize: "2.5rem" }}>
      {prompt.fields.text}
    </p>
  );
}

interface PromptProps {
  prompt: IPrompt;
}

export default Prompt;
