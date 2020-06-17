import { IPage, IQuestion } from "types/generated/contentful";

export type IBookPage = IQuestion | IPage;

class BookPage {
  static isPage(bookPage: IBookPage) {
    return bookPage.sys.contentType.sys.id === "page";
  }

  static isQuestion(bookPage: IBookPage) {
    return bookPage.sys.contentType.sys.id === "question";
  }

  static asQuestion(bookPage: IBookPage) {
    if (BookPage.isPage(bookPage)) {
      return null;
    }
    const question = bookPage as IQuestion;
    return question;
  }
}

export default BookPage;
