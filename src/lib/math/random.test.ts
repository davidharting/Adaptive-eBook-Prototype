import { flipCoin } from "./random";

describe("#flipCoin", () => {
  it("should land on heads about 50% of the time", () => {
    const numberOfTrials = 1000000;
    const counts = { heads: 0, tails: 0 };
    for (let i = 0; i < numberOfTrials; i++) {
      const trial = flipCoin("heads", "tails");
      counts[trial]++;
    }
    expect(counts.heads).toBeGreaterThanOrEqual(numberOfTrials * 0.45);
    expect(counts.heads).toBeLessThanOrEqual(numberOfTrials * 0.55);

    expect(counts.tails).toBeGreaterThan(numberOfTrials * 0.45);
    expect(counts.tails).toBeLessThanOrEqual(numberOfTrials * 0.55);
  });
});
