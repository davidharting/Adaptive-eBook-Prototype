import React from "react";
import { useSelector } from "react-redux";
import { IPage } from "types/generated/contentful";
import PageModel from "models/Page";
import { selectTreatment } from "features/setup-device/setupDeviceSlice";
import Prompt from "./Prompt";
import styles from "./page.module.css";

function Page({ page }: PageProps) {
  const picture = page.fields.picture;
  const treatment = useSelector(selectTreatment);
  const prompt = treatment ? PageModel.getPrompt(page, treatment) : null;

  return (
    <>
      {prompt && <Prompt prompt={prompt} />}
      {picture ? (
        <div className={styles.pictureContainer}>
          <img
            src={picture.fields.file.url}
            alt={picture.fields.description}
            className={styles.picture}
          />
        </div>
      ) : null}
    </>
  );
}

export default Page;

interface PageProps {
  page: IPage;
}
