import React from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "react-bootstrap/Button";
import styles from "./preview-book.module.css";
import {
  chooseBook,
  clearPreview,
  selectPreviewBook,
} from "../selectBookSlice";

function PreviewBook() {
  const dispatch = useDispatch();
  const book = useSelector(selectPreviewBook);
  const coverImage = book?.fields.cover?.fields.file;

  if (!book) {
    return <h1>Sorry, there was an error</h1>;
  }

  return (
    <div>
      {coverImage && (
        <img
          alt={book.fields.title}
          src={coverImage.url}
          className={styles.coverImage}
        />
      )}
      <div className={styles.bottomButtons}>
        <Button
          className="btn-xl"
          variant="secondary"
          onClick={() => dispatch(clearPreview())}
        >
          Choose a different book
        </Button>
        <Button
          className="btn-xl"
          variant="primary"
          onClick={() => dispatch(chooseBook(book.sys.id))}
        >
          Begin!
        </Button>
      </div>
    </div>
  );
}

export default PreviewBook;
