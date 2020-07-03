import React from "react";
import { useDispatch } from "react-redux";
import Button from "react-bootstrap/Button";
import { finishBook } from "./selectBookSlice";

function InvalidBook({ problems }: InvalidBookProps) {
  const dispatch = useDispatch();
  return (
    <div>
      <h1>There are problems with this book</h1>
      <p>
        This error should only be seen during development. If you are a user of
        this adaptive eBook and see this error page, please contact&nbsp;
        <a href="mailto:davideharting@gmail.com">davideharting@gmail.com</a>.
      </p>
      <h2>Errors:</h2>
      {problems.length < 1 && (
        <p>We could not automatically determine the problem with this book.</p>
      )}
      {problems.length > 1 && (
        <ul>
          {problems.map((problem) => (
            <li>{problem}</li>
          ))}
        </ul>
      )}
      <Button variant="primary" onClick={() => dispatch(finishBook())}>
        Choose a different book
      </Button>
    </div>
  );
}

interface InvalidBookProps {
  problems: Array<string>;
}

export default InvalidBook;
