import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import NewSession from "./features/session/NewSession";
import SelectBook from "./features/select-book/SelectBook";
import { setContent } from "./features/content/contentSlice";
import "./App.css";
import { RootState } from "./app/store";
import content from "./content.json";

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

  return (
    <div className="App">
      <header className="App-header">
        {gameStatus === "CREATE_SESSION" && <NewSession />}
        {gameStatus === "PICK_BOOK" && <SelectBook />}
        {gameStatus === "PLAYING" && (
          <>
            <h1>Implement book here!</h1>
          </>
        )}
      </header>
    </div>
  );
}

export default App;
