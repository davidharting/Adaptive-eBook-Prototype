import React from "react";
import { useSelector, useDispatch } from "react-redux";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import CenteredLayout from "layouts/Centered";
import {
  chooseBook,
  selectAvailableBooks,
  selectBookValidation,
} from "./selectBookSlice";
import InvalidBook from "./InvalidBook";

function SelectBook() {
  const dispatch = useDispatch();
  const choices = useSelector(selectAvailableBooks);
  const validation = useSelector(selectBookValidation);

  const [selected, setSelected] = React.useState<string | null>(null);

  if (validation.status === "error") {
    return (
      <CenteredLayout>
        <InvalidBook problems={validation.problems} />
      </CenteredLayout>
    );
  }

  return (
    <CenteredLayout>
      <div>
        <h1>Select a book!</h1>
        <Form
          onSubmit={(e: React.FormEvent) => {
            e.preventDefault();
            if (selected !== null) {
              dispatch(chooseBook(selected));
            }
          }}
        >
          <Form.Group>
            {choices.map((book) => {
              return (
                <Form.Check
                  key={book.sys.id}
                  type="radio"
                  name="book"
                  id={book.sys.id}
                  label={book.fields.title}
                  value={book.sys.id}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setSelected(e.target.value);
                  }}
                />
              );
            })}
          </Form.Group>
          <Button variant="primary" disabled={selected === null} type="submit">
            {selected === null && "Please choose a book"}
            {selected !== null && "Read this book!"}
          </Button>
        </Form>
      </div>
    </CenteredLayout>
  );
}

export default SelectBook;
