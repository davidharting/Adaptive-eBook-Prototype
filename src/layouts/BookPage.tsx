import React from "react";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import ReadToMe from "features/read-to-me/ReadToMe";

interface OnClick {
  (event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
}

interface OnFinishBook {
  (repeatBook: boolean): void;
}

interface BookPageLayout {
  children: React.ReactNode;
  pageNumber: number;
  pageForward: OnClick | undefined;
  finishBook: OnFinishBook | undefined;
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
      className="d-flex flex-column align-items-center justify-content-between vh-100"
    >
      <ReadToMe style={{ position: "absolute", top: 0, right: 0 }} />
      <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center">
        {children}
      </div>

      <div className="w-100 d-flex flex-column align-items-center justify-content-center">
        {!finishBook && (
          <Button
            block
            className="btn-xl"
            disabled={!pageForward}
            onClick={pageForward}
            style={{ visibility: pageForward ? "visible" : "hidden" }}
          >
            Next page
          </Button>
        )}

        {finishBook && (
          <div className="d-flex flex-row justify-content-around w-100">
            <Button
              className="btn-xl"
              onClick={() => {
                finishBook(false);
              }}
            >
              Choose a different book
            </Button>
            <div style={{ width: "8px" }} />
            <Button
              className="btn-xl"
              onClick={() => {
                finishBook(true);
              }}
            >
              Read this book again
            </Button>
          </div>
        )}
        <p className="text-muted">Page {pageNumber + 1}</p>
      </div>
    </Container>
  );
}

export default BookPageLayout;
