import React from "react";
import { IPrompt } from "types/generated/contentful";
import PromptModel from "models/Prompt";
import styles from "./prompt.module.css";

function Prompt({ prompt }: PromptProps) {
  return (
    <p className={`mb-0 text-center ${styles.prompt}`}>
      {PromptModel.getText(prompt)}
    </p>
  );
}

interface PromptProps {
  prompt: IPrompt;
}

export default Prompt;
