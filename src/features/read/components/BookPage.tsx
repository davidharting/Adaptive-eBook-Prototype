import React from "react";
import { IPage } from "types/generated/contentful";
import { IBookPage } from "models/BookPage";
import Page from "./Page";
import Question from "./Question";

interface BookPageProps {
  bookPage: IBookPage;
}

function isPage(page: IBookPage): page is IPage {
  return page.sys.contentType.sys.id === "page";
}

function BookPage({ bookPage }: BookPageProps) {
  if (isPage(bookPage)) {
    return <Page page={bookPage} />;
  }
  return <Question question={bookPage} />;
}

export default BookPage;
