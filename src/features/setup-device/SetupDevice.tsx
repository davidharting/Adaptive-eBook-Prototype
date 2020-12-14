import React from "react";
import { useDispatch } from "react-redux";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import CenteredLayout from "layouts/Centered";
import { startSession, Treatment } from "./setupDeviceSlice";

function NewSession() {
  const [parentName, setParentName] = React.useState<string>("");
  const [childName, setChildName] = React.useState<string>("");
  const [treatment, setTreatment] = React.useState<Treatment | "">("");
  const [testType, setTestType] = React.useState<string>("");
  const dispatch = useDispatch();

  const disabled = !parentName || !childName || !treatment;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // if (childName && parentName && treatment && testType) { //empty string in Javascript is technically "falsy" therefore && testType == false
    if (childName && parentName && treatment) {
      dispatch(startSession({ childName, parentName, treatment, testType }));
    }
  };

  return (
    <CenteredLayout vertical={false}>
      <div>
        <h1>First, let's set up this device</h1>
        <p>
          This step is for the <b>parent</b>. You will only need to do this once
          per device.
        </p>
        <Form onSubmit={onSubmit}>
          <Form.Group>
            <Form.Label>What is your first and last name?</Form.Label>
            <Form.Control
              type="text"
              onChange={(e) => setParentName(e.target.value)}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>
              What is the first and last name of your child?
            </Form.Label>
            <Form.Control
              type="text"
              onChange={(e) => setChildName(e.target.value)}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>What type of book were you assigned?</Form.Label>
            <Form.Control
              as="select"
              onChange={(e) => {
                if (["size", "number", "mixed"].includes(e.target.value)) {
                  setTreatment(e.target.value as Treatment);
                }
              }}
            >
              <option value=""></option>
              <option value="number">A</option>
              <option value="size">B</option>
              <option value="mixed">C</option>
            </Form.Control>
          </Form.Group>
          <Form.Group>
            <Form.Label>What type of game were you assigned?</Form.Label>
            <Form.Control
              as="select"
              onChange={(e) => {
                if (["A", "B"].includes(e.target.value)) {
                  setTestType(e.target.value);
                }
              }}
            >
              <option value=""></option>
              <option value="A">A</option>
              <option value="B">B</option>
            </Form.Control>
          </Form.Group>
          <Button disabled={disabled} variant="primary" type="submit">
            Let's go!
          </Button>
        </Form>
      </div>
    </CenteredLayout>
  );
}

export default NewSession;
