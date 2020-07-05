import React from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import { finishBook, selectBookValidation } from "./selectBookSlice";

function InvalidBook() {
  const dispatch = useDispatch();
  const validation = useSelector(selectBookValidation);

  return (
    <Container>
      <h1>There are problems with this book</h1>
      <p>
        This error should only be seen during development. If you are a user of
        this adaptive eBook and see this error page, please contact&nbsp;
        <a href="mailto:davideharting@gmail.com">davideharting@gmail.com</a>.
      </p>
      {validation.message && <b>{validation.message}</b>}
      {validation.questions && (
        <QuestionErrors questions={validation.questions} />
      )}
      <Button variant="primary" onClick={() => dispatch(finishBook())}>
        Choose a different book
      </Button>
    </Container>
  );
}

export default InvalidBook;

function QuestionErrors({ questions }: QuestionErrorsProps) {
  return (
    <>
      <h2>Problems</h2>
      {questions.map((q) => (
        <li key={q.message}>
          {q.message}
          <ul>
            {q.problems.map((p) => (
              <li key={p}>{p}</li>
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
