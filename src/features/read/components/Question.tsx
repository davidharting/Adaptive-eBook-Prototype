import React from "react";
import { IQuestion, IStimulus } from "types/generated/contentful";

interface QuestionProps {
  question: IQuestion;
}

function Question({ question }: QuestionProps) {
  return (
    <>
      <p>{question.fields.prompt}</p>
      <div className="d-flex align-items-center justify-content-around">
        <Stimulus stimulus={question.fields.left} />
        <Stimulus stimulus={question.fields.right} />
      </div>
    </>
  );
}

interface StimulusProps {
  stimulus: IStimulus;
}

function Stimulus({ stimulus }: StimulusProps) {
  return (
    <div className="w-50 h-100">
      <img
        alt={stimulus.fields.image.fields.description}
        src={stimulus.fields.image.fields.file.url}
        style={{ maxWidth: "100%", height: "auto" }}
      />
    </div>
  );
}

export default Question;
