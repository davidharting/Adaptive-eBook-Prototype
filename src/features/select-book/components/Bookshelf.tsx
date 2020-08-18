import React from "react";
import { useSelector, useDispatch } from "react-redux";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import CardDeck from "react-bootstrap/CardDeck";
import Card from "react-bootstrap/Card";
import ResetDevice from "features/setup-device/ResetDevice";
import { previewBook, selectAvailableBooks } from "../selectBookSlice";
import { IBook } from "types/generated/contentful";

function SelectBook() {
  const choices = useSelector(selectAvailableBooks);

  return (
    <Container>
      <h1>Bookshelf</h1>
      <CardDeck className="justify-content-center">
        {choices.map((c) => (
          <BookCard key={c.sys.id} book={c} />
        ))}
      </CardDeck>
      <br />
      <br />
      <ResetDevice />
    </Container>
  );
}

export default SelectBook;

function BookCard({ book }: BookCardProps) {
  const dispatch = useDispatch();
  const cover = book.fields.cover;
  return (
    <Card
      style={{ minWidth: "300px", marginBottom: "1rem", maxWidth: "350px" }}
    >
      {cover && (
        <Card.Img
          alt={book.fields.title}
          src={cover.fields.file.url}
          variant="top"
        />
      )}
      <Card.Body>
        <Card.Title>{book.fields.title}</Card.Title>
        <Button
          variant="primary"
          onClick={() => dispatch(previewBook(book.sys.id))}
        >
          Select
        </Button>
      </Card.Body>
    </Card>
  );
}

interface BookCardProps {
  book: IBook;
}
