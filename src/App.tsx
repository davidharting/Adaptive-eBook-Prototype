import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import "bootstrap/dist/css/bootstrap.min.css";

import NewSession from "features/setup-device/SetupDevice";
import ResetDevice from "features/setup-device/ResetDevice";
import SelectBook from "features/select-book/SelectBook";
import InvalidBook from "features/select-book/InvalidBook";
import Read from "features/read/Read";
import { setContent } from "features/content/contentSlice";
import { selectBookValidation } from "features/select-book/selectBookSlice";
import { RootState } from "app/store";
import content from "content.json";

type GameStatus = "CREATE_SESSION" | "PICK_BOOK" | "PLAYING";

// https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
const ONE_HUNDRED_VH = "calc(var(--vh, 1vh) * 100)";

function App() {
  useVhCustomProperty();
  const dispatch = useDispatch();
  useEffect(() => {
    // Sadly typescript I must once again ask you to trust me
    // Trust that this JSON file does indeed contain an array of Contentful Entries
    // @ts-ignore
    dispatch(setContent(content));
  }, [dispatch]);

  const gameStatus: GameStatus = useSelector(selectGameStatus);
  const showHeader = gameStatus !== "CREATE_SESSION";

  return (
    <>
      <header>{showHeader && <ResetDevice />}</header>
      <main
        style={{
          // This feels hacky that I know the pixel height of the header but 🤷🏼‍♀️
          height: showHeader
            ? `calc(${ONE_HUNDRED_VH} - 38px)`
            : ONE_HUNDRED_VH,
        }}
      >
        {gameStatus === "CREATE_SESSION" && <NewSession />}
        {gameStatus === "PICK_BOOK" && <SelectBook />}
        {gameStatus === "PLAYING" && <Read />}
      </main>
    </>
  );
}

export default App;

function useVhCustomProperty() {
  useEffect(() => {
    const updateVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    updateVh();

    // TODO: Add debounce or throttle if we notice issues

    window.addEventListener("resize", updateVh);

    return () => {
      window.removeEventListener("resize", updateVh);
    };
  }, []);
}

function selectGameStatus(state: RootState): GameStatus {
  if (state.setupDevice.status === "unstarted") {
    return "CREATE_SESSION";
  }
  if (state.selectBook.bookId === null) {
    return "PICK_BOOK";
  }

  const bookValidation = selectBookValidation(state);
  if (bookValidation.status === "error") {
    return "PICK_BOOK";
  }

  return "PLAYING";
}
