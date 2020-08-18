export function flipCoin<T>(heads: T, tails: T): T {
  const r = Math.random();
  if (r <= 0.5) {
    return heads;
  }
  return tails;
}
