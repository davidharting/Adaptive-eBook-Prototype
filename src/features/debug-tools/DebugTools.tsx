import React from "react";
import { useSelector } from "react-redux";
import { useBooleanQueryParam } from "lib/browser/query-params";
import styles from "./debug-tools.module.css";
import { selectDebugData } from "./debugToolsSlice";

function DebugTools() {
  const shouldShowDebugTools = useBooleanQueryParam("debug");
  const data = useSelector(selectDebugData);

  if (shouldShowDebugTools === false) {
    return null;
  }

  return (
    <div className={styles.container}>
      {data.map((d, i) => {
        return (
          <div key={i} className={styles.row}>
            <span>{d.key}:&nbsp;</span>
            <span>{d.value}</span>
          </div>
        );
      })}
    </div>
  );
}

export default DebugTools;
