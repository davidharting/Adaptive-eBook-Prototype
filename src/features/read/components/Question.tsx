import React from "react";
import cn from "classnames";
import { useDispatch, useSelector } from "react-redux";
import Button from "react-bootstrap/Button";
import { Asset } from "contentful";
import { IQuestion, IChoice } from "types/generated/contentful";

import Prompt from "./Prompt";

import {
  chooseAnswerAsync,
  selectQuestionStatus,
  selectPrompt,
  selectChoice,
  Grade,
} from "../readSlice";

import styles from "./question.module.css";

interface QuestionProps {
  question: IQuestion;
}

function Question({ question }: QuestionProps) {
  const status = useSelector(selectQuestionStatus);
  const choice = useSelector(selectChoice);

  return (
    <>
      {status === "UNANSWERED" || status === "NOT_QUESTION" ? (
        <QuestionText question={question} />
      ) : (
        <Feedback grade={status} />
      )}
      <div className="w-100 d-flex align-items-center justify-content-around">
        {choice && <Choice choice={choice} questionId={question.sys.id} />}
      </div>
    </>
  );
}

function QuestionText({ question }: { question: IQuestion }) {
  const narrative = question.fields.narrative;
  const questionPrompt = useSelector(selectPrompt);
  return (
    <>
      {narrative && <Prompt prompt={narrative} />}
      {questionPrompt && <Prompt prompt={questionPrompt} />}
    </>
  );
}

function Feedback({ grade }: { grade: Grade }) {
  return (
    <p
      className={cn("mb-0 text-center", {
        [styles.correct]: grade === "CORRECT",
        [styles.wrong]: grade === "WRONG",
      })}
    >
      {grade === "CORRECT" ? "Correct! ✅" : "Sorry, that's not right. ⛔️"}
    </p>
  );
}

function Choice({ choice, questionId }: ChoiceProps) {
  const dispatch = useDispatch();

  const status = useSelector(selectQuestionStatus);

  const selectStimulus = (stimulusId: string) => {
    dispatch(chooseAnswerAsync({ questionId, stimulusId }));
  };

  const disabled = status !== "UNANSWERED";
  return (
    <>
      <Stimulus
        disabled={disabled}
        onClick={selectStimulus}
        stimulus={choice.fields.stimulusA}
      />
      <Stimulus
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
  disabled: boolean;
  onClick: OnStimulusClick;
  stimulus: Asset;
}

interface OnStimulusClick {
  (stimulusId: string): void;
}

function Stimulus({ disabled, onClick, stimulus }: StimulusProps) {
  return (
    <div
      className={`d-flex flex-column justify-content-between ${styles.stimulus}`}
    >
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
