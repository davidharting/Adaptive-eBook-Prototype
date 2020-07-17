import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import "bootstrap/dist/css/bootstrap.min.css";

import NewSession from "features/setup-device/SetupDevice";
import SelectBook from "features/select-book/SelectBook";
import Read from "features/read/Read";
import { setContent } from "features/content/contentSlice";
import { selectBookValidation } from "features/select-book/selectBookSlice";
import { RootState } from "app/store";
import content from "content.json";
import InvalidBook from "features/select-book/InvalidBook";

type GameStatus = "CREATE_SESSION" | "PICK_BOOK" | "INVALID_BOOK" | "PLAYING";

function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    // Sadly typescript I must once again ask you to trust me
    // Trust that this JSON file does indeed contain an array of Contentful Entries
    // @ts-ignore
    dispatch(setContent(content));
  }, [dispatch]);

  const gameStatus: GameStatus = useSelector(selectGameStatus);

  return (
    <>
      <main>
        {gameStatus === "CREATE_SESSION" && <NewSession />}
        {gameStatus === "PICK_BOOK" && <SelectBook />}
        {gameStatus === "INVALID_BOOK" && <InvalidBook />}
        {gameStatus === "PLAYING" && <Read />}
      </main>
    </>
  );
}

export default App;

function selectGameStatus(state: RootState): GameStatus {
  if (state.setupDevice.status === "unstarted") {
    return "CREATE_SESSION";
  }
  if (state.selectBook.bookId === null) {
    return "PICK_BOOK";
  }

  const bookValidation = selectBookValidation(state);
  if (bookValidation.status === "error") {
    return "INVALID_BOOK";
  }

  return "PLAYING";
}
