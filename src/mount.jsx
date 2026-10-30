import React from "react";
import ReactDOM from "react-dom/client";
import { MantineProvider, createTheme } from "@mantine/core";
import "@fontsource/geist-sans";
import "@fontsource/geist-mono";
import "./styles/tailwind.css";
import "@mantine/core/styles.layer.css";

const theme = createTheme({
  focusRing: "never",
  defaultRadius: "md",
  loader: "bars",
  fontFamily: "Geist Sans, Geist Mono, Open Sans, sans-serif",
  fontFamilyMonospace: "Geist Mono, ui-monospace, monospace",
  primaryColor: "dark",
  cursorType: "pointer",
});

// Renders one of the extension's pages (new tab, Switch popup) with Pulse's
// fonts, styles and Mantine theme
export const mount = (element, providerProps) =>
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <MantineProvider theme={theme} {...providerProps}>
        {element}
      </MantineProvider>
    </React.StrictMode>,
  );
