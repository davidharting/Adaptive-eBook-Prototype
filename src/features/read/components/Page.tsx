import React from "react";
import { IPage } from "../../../types/generated/contentful";

interface PageProps {
  page: IPage;
}

function Page({ page }: PageProps) {
  return <p>{page.fields.prompt}</p>;
}

export default Page;
