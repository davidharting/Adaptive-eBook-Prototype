import React from "react";
import Button from "react-bootstrap/Button";
import { useSelector } from "react-redux";
import { selectAudioForCurrentBookPage } from "./readToMeSlice";

function ReadToMe() {
  const audio = useSelector(selectAudioForCurrentBookPage);
  const onClick = () => {
    console.log(audio);
  };
  return <Button onClick={onClick}>Read to Me</Button>;
}

export default ReadToMe;
