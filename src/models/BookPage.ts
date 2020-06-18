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

  static asQuestion(bookPage: IBookPage) {
    if (BookPage.isPage(bookPage)) {
      return null;
    }
    const question = bookPage as IQuestion;
    return question;
  }
}

export default BookPage;
