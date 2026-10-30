import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { ScrollArea, TextInput } from "@mantine/core";
import { CaretDownIcon, CaretRightIcon } from "@phosphor-icons/react";
import { useShallow } from "zustand/react/shallow";
import useSwitchStore from "../store";
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

const ENTER_LABELS = {
  group: "expand",
  more: "show",
  command: "run",
  chrome: "run",
  task: "run",
  keybinding: "copy keys",
};

const RowEnd = ({ row, selected }) => {
  if (row.type === "group") {
    const Caret = row.expanded ? CaretDownIcon : CaretRightIcon;
    return <Caret size={14} className="text-sw-faint" />;
  }
  return (
    <Keys keys={row.keys} accent={selected && row.type === "keybinding"} />
  );
};

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
    useShallow(({ urlList, tabs, currentTab, keybindings, commandKeys }) => ({
      urlList,
      tabs,
      currentTab,
      keybindings,
      commandKeys,
    })),
  );
  const [query, setQuery] = useState("");
  const [expandedGroupId, setExpandedGroupId] = useState(null);
  const [shownSections, setShownSections] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const rowRefs = useRef([]);

  const { sections, rows, tokens } = useMemo(
    () =>
      buildSearchResults({ ...data, query, expandedGroupId, shownSections }),
    [data, query, expandedGroupId, shownSections],
  );
  const selected = rows[Math.min(selectedIdx, rows.length - 1)];
  const select = (idx) =>
    setSelectedIdx(Math.max(0, Math.min(idx, rows.length - 1)));

  useEffect(() => {
    rowRefs.current[selectedIdx]?.scrollIntoView({ block: "nearest" });
  }, [selectedIdx]);

  const activate = (row) => {
    switch (row.type) {
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
        return openInCurrentTab(row.url, onClose);
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
    Escape: () => {
      if (!query) return onClose?.();
      setQuery("");
      select(0);
    },
  };

  let rowIdx = -1;

  return (
    <View keymap={keymap} autoFocus={false}>
      <HomeHeader view="search" active onClose={onClose}>
        <TextInput
          className="flex-1"
          variant="unstyled"
          classNames={{
            input: "text-[17px]! text-sw-text! placeholder:text-sw-faint",
          }}
          placeholder="Search across websites, shortcuts & tabs"
          value={query}
          onChange={(event) => {
            setQuery(event.currentTarget.value);
            select(0);
          }}
          data-autofocus
          autoFocus
          spellCheck={false}
          aria-label="Search"
        />
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
                    title={<Highlight text={row.title} tokens={tokens} />}
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
              No matches for “{query.trim()}”. Press ↵ to search Google.
            </div>
          )}
        </div>
      </ScrollArea>

      <PanelFooter
        hints={[
          [["↑", "↓"], "select"],
          [["↵"], ENTER_LABELS[selected?.type] || "open"],
          [["Tab"], "shortcuts"],
        ]}
      />
    </View>
  );
}
