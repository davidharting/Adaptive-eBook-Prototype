import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import NewSession from "./features/session/NewSession";
import { setContent, SetContentPayload } from "./features/content/contentSlice";
import "./App.css";
import content from "./content.json";

function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    // Sadly typescript I must once again ask you to trust me
    // Trust that this JSON file does indeed contain an array of Contentful Entries
    // @ts-ignore
    dispatch(setContent(content));
  }, [dispatch]);

  return (
    <div className="App">
      <header className="App-header">
        <NewSession />
      </header>
    </div>
  );
}

export default App;
