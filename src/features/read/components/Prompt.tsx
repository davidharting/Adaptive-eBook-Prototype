import React from "react";
import { IPrompt } from "types/generated/contentful";
import PromptModel from "models/Prompt";

function Prompt({ prompt }: PromptProps) {
  return (
    <p
      className="mb-0 text-center"
      style={{ fontSize: "2.5rem", zIndex: 1000 }}
    >
      {PromptModel.getText(prompt)}
    </p>
  );
}

interface PromptProps {
  prompt: IPrompt;
}

export default Prompt;
