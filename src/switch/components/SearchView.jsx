import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { ScrollArea, TextInput } from "@mantine/core";
import {
  CaretDownIcon,
  CaretRightIcon,
  GlobeIcon,
  StarIcon,
  XIcon,
} from "@phosphor-icons/react";
import { useShallow } from "zustand/react/shallow";
import clamp from "lodash/clamp";
import useSwitchStore from "../store";
import { findWebapp } from "../catalog";
import { buildSearchResults } from "../search";
import { googleSearchUrl } from "../../utils/url";
import {
  copyText,
  openInCurrentTab,
  openLink,
  runChromeAction,
  runCommand,
  runTask,
  switchToTab,
} from "../actions";
import {
  HomeHeader,
  Highlight,
  Keys,
  PanelFooter,
  Row,
  SectionTitle,
  View,
} from "./common";
import SectionFilter from "./SectionFilter";

const ENTER_LABELS = {
  group: "expand",
  more: "show",
  command: "run",
  chrome: "run",
  task: "run",
  keybinding: "copy keys",
};

// Stars a link; shown on hover or selection, and always once starred
const FavoriteButton = ({ row }) => {
  const toggleFavorite = useSwitchStore((state) => state.toggleFavorite);
  const label = row.favorite ? "Remove from favorites" : "Add to favorites";

  return (
    <button
      type="button"
      className="sw-row-star"
      data-on={row.favorite || undefined}
      aria-label={label}
      title={label}
      // Keeps keyboard focus in the search box
      onMouseDown={(event) => event.preventDefault()}
      onClick={(event) => {
        event.stopPropagation();
        toggleFavorite(row.linkId);
      }}
    >
      <StarIcon size={15} weight={row.favorite ? "fill" : "regular"} />
    </button>
  );
};

const RowEnd = ({ row, selected }) => {
  if (row.type === "group") {
    const Caret = row.expanded ? CaretDownIcon : CaretRightIcon;
    return <Caret size={14} className="text-sw-faint" />;
  }
  return (
    <>
      {row.linkId && <FavoriteButton row={row} />}
      <Keys keys={row.keys} accent={selected && row.type === "keybinding"} />
    </>
  );
};

// The web app the search is scoped to; × or Backspace in the empty box leaves it
const ScopeChip = ({ app, onClear }) => (
  <span className="sw-scope-chip">
    <GlobeIcon size={14} />
    {app.label}
    <button
      type="button"
      className="sw-scope-clear"
      aria-label={`Leave ${app.label}`}
      title={`Leave ${app.label}`}
      // Keeps keyboard focus in the search box
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClear}
    >
      <XIcon size={11} weight="bold" />
    </button>
  </span>
);

const RowSubtitle = ({ row }) =>
  row.tag ? (
    <span className="flex items-center gap-2">
      <span
        className={`shrink-0 rounded px-1.5 py-px text-[10px] font-semibold tracking-wider uppercase ${
          /^(quick ?)?switch$/i.test(row.tag)
            ? "bg-sw-selected text-sw-accent-soft"
            : "bg-sw-key text-sw-muted"
        }`}
      >
        {row.tag}
      </span>
      <span className="truncate">{row.subtitle}</span>
    </span>
  ) : (
    row.subtitle
  );

export default function SearchView({ onClose }) {
  const setView = useSwitchStore((state) => state.setView);
  const data = useSwitchStore(
    useShallow(
      ({
        urlList,
        usage,
        favorites,
        sectionVisibility,
        tabs,
        bookmarkFolders,
        currentTab,
        keybindings,
        commandKeys,
      }) => ({
        urlList,
        usage,
        favorites,
        sectionVisibility,
        tabs,
        bookmarkFolders,
        currentTab,
        keybindings,
        commandKeys,
      }),
    ),
  );
  const [query, setQuery] = useState("");
  // The web app the search is limited to ("yt." -> YouTube)
  const [scope, setScope] = useState(null);
  const [expandedGroupId, setExpandedGroupId] = useState(null);
  const [shownSections, setShownSections] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const rowRefs = useRef([]);
  const inputRef = useRef(null);

  const { sections, rows, tokens } = useMemo(
    () =>
      buildSearchResults({
        ...data,
        query,
        scope,
        expandedGroupId,
        shownSections,
      }),
    [data, query, scope, expandedGroupId, shownSections],
  );
  const selected = rows[Math.min(selectedIdx, rows.length - 1)];
  const select = (idx) => setSelectedIdx(clamp(idx, 0, rows.length - 1));

  useEffect(() => {
    rowRefs.current[selectedIdx]?.scrollIntoView({ block: "nearest" });
  }, [selectedIdx]);

  // "yt." scopes the search to YouTube, keeping anything typed after the dot
  const changeQuery = (value) => {
    const [, alias, rest = ""] =
      (!scope && value.match(/^\s*([^\s.]+)\.(.*)$/)) || [];
    const app = findWebapp(alias);
    if (app) setScope(app);
    setQuery(app ? rest.trimStart() : value);
    select(0);
  };

  const enterScope = (app) => {
    setScope(app);
    setQuery("");
    select(0);
    inputRef.current?.focus();
  };

  const leaveScope = () => {
    setScope(null);
    select(0);
    inputRef.current?.focus();
  };

  const activate = (row) => {
    switch (row.type) {
      case "scope":
        return enterScope(row.app);
      case "group":
        return setExpandedGroupId(row.expanded ? null : row.groupId);
      case "more":
        return setShownSections((ids) => [...ids, row.sectionId]);
      case "command":
        return runCommand(row.commandId, onClose);
      case "chrome":
        return runChromeAction(row.actionId, onClose);
      case "keybinding":
        return copyText(row.keybinding.combo);
      case "link":
        return openInCurrentTab(row, onClose);
      case "tab":
        return switchToTab(row.tab, onClose);
      case "task":
        return runTask(row.taskId);
      default:
        return undefined;
    }
  };

  const keymap = {
    ArrowDown: () => select(selectedIdx + 1),
    ArrowUp: () => select(selectedIdx - 1),
    Enter: () => {
      if (selected) activate(selected);
      else if (query.trim()) openLink(googleSearchUrl(query), onClose);
    },
    Tab: () => setView("shortcuts"),
    ArrowRight: () => {
      if (selected?.type !== "group" || selected.expanded) return false;
      setExpandedGroupId(selected.groupId);
    },
    // Collapse the open group, from its header or any of its destinations
    ArrowLeft: () => {
      if (
        !selected?.groupId ||
        (selected.type === "group" && !selected.expanded)
      ) {
        return false;
      }
      setExpandedGroupId(null);
      select(rows.findIndex((row) => row.key === selected.groupId));
    },
    // Backspace in the empty box leaves the web app the search is scoped to
    Backspace: () => {
      if (!scope || query) return false;
      leaveScope();
    },
    // Clears the query, then the scope, then closes
    Escape: () => {
      if (query) {
        setQuery("");
        return select(0);
      }
      if (scope) return leaveScope();
      onClose?.();
    },
  };

  // An alias swaps the arrows hint for "."; inside a web app, Backspace leaves it
  const suggested = !scope && findWebapp(query);
  const hints = [
    suggested
      ? [["."], `search in ${suggested.label}`]
      : [["↑", "↓"], "select"],
    [["↵"], ENTER_LABELS[selected?.type] || "open"],
    scope ? [["⌫"], `leave ${scope.label}`] : [["Tab"], "shortcuts"],
  ];

  let rowIdx = -1;

  return (
    <View keymap={keymap} autoFocus={false}>
      <HomeHeader view="search" active onClose={onClose}>
        {scope && <ScopeChip app={scope} onClear={leaveScope} />}
        <TextInput
          ref={inputRef}
          className="flex-1"
          variant="unstyled"
          classNames={{
            input: "text-[17px]! text-sw-text! placeholder:text-sw-faint",
          }}
          placeholder={
            scope
              ? `Search ${scope.label}`
              : "Search sites, shortcuts, tabs & bookmarks"
          }
          value={query}
          onChange={(event) => changeQuery(event.currentTarget.value)}
          data-autofocus
          autoFocus
          spellCheck={false}
          aria-label="Search"
        />
        {scope ? (
          query.trim() && (
            <span className="shrink-0 font-sw-mono text-[11.5px] text-sw-faint">
              {rows.length} in {scope.label}
            </span>
          )
        ) : (
          <SectionFilter onClose={() => inputRef.current?.focus()} />
        )}
      </HomeHeader>

      <ScrollArea className="min-h-0 flex-1" type="hover" scrollbarSize={6}>
        <div className="pb-2" role="listbox">
          {sections.map((section) => (
            <Fragment key={section.id}>
              <SectionTitle title={section.title} count={section.count} />
              {section.rows.map((row) => {
                const idx = ++rowIdx;
                return (
                  <Row
                    key={row.key}
                    ref={(node) => {
                      rowRefs.current[idx] = node;
                    }}
                    number={row.number}
                    child={row.child}
                    nested={row.nested}
                    title={
                      <Highlight
                        text={row.title}
                        tokens={row.highlight || tokens}
                      />
                    }
                    subtitle={<RowSubtitle row={row} />}
                    selected={row === selected}
                    right={<RowEnd row={row} selected={row === selected} />}
                    onClick={() => {
                      select(idx);
                      activate(row);
                    }}
                  />
                );
              })}
            </Fragment>
          ))}
          {!rows.length && (
            <div className="px-6 py-10 text-center text-[14px] text-sw-muted">
              {query.trim()
                ? `No matches for “${query.trim()}”. Press ↵ to search Google.`
                : "Nothing to show. Turn sections back on from the filter."}
            </div>
          )}
        </div>
      </ScrollArea>

      <PanelFooter hints={hints} />
    </View>
  );
}
