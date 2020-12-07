import { IBook, IQuestion } from "types/generated/contentful";
import BookPage, { IBookPage } from "./BookPage";
import { BookType } from "./constants";
import Question from "./Question";

function getType(book: IBook): BookType {
  return book.fields.type || "normal";
}

function getPages(book: IBook): IBookPage[] | null {
  const pages: IBookPage[] | undefined = book.fields.pages;
  if (!pages || !pages.length) {
    return null;
  }

  return pages;
}

function getPage(book: IBook, pageNumber: number) {
  const pages = getPages(book);
  if (!pages || !pages.length || pageNumber >= pages.length) {
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

function isAssessment(book: IBook): boolean {
  return book.fields.type === "pre-test" || book.fields.type === "post-test";
}

export interface BookValidation {
  status: "ok" | "error";
  message?: string;
  questions?: Array<QuestionError>;
}

/**
 * Note: Once there are "assessment" books, this validation logic will need to change,a long with difficulty handling.
 */
function validate(book: IBook): BookValidation {
  const bookPages = getPages(book);
  if (!bookPages) {
    return { status: "error", message: "Book contains no pages." };
  }

  const questionsErrors: Array<QuestionError> = [];
  bookPages
    .filter((bookPage) => bookPage.sys.type === "entry")
    .map((bookPage) => BookPage.asQuestion(bookPage))
    .forEach((question, i) => {
      if (question) {
        const validation = Question.validate(question);
        if (validation.status === "error") {
          questionsErrors.push({
            message: `Question on page ${i + 1} has invalid choices.`,
            problems: validation.problems,
          });
        }
      }
    });

  if (questionsErrors.length) {
    return {
      status: "error",
      message: "There was a problem with one or more questions in this book.",
      questions: questionsErrors,
    };
  }

  return { status: "ok" };
}

const Book = {
  getType,
  getPages,
  getPage,
  getQuestion,
  getQuestionById,
  isAssessment,
  validate,
};
export default Book;

export interface QuestionError {
  message: string;
  problems: Array<string>;
}
