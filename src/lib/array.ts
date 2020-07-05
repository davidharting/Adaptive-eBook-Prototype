export function last<T>(a: Array<T>, n: number = 1): Array<T> {
  if (a.length < n) {
    return a;
  }
  return a.slice(a.length - n);
}

export function lastItem<T>(a: Array<T>): T | undefined {
  const recentItems = last(a);
  return recentItems.length === 1 ? recentItems[0] : undefined;
}

export function uniqueCount<T>(a: Array<T>): number {
  const uniques = Array.from(new Set(a).values());
  return uniques ? uniques.length : 0;
}
