import React from "react";
import { useDispatch, useSelector } from "react-redux";
import BookPageLayout from "layouts/BookPage";
import { finishBook, selectBook } from "features/select-book/selectBookSlice";
import ResetDevice from "features/setup-device/ResetDevice";
import {
  goToNextPage,
  selectPage,
  selectPageNumber,
  selectOnLastPage,
  selectCanPageForward,
} from "./readSlice";
import Page from "./components/Page";
import CenteredLayout from "layouts/Centered";

function Read() {
  const dispatch = useDispatch();
  const book = useSelector(selectBook);
  const pageNumber = useSelector(selectPageNumber);
  const page = useSelector(selectPage);
  const onLastPage = useSelector(selectOnLastPage);
  const canPageForward = useSelector(selectCanPageForward);

  if (!book) {
    // TODO: Use an effect hook or something to make sure that we get a warning to sentry
    return (
      <CenteredLayout>
        <div>
          <h1>Sorry, there has been an error.</h1>
          <p>We cannot find the book you selected.</p>
          <ResetDevice />
        </div>
      </CenteredLayout>
    );
  }

  // TODO: Naming is so wonky. finishBook used by completeBook passed as finishBook
  const completeBook = onLastPage
    ? (repeatBook: boolean) => dispatch(finishBook({ repeat: repeatBook }))
    : undefined;
  const pageForward = canPageForward
    ? () => dispatch(goToNextPage())
    : undefined;

  return (
    <BookPageLayout
      finishBook={completeBook}
      pageForward={pageForward}
      pageNumber={pageNumber}
    >
      {page === null && (
        <>
          <h2>Sorry, we cannot find that page.</h2>
        </>
      )}
      {page && <Page page={page} />}
    </BookPageLayout>
  );
}

export default Read;
