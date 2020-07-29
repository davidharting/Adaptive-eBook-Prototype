import { IPage } from "types/generated/contentful";

class Page {
  static getAudio(page: IPage): string[] {
    const promptAudio = page.fields.narrative.fields.audio?.fields.file.url;
    return promptAudio ? [promptAudio] : [];
  }
}

export default Page;
