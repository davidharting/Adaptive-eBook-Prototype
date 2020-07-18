import { createClient, EntryCollection } from "contentful";
import {
  IBookFields,
  IPageFields,
  IChoiceFields,
  IQuestionFields,
} from "types/generated/contentful";

type Fields = IBookFields | IPageFields | IChoiceFields | IQuestionFields;

export function getEntries(): Promise<EntryCollection<Fields>> {
  const apiKey = process.env.REACT_APP_CONTENTFUL_DELIVERY_API_KEY;

  if (!apiKey) {
    throw new Error("Missing environment variable CONTENTFUL_DELIVERY_API_KEY");
  }

  const client = createClient({
    space: SPACE_ID,
    environment: ENVIRONMENT,
    accessToken: apiKey,
  });

  return client.getEntries<Fields>();
}

const SPACE_ID = "hfznm2gke77t";
const ENVIRONMENT = "master";
