import React from "react";
import Button from "react-bootstrap/Button";

function LargeButton() {
  return <Button></Button>;
}

interface LargeButtonProps {
  disabled: boolean;
  onClick: OnClick;
}

interface OnClick {
  (): void;
}
