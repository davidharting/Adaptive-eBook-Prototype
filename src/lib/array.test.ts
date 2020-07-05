import { last, uniqueCount } from "./array";

describe("lib/array", () => {
  describe("#last", () => {
    test("if the array has no elements, it should return the array", () => {
      const a: Array<number> = [];
      expect(last(a, 3)).toBe(a);
    });

    test("if we want more elements than the array has, return the entire array", () => {
      const a = ["blue", "green", "red"];
      const end = last(a, 5);
      expect(end).toBe(a);
      expect(end).toEqual(["blue", "green", "red"]);
    });

    test("returns the last n elements of the array", () => {
      const a = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      expect(last(a)).toEqual([10]);
      expect(last(a, 2)).toEqual([9, 10]);
      expect(last(a, 3)).toEqual([8, 9, 10]);
      expect(last(a, 6)).toEqual([5, 6, 7, 8, 9, 10]);
      expect(last(a, 10)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });
  });

  describe("#uniqueCount", () => {
    it("should count unique items in an array", () => {
      expect(uniqueCount([])).toBe(0);
      expect(uniqueCount([1, 2, 3])).toBe(3);
      expect(
        uniqueCount(["blue", "green", "green", "red", "blue", "blue", "yellow"])
      ).toBe(4);
    });
  });
});
