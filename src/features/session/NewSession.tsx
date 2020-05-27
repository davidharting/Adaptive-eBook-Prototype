import React from "react";
import { useDispatch } from "react-redux";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

import { startSession } from "./sessionSlice";

function NewSession() {
  const [name, setName] = React.useState("");
  const dispatch = useDispatch();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(startSession({ playerName: name }));
  };

  return (
    <>
      <h1>Let's get started!</h1>
      <p>
        We just need to get a little info from you before you begin. If you do
        not to share this information, you can leave it blank or fill it in with
        a random value.
      </p>
      <Form onSubmit={onSubmit}>
        <Form.Group>
          <Form.Label>What is your name?</Form.Label>
          <Form.Control type="text" onChange={(e) => setName(e.target.value)} />
          <Form.Text>This will just help us keep your data straight.</Form.Text>
        </Form.Group>
        <Button variant="primary" type="submit">
          Let's go!
        </Button>
      </Form>
    </>
  );
}

export default NewSession;
