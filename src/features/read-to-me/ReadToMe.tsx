import React from "react";
import { useSelector } from "react-redux";
import { selectAudioForCurrentBookPage } from "./readToMeSlice";
import styles from "./read-to-me.module.css";
import SpeakerIcon from "./speaker-icon.png";

function ReadToMe({ style }: ReadToMeProps) {
  const audioAssetUrls = useSelector(selectAudioForCurrentBookPage);
  const [disabled, setDisabled] = React.useState<boolean>(false);

  if (!audioAssetUrls || audioAssetUrls.length < 1) {
    return null;
  }

  const playAudio = () => {
    if (!disabled) {
      // Big limitation - assuming at most 2 audio files!
      setDisabled(true);
      const first = new Audio(audioAssetUrls[0]);
      first.onended = () => {
        const second = new Audio(audioAssetUrls[1]);
        second.onended = () => {
          setDisabled(false);
        };
        second.play();
      };
      first.play();
    }
  };

  return (
    <img
      alt="Play audio"
      className={disabled ? styles.disabledSpeaker : styles.speaker}
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
