import React from "react";
import cn from "classnames";
import { useDispatch, useSelector } from "react-redux";
import Button from "react-bootstrap/Button";
import { Asset } from "contentful";
import { IQuestion, IChoice } from "types/generated/contentful";

import Prompt from "./Prompt";

import {
  chooseAnswerAsync,
  selectAnswer,
  selectQuestionStatus,
  selectPrompt,
  selectChoice,
} from "../readSlice";

import styles from "./question.module.css";

interface QuestionProps {
  question: IQuestion;
}

function Question({ question }: QuestionProps) {
  const narrative = question.fields.narrative;
  const questionPrompt = useSelector(selectPrompt);
  const choice = useSelector(selectChoice);

  return (
    <>
      {narrative && <Prompt prompt={narrative} />}
      {questionPrompt && <Prompt prompt={questionPrompt} />}
      <div className="w-100 d-flex align-items-center justify-content-around">
        {choice && <Choice choice={choice} questionId={question.sys.id} />}
      </div>
    </>
  );
}

function Choice({ choice, questionId }: ChoiceProps) {
  const dispatch = useDispatch();

  const status = useSelector(selectQuestionStatus);
  const answer = useSelector(selectAnswer);

  const selectStimulus = (stimulusId: string) => {
    dispatch(chooseAnswerAsync({ questionId, stimulusId }));
  };

  const decorate = (stimulusId: string) => {
    if (
      (status === "CORRECT" || status === "WRONG") &&
      stimulusId === answer?.stimulusId
    ) {
      return status;
    }
    return false;
  };

  const disabled = status !== "UNANSWERED";
  return (
    <>
      <Stimulus
        decorate={decorate(choice.fields.stimulusA.sys.id)}
        disabled={disabled}
        onClick={selectStimulus}
        stimulus={choice.fields.stimulusA}
      />
      <Stimulus
        decorate={decorate(choice.fields.stimulusB.sys.id)}
        disabled={disabled}
        onClick={selectStimulus}
        stimulus={choice.fields.stimulusB}
      />
    </>
  );
}

interface ChoiceProps {
  choice: IChoice;
  questionId: string;
}

interface StimulusProps {
  decorate?: "CORRECT" | "WRONG" | false;
  disabled: boolean;
  onClick: OnStimulusClick;
  stimulus: Asset;
}

interface OnStimulusClick {
  (stimulusId: string): void;
}

// TODO: Stimulus should probably be own file
// When it is its own file that will make me want to rethink the data passing
// The stimulus should be able to use it's stimulus ID and then ask more about itself of state
// e.g., - am I disabled? am I right / wrong?

function Stimulus({ decorate, disabled, onClick, stimulus }: StimulusProps) {
  const cx = cn("d-flex flex-column justify-content-between", styles.stimulus, {
    [styles.stimulusCorrect]: decorate === "CORRECT",
    [styles.stimulusWrong]: decorate === "WRONG",
  });

  return (
    <div className={cx}>
      <img alt={stimulus.fields.description} src={stimulus.fields.file.url} />
      <Button
        className="btn-xl"
        disabled={disabled}
        variant="primary"
        onClick={() => onClick(stimulus.sys.id)}
        style={{ display: disabled ? "none" : "block" }}
      >
        Select
      </Button>
    </div>
  );
}

export default Question;
