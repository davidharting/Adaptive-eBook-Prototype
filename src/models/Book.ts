import { IBook, IQuestion } from "types/generated/contentful";
import BookPage, { IBookPage } from "./BookPage";
import Question from "./Question";

function getPages(book: IBook): IBookPage[] | null {
  const pages: IBookPage[] | undefined = book.fields.pages;
  if (!pages || !pages.length) {
    return null;
  }

  return pages;
}

function getPage(book: IBook, pageNumber: number) {
  const pages = getPages(book);
  if (!pages || !pages.length || pages.length < pageNumber) {
    return null;
  }
  return pages[pageNumber];
}

function getQuestion(book: IBook, pageNumber: number): IQuestion | null {
  const page = getPage(book, pageNumber);
  if (!page) {
    return null;
  }
  const question = BookPage.asQuestion(page);
  return question;
}

interface GetQuestion {
  question: IQuestion;
  pageNumber: number;
}
function getQuestionById(book: IBook, questionId: string): GetQuestion | null {
  const pages = book.fields.pages || [];
  const page = pages.find((p) => p.sys.id === questionId);
  if (!page) {
    return null;
  }
  const pageNumber = pages.indexOf(page);
  const question = BookPage.asQuestion(page);
  if (!question) {
    return null;
  }
  return { question, pageNumber };
}

function hasNextPage(book: IBook, pageNumber: number) {
  const pages = getPages(book);
  if (!pages || !pages.length) {
    return false;
  }
  return pageNumber < pages.length - 1;
}

export interface BookValidation {
  status: "ok" | "error";
  problems: Array<string>;
}

/**
 * Note: Once there are "assessment" books, this validation logic will need to change,a long with difficulty handling.
 */
function validate(book: IBook): BookValidation {
  const problems: Array<string> = [];

  const pages = getPages(book);
  if (!pages) {
    problems.push("Book contains no pages.");
    return { status: "error", problems };
  }

  pages.forEach((p, i) => {
    const question = BookPage.asQuestion(p);
    if (question) {
      if (!Question.areChoicesValid(question)) {
        problems.push(`Question on page ${i + 1} has invalid choices.`);
      }
    }
  });

  if (problems.length > 1) {
    return { status: "error", problems };
  }

  return { status: "ok", problems };
}

const Book = {
  getPages,
  getPage,
  hasNextPage,
  getQuestion,
  getQuestionById,
  validate,
};
export default Book;
