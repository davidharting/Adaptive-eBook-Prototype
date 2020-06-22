import React from "react";
import cn from "classnames";
import { useDispatch, useSelector } from "react-redux";
import Button from "react-bootstrap/Button";
import { IQuestion, IStimulus } from "types/generated/contentful";

import {
  chooseAnswerAsync,
  selectAnswer,
  selectQuestionStatus,
} from "../readSlice";

import styles from "./question.module.css";

interface QuestionProps {
  question: IQuestion;
}

function Question({ question }: QuestionProps) {
  const dispatch = useDispatch();
  const status = useSelector(selectQuestionStatus);
  const answer = useSelector(selectAnswer);

  const selectStimulus = (stimulusId: string) => {
    dispatch(chooseAnswerAsync({ questionId: question.sys.id, stimulusId }));
  };

  const disabled = status !== "UNANSWERED";

  const decorate = (stimulusId: string) => {
    if (
      (status === "CORRECT" || status === "WRONG") &&
      stimulusId === answer?.stimulusId
    ) {
      return status;
    }
    return false;
  };

  return (
    <>
      <p>{question.fields.quantityPrompt}</p>
      <div className="d-flex align-items-center justify-content-around">
        <Stimulus
          decorate={decorate(question.fields.left.sys.id)}
          disabled={disabled}
          onClick={selectStimulus}
          stimulus={question.fields.left}
        />
        <Stimulus
          decorate={decorate(question.fields.right.sys.id)}
          disabled={disabled}
          onClick={selectStimulus}
          stimulus={question.fields.right}
        />
      </div>
    </>
  );
}

interface StimulusProps {
  decorate?: "CORRECT" | "WRONG" | false;
  disabled: boolean;
  onClick: OnStimulusClick;
  stimulus: IStimulus;
}

interface OnStimulusClick {
  (stimulusId: string): void;
}

// TODO: Stimulus should probably be own file
// When it is its own file that will make me want to rethink the data passing
// The stimulus should be able to use it's stimulus ID and then ask more about itself of state
// e.g., - am I disabled? am I right / wrong?

function Stimulus({ decorate, disabled, onClick, stimulus }: StimulusProps) {
  const cx = cn(
    `d-flex flex-column justify-content-between w-50 h-100`,
    {
      "border border-success": decorate === "CORRECT",
      "border border-danger": decorate === "WRONG",
    },
    { [styles.stimulus]: true }
  );

  return (
    <div className={cx}>
      <img
        alt={stimulus.fields.image.fields.description}
        src={stimulus.fields.image.fields.file.url}
        style={{ maxWidth: "100%", height: "auto" }}
      />
      <Button
        disabled={disabled}
        variant="primary"
        size="lg"
        onClick={() => onClick(stimulus.sys.id)}
        style={{ visibility: disabled ? "hidden" : "visible" }}
      >
        Select
      </Button>
      {decorate === "CORRECT" && (
        <p className={`text-success ${styles.feedback}`}>Nice work!</p>
      )}
      {decorate === "WRONG" && (
        <p className={`text-danger ${styles.feedback}`}>
          Sorry, this is not the right one!
        </p>
      )}
    </div>
  );
}

export default Question;
