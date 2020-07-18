import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import "bootstrap/dist/css/bootstrap.min.css";
import Spinner from "react-bootstrap/Spinner";

import NewSession from "features/setup-device/SetupDevice";
import SelectBook from "features/select-book/SelectBook";
import Read from "features/read/Read";
import {
  fetchContent,
  selectLoadingState,
} from "features/content/contentSlice";
import { selectBookValidation } from "features/select-book/selectBookSlice";
import { RootState } from "app/store";
import InvalidBook from "features/select-book/InvalidBook";
import CenteredLayout from "layouts/Centered";

type GameStatus = "CREATE_SESSION" | "PICK_BOOK" | "INVALID_BOOK" | "PLAYING";

function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    // Sadly typescript I must once again ask you to trust me
    // Trust that this JSON file does indeed contain an array of Contentful Entries
    // @ts-ignore
    dispatch(fetchContent());
  }, [dispatch]);

  const loadingState = useSelector(selectLoadingState);
  const gameStatus: GameStatus = useSelector(selectGameStatus);

  if (loadingState === "idle" || loadingState === "loading") {
    return (
      <CenteredLayout>
        <Spinner animation="grow" />
      </CenteredLayout>
    );
  }

  if (loadingState === "error") {
    return (
      <CenteredLayout>
        <h1>Sorry, we were unable to load game data.</h1>
        <p>
          We were unable to load some data required to show you the game. Please
          try refreshing the browser.
        </p>
      </CenteredLayout>
    );
  }

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
