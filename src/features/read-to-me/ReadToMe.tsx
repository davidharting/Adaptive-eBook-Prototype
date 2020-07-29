import React from "react";
import Button from "react-bootstrap/Button";
import { useSelector } from "react-redux";
import { selectAudioForCurrentBookPage } from "./readToMeSlice";

function ReadToMe({ style }: ReadToMeProps) {
  const audioAssetUrls = useSelector(selectAudioForCurrentBookPage);

  if (!audioAssetUrls || audioAssetUrls.length < 1) {
    return null;
  }

  const onClick = () => {
    // Big limitation - assuming at most 2 audio files!
    const first = new Audio(audioAssetUrls[0]);
    first.onended = () => {
      const second = new Audio(audioAssetUrls[1]);
      second.play();
    };
    first.play();
  };

  return (
    <>
      <Button variant="light" onClick={onClick} style={style}>
        Audio
      </Button>
    </>
  );
}

interface ReadToMeProps {
  style?: React.CSSProperties;
}

export default ReadToMe;
