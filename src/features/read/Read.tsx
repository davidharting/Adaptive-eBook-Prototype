import React from "react";
import { useDispatch, useSelector } from "react-redux";
import BookPageLayout from "layouts/BookPage";
import { selectBook } from "features/select-book/selectBookSlice";
import ResetDevice from "features/setup-device/ResetDevice";
import {
  nextPage,
  selectPage,
  selectPageNumber,
  selectOnCredits,
  selectCanPageForward,
  selectQuestionStatus,
} from "./readSlice";
import BookPage from "./components/BookPage";
import CenteredLayout from "layouts/Centered";
import Credits from "./components/Credits";

function Read() {
  const dispatch = useDispatch();
  const book = useSelector(selectBook);
  const pageNumber = useSelector(selectPageNumber);
  const page = useSelector(selectPage);
  const onCreditsPage = useSelector(selectOnCredits);
  const canPageForward = useSelector(selectCanPageForward);
  const questionStatus = useSelector(selectQuestionStatus);

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

  if (onCreditsPage) {
    return <Credits />;
  }

  return (
    <BookPageLayout
      backgroundImage={book.fields.pageBackground}
      divider={questionStatus !== "NOT_QUESTION"}
      pageForward={canPageForward ? () => dispatch(nextPage()) : undefined}
      pageNumber={pageNumber}
    >
      {page === null && onCreditsPage === false && (
        <>
          <h2>Sorry, we cannot find that page.</h2>
        </>
      )}
      {page && <BookPage bookPage={page} />}
    </BookPageLayout>
  );
}

export default Read;
