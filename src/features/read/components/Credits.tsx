import React from "react";
import { useDispatch, useSelector } from "react-redux";
import BookPageLayout from "layouts/BookPage";
import { selectBook, finishBook } from "features/select-book/selectBookSlice";
import { selectPageNumber } from "../readSlice";

function Credits() {
  const dispatch = useDispatch();
  const book = useSelector(selectBook);
  const pageNumber = useSelector(selectPageNumber);
  if (!book) {
    return null;
  }

  // TODO: Place in credits content

  const credits = book.fields.credits;

  const image =
    credits && credits.fields.background
      ? credits.fields.background
      : book.fields.pageBackground;

  return (
    <BookPageLayout
      backgroundImage={image}
      finishBook={(repeatBook: boolean) =>
        dispatch(finishBook({ repeat: repeatBook }))
      }
      pageNumber={pageNumber}
    >
      {credits && credits.fields.contributors ? (
        <Contributors contributors={credits?.fields.contributors} />
      ) : null}
    </BookPageLayout>
  );
}

export default Credits;

function Contributors({ contributors }: ContributorsProps) {
  const lines = contributors.split("\n");

  return (
    <>
      <h1>Credits</h1>
      {lines.map((line, i) => (
        <p
          key={i}
          className="mb-0"
          style={{ fontSize: "1.5rem", textAlign: "center", zIndex: 1000 }}
        >
          {line}
        </p>
      ))}
    </>
  );
}

interface ContributorsProps {
  contributors: string;
}
