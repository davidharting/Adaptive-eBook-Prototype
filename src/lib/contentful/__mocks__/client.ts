import { EntryCollection } from "contentful";
import {
  IBookFields,
  IPageFields,
  IChoiceFields,
  IQuestionFields,
} from "types/generated/contentful";

import content from "./content.json";

type Fields = IBookFields | IPageFields | IChoiceFields | IQuestionFields;

export function getEntries(): Promise<EntryCollection<Fields>> {
  // @ts-ignore
  return content;
}
