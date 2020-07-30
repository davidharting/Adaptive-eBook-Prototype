import React from "react";
import { useSelector } from "react-redux";
import Bookshelf from "./components/Bookshelf";
import PreviewBook from "./components/PreviewBook";
import { selectStatus } from "./selectBookSlice";

function SelectBook() {
  const status = useSelector(selectStatus);

  if (status === "idle") {
    return <Bookshelf />;
  }

  if (status === "preview") {
    return <PreviewBook />;
  }

  return null;
}

export default SelectBook;
