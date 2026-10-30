// Static destinations Switch searches: tab commands, web app pages, browser
// and .new links, and one-off tasks. Ported from QuickSwitch's url.config.js.
// `l0` are an app's aliases and `l1` a section's, so search finds `yt watch` and
// `yt p music`.

import { capitalize } from "../utils/text";
import { IS_MAC, parseKeyCombo } from "../utils/keys";

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
];

// Config every scraped playlist is saved with; it joins the YouTube group
export const YOUTUBE_PLAYLISTS = {
  source: "youtube:playlists",
  appName: "youtube",
  l1Label: "Playlists",
  l1: ["p", "playlists"],
};

const WEBAPPS = [
  {
    appName: "youtube",
    label: "YouTube",
    l0: ["yt"],
    url: "https://www.youtube.com",
    paths: [
      ["Watch Later", "/playlist?list=WL"],
      ["Liked Videos", "/playlist?list=LL"],
      ["Playlists", "/feed/playlists"],
      ["Subscriptions", "/feed/subscriptions"],
      ["History", "/feed/history"],
    ],
  },
  {
    appName: "github",
    label: "GitHub",
    l0: ["gh", "git"],
    url: "https://github.com",
    paths: [
      ["Pull Requests", "/pulls"],
      ["Issues", "/issues"],
      ["Notifications", "/notifications"],
      ["Explore", "/explore"],
    ],
  },
  {
    appName: "linkedin",
    label: "LinkedIn",
    l0: ["ln", "li"],
    url: "https://www.linkedin.com",
    paths: [
      ["Profile", "/in/"],
      ["My Network", "/mynetwork"],
      ["Jobs", "/jobs"],
      ["Messaging", "/messaging"],
      ["Settings", "/mypreferences"],
    ],
  },
  {
    appName: "x",
    label: "X",
    l0: ["x"],
    url: "https://x.com",
    paths: [
      ["Grok", "/i/grok"],
      ["Explore", "/explore"],
      ["Notifications", "/notifications"],
      ["Messages", "/messages"],
      ["Settings", "/settings/account"],
    ],
  },
  {
    appName: "facebook",
    label: "Facebook",
    l0: ["fb"],
    url: "https://www.facebook.com",
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
    paths: [
      ["Wallet", "/wallet"],
      ["Recharge & Bill Payments", "/recharge"],
    ],
  },
  {
    appName: "zomato",
    label: "Zomato",
    l0: ["zo"],
    url: "https://www.zomato.com",
    paths: [
      ["Order Food", "/order"],
      ["Dining Out", "/dine-out"],
    ],
  },
  {
    appName: "tiktok",
    label: "TikTok",
    l0: ["tt"],
    url: "https://www.tiktok.com",
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

export const GLOBALS = [
  ["Chrome extensions", "chrome://extensions"],
  ["Chrome settings", "chrome://settings"],
  ["Chrome bookmarks", "chrome://bookmarks"],
  ["Chrome history", "chrome://history"],
  ["Chrome downloads", "chrome://downloads"],
  ["New Google Doc", "https://doc.new"],
  ["New Google Sheet", "https://sheet.new"],
  ["New Google Slide", "https://slide.new"],
  ["New Google Form", "https://form.new"],
  ["New video call with Google Meet", "https://meet.new"],
  ["New Google Calendar event", "https://cal.new"],
  ["New Google Keep note", "https://keep.new"],
  ["New Google Site", "https://site.new"],
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
  ["New GitHub repository", "https://repo.new"],
  ["New GitHub gist", "https://gist.new"],
  ["New Medium story", "https://story.new"],
  ["New Canva design", "https://design.new"],
  ["New Bitly link", "https://link.new"],
  ["New PDF from JPG", "https://jpgtopdf.new"],
  ["Registry of .new shortcuts", "https://whats.new"],
  ["New SQL query", "https://sql.new"],
  ["New Visual Studio codespace", "https://vso.new"],
  ["New Notion page", "https://notion.new"],
  ["Generate a UUID", "https://uuid.new"],
  ["New GitLab project", "https://gitlab.new"],
  ["New Python sandbox on CoderPad", "https://python.new"],
  ["New CoderPad interview", "https://pad.new"],
  ["Generate a strong password", "https://password.new"],
  ["Startup jobs", "https://job.new"],
  ["Google Drive", "https://drive.google.com"],
  ["Google Docs", "https://docs.google.com"],
  ["Google Sheets", "https://sheets.google.com"],
  ["Google Slides", "https://slides.google.com"],
  ["Google Calendar", "https://calendar.google.com"],
  ["Google Meet", "https://meet.google.com"],
  ["Google Keep", "https://keep.google.com"],
  ["Gmail", "https://mail.google.com"],
].map(([title, url]) => ({
  id: `global:${url}`,
  title,
  url,
}));

// Web app groups, with imported links (e.g. scraped playlists) added to their app's group
export const getWebappGroups = (urlList = []) =>
  WEBAPP_GROUPS.map((group) => {
    const imported = urlList
      .filter((link) => link.appName === group.appName)
      .map((link) => ({ ...link, id: `imported:${link.url}` }));
    return imported.length
      ? { ...group, children: [...group.children, ...imported] }
      : group;
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
