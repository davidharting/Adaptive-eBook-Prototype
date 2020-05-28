import React from "react";
import { useDispatch, useSelector } from "react-redux";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import {
  finishBook,
  goToNextPage,
  selectBook,
  selectPage,
  selectPageNumber,
  selectHasNextPage,
} from "./readSlice";
import Page from "./components/Page";

function Read() {
  const dispatch = useDispatch();
  const book = useSelector(selectBook);
  const pageNumber = useSelector(selectPageNumber);
  const page = useSelector(selectPage);
  const hasNextPage = useSelector(selectHasNextPage);

  if (!book) {
    // TODO: Use an effect hook or something to make sure that we get a warning to sentry
    return (
      <>
        <h1>Sorry, there has been an error.</h1>
        <p>We cannot find the book you selected.</p>
      </>
    );
  }

  return (
    <Container fluid>
      {page === null && (
        <>
          <h2>Sorry, we cannot find that page.</h2>
        </>
      )}
      <Row className="align-items-center">
        <Col>{page && <Page page={page} />}</Col>
        <Col xs={2}>
          {hasNextPage === true && (
            <Button
              onClick={() => {
                dispatch(goToNextPage());
              }}
            >
              Next page >
            </Button>
          )}
        </Col>
      </Row>
      <Row>
        {hasNextPage === false && (
          <Button
            onClick={() => {
              dispatch(finishBook());
            }}
          >
            All done!
          </Button>
        )}
      </Row>
      <Row className="justify-content-center">
        <p className="text-muted">Page {pageNumber + 1}</p>
      </Row>
    </Container>
  );
}

export default Read;
