// Key combos as keycap labels, the way the user's OS prints them: ⌃ ⌥ ⇧ ⌘ on
// macOS, Ctrl Alt Shift on Windows/Linux. Sources are Chrome's command shortcuts
// ("Alt+Shift+K", or "⇧⌥K" on macOS) and written combos like "⌘ + Shift + M".
import { tabAction } from "./tabs";

export const IS_MAC =
  typeof navigator !== "undefined" &&
  /mac/i.test(navigator.userAgentData?.platform || navigator.platform || "");

// Every spelling Chrome or the cards use for a modifier
const MODIFIER_NAMES = {
  "⌃": "ctrl",
  ctrl: "ctrl",
  control: "ctrl",
  macctrl: "ctrl",
  "⌥": "alt",
  alt: "alt",
  option: "alt",
  opt: "alt",
  "⇧": "shift",
  shift: "shift",
  "⌘": "meta",
  cmd: "meta",
  command: "meta",
  meta: "meta",
  win: "meta",
};
// Each OS's usual order: ⌃⌥⇧⌘ on macOS, Ctrl+Alt+Shift elsewhere
const MODIFIER_ORDER = ["ctrl", "alt", "shift", "meta"];
const MODIFIER_LABELS = {
  mac: { ctrl: "⌃", alt: "⌥", shift: "⇧", meta: "⌘" },
  other: { ctrl: "Ctrl", alt: "Alt", shift: "Shift", meta: "Win" },
};
const KEY_NAMES = {
  up: "↑",
  down: "↓",
  left: "←",
  right: "→",
  comma: ",",
  period: ".",
};

const keyLabel = (key, isMac) => {
  const modifier = MODIFIER_NAMES[key.toLowerCase()];
  if (modifier) return MODIFIER_LABELS[isMac ? "mac" : "other"][modifier];
  return KEY_NAMES[key.toLowerCase()] || key;
};

export const SHIFT = keyLabel("shift", IS_MAC);

const splitShortcut = (shortcut) => {
  if (shortcut.includes("+")) {
    const parts = shortcut.split("+");
    return { modifiers: parts.slice(0, -1), key: parts.at(-1) };
  }
  // macOS: modifier symbols run straight into the key name
  const [, modifiers, key] = shortcut.match(/^([⌥⇧⌘⌃]*)(.*)$/);
  return { modifiers: [...modifiers], key };
};

const parseCommandShortcut = (shortcut = "", isMac = IS_MAC) => {
  if (!shortcut) return [];

  const { modifiers, key } = splitShortcut(shortcut);
  const sorted = modifiers
    .map((modifier) => MODIFIER_NAMES[modifier.toLowerCase()] || modifier)
    .sort((a, b) => MODIFIER_ORDER.indexOf(a) - MODIFIER_ORDER.indexOf(b));
  return [...sorted, key].map((part) => keyLabel(part, isMac));
};

// "⌘ + Shift + M" -> ["⌘", "⇧", "M"]; "G then Shift + →" keeps "then" as a word
export const parseKeyCombo = (combo = "", isMac = IS_MAC) =>
  combo.split(/\s+then\s+/i).flatMap((part, i) => [
    ...(i ? ["then"] : []),
    ...part
      .split("+")
      .map((key) => key.trim())
      .filter(Boolean)
      .map((key) => keyLabel(key, isMac)),
  ]);

// { "sort-tabs": ["⌥", "⇧", "J"], ... } with the keys the user actually has; a
// command whose key another extension took comes back as []
export const getCommandKeys = async () =>
  Object.fromEntries(
    (await chrome.commands.getAll()).map(({ name, shortcut }) => [
      name,
      parseCommandShortcut(shortcut),
    ]),
  );

export const openShortcutSettings = () =>
  tabAction("open", { url: "chrome://extensions/shortcuts" });
