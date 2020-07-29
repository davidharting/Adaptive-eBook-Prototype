import React from "react";
import { useSelector } from "react-redux";
import { selectAudioForCurrentBookPage } from "./readToMeSlice";
import styles from "./read-to-me.module.css";
import SpeakerIcon from "./speaker-icon.png";

function ReadToMe({ style }: ReadToMeProps) {
  const audioAssetUrls = useSelector(selectAudioForCurrentBookPage);

  if (!audioAssetUrls || audioAssetUrls.length < 1) {
    return null;
  }

  const playAudio = () => {
    // Big limitation - assuming at most 2 audio files!
    const first = new Audio(audioAssetUrls[0]);
    first.onended = () => {
      const second = new Audio(audioAssetUrls[1]);
      second.play();
    };
    first.play();
  };

  return (
    <img
      alt="Play audio"
      className={styles.speaker}
      style={style}
      src={SpeakerIcon}
      role="button"
      onClick={playAudio}
    />
  );
}

interface ReadToMeProps {
  style?: React.CSSProperties;
}

export default ReadToMe;
