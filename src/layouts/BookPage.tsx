import React from "react";
import cn from "classnames";
import { Asset } from "contentful";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import ReadToMe from "features/read-to-me/ReadToMe";

import styles from "./book-page.module.css";
import { useIsScrollable } from "lib/browser/window";

interface OnClick {
  (event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
}

interface OnFinishBook {
  (repeatBook: boolean): void;
}

interface BookPageLayoutProps {
  backgroundImage?: Asset;
  children: React.ReactNode;
  pageNumber: number;
  pageForward?: OnClick;
  finishBook?: OnFinishBook;
}

function BookPageLayout({
  backgroundImage,
  children,
  finishBook,
  pageForward,
  pageNumber,
}: BookPageLayoutProps) {
  const isScrollable = useIsScrollable();

  return (
    <Container
      fluid
      className="d-flex flex-column align-items-center justify-content-between"
    >
      {backgroundImage && <BackgroundImage asset={backgroundImage} />}
      <ReadToMe style={{ position: "absolute", top: 0, right: 0 }} />
      <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center">
        {children}
      </div>

      {!finishBook && (
        <div className={styles.nextPage}>
          <Button
            block
            className="btn-xl"
            disabled={!pageForward}
            onClick={pageForward}
            style={{ visibility: pageForward ? "visible" : "hidden" }}
          >
            Next page
          </Button>
        </div>
      )}

      {finishBook && (
        <div
          className={`d-flex flex-row justify-content-around w-100 ${styles.finishBook}`}
        >
          <Button
            className="btn-xl"
            onClick={() => {
              finishBook(true);
            }}
            variant="secondary"
          >
            Read this book again
          </Button>
          <div style={{ width: "8px" }} />
          <Button
            className="btn-xl"
            onClick={() => {
              finishBook(false);
            }}
          >
            Go to bookshelf
          </Button>
        </div>
      )}

      <p
        className={cn("text-muted", {
          [styles.bottomCenter]: isScrollable !== true,
        })}
        style={{ zIndex: 50 }}
      >
        Page {pageNumber + 1}
      </p>
      <div className={styles.divider} />
    </Container>
  );
}

export default BookPageLayout;

function BackgroundImage({ asset }: BackgroundImageProps) {
  return (
    <img
      alt={asset.fields.title}
      src={asset.fields.file.url}
      className={styles.pageBackground}
    />
  );
}

interface BackgroundImageProps {
  asset: Asset;
}
