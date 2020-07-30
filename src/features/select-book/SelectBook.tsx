import React from "react";
import { useSelector } from "react-redux";
import Container from "react-bootstrap/Container";
import Bookshelf from "./components/Bookshelf";
import PreviewBook from "./components/PreviewBook";
import { selectStatus } from "./selectBookSlice";

function SelectBook() {
  const status = useSelector(selectStatus);

  return (
    <Container>
      {status === "idle" && <Bookshelf />}
      {status === "preview" && <PreviewBook />}
    </Container>
  );
}

export default SelectBook;
