import { IBook, IPage, IQuestion } from "types/generated/contentful";

export type BookPage = IQuestion | IPage;

function getPages(book: IBook): BookPage[] | null {
  const pages: BookPage[] | undefined = book.fields.pages;
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
  if (!page || page.sys.contentType.sys.id === "page") {
    return null;
  }
  const question = page as IQuestion;
  return question;
}

function hasNextPage(book: IBook, pageNumber: number) {
  const pages = getPages(book);
  if (!pages || !pages.length) {
    return false;
  }
  return pageNumber < pages.length - 1;
}

const Book = { getPages, getPage, hasNextPage, getQuestion };
export default Book;
