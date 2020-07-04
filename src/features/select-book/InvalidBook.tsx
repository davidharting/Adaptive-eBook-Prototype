import React from "react";
import { useDispatch } from "react-redux";
import Button from "react-bootstrap/Button";
import { finishBook } from "./selectBookSlice";
import { BookValidation } from "models/Book";

function InvalidBook({ error }: InvalidBookProps) {
  const dispatch = useDispatch();

  return (
    <div>
      <h1>There are problems with this book</h1>
      <p>
        This error should only be seen during development. If you are a user of
        this adaptive eBook and see this error page, please contact&nbsp;
        <a href="mailto:davideharting@gmail.com">davideharting@gmail.com</a>.
      </p>
      {error.message && <b>{error.message}</b>}
      {error.questions && <QuestionErrors questions={error.questions} />}
      <Button variant="primary" onClick={() => dispatch(finishBook())}>
        Choose a different book
      </Button>
    </div>
  );
}

interface InvalidBookProps {
  error: BookValidation;
}

function QuestionErrors({ questions }: QuestionErrorsProps) {
  return (
    <>
      <h2>Problems</h2>
      {questions.map((q) => (
        <li>
          {q.message}
          <ul>
            {q.problems.map((p) => (
              <li>{p}</li>
            ))}
          </ul>
        </li>
      ))}
    </>
  );
}

interface QuestionErrorsProps {
  questions: Array<{
    message: string;
    problems: Array<string>;
  }>;
}

export default InvalidBook;
