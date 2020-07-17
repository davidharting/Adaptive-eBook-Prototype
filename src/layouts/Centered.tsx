import React from "react";
import Container from "react-bootstrap/Container";
import cn from "classnames";

interface CenteredLayoutProps {
  children: React.ReactChild;
  /**
   * Whether or not to center vertically in addition to horizontally
   */
  vertical?: boolean;
}

function CenteredLayout({ children, vertical = true }: CenteredLayoutProps) {
  const cx = cn("d-flex justify-content-center align-items-center vw-100", {
    "vh-100": vertical,
  });
  return <Container className={cx}>{children}</Container>;
}

export default CenteredLayout;
