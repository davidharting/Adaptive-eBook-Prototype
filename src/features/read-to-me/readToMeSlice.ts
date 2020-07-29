import { RootState } from "app/store";
import { selectPage } from "features/read/readSlice";
import BookPage from "models/BookPage";
import Page from "models/Page";
import Question from "models/Question";

export function selectAudioForCurrentBookPage(state: RootState): string[] {
  const bookPage = selectPage(state);
  if (!bookPage) {
    return [];
  }
  const determination = BookPage.determineType(bookPage);
  if (determination.type === "page") {
    return Page.getAudio(determination.page);
  }
  if (determination.type === "question") {
    return Question.getAudio(determination.question);
  }
  return [];
}
