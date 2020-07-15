import React from "react";
import { IPrompt } from "types/generated/contentful";

// TODO: Read to me logic would go here?

function Prompt({ prompt }: PromptProps) {
  return <p style={{ fontSize: "2.5rem" }}>{prompt.fields.text}</p>;
}

interface PromptProps {
  prompt: IPrompt;
}

export default Prompt;
