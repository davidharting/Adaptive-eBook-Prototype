import React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";

interface OnClick {
  (event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
}

interface BookPageLayout {
  children: React.ReactNode;
  pageNumber: number;
  pageForward: OnClick | undefined;
  finishBook: OnClick | undefined;
}

function BookPageLayout({
  children,
  finishBook,
  pageForward,
  pageNumber,
}: BookPageLayout) {
  return (
    <Container
      fluid
      className="h-100 d-flex flex-column align-items-center justify-content-between"
    >
      <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center">
        {children}
      </div>

      <div className="w-100 d-flex flex-column align-items-center justify-content-center">
        {pageForward && (
          <Button block onClick={pageForward}>
            Next page
          </Button>
        )}

        {finishBook && (
          <Button block onClick={finishBook}>
            All done!
          </Button>
        )}

        <p className="text-muted">Page {pageNumber + 1}</p>
      </div>
    </Container>
  );
}

export default BookPageLayout;
