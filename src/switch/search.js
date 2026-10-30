// Builds the Search view's sections. Idle, web apps are collapsible groups; with a
// query every section is filtered and groups flatten to "YouTube › Watch Later".
import { COMMANDS, GLOBALS, TASKS, getWebappGroups } from "./catalog";
import { matchesAll, pluralize, tokenize } from "../utils/text";
import { displayUrl } from "../utils/url";

const IDLE_GLOBALS_LIMIT = 5;
const KEYBINDINGS_LIMIT = 6;

// Navigation rows show the short URL ("youtube.com/feed/history"); Global rows
// show it in full, since many are chrome:// or .new links
const linkRow = (link, title = link.title, shortUrl = false) => ({
  key: link.id,
  type: "link",
  title,
  subtitle: shortUrl ? displayUrl(link.url) : link.url,
  url: link.url,
});

const taskRow = (task, title = task.title) => ({
  key: `task:${task.id}`,
  type: "task",
  title,
  subtitle: task.description,
  taskId: task.id,
});

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
        .map((child) =>
          linkRow(child, `${group.label} › ${child.title}`, true),
        );
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
    const parent = {
      key: group.id,
      type: "group",
      title: group.label,
      subtitle: `${displayUrl(group.url)} · ${pluralize(group.children.length, "destination")}`,
      groupId: group.id,
      expanded,
    };
    const children = expanded
      ? [
          ...group.children.map((child) => linkRow(child, child.title, true)),
          ...tasks.map((task) => taskRow(task)),
        ].map((row) => ({ ...row, child: true, groupId: group.id }))
      : [];
    return [parent, ...children];
  });

const globalRows = (tokens, showAll) => {
  const rows = GLOBALS.filter((link) =>
    matchesAll(tokens, link.title, link.url),
  ).map((link) => linkRow(link));
  if (tokens.length || showAll || rows.length <= IDLE_GLOBALS_LIMIT)
    return rows;

  return [
    ...rows.slice(0, IDLE_GLOBALS_LIMIT),
    {
      key: "more:global",
      type: "more",
      title: `Show ${rows.length - IDLE_GLOBALS_LIMIT} more`,
    },
  ];
};

// Returns the visible sections plus the flat list of rows arrow keys move through.
// Top-level rows are numbered like the design; group children and "more" rows aren't.
export const buildSearchResults = ({
  query,
  urlList,
  tabs,
  currentTab,
  keybindings,
  commandKeys,
  expandedGroupId,
  showAllGlobals,
}) => {
  const tokens = tokenize(query);
  const searching = tokens.length > 0;
  const groups = getWebappGroups(urlList);
  const navigation = navigationRows(tokens, groups, expandedGroupId);

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

  const keybindingRows = keybindings
    .filter((k) => matchesAll(tokens, k.title, k.description))
    .slice(0, KEYBINDINGS_LIMIT)
    .map((keybinding) => ({
      key: keybinding.id,
      type: "keybinding",
      title: keybinding.title,
      subtitle: keybinding.description,
      tag: keybinding.group,
      keys: keybinding.keys,
      keybinding,
    }));

  // The tab Switch was opened on is left out; switching to it does nothing
  const tabRows = tabs
    .filter((tab) => tab.id !== currentTab?.id)
    .filter((tab) => matchesAll(tokens, tab.title, tab.url))
    .map((tab) => ({
      key: `tab:${tab.id}`,
      type: "tab",
      title: tab.title || displayUrl(tab.url),
      subtitle: displayUrl(tab.url),
      tab,
    }));

  // App tasks sit in their web app group. Resetting imported links only makes
  // sense once there are some.
  const taskRows = TASKS.filter(
    (t) => !t.appName && (t.id !== "reset-imported-links" || urlList.length),
  )
    .filter((t) => matchesAll(tokens, t.title, t.description))
    .map((t) => taskRow(t));

  const global = [
    "global",
    "Global",
    globalRows(tokens, showAllGlobals),
    searching ? null : GLOBALS.length,
  ];
  const openTabs = ["tabs", "Open tabs", tabRows];
  // Idle lists what Switch can do; a query leads with the closest matches
  const sections = [
    searching && ["keybindings", "Keyboard shortcuts", keybindingRows],
    ["commands", "Commands", commands],
    ["navigation", "Navigation", navigation, searching ? null : groups.length],
    ...(searching ? [openTabs, global] : [global, openTabs]),
    ["tasks", "Tasks", taskRows],
  ]
    .filter((s) => s && s[2].length)
    .map(([id, title, rows, count]) => ({
      id,
      title,
      rows,
      count: count ?? rows.length,
    }));

  let number = 0;
  sections.forEach(({ rows }) =>
    rows.forEach((row) => {
      if (!row.child && row.type !== "more") row.number = ++number;
    }),
  );

  return { sections, rows: sections.flatMap((s) => s.rows), tokens };
};
