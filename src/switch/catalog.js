// Static destinations Switch searches: tab commands, Chrome's own actions and
// pages, web app pages, .new and other global links, and one-off tasks. Ported
// from QuickSwitch's url.config.js.
// `l0` are an app's aliases and `l1` a section's, so search finds `yt watch` and
// `yt p music`; `yt.` scopes the search to YouTube.

import { capitalize } from "../utils/text";
import { IS_MAC, parseKeyCombo } from "../utils/keys";
import { getSite, googleSearchUrl } from "../utils/url";

// The command that opens Switch (labelled "Open Switch"). It keeps the id it
// shipped with: Chrome keeps the key bound to this id for the extension, so a
// renamed command comes back without one on existing installs.
export const OPEN_SWITCH_COMMAND = "toggle-quick-switch";

// Ids double as chrome.commands names, so the UI shows their live keys.
// `none` is the toast when there's no tab to cycle to.
export const COMMANDS = [
  {
    id: "sort-tabs",
    title: "Sort tabs",
    description: "Group tabs by site, then order them by URL",
  },
  {
    id: "cycle-same-domain-tabs",
    title: "Cycle same-domain tabs",
    description: "Jump to the next tab on this site",
    none: "No other tab on this site.",
  },
  {
    id: "cycle-favorite-tabs",
    title: "Cycle favorite tabs",
    description: "Step through tabs of your starred shortcuts",
    none: "No tabs from your starred shortcuts are open.",
  },
];

// Chrome's own keys on the user's OS, written like the keyboard shortcut cards
// ("⌘ + Shift + N"); nothing when Chrome has no key for it there
const chromeKeys = (mac, windows) => {
  const combo = IS_MAC ? mac : windows;
  return combo ? { combo, keys: parseKeyCombo(combo) } : {};
};

// Chrome features Switch runs itself (see CHROME_COMMANDS), on the tab it was
// opened on or that tab's window. A toggle's title follows that tab's state;
// `none` is the toast when the tab can't take the action.
export const CHROME_ACTIONS = [
  {
    id: "new-window",
    title: "New window",
    description: "Open a new browser window",
    mac: "⌘ + N",
    windows: "Ctrl + N",
  },
  {
    id: "new-incognito-window",
    title: "New Incognito window",
    description: "Browse without saving history",
    mac: "⌘ + Shift + N",
    windows: "Ctrl + Shift + N",
  },
  {
    id: "open-in-incognito",
    title: "Open page in Incognito",
    description: "Reopen this tab's page in an Incognito window",
    none: "Only web pages can open in Incognito.",
  },
  {
    id: "duplicate-tab",
    title: "Duplicate tab",
    description: "Open a copy of this tab next to it",
  },
  {
    id: "toggle-pin-tab",
    title: (tab) => (tab?.pinned ? "Unpin tab" : "Pin tab"),
    description: "Pinned tabs stay small, at the start of the window",
  },
  {
    id: "toggle-mute-tab",
    title: (tab) => (tab?.mutedInfo?.muted ? "Unmute tab" : "Mute tab"),
    description: "Turn this tab's sound off or back on",
  },
  {
    id: "move-tab-to-new-window",
    title: "Move tab to new window",
    description: "Give this tab a window of its own",
  },
  {
    id: "toggle-full-screen",
    title: "Full screen",
    description: "Enter or leave full screen",
    mac: "⌃ + ⌘ + F",
    windows: "F11",
  },
].map(({ mac, windows, ...action }) => ({
  ...action,
  ...chromeKeys(mac, windows),
}));

// chrome:// pages, with Chrome's key for the ones that have one
export const CHROME_PAGES = [
  ["Extensions", "chrome://extensions"],
  ["Extension keyboard shortcuts", "chrome://extensions/shortcuts"],
  ["Settings", "chrome://settings", "⌘ + ,"],
  ["History", "chrome://history", "⌘ + Y", "Ctrl + H"],
  ["Downloads", "chrome://downloads", "⌘ + Shift + J", "Ctrl + J"],
  ["Bookmark manager", "chrome://bookmarks", "⌘ + ⌥ + B", "Ctrl + Shift + O"],
  ["Passwords", "chrome://password-manager/passwords"],
  [
    "Clear browsing data",
    "chrome://settings/clearBrowserData",
    "⌘ + Shift + ⌫",
    "Ctrl + Shift + Delete",
  ],
  ["Autofill and payment methods", "chrome://settings/autofill"],
  ["Privacy and security", "chrome://settings/privacy"],
  ["Site settings and permissions", "chrome://settings/content"],
  ["Search engines", "chrome://settings/searchEngines"],
  ["Appearance and themes", "chrome://settings/appearance"],
  ["Performance and Memory Saver", "chrome://settings/performance"],
  ["Sync and Google services", "chrome://settings/syncSetup"],
  ["Default browser", "chrome://settings/defaultBrowser"],
  ["About Chrome and updates", "chrome://settings/help"],
  ["Experimental flags", "chrome://flags"],
  ["Inspect devices", "chrome://inspect"],
  ["Version info", "chrome://version"],
].map(([title, url, mac, windows]) => ({
  id: `chrome:${url}`,
  title,
  url,
  ...chromeKeys(mac, windows),
}));

// Chrome keys for what Switch can't do itself, shaped like the keyboard shortcut
// cards so they share their rows; ones with no key on this OS are left out
export const CHROME_SHORTCUTS = [
  [
    "Reopen closed tab",
    "Bring back the tab or window you closed last",
    "⌘ + Shift + T",
    "Ctrl + Shift + T",
  ],
  [
    "Focus the address bar",
    "Type a URL or search from anywhere",
    "⌘ + L",
    "Ctrl + L",
  ],
  ["Find on page", "Search the text of this page", "⌘ + F", "Ctrl + F"],
  ["Bookmark this page", "Save this tab to bookmarks", "⌘ + D", "Ctrl + D"],
  [
    "Show the bookmarks bar",
    "Toggle the bar under the address bar",
    "⌘ + Shift + B",
    "Ctrl + Shift + B",
  ],
  ["Next tab", "Move one tab to the right", "⌃ + Tab", "Ctrl + Tab"],
  [
    "Previous tab",
    "Move one tab to the left",
    "⌃ + Shift + Tab",
    "Ctrl + Shift + Tab",
  ],
  [
    "Jump to a tab by position",
    "Go to the first through eighth tab",
    "⌘ + 1–8",
    "Ctrl + 1–8",
  ],
  ["Jump to the last tab", "Go to the rightmost tab", "⌘ + 9", "Ctrl + 9"],
  [
    "Open a link in a background tab",
    "Keep reading while it loads",
    "⌘ + Click",
    "Ctrl + Click",
  ],
  [
    "Hard reload",
    "Reload the page, skipping the cache",
    "⌘ + Shift + R",
    "Ctrl + Shift + R",
  ],
  ["Reset zoom", "Back to 100%", "⌘ + 0", "Ctrl + 0"],
  [
    "Open developer tools",
    "Inspect the page's elements, console and network",
    "⌘ + ⌥ + I",
    "Ctrl + Shift + I",
  ],
  ["View page source", "See the page's HTML", "⌘ + ⌥ + U", "Ctrl + U"],
  [
    "Open the task manager",
    "See what each tab and extension is using",
    null,
    "Shift + Esc",
  ],
]
  .map(([title, description, mac, windows]) => ({
    id: `keybinding:${title.toLowerCase()}`,
    title,
    description,
    ...chromeKeys(mac, windows),
  }))
  .filter((shortcut) => shortcut.combo);

// A task with an `appName` is listed in that app's web app group, not under Tasks
export const TASKS = [
  {
    id: "fetch-youtube-playlists",
    appName: "youtube",
    title: "Fetch playlists",
    description: "Import your playlists so they show up in search",
  },
  {
    id: "reset-imported-links",
    title: "Reset imported links",
    description: "Remove imported links, like YouTube playlists",
  },
  {
    id: "reset-switch-data",
    title: "Reset Switch data",
    description: "Delete your shortcuts, imported links, favorites and history",
  },
];

// Config every scraped playlist is saved with; it joins the YouTube group, under
// its Playlists destination
export const YOUTUBE_PLAYLISTS = {
  source: "youtube:playlists",
  appName: "youtube",
  l1Label: "Playlists",
  l1: ["p", "playlists"],
  tag: "playlist",
};

// `search` is the path a query is added to when searching inside the app
// ("yt.lofi"); apps without one search through Google
const WEBAPPS = [
  {
    appName: "youtube",
    label: "YouTube",
    l0: ["yt"],
    url: "https://www.youtube.com",
    search: "/results?search_query=",
    paths: [
      ["Watch Later", "/playlist?list=WL"],
      ["Liked Videos", "/playlist?list=LL"],
      ["Playlists", "/feed/playlists"],
      ["Subscriptions", "/feed/subscriptions"],
      ["History", "/feed/history"],
    ],
  },
  {
    appName: "gmail",
    label: "Gmail",
    l0: ["gm"],
    url: "https://mail.google.com",
    search: "/mail/u/0/#search/",
    paths: [
      ["Compose", "/mail/#inbox?compose=new"],
      ["Starred", "/mail/#starred"],
      ["Sent", "/mail/#sent"],
      ["Drafts", "/mail/#drafts"],
      ["All Mail", "/mail/#all"],
    ],
  },
  {
    appName: "drive",
    label: "Google Drive",
    l0: ["gd"],
    url: "https://drive.google.com",
    search: "/drive/search?q=",
    paths: [
      ["My Drive", "/drive/my-drive"],
      ["Shared with me", "/drive/shared-with-me"],
      ["Recent", "/drive/recent"],
      ["Starred", "/drive/starred"],
      ["Trash", "/drive/trash"],
    ],
  },
  {
    appName: "github",
    label: "GitHub",
    l0: ["gh", "git"],
    url: "https://github.com",
    search: "/search?q=",
    paths: [
      ["Pull Requests", "/pulls"],
      ["Issues", "/issues"],
      ["Notifications", "/notifications"],
      ["Stars", "/stars"],
      ["Explore", "/explore"],
    ],
  },
  {
    appName: "linkedin",
    label: "LinkedIn",
    l0: ["ln", "li"],
    url: "https://www.linkedin.com",
    search: "/search/results/all/?keywords=",
    paths: [
      ["Profile", "/in/me/"],
      ["My Network", "/mynetwork"],
      ["Jobs", "/jobs"],
      ["Messaging", "/messaging"],
      ["Notifications", "/notifications"],
      ["Settings", "/mypreferences"],
    ],
  },
  {
    appName: "x",
    label: "X",
    l0: ["x"],
    url: "https://x.com",
    search: "/search?q=",
    paths: [
      ["Grok", "/i/grok"],
      ["Explore", "/explore"],
      ["Notifications", "/notifications"],
      ["Messages", "/messages"],
      ["Bookmarks", "/i/bookmarks"],
      ["Settings", "/settings/account"],
    ],
  },
  {
    appName: "instagram",
    label: "Instagram",
    l0: ["ig", "insta"],
    url: "https://www.instagram.com",
    search: "/explore/search/keyword/?q=",
    paths: [
      ["Messages", "/direct/inbox/"],
      ["Explore", "/explore/"],
      ["Reels", "/reels/"],
    ],
  },
  {
    appName: "reddit",
    label: "Reddit",
    l0: ["rd"],
    url: "https://www.reddit.com",
    search: "/search/?q=",
    paths: [
      ["Popular", "/r/popular/"],
      ["Saved", "/user/me/saved/"],
    ],
  },
  {
    appName: "facebook",
    label: "Facebook",
    l0: ["fb"],
    url: "https://www.facebook.com",
    search: "/search/top?q=",
    paths: [
      ["Profile", "/me"],
      ["Messages", "/messages"],
      ["Notifications", "/notifications"],
    ],
  },
  {
    appName: "amazon",
    label: "Amazon",
    l0: ["az"],
    url: "https://www.amazon.in",
    search: "/s?k=",
    paths: [
      ["Orders", "/gp/css/order-history"],
      ["Cart", "/gp/cart/view.html"],
      ["Wish List", "/gp/registry/wishlist"],
    ],
  },
  {
    appName: "netflix",
    label: "Netflix",
    l0: ["nf"],
    url: "https://www.netflix.com",
    search: "/search?q=",
    paths: [
      ["My List", "/browse/my-list"],
      ["Latest", "/latest"],
    ],
  },
  {
    appName: "spotify",
    label: "Spotify",
    l0: ["sp"],
    url: "https://open.spotify.com",
    search: "/search/",
    paths: [
      ["Your Library", "/collection"],
      ["Liked Songs", "/collection/tracks"],
    ],
  },
  {
    appName: "flipkart",
    label: "Flipkart",
    l0: ["fk"],
    url: "https://www.flipkart.com",
    search: "/search?q=",
    paths: [
      ["Orders", "/account/orders"],
      ["Wishlist", "/wishlist"],
    ],
  },
  {
    appName: "paytm",
    label: "Paytm",
    l0: ["pt"],
    url: "https://paytm.com",
    paths: [["Recharge & Bill Payments", "/recharge"]],
  },
  {
    appName: "zomato",
    label: "Zomato",
    l0: ["zo"],
    url: "https://www.zomato.com",
    paths: [
      // Redirects to the user's city
      ["Order Food", "/delivery"],
      ["Dining Out", "/dine-out"],
    ],
  },
  {
    appName: "tiktok",
    label: "TikTok",
    l0: ["tt"],
    url: "https://www.tiktok.com",
    search: "/search?q=",
    paths: [["Explore", "/explore"]],
  },
];

// Each web app is a group: its home page plus one destination per path
const WEBAPP_GROUPS = WEBAPPS.map(({ paths, ...app }) => ({
  ...app,
  id: `webapp:${app.appName}`,
  children: [["Home", ""], ...paths].map(([title, path]) => ({
    id: `webapp:${app.url}${path}`,
    title,
    url: `${app.url}${path}`,
  })),
}));

// The web app an alias names: "yt" -> YouTube
export const findWebapp = (alias = "") => {
  const key = alias.trim().toLowerCase();
  return WEBAPP_GROUPS.find((app) => app.l0.includes(key));
};

// A search inside the web app, on its own search page or else through Google
export const siteSearchUrl = (app, query) =>
  app.search
    ? `${app.url}${app.search}${encodeURIComponent(query)}`
    : googleSearchUrl(`site:${getSite(app.url)} ${query}`);

// Gmail and Google Drive are web app groups; Chrome's pages have their own section
export const GLOBALS = [
  ["Google Calendar", "https://calendar.google.com"],
  ["Google Docs", "https://docs.google.com"],
  ["Google Sheets", "https://sheets.google.com"],
  ["Google Slides", "https://slides.google.com"],
  ["Google Meet", "https://meet.google.com"],
  ["Google Keep", "https://keep.google.com"],
  ["Google Maps", "https://maps.google.com"],
  ["Google Photos", "https://photos.google.com"],
  ["Google Translate", "https://translate.google.com"],
  ["WhatsApp Web", "https://web.whatsapp.com"],
  ["New Claude chat", "https://claude.new"],
  ["New ChatGPT chat", "https://chatgpt.com"],
  ["New Gemini chat", "https://gemini.google.com/app"],
  ["New Google Doc", "https://doc.new"],
  ["New Google Sheet", "https://sheet.new"],
  ["New Google Slide", "https://slide.new"],
  ["New Google Form", "https://form.new"],
  ["New Google Drawing", "https://drawings.new"],
  ["New video call with Google Meet", "https://meet.new"],
  ["New Google Calendar event", "https://cal.new"],
  ["New Google Keep note", "https://keep.new"],
  ["New Google Site", "https://site.new"],
  ["New GitHub repository", "https://repo.new"],
  ["New GitHub gist", "https://gist.new"],
  ["New GitHub codespace", "https://codespace.new"],
  ["New GitLab project", "https://gitlab.new"],
  ["New Next.js project on StackBlitz", "https://next.new"],
  ["New Node.js project on StackBlitz", "https://node.new"],
  ["New React project on CodeSandbox", "https://react.new"],
  ["New TypeScript project on CodeSandbox", "https://ts.new"],
  ["New JavaScript project on CodeSandbox", "https://js.new"],
  ["New Vue project on CodeSandbox", "https://vue.new"],
  ["New Nuxt project on CodeSandbox", "https://nuxt.new"],
  ["New Angular project on CodeSandbox", "https://ng.new"],
  ["New CodeSandbox project", "https://csb.new"],
  ["New CodePen", "https://pen.new"],
  ["New Tailwind Play page", "https://tailwind.new"],
  ["New Python sandbox on CoderPad", "https://python.new"],
  ["New CoderPad interview", "https://pad.new"],
  ["New Notion page", "https://notion.new"],
  ["New Figma design", "https://figma.new"],
  ["New Canva design", "https://design.new"],
  ["New Medium story", "https://story.new"],
  ["New Bitly link", "https://link.new"],
  ["Convert JPG to PDF with Adobe", "https://jpgtopdf.new"],
  ["Generate a UUID", "https://uuid.new"],
  ["Generate a strong password", "https://password.new"],
  ["Post a job on Startup.jobs", "https://job.new"],
  ["Registry of .new shortcuts", "https://whats.new"],
].map(([title, url]) => ({
  id: `global:${url}`,
  title,
  url,
}));

// Web app groups, with imported links (e.g. scraped playlists) added to their app's
// group: nested under the destination their `l1Label` names, else at the end
export const getWebappGroups = (urlList = []) =>
  WEBAPP_GROUPS.map((group) => {
    const imported = urlList
      .filter((link) => link.appName === group.appName)
      .map((link) => ({ ...link, id: `imported:${link.url}` }));
    if (!imported.length) return group;

    const isUnder = (link, child) => link.l1Label === child.title;
    const children = group.children.flatMap((child) => [
      child,
      ...imported
        .filter((link) => isUnder(link, child))
        .map((link) => ({ ...link, nested: true })),
    ]);
    const rest = imported.filter(
      (link) => !group.children.some((child) => isUnder(link, child)),
    );
    return { ...group, children: [...children, ...rest] };
  });

// Every keyboard shortcut card Pulse has shown, from the rows its API returns
// alongside each card
export const getKeybindings = (entities = []) => {
  const entity = entities.find(({ _id }) => _id === "keybindings");
  const keybindings = new Map();

  [...(entity?.history || []), entity?.db]
    .flatMap((entry) => entry?.parsed || [])
    .forEach(({ title, description, group, mac, windows }) => {
      const combo = (IS_MAC ? mac || windows : windows || mac) || "";
      if (!title || !combo) return;

      const id = title.toLowerCase();
      keybindings.set(id, {
        id: `keybinding:${id}`,
        title: capitalize(title),
        description,
        group,
        combo,
        keys: parseKeyCombo(combo),
      });
    });

  return [...keybindings.values()];
};
