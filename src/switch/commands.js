// What Switch runs on the browser's tabs: the keyboard commands (sort, cycle),
// Chrome's own tab and window actions, and the YouTube playlist import
import { getSite, isUrlMatch, normalizeUrl } from "../utils/url";
import { getActiveTab, getWindowTabs, tabAction } from "../utils/tabs";

// Pinned tabs stay put; the rest are grouped by site, then ordered by URL.
// Resolves to the number of tabs sorted.
const sortTabs = async (windowId) => {
  const ids = (await getWindowTabs(windowId))
    .filter((tab) => !tab.pinned)
    .map((tab) => ({
      id: tab.id,
      url: normalizeUrl(tab.url || tab.pendingUrl),
    }))
    .sort((a, b) => a.url.localeCompare(b.url))
    .map(({ id }) => id);

  if (ids.length) await tabAction("move", { tabIds: ids, index: -1 });
  return ids.length;
};

// Activate the next tab (wrapping around) after the active one that passes
// `predicate`. Resolves to that tab, or null when there's none.
const cycleTabs = async (windowId, predicate) => {
  const tabs = await getWindowTabs(windowId);
  const activeIdx = tabs.findIndex((tab) => tab.active);

  for (let step = 1; step < tabs.length; step++) {
    const tab = tabs[(activeIdx + step) % tabs.length];
    if (predicate(tab, tabs[activeIdx])) {
      await tabAction("focus", { tabId: tab.id });
      return tab;
    }
  }
  return null;
};

// The keyboard commands, also runnable from Switch's Commands list
export const TAB_COMMANDS = {
  "sort-tabs": sortTabs,
  "cycle-same-domain-tabs": (windowId) =>
    cycleTabs(windowId, (tab, activeTab) => {
      const site = getSite(activeTab?.url);
      return !!site && getSite(tab.url) === site;
    }),
  "cycle-favorite-tabs": (windowId, shortcuts = []) =>
    cycleTabs(windowId, (tab) =>
      shortcuts.some(
        ({ favorite, url }) => favorite && isUrlMatch(tab.url, url),
      ),
    ),
};

const onActiveTab = (action) => async (windowId) =>
  action(await getActiveTab(windowId));

// The Chrome section's actions (CHROME_ACTIONS), on the tab Switch was opened on
// or its window. One resolves to false when that tab can't take it.
export const CHROME_COMMANDS = {
  "new-window": () => chrome.windows.create({}),
  "new-incognito-window": () => chrome.windows.create({ incognito: true }),
  "open-in-incognito": onActiveTab(async (tab) => {
    if (!/^https?:\/\//.test(tab?.url || "")) return false;
    await chrome.windows.create({ incognito: true, url: tab.url });
  }),
  "duplicate-tab": onActiveTab((tab) =>
    tabAction("duplicate", { tabId: tab.id }),
  ),
  "toggle-pin-tab": onActiveTab((tab) =>
    tabAction("pin", { tabId: tab.id, pinned: !tab.pinned }),
  ),
  "toggle-mute-tab": onActiveTab((tab) =>
    tabAction("mute", { tabId: tab.id, muted: !tab.mutedInfo?.muted }),
  ),
  "move-tab-to-new-window": onActiveTab((tab) =>
    tabAction("detach", { tabId: tab.id }),
  ),
  "toggle-full-screen": async (windowId = chrome.windows.WINDOW_ID_CURRENT) => {
    const { state } = await chrome.windows.get(windowId);
    await chrome.windows.update(windowId, {
      state: state === "fullscreen" ? "normal" : "fullscreen",
    });
  },
};

// Runs inside the YouTube page (via chrome.scripting), so it must be self-contained.
// No spread syntax: Babel compiles it to a helper that only exists in our bundle.
function scrapeYouTubePlaylists() {
  const anchors = Array.from(document.querySelectorAll('a[href*="list="]'));
  // Title links first, so a thumbnail's "12 videos" overlay never wins as the name
  const isTitleLink = (anchor) =>
    anchor.id === "video-title" || /title/i.test(anchor.className);
  anchors.sort((a, b) => Number(isTitleLink(b)) - Number(isTitleLink(a)));

  const playlists = new Map();
  anchors.forEach((anchor) => {
    const href = anchor.getAttribute("href") || "";
    const id = new URLSearchParams(href.split("?")[1]).get("list");
    const title = (anchor.getAttribute("title") || anchor.textContent || "")
      .replace(/\s+/g, " ")
      .trim();
    if (id && title && !playlists.has(id)) {
      playlists.set(id, {
        title,
        url: `https://www.youtube.com/playlist?list=${id}`,
      });
    }
  });
  return Array.from(playlists.values());
}

export const YOUTUBE_PLAYLISTS_URL = "https://www.youtube.com/feed/playlists";

// Resolves to null when the active tab isn't the playlists page. Needs the
// activeTab grant Chrome gives when Switch is opened on that page.
export const fetchYouTubePlaylists = async (windowId) => {
  const tab = await getActiveTab(windowId);
  if (!isUrlMatch(tab?.url, YOUTUBE_PLAYLISTS_URL)) return null;

  const [{ result } = {}] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: scrapeYouTubePlaylists,
  });
  // A scraper that throws in the page comes back as a null result
  if (!Array.isArray(result)) throw new Error("Playlist scraper failed");
  return result;
};
