import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  nextPage,
  selectBook,
  selectPage,
  selectPageNumber,
} from "./readSlice";
import Page from "./components/Page";

function Read() {
  const dispatch = useDispatch();
  const book = useSelector(selectBook);
  const pageNumber = useSelector(selectPageNumber);
  const page = useSelector(selectPage);

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
      <button
        onClick={() => {
          dispatch(nextPage());
        }}
      >
        Next page >
      </button>
    </>
  );
}

export default Read;
