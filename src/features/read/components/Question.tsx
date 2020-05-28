import React from "react";
import { IQuestion } from "types/generated/contentful";

interface QuestionProps {
  question: IQuestion;
}

function Question({ question }: QuestionProps) {
  return <p>{JSON.stringify(question, null, 2)}</p>;
}

export default Question;
