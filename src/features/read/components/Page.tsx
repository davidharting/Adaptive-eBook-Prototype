import React from "react";
import { IPage, IQuestion } from "../../../types/generated/contentful";
import Prompt from "./Prompt";
import Question from "./Question";

type BookPage = IPage | IQuestion;

interface PageProps {
  page: BookPage;
}

function isPage(page: BookPage): page is IPage {
  return page.sys.contentType.sys.id === "page";
}

function Page({ page }: PageProps) {
  if (isPage(page)) {
    return <Prompt prompt={page.fields.narrative} />;
  }
  return <Question question={page} />;
}

export default Page;
