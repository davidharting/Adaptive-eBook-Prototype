import { getBooleanQueryParam } from "./query-params";

describe("Query Params", () => {
  describe("#getBooleanQueryParam", () => {
    afterAll(() => {
      window.history.replaceState({}, "Test", "/");
    });

    it("should return false if there are no query params", () => {
      window.history.replaceState({}, "Test", "/");
      expect(getBooleanQueryParam("preview")).toBe(false);
    });

    it("should return true if the query param is present with no value", () => {
      window.history.replaceState({}, "Test", "/?abc=123&preview");
      expect(getBooleanQueryParam("preview")).toBe(true);
    });

    it('should return true if the query param is present and has a value of 1 or "true"', () => {
      window.history.replaceState({}, "Test", "/?preview=1&abc=123");
      expect(getBooleanQueryParam("preview")).toBe(true);
      window.history.replaceState({}, "Test", "/?preview=true&abc=123");
      expect(getBooleanQueryParam("preview")).toBe(true);
    });

    it("should return false if the query param is present and has a value of 0 or false", () => {
      window.history.replaceState({}, "Test", "/?preview=0&abc=123");
      expect(getBooleanQueryParam("preview")).toBe(false);
      window.history.replaceState({}, "Test", "/?preview=false&abc=123");
      expect(getBooleanQueryParam("preview")).toBe(false);
    });
  });
});
