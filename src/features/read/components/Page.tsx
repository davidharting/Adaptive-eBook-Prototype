import React from "react";
import { IPage } from "types/generated/contentful";
import Prompt from "./Prompt";
import styles from "./page.module.css";

function Page({ page }: PageProps) {
  const picture = page.fields.picture;
  return (
    <>
      <Prompt prompt={page.fields.narrative} />
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
