import { createClient, EntryCollection } from "contentful";
import {
  IBookFields,
  IPageFields,
  IChoiceFields,
  IQuestionFields,
} from "types/generated/contentful";
import { getBooleanQueryParam } from "lib/browser/query-params";

type Fields = IBookFields | IPageFields | IChoiceFields | IQuestionFields;

export function getEntries(): Promise<EntryCollection<Fields>> {
  const shouldUsePreviewApi = getBooleanQueryParam("preview");
  const client = createContentfulClient(
    shouldUsePreviewApi ? "preview" : "production"
  );
  // Big assumption here that we have less than 1000 entries!
  // Once this assumption breaks, we have to page through and gather up items
  return client.getEntries<Fields>({ skip: 0, limit: 1000 });
}

type ContentMode = "production" | "preview";

function createContentfulClient(mode: ContentMode) {
  const apiKey =
    mode === "production"
      ? getEnvironmentVariable("REACT_APP_CONTENTFUL_DELIVERY_API_KEY")
      : getEnvironmentVariable("REACT_APP_CONTENTFUL_PREVIEW_API_KEY");

  const host = mode === "production" ? undefined : "preview.contentful.com";

  return createClient({
    space: SPACE_ID,
    environment: ENVIRONMENT,
    accessToken: apiKey,
    host,
  });
}

const SPACE_ID = "hfznm2gke77t";
const ENVIRONMENT = "master";

function getEnvironmentVariable(key: string): string {
  const value = process.env[key];
  if (value === undefined || value === null || value === "") {
    throw new Error(`Missing required environment variable ${key}`);
  }
  return value;
}
