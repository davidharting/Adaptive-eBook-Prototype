import React from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import { useDispatch } from "react-redux";

import { signOut } from "features/setup-device/setupDeviceSlice";

function ResetDevice() {
  const [isModalVisible, setIsModalVisible] = React.useState<boolean>(false);
  const [confirmationText, setConfirmationText] = React.useState<string>("");
  const dispatch = useDispatch();

  const openModal = () => setIsModalVisible(true);
  const closeModal = () => setIsModalVisible(false);
  const resetDevice = () => dispatch(signOut());

  return (
    <>
      <Button className="text-muted" variant="link" onClick={openModal}>
        Reset
      </Button>
      {isModalVisible && (
        <Modal show={isModalVisible} onHide={closeModal}>
          <Modal.Header closeButton>
            <Modal.Title>Reset device?</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              If you would like to go back to the setup screen, you can reset
              the device. You can do this to correct a mistake made during
              setup, or if this is a shared device and you are done with it.
            </p>
            <Form
              onSubmit={(e: React.FormEvent) => {
                e.preventDefault();
                resetDevice();
              }}
            >
              <Form.Group>
                <Form.Label>
                  Confirm that you would like to reset the device by typing
                  "reset" in the box below
                </Form.Label>
                <Form.Control
                  onChange={(e) => {
                    setConfirmationText(e.target.value);
                  }}
                  placeholder="reset"
                  type="input"
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={closeModal} variant="secondary">
              Cancel
            </Button>
            <Button
              disabled={confirmationText !== "reset"}
              onClick={resetDevice}
              variant="danger"
            >
              Yes, reset device
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
}

export default ResetDevice;
