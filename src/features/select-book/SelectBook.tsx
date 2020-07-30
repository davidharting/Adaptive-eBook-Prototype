import React from "react";
import { useSelector } from "react-redux";
import CenteredLayout from "layouts/Centered";
import Bookshelf from "./components/Bookshelf";
import PreviewBook from "./components/PreviewBook";
import { selectStatus } from "./selectBookSlice";

function SelectBook() {
  const status = useSelector(selectStatus);

  return (
    <CenteredLayout>
      {status === "idle" && <Bookshelf />}
      {status === "preview" && <PreviewBook />}
    </CenteredLayout>
  );
}

export default SelectBook;
