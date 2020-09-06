import React from "react";
import ReactDOM from "react-dom";
import {
  ErrorBoundary as SentryErrorBoundary,
  init as initializeSentry,
} from "@sentry/react";
import "./index.css";
import App from "./App";
import { store } from "./app/store";
import { Provider } from "react-redux";
import * as serviceWorker from "./serviceWorker";

initializeSentry({
  dsn:
    "https://0fdf42bdead84d25bba7b49d7b29ac84@o398627.ingest.sentry.io/5254619",
  environment: process.env.REACT_APP_DEPLOY,
});

ReactDOM.render(
  <React.StrictMode>
    <SentryErrorBoundary fallback={"Sorry, an error has occurred."}>
      <Provider store={store}>
        <App />
      </Provider>
    </SentryErrorBoundary>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
