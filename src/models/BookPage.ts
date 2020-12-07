import { IPage, IQuestion } from "types/generated/contentful";

// It would probably be ideal if the content model naming was changed to make this less clumsy.
// e.g., QuestionPage and NarrativePage, and then this type could just be Page
// Currently, sometimes I say "Page" to mean IPage, other times to mean BookPage
export type IBookPage = IQuestion | IPage;

class BookPage {
  static isPage(bookPage: IBookPage) {
    return bookPage.sys.contentType.sys.id === "page";
  }

  static isQuestion(bookPage: IBookPage) {
    return bookPage.sys.contentType.sys.id === "question";
  }

  static asQuestion(bookPage: IBookPage): IQuestion | null {
    if (BookPage.isPage(bookPage)) {
      return null;
    }
    const question = bookPage as IQuestion;
    return question;
  }

  static asPage(bookPage: IBookPage): IPage | null {
    if (BookPage.isPage(bookPage)) {
      const page = bookPage as IPage;
      return page;
    }
    return null;
  }

  static determineType(bookPage: IBookPage): BookPageDetermination {
    if (this.isPage(bookPage)) {
      const page = BookPage.asPage(bookPage);
      if (page) {
        return { type: "page", page };
      }
    }
    if (this.isQuestion(bookPage)) {
      const question = BookPage.asQuestion(bookPage);
      if (question) {
        return { type: "question", question };
      }
    }
    return { type: "error" };
  }
}

export default BookPage;

export type BookPageDetermination =
  | { type: "question"; question: IQuestion }
  | { type: "page"; page: IPage }
  | { type: "error" };
