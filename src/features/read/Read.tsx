import React from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "react-bootstrap/Button";
import {
  finishBook,
  goToNextPage,
  selectBook,
  selectPage,
  selectPageNumber,
  selectHasNextPage,
} from "./readSlice";
import Page from "./components/Page";

function Read() {
  const dispatch = useDispatch();
  const book = useSelector(selectBook);
  const pageNumber = useSelector(selectPageNumber);
  const page = useSelector(selectPage);
  const hasNextPage = useSelector(selectHasNextPage);

  if (!book) {
    // TODO: Use an effect hook or something to make sure that we get a warning to sentry
    return (
      <>
        <h1>Sorry, there has been an error.</h1>
        <p>We cannot find the book you selected.</p>
      </>
    );
  }

  return (
    <>
      <h1>You are on page: {pageNumber + 1}</h1>
      {page === null && (
        <>
          <h2>Sorry, we cannot find that page.</h2>
        </>
      )}
      {page && <Page page={page} />}
      {hasNextPage === true && (
        <Button
          onClick={() => {
            dispatch(goToNextPage());
          }}
        >
          Next page >
        </Button>
      )}
      {hasNextPage === false && (
        <Button
          onClick={() => {
            dispatch(finishBook());
          }}
        >
          All done!
        </Button>
      )}
    </>
  );
}

export default Read;
