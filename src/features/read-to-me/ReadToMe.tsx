import React from "react";
import Button from "react-bootstrap/Button";
import { useSelector } from "react-redux";
import { selectAudioForCurrentBookPage } from "./readToMeSlice";

function ReadToMe({ style }: ReadToMeProps) {
  const audio = useSelector(selectAudioForCurrentBookPage);
  const onClick = () => {
    console.log(audio);
  };
  // if (!audio || audio.length < 1) { return null }
  return (
    <Button variant="light" onClick={onClick} style={style}>
      Audio
    </Button>
  );
}

interface ReadToMeProps {
  style?: React.CSSProperties;
}

export default ReadToMe;
