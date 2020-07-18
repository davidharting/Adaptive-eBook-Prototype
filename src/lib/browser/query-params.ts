export function getBooleanQueryParam(key: string): boolean {
  if (
    typeof window === "object" &&
    window.URLSearchParams &&
    window.location.search
  ) {
    const params = new URLSearchParams(window.location.search);
    if (params.has(key)) {
      const value = params.get(key);
      if (value !== "false" && value !== "0") {
        return true;
      }
    }
  }
  return false;
}
