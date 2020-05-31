import React from "react";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";

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
        {!finishBook && (
          <Button
            disabled={!pageForward}
            block
            onClick={pageForward}
            size="lg"
            style={{ visibility: pageForward ? "visible" : "hidden" }}
          >
            Next page
          </Button>
        )}

        {finishBook && (
          <Button block onClick={finishBook} size="lg">
            All done!
          </Button>
        )}

        <p className="text-muted">Page {pageNumber + 1}</p>
      </div>
    </Container>
  );
}

export default BookPageLayout;
