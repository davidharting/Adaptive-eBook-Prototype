export interface Validation {
  status: "ok" | "error";
  problems: Array<string>;
}
