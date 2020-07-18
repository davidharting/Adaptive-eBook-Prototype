import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { store } from "app/store";
import App from "App";

jest.mock("lib/contentful/client");

test("renders setup device screen", () => {
  render(
    <Provider store={store}>
      <App />
    </Provider>
  );

  return screen.findByText(/set up this device/i).then((node) => {
    expect(node).toBeInTheDocument();
  });
});
