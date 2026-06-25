// src/index.tsx
import "./i18n";
import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./app/store";
import reportWebVitals from "./reportWebVitals";
import ContextProvider from "./app/context/ContextProvider";
import ThemeWrapper from "./app/ThemeWrapper";
import { setupAxiosAuth } from "./lib/setupAxiosAuth";
import "./css/global.css";

setupAxiosAuth();

const container = document.getElementById("root")!;
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ContextProvider>
        <ThemeWrapper />
      </ContextProvider>
    </Provider>
  </React.StrictMode>
);

reportWebVitals();
