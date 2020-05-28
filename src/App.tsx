import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";

import "bootstrap/dist/css/bootstrap.min.css";

import NewSession from "features/session/NewSession";
import SelectBook from "features/select-book/SelectBook";
import Read from "features/read/Read";
import { setContent } from "features/content/contentSlice";
import { signOut } from "features/session/sessionSlice";
import { RootState } from "app/store";
import content from "content.json";

type GameStatus = "CREATE_SESSION" | "PICK_BOOK" | "PLAYING";

function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    // Sadly typescript I must once again ask you to trust me
    // Trust that this JSON file does indeed contain an array of Contentful Entries
    // @ts-ignore
    dispatch(setContent(content));
  }, [dispatch]);

  const gameStatus: GameStatus = useSelector((state: RootState) => {
    if (state.session.id === null) {
      return "CREATE_SESSION";
    }
    if (state.selectBook.bookId === null) {
      return "PICK_BOOK";
    }
    return "PLAYING";
  });

  const showHeader = gameStatus !== "CREATE_SESSION";

  return (
    <>
      <header>
        {showHeader && (
          <Button
            className="text-muted"
            variant="link"
            onClick={() => dispatch(signOut())}
          >
            Sign out
          </Button>
        )}
      </header>
      <main
        style={{
          // This feels hacky that I know the pixel height of the header but 🤷🏼‍♀️
          height: showHeader ? "calc(100vh - 38px)" : "100vh",
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
