import { create } from "zustand";
import { DEFAULT_ENTITIES_KEY, SWITCH_KEY } from "../config";
import {
  parseStored,
  readFromStorage,
  saveDataToStorage,
} from "../utils/storage";
import { getCommandKeys } from "../utils/keys";
import { getActiveTab, getWindowTabs } from "../utils/tabs";
import { getKeybindings } from "./catalog";

// Search and Shortcuts are the two home views; Switch reopens on the last one
const HOME_VIEWS = ["search", "shortcuts"];
const TOAST_DURATION = 3000;

const pickSaved = ({ shortcuts = [], urlList = [], lastView } = {}) => ({
  shortcuts,
  urlList,
  lastView: HOME_VIEWS.includes(lastView) ? lastView : "search",
});

const useSwitchStore = create((set, get) => {
  const save = (update) => {
    set(update);
    const { shortcuts, urlList, lastView } = get();
    saveDataToStorage({ shortcuts, urlList, lastView }, SWITCH_KEY);
  };

  return {
    loaded: false,
    // Saved: shortcuts are { _id, name, url, hotkey, favorite, createdAt };
    // urlList holds imported links, like scraped YouTube playlists
    shortcuts: [],
    urlList: [],
    lastView: "search",
    // Context: commandKeys maps a command to its keys ([] when unassigned) and is
    // empty until read
    commandKeys: {},
    keybindings: [],
    windowId: undefined,
    tabs: [],
    currentTab: null,
    // UI
    view: "search",
    params: {},
    toast: null,

    load: async ({ windowId } = {}) => {
      const [data, entities] = await Promise.all([
        readFromStorage(SWITCH_KEY, {}),
        readFromStorage(DEFAULT_ENTITIES_KEY, []),
      ]);
      const saved = pickSaved(data || {});
      set({
        ...saved,
        view: saved.lastView,
        keybindings: getKeybindings(entities || []),
        windowId,
        loaded: true,
      });
      await get().refreshTabs();
    },

    refreshTabs: async () => {
      const { windowId } = get();
      const [tabs, currentTab] = await Promise.all([
        getWindowTabs(windowId),
        getActiveTab(windowId),
      ]);
      set({ tabs, currentTab });
    },

    refreshCommandKeys: async () =>
      set({ commandKeys: await getCommandKeys() }),

    // Each time the panel opens: back to the last home view, with fresh tabs
    reopen: () => {
      set({ view: get().lastView, params: {}, toast: null });
      return get().refreshTabs();
    },

    setView: (view, params = {}) =>
      HOME_VIEWS.includes(view) && view !== get().lastView
        ? save({ view, params, lastView: view })
        : set({ view, params }),

    addShortcut: (data) => {
      const shortcut = {
        ...data,
        _id: crypto.randomUUID(),
        createdAt: Date.now(),
      };
      save({ shortcuts: [shortcut, ...get().shortcuts] });
      get().showToast("Shortcut created.");
    },

    updateShortcut: (_id, data) => {
      save({
        shortcuts: get().shortcuts.map((s) =>
          s._id === _id ? { ...s, ...data } : s,
        ),
      });
      get().showToast("Shortcut updated.");
    },

    deleteShortcut: (_id) => {
      save({ shortcuts: get().shortcuts.filter((s) => s._id !== _id) });
      get().showToast("Shortcut deleted.");
    },

    // Replaces the links previously imported from the same source
    setImportedLinks: (source, links) =>
      save({
        urlList: [
          ...get().urlList.filter((link) => link.source !== source),
          ...links,
        ],
      }),

    resetImportedLinks: () => save({ urlList: [] }),

    showToast: (message, type = "success") => {
      const toast = { id: Date.now(), message, type };
      set({ toast });
      setTimeout(
        () => get().toast === toast && set({ toast: null }),
        TOAST_DURATION,
      );
    },

    hideToast: () => set({ toast: null }),
  };
});

// Keeps this page's Switch current: edits made in another window, new
// keyboard cards Pulse fetches, and keys changed in chrome://extensions/shortcuts
// (re-read whenever the page is shown again). Returns a cleanup function.
export const syncSwitch = () => {
  const { setState, getState } = useSwitchStore;

  const onStorageChange = (changes, area) => {
    if (area !== "local") return;
    const saved = parseStored(changes[SWITCH_KEY]?.newValue);
    const entities = parseStored(changes[DEFAULT_ENTITIES_KEY]?.newValue);
    if (saved) {
      const { shortcuts, urlList } = pickSaved(saved);
      setState({ shortcuts, urlList });
    }
    if (entities) setState({ keybindings: getKeybindings(entities) });
  };
  const onShow = () => !document.hidden && getState().refreshCommandKeys();

  onShow();
  chrome.storage.onChanged.addListener(onStorageChange);
  window.addEventListener("focus", onShow);
  document.addEventListener("visibilitychange", onShow);
  return () => {
    chrome.storage.onChanged.removeListener(onStorageChange);
    window.removeEventListener("focus", onShow);
    document.removeEventListener("visibilitychange", onShow);
  };
};

export default useSwitchStore;
