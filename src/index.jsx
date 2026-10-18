import React from "react";
import ReactDOM from "react-dom/client";
import {
  MantineProvider,
  createTheme,
  localStorageColorSchemeManager,
} from "@mantine/core";
import "@fontsource/geist-sans";
import "@fontsource/geist-mono";
import "./styles/tailwind.css";
import "@mantine/core/styles.layer.css";
import App from "./App";

const theme = createTheme({
  focusRing: "never",
  defaultRadius: "md",
  loader: "bars",
  fontFamily: "Geist Sans, Geist Mono, Open Sans, sans-serif",
  primaryColor: "dark",
  cursorType: "pointer",
});

const colorSchemeManager = localStorageColorSchemeManager({
  key: "pulse:color-scheme",
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <MantineProvider
      theme={theme}
      defaultColorScheme="auto"
      colorSchemeManager={colorSchemeManager}
    >
      <App />
    </MantineProvider>
  </React.StrictMode>,
);
