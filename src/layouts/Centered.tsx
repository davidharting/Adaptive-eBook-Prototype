import React from "react";
import Container from "react-bootstrap/Container";

interface CenteredLayoutProps {
  children: React.ReactChild;
}

function CenteredLayout({ children }: CenteredLayoutProps) {
  return (
    <Container className="d-flex justify-content-center align-items-center vw-100 h-100">
      {children}
    </Container>
  );
}

export default CenteredLayout;
