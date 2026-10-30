// Switch's service worker side: keyboard commands
import { SWITCH_KEY } from "../config";
import { readFromStorage } from "../utils/storage";
import { isNewTabPage } from "../utils/tabs";
import { OPEN_SWITCH_COMMAND } from "./catalog";
import { TAB_COMMANDS } from "./commands";

// Window chrome around the 740x450 panel when it opens as a standalone window
const FALLBACK_WINDOW_SIZE = { width: 756, height: 490 };

const getSavedData = async () => (await readFromStorage(SWITCH_KEY, {})) || {};

// Opening the popup needs a focused browser window; when Chrome refuses, open
// the same page in a small window instead
const openPopup = (windowId) =>
  chrome.action.openPopup(windowId ? { windowId } : undefined).catch(() =>
    chrome.windows.create({
      url: chrome.runtime.getURL(`switch.html?windowId=${windowId ?? ""}`),
      type: "popup",
      focused: true,
      ...FALLBACK_WINDOW_SIZE,
    }),
  );

// Open popups (and fallback windows) connect a port, so the toggle shortcut can
// close them instead of opening another
const openPanels = new Set();

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== "switch") return;
  openPanels.add(port);
  port.onDisconnect.addListener(() => openPanels.delete(port));
});

// Pulse's new tab shows Switch as a modal over the daily card; any other
// page gets the toolbar popup. The new tab answers only for its own tab id.
const toggleSwitch = async (tab) => {
  if (openPanels.size) {
    openPanels.forEach((port) => port.postMessage({ type: "close" }));
    return;
  }
  if (!isNewTabPage(tab)) return openPopup(tab?.windowId);

  const handled = await chrome.runtime
    .sendMessage({ type: "toggle-switch", tabId: tab.id })
    .catch(() => false);
  if (!handled) openPopup(tab.windowId);
};

chrome.commands.onCommand.addListener(async (command, tab) => {
  if (command === OPEN_SWITCH_COMMAND) return toggleSwitch(tab);
  const { shortcuts } = await getSavedData();
  return TAB_COMMANDS[command]?.(tab?.windowId, shortcuts);
});
