// Builds the Search view's sections. Idle, web apps are collapsible groups; with a
// query every section is filtered and groups flatten to "YouTube › Watch Later".
// Scoped to a web app ("yt."), only that app's results show.
// Links are ordered most recently used first, groups by their latest use.
import {
  CHROME_ACTIONS,
  CHROME_PAGES,
  CHROME_SHORTCUTS,
  COMMANDS,
  GLOBALS,
  TASKS,
  findWebapp,
  getWebappGroups,
  siteSearchUrl,
} from "./catalog";
import { matchesAll, pluralize, tokenize } from "../utils/text";
import { displayUrl, isUrlMatch } from "../utils/url";

// The Search view's sections, in the order the results and the filter list them.
// `visible` is whether a section shows until it's toggled; `filterable: false`
// sections aren't in the filter and always show. `when` limits a section to idle
// ("idle") or to a query ("search"). Soon sources are listed in the filter but
// can't be turned on yet.
export const SECTIONS = [
  {
    id: "recent",
    label: "Recently used",
    visible: true,
    filterable: false,
    when: "idle",
  },
  {
    id: "favorites",
    label: "Favorites",
    visible: true,
    filterable: false,
    when: "idle",
  },
  {
    id: "keybindings",
    label: "Shortcuts",
    visible: true,
    filterable: false,
    when: "search",
  },
  { id: "commands", label: "Commands", visible: true, filterable: true },
  { id: "navigation", label: "Navigation", visible: true, filterable: true },
  { id: "global", label: "Global", visible: true, filterable: true },
  { id: "chrome", label: "Chrome", visible: true, filterable: true },
  { id: "tabs", label: "Open tabs", visible: true, filterable: true },
  { id: "tasks", label: "Tasks", visible: true, filterable: true },
  // { id: "bookmarks", label: "Bookmarks", visible: false, filterable: true, soon: true },
];

// A filterable section's saved choice, else its default
export const isSectionVisible = (id, sectionVisibility = {}) => {
  const section = SECTIONS.find((s) => s.id === id);
  if (!section) return false;
  if (section.soon) return false;
  if (!section.filterable) return section.visible;
  return sectionVisibility[id] ?? section.visible;
};

const IDLE_SECTION_LIMIT = 5;
const RECENT_LIMIT = 5;
const KEYBINDINGS_LIMIT = 6;

// Navigation rows show the short URL ("youtube.com/feed/history"); Global and
// Chrome rows show it in full, since they're .new and chrome:// links. A link's
// `tag` (like "playlist") is shown before its URL.
const linkRow = (link, title = link.title, shortUrl = false) => ({
  key: link.id,
  linkId: link.id,
  type: "link",
  title,
  subtitle: shortUrl ? displayUrl(link.url) : link.url,
  tag: link.tag,
  keys: link.keys,
  url: link.url,
});

const keybindingRow = (keybinding, tag = keybinding.group) => ({
  key: keybinding.id,
  type: "keybinding",
  title: keybinding.title,
  subtitle: keybinding.description,
  tag,
  keys: keybinding.keys,
  keybinding,
});

const taskRow = (task, title = task.title) => ({
  key: `task:${task.id}`,
  type: "task",
  title,
  subtitle: task.description,
  tag: "task",
  taskId: task.id,
});

const tabRow = (tab) => ({
  key: `tab:${tab.id}`,
  type: "tab",
  title: tab.title || displayUrl(tab.url),
  subtitle: displayUrl(tab.url),
  tab,
});

// Typing an alias on its own ("yt") offers to search inside its web app, which
// picking the row or typing "." does
const scopeRow = (app, alias) => ({
  key: `scope:${app.appName}`,
  type: "scope",
  title: `Search in ${app.label}`,
  subtitle: `Alias ${alias} · type . to look only inside ${app.label}`,
  highlight: [app.label],
  keys: ["."],
  app,
});

// "YouTube › Playlists › Lo-fi"
const destinationTitle = (group, child) =>
  [group.label, child.nested && child.l1Label, child.title]
    .filter(Boolean)
    .join(" › ");

// Most recently used first. Never-used items have time 0, so they keep their
// catalog order (sort is stable).
const byRecency = (items, time) => [...items].sort((a, b) => time(b) - time(a));

// A group's destinations by recency, each still followed by its imported links
// (also by recency); a group's time is its latest use of any of them
const orderGroups = (groups, linkTime) => {
  const blockTime = ({ child, nested }) =>
    Math.max(linkTime(child), ...nested.map(linkTime));

  const ordered = groups.map((group) => {
    const blocks = [];
    group.children.forEach((child) => {
      if (child.nested && blocks.length) blocks.at(-1).nested.push(child);
      else blocks.push({ child, nested: [] });
    });
    const sorted = byRecency(blocks, blockTime);
    return {
      ...group,
      time: Math.max(0, ...sorted.map(blockTime)),
      children: sorted.flatMap(({ child, nested }) => [
        child,
        ...byRecency(nested, linkTime),
      ]),
    };
  });
  return byRecency(ordered, (group) => group.time);
};

// A group lists its app's tasks after its destinations
const navigationRows = (tokens, groups, expandedGroupId) =>
  groups.flatMap((group) => {
    const tasks = TASKS.filter((task) => task.appName === group.appName);

    if (tokens.length) {
      const links = group.children
        .filter((child) =>
          matchesAll(
            tokens,
            group.label,
            ...group.l0,
            ...(child.l1 || []),
            child.l1Label,
            child.title,
            displayUrl(child.url),
          ),
        )
        .map((child) => linkRow(child, destinationTitle(group, child), true));
      const taskRows = tasks
        .filter((task) =>
          matchesAll(
            tokens,
            group.label,
            ...group.l0,
            task.title,
            task.description,
          ),
        )
        .map((task) => taskRow(task, `${group.label} › ${task.title}`));
      return [...links, ...taskRows];
    }

    const expanded = group.id === expandedGroupId;
    // Names the aliases that scope the search to the app ("yt.")
    const parent = {
      key: group.id,
      type: "group",
      title: group.label,
      subtitle: `${displayUrl(group.url)} · alias ${group.l0.join(", ")} · ${pluralize(group.children.length, "destination")}`,
      groupId: group.id,
      expanded,
    };
    // Every imported link is listed, indented under its destination
    const children = expanded
      ? [
          ...group.children.map((child) => ({
            ...linkRow(child, child.title, true),
            nested: child.nested,
          })),
          ...tasks.map((task) => taskRow(task)),
        ].map((row) => ({ ...row, child: true, groupId: group.id }))
      : [];
    return [parent, ...children];
  });

// Chrome's actions, then its pages, then keys for what only Chrome can do. Every
// row matches "chrome"; a toggle is titled for the tab Switch was opened on.
const chromeRows = (tokens, currentTab, linkTime) => {
  const matches = (...fields) => matchesAll(tokens, "Chrome", ...fields);
  const actions = CHROME_ACTIONS.map((action) => ({
    ...action,
    title:
      typeof action.title === "function"
        ? action.title(currentTab)
        : action.title,
  }))
    .filter((action) => matches(action.title, action.description))
    .map((action) => ({
      key: `chrome-action:${action.id}`,
      type: "chrome",
      title: action.title,
      subtitle: action.description,
      keys: action.keys,
      actionId: action.id,
    }));
  const pages = byRecency(CHROME_PAGES, linkTime)
    .filter((page) => matches(page.title, page.url))
    .map((page) => linkRow(page));
  const shortcuts = CHROME_SHORTCUTS.filter((shortcut) =>
    matches(shortcut.title, shortcut.description),
  ).map((shortcut) => keybindingRow(shortcut, "shortcut"));

  return [...actions, ...pages, ...shortcuts];
};

// Searching inside one web app, in the full search's order: its destinations,
// imported links under their destination's name ("Playlists"), open tabs and
// tasks, then a search on the app itself
const scopedSections = ({
  app,
  group,
  query,
  tokens,
  tabs,
  currentTab,
  linkTime,
}) => {
  const linkRows = (links) =>
    links
      .filter((link) =>
        matchesAll(
          tokens,
          link.title,
          link.l1Label,
          ...(link.l1 || []),
          displayUrl(link.url),
        ),
      )
      .map((link) => linkRow(link, link.title, true));

  const own = new Set(app.children.map(({ id }) => id));
  const links = byRecency(group.children, linkTime);
  const destinations = links.filter(({ id }) => own.has(id));
  const imported = links.filter(({ id }) => !own.has(id));
  const importedSections = [
    ...new Set(imported.map(({ l1Label }) => l1Label)),
  ].map((label) => ({
    id: `imported:${label}`,
    title: label || "Imported",
    rows: linkRows(imported.filter(({ l1Label }) => l1Label === label)),
  }));

  const tabRows = tabs
    .filter((tab) => tab.id !== currentTab?.id && isUrlMatch(tab.url, app.url))
    .filter((tab) => matchesAll(tokens, tab.title, tab.url))
    .map(tabRow);
  const taskRows = TASKS.filter((task) => task.appName === app.appName)
    .filter((task) => matchesAll(tokens, task.title, task.description))
    .map((task) => taskRow(task));

  const term = query.trim();
  const searchUrl = siteSearchUrl(app, term);
  const searchRows = term
    ? [
        {
          key: `search:${app.appName}`,
          type: "link",
          title: `Search ${app.label} for “${term}”`,
          subtitle: displayUrl(searchUrl),
          url: searchUrl,
        },
      ]
    : [];

  return [
    { id: "destinations", title: "Destinations", rows: linkRows(destinations) },
    ...importedSections,
    { id: "tabs", title: "Open tabs", rows: tabRows },
    { id: "tasks", title: "Tasks", rows: taskRows },
    { id: "search", title: "Search", rows: searchRows },
  ]
    .filter((s) => s.rows.length)
    .map((s) => ({ ...s, count: s.rows.length }));
};

// Numbers top-level rows like the design (group children and "more" rows
// aren't), marks starred links, and lists the rows arrow keys move through
const withRows = (sections, tokens, favorites) => {
  let number = 0;
  sections.forEach(({ rows }) =>
    rows.forEach((row) => {
      if (!row.child && row.type !== "more") row.number = ++number;
      if (row.linkId) row.favorite = favorites.includes(row.linkId);
    }),
  );

  return { sections, rows: sections.flatMap((s) => s.rows), tokens };
};

// Idle, a long section lists its first rows and a "Show N more" row until that
// row is picked
const limitRows = (sectionId, rows, searching, shownSections) => {
  if (
    searching ||
    shownSections.includes(sectionId) ||
    rows.length <= IDLE_SECTION_LIMIT
  ) {
    return rows;
  }
  return [
    ...rows.slice(0, IDLE_SECTION_LIMIT),
    {
      key: `more:${sectionId}`,
      type: "more",
      title: `Show ${rows.length - IDLE_SECTION_LIMIT} more`,
      sectionId,
    },
  ];
};

// Returns the visible sections plus the flat list of rows arrow keys move through.
// `scope` is the web app the search is limited to, if any.
export const buildSearchResults = ({
  query,
  scope,
  urlList,
  tabs,
  currentTab,
  keybindings,
  commandKeys,
  expandedGroupId,
  shownSections,
  usage,
  favorites,
  sectionVisibility = {},
}) => {
  const tokens = tokenize(query);
  const searching = tokens.length > 0;
  const linkTime = (link) => usage[link.id]?.lastUsed || 0;
  const groups = orderGroups(getWebappGroups(urlList), linkTime);

  if (scope) {
    const group = groups.find(({ appName }) => appName === scope.appName);
    const sections = scopedSections({
      app: scope,
      group,
      query,
      tokens,
      tabs,
      currentTab,
      linkTime,
    });
    return withRows(sections, tokens, favorites);
  }

  const navigation = navigationRows(tokens, groups, expandedGroupId);

  // Every link a recent or favorite id can point to, titled in full
  const links = new Map([
    ...groups.flatMap((group) =>
      group.children.map((child) => [
        child.id,
        linkRow(child, destinationTitle(group, child), true),
      ]),
    ),
    ...[...GLOBALS, ...CHROME_PAGES].map((link) => [link.id, linkRow(link)]),
  ]);
  const linkRows = (ids, section) =>
    ids
      .filter((id) => links.has(id))
      .map((id) => ({ ...links.get(id), key: `${section}:${id}` }));
  const recent = linkRows(
    byRecency(Object.keys(usage), (id) => usage[id].lastUsed),
    "recent",
  ).slice(0, RECENT_LIMIT);
  const favoriteRows = linkRows(
    byRecency(favorites, (id) => usage[id]?.lastUsed || 0),
    "favorite",
  );

  const commands = COMMANDS.filter((c) =>
    matchesAll(tokens, c.title, c.description),
  ).map((c) => ({
    key: `command:${c.id}`,
    type: "command",
    title: c.title,
    subtitle: c.description,
    keys: commandKeys[c.id],
    commandId: c.id,
  }));

  // Cards for a Chrome shortcut the Chrome section already lists are left out
  const keybindingRows = keybindings
    .filter((k) => !CHROME_SHORTCUTS.some(({ id }) => id === k.id))
    .filter((k) => matchesAll(tokens, k.title, k.description, k.group))
    .slice(0, KEYBINDINGS_LIMIT)
    .map((keybinding) => keybindingRow(keybinding));

  // The tab Switch was opened on is left out; switching to it does nothing
  const tabRows = tabs
    .filter((tab) => tab.id !== currentTab?.id)
    .filter((tab) => matchesAll(tokens, tab.title, tab.url))
    .map(tabRow);

  // App tasks sit in their web app group. Resetting imported links only makes
  // sense once there are some.
  const taskRows = TASKS.filter(
    (t) => !t.appName && (t.id !== "reset-imported-links" || urlList.length),
  )
    .filter((t) => matchesAll(tokens, t.title, t.description))
    .map((t) => taskRow(t));

  // Counted in full, though idle they show only their first rows
  const limited = (id, rows) => ({
    rows: limitRows(id, rows, searching, shownSections),
    count: rows.length,
  });
  const content = {
    recent: { rows: recent },
    favorites: { rows: favoriteRows },
    keybindings: { rows: keybindingRows },
    commands: { rows: commands },
    navigation: {
      rows: navigation,
      count: searching ? undefined : groups.length,
    },
    global: limited(
      "global",
      byRecency(GLOBALS, linkTime)
        .filter((link) => matchesAll(tokens, link.title, link.url))
        .map((link) => linkRow(link)),
    ),
    chrome: limited("chrome", chromeRows(tokens, currentTab, linkTime)),
    tabs: { rows: tabRows },
    tasks: { rows: taskRows },
  };
  // Idle leads with recent and starred links, a query with shortcuts;
  // then what Switch can do
  const sections = SECTIONS.filter(
    ({ id, when }) =>
      content[id] &&
      (!when || when === (searching ? "search" : "idle")) &&
      isSectionVisible(id, sectionVisibility),
  )
    .map(({ id, label }) => ({ id, title: label, ...content[id] }))
    .filter((s) => s.rows.length)
    .map((s) => ({ ...s, count: s.count ?? s.rows.length }));

  // An alias on its own leads with searching inside its web app
  const alias = query.trim().toLowerCase();
  const app = findWebapp(alias);
  const suggestion = app
    ? [
        {
          id: "scope",
          title: "Search in",
          count: 1,
          rows: [scopeRow(app, alias)],
        },
      ]
    : [];

  return withRows([...suggestion, ...sections], tokens, favorites);
};
