import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { chooseBook, selectAvailableBooks } from "./selectBookSlice";

function SelectBook() {
  const dispatch = useDispatch();
  const choices = useSelector(selectAvailableBooks);

  const [selected, setSelected] = React.useState<string | null>(null);

  return (
    <>
      <h1>Select a book!</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (selected !== null) {
            dispatch(chooseBook(selected));
          }
        }}
      >
        {choices.map((book) => {
          return (
            <>
              <input
                type="radio"
                id={book.sys.id}
                name="book"
                value={book.sys.id}
                onChange={(e) => setSelected(e.target.value)}
              />
              <label htmlFor={book.sys.id}>{book.fields.title}</label>
              <br />
            </>
          );
        })}
        <button disabled={selected === null} type="submit">
          {selected === null && "Please choose a book"}
          {selected !== null && "Read this book!"}
        </button>
      </form>
    </>
  );
}

export default SelectBook;
