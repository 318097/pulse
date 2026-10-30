import { localStorageColorSchemeManager } from "@mantine/core";
import App from "./App";
import { mount } from "./mount";

mount(<App />, {
  defaultColorScheme: "auto",
  colorSchemeManager: localStorageColorSchemeManager({
    key: "pulse:color-scheme",
  }),
});
