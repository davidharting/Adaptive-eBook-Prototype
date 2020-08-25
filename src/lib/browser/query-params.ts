import React from "react";

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

export function useBooleanQueryParam(key: string) {
  const [value, setValue] = React.useState<boolean>(false);
  React.useEffect(() => {
    const v = getBooleanQueryParam(key);
    setValue(v);
  }, [key]);
  return value;
}
