import React from "react";

// TODO: Problem with using "is scrollable" to decide if I should absolutely position the Page Num. or not...
// I really need to decide if there is room for the Page Num. or not, even if it isn't scrolling the other content
// More of a "should I scroll to see page number", not "are we scrolling without it"

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
