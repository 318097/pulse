// What happens when a Switch row, key or command is picked. `close` hides the
// panel (closes the popup, or the modal on Pulse's new tab).
import { CHROME_ACTIONS, COMMANDS, YOUTUBE_PLAYLISTS } from "./catalog";
import { pluralize } from "../utils/text";
import { displayUrl } from "../utils/url";
import { getActiveTab, openUrl, tabAction } from "../utils/tabs";
import useSwitchStore from "./store";
import {
  CHROME_COMMANDS,
  fetchYouTubePlaylists,
  TAB_COMMANDS,
  YOUTUBE_PLAYLISTS_URL,
} from "./commands";

const state = () => useSwitchStore.getState();

// Wraps an action so a failure shows as an error toast; `failure` is the
// message, or a function of the action's arguments
const attempt =
  (action, failure) =>
  async (...args) => {
    try {
      return await action(...args);
    } catch (error) {
      console.error("[Switch]", error);
      const message =
        typeof failure === "function" ? failure(...args) : failure;
      state().showToast(message, "error");
    }
  };

const couldNotOpen = (url) => `Couldn't open ${displayUrl(url)}.`;

// Shortcuts: switch to a tab already showing the site, or open it
export const openLink = attempt(async (url, close) => {
  await openUrl(url, { windowId: state().windowId });
  close();
}, couldNotOpen);

// Navigation, Global and Chrome links: count the use (before the popup can
// close), then load in the tab Switch was opened on
export const openInCurrentTab = attempt(async ({ url, linkId }, close) => {
  state().recordUse(linkId);
  const tab = await getActiveTab(state().windowId);
  await tabAction("update", { tabId: tab?.id, url });
  close();
}, ({ url }) => couldNotOpen(url));

// Open tabs: bring that tab (and its window) to the front

export const switchToTab = attempt(async (tab, close) => {
  await tabAction("focus", { tabId: tab.id, windowId: tab.windowId });
  close();
}, "That tab is no longer open.");

export const runCommand = attempt(async (id, close) => {
  const { windowId, shortcuts, showToast, refreshTabs } = state();
  const result = await TAB_COMMANDS[id](windowId, shortcuts);

  if (id === "sort-tabs") {
    showToast(`Sorted ${pluralize(result, "tab")}.`);
    return refreshTabs();
  }
  if (result) return close();
  showToast(COMMANDS.find((command) => command.id === id).none, "info");
}, "Couldn't run that command.");

export const runChromeAction = attempt(async (id, close) => {
  const { windowId, showToast } = state();
  if ((await CHROME_COMMANDS[id](windowId)) !== false) return close();
  showToast(CHROME_ACTIONS.find((action) => action.id === id).none, "info");
}, "Couldn't run that action.");

const RESET_WARNING =
  "Run it again to delete all your shortcuts, imported links, favorites and history.";

const TASKS = {
  "fetch-youtube-playlists": async () => {
    const { windowId, showToast, setImportedLinks } = state();
    const playlists = await fetchYouTubePlaylists(windowId);
    if (!playlists) {
      return showToast(
        `Open ${displayUrl(YOUTUBE_PLAYLISTS_URL)}, then run this again from Switch.`,
        "info",
      );
    }
    setImportedLinks(
      YOUTUBE_PLAYLISTS.source,
      playlists.map((playlist) => ({ ...YOUTUBE_PLAYLISTS, ...playlist })),
    );
    showToast(`Scraped ${pluralize(playlists.length, "item")}.`);
  },
  "reset-imported-links": () => {
    state().resetImportedLinks();
    state().showToast("Removed imported links.");
  },
  // Runs only when picked again while its warning is still showing
  "reset-switch-data": async () => {
    const { toast, showToast, resetSwitchData } = state();
    if (toast?.message !== RESET_WARNING) {
      return showToast(RESET_WARNING, "info");
    }
    await resetSwitchData();
    showToast("Deleted all Switch data.");
  },
};

export const runTask = attempt(
  (id) => TASKS[id](),
  (id) =>
    id === "fetch-youtube-playlists"
      ? "Couldn't read the page. Reopen Switch on it and retry."
      : "Couldn't run that task.",
);

export const copyText = attempt(async (text) => {
  await navigator.clipboard.writeText(text);
  state().showToast(`Copied ${text}`);
}, "Couldn't copy to the clipboard.");
