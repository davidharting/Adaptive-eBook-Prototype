import React from "react";
import Button from "react-bootstrap/Button";
import { IQuestion, IStimulus } from "types/generated/contentful";

import styles from "./question.module.css";

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
    <div
      className={`d-flex flex-column justify-content-between w-50 h-100 rounded ${styles.stimulus}`}
      onClick={() => {
        console.log("hey!");
      }}
      role="button"
    >
      <img
        alt={stimulus.fields.image.fields.description}
        src={stimulus.fields.image.fields.file.url}
        style={{ maxWidth: "100%", height: "auto" }}
      />
      <Button variant="link" size="lg">
        Pick me
      </Button>
    </div>
  );
}

export default Question;
