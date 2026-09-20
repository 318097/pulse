import { useMantineColorScheme } from "@mantine/core";
import { useEffect } from "react";

/**
 * Syncs Mantine's color scheme with Tailwind's dark class
 * Ensures Tailwind's dark: utilities respond to Mantine theme changes
 */
export function useTailwindDarkMode() {
  const { colorScheme } = useMantineColorScheme();

  useEffect(() => {
    const root = document.documentElement;
    if (colorScheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [colorScheme]);
}
