import React from "react";

export function useIsScrollable(): boolean | null {
  const [isScrollable, setIsScrollable] = React.useState<boolean | null>(null);

  const onResize = () => {
    if (document.body.clientHeight > window.innerHeight) {
      setIsScrollable(true);
    } else {
      setIsScrollable(false);
    }
  };

  React.useEffect(() => {
    onResize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return isScrollable;
}
