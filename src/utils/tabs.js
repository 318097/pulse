// chrome.tabs reads and actions. Functions that take a windowId act on that
// window, or the current one when it's left out.
import { isUrlMatch } from "./url";

const inWindow = (windowId) =>
  windowId ? { windowId } : { currentWindow: true };

export const getWindowTabs = (windowId) =>
  chrome.tabs.query({ ...inWindow(windowId), windowType: "normal" });

export const getActiveTab = async (windowId) =>
  (await chrome.tabs.query({ ...inWindow(windowId), active: true }))[0];

// Pulse's own new tab shows up as chrome://newtab or as the extension page
export const isNewTabPage = (tab) =>
  !!tab &&
  (tab.url === "chrome://newtab/" ||
    tab.pendingUrl === "chrome://newtab/" ||
    !!tab.url?.startsWith(chrome.runtime.getURL("index.html")));

// Tabs whose URL starts with `url` (see isUrlMatch)
export const getMatchedTabs = (tabs = [], url) =>
  url ? tabs.filter((tab) => isUrlMatch(tab.url, url)) : [];

// Most recently used first, so switching jumps to the tab you were last on
export const sortByLastAccessed = (tabs) =>
  [...tabs].sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0));

// Every change made to a tab goes through tabAction(action, info)
const TAB_ACTIONS = {
  // A new tab at `url`; optionally in `windowId`, at `index`, or in the
  // background (`active: false`)
  open: ({ url, windowId, index, active = true }) =>
    chrome.tabs.create({ url, windowId, index, active }),
  // Load `url` in `tabId`, or in the active tab when there's no `tabId`
  update: ({ tabId, url }) =>
    tabId === undefined
      ? chrome.tabs.update({ url })
      : chrome.tabs.update(tabId, { url }),
  // Make `tabId` the active tab, and bring its window to the front when
  // `windowId` is given
  focus: async ({ tabId, windowId }) => {
    await chrome.tabs.update(tabId, { active: true });
    if (windowId !== undefined) {
      await chrome.windows.update(windowId, { focused: true });
    }
  },
  // Move `tabIds`, in that order, to `index` (-1 is the end of the window)
  move: ({ tabIds, index }) => chrome.tabs.move(tabIds, { index }),
  // Move `tabId` out into a new window of its own
  detach: ({ tabId }) => chrome.windows.create({ tabId }),
  // A copy of `tabId`, right after it
  duplicate: ({ tabId }) => chrome.tabs.duplicate(tabId),
  pin: ({ tabId, pinned }) => chrome.tabs.update(tabId, { pinned }),
  mute: ({ tabId, muted }) => chrome.tabs.update(tabId, { muted }),
  close: ({ tabId }) => chrome.tabs.remove(tabId),
};

export const tabAction = (action, info = {}) => {
  if (!TAB_ACTIONS[action]) throw new Error(`Unknown tab action "${action}"`);
  return TAB_ACTIONS[action](info);
};

const focusTab = ({ id, windowId }) =>
  tabAction("focus", { tabId: id, windowId });

// Switch to the most recently used tab already showing `url`. Otherwise open it
// in a new tab, or in the current tab when that's a new tab page.
export const openUrl = async (url, { windowId } = {}) => {
  const [tabs, activeTab] = await Promise.all([
    getWindowTabs(windowId),
    getActiveTab(windowId),
  ]);
  const [matchedTab] = sortByLastAccessed(
    getMatchedTabs(tabs, url).filter((tab) => tab.id !== activeTab?.id),
  );
  if (matchedTab) return focusTab(matchedTab);
  if (isUrlMatch(activeTab?.url, url)) return focusTab(activeTab);

  return isNewTabPage(activeTab)
    ? tabAction("update", { tabId: activeTab.id, url })
    : tabAction("open", { url, windowId: activeTab?.windowId });
};

// Replace the page's own tab with a fresh one at `url`, in the same spot.
// Chrome keeps keyboard focus in the address bar on a new tab page, but gives
// it to the page in a tab opened this way.
export const reopenInNewTab = async (url) => {
  const tab = await chrome.tabs.getCurrent();
  await tabAction("open", { url, index: tab.index, windowId: tab.windowId });
  tabAction("close", { tabId: tab.id });
};
