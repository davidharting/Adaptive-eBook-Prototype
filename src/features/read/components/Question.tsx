import React from "react";
import cn from "classnames";
import { useDispatch } from "react-redux";
import Button from "react-bootstrap/Button";
import { IQuestion, IStimulus } from "types/generated/contentful";

import { chooseAnswer } from "../readSlice";

import styles from "./question.module.css";

type QuestionStatus = "unanswered" | "correct" | "wrong";

interface QuestionProps {
  question: IQuestion;
}

function Question({ question }: QuestionProps) {
  const dispatch = useDispatch();

  const status: QuestionStatus = "unanswered";

  const selectStimulus = (stimulusId: string) => {
    dispatch(chooseAnswer({ questionId: question.sys.id, stimulusId }));
  };

  return (
    <>
      <p>{question.fields.prompt}</p>
      <div className="d-flex align-items-center justify-content-around">
        <Stimulus
          disabled={status !== "unanswered"}
          onClick={selectStimulus}
          stimulus={question.fields.left}
        />
        <Stimulus
          disabled={status !== "unanswered"}
          onClick={selectStimulus}
          stimulus={question.fields.right}
        />
      </div>
    </>
  );
}

interface StimulusProps {
  disabled: boolean;
  onClick: OnStimulusClick;
  stimulus: IStimulus;
}

interface OnStimulusClick {
  (stimulusId: string): void;
}

function Stimulus({ disabled, onClick, stimulus }: StimulusProps) {
  const cx = cn(
    "d-flex flex-column justify-content-between w-50 h-100 rounded",
    {
      [styles.stimulus]: disabled === false,
      [styles.disabledStimulus]: disabled === true,
    }
  );

  return (
    <div className={cx} onClick={() => onClick(stimulus.sys.id)} role="button">
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
