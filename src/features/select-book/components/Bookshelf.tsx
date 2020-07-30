import React from "react";
import { useSelector, useDispatch } from "react-redux";
import Button from "react-bootstrap/Button";
import CardDeck from "react-bootstrap/CardDeck";
import Card from "react-bootstrap/Card";
import ResetDevice from "features/setup-device/ResetDevice";
import { previewBook, selectAvailableBooks } from "../selectBookSlice";
import { IBook } from "types/generated/contentful";

function SelectBook() {
  const choices = useSelector(selectAvailableBooks);

  return (
    <div>
      <h1>Bookshelf</h1>
      <CardDeck>
        {choices.map((c) => (
          <BookCard book={c} />
        ))}
      </CardDeck>
      <br />
      <br />
      <ResetDevice />
    </div>
  );
}

export default SelectBook;

function BookCard({ book }: BookCardProps) {
  const dispatch = useDispatch();
  const cover = book.fields.cover;
  return (
    <Card>
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
