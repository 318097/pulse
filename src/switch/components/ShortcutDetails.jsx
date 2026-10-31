import { useEffect, useState } from "react";
import { Button, Group, Popover, ScrollArea, Text } from "@mantine/core";
import clamp from "lodash/clamp";
import useSwitchStore from "../store";
import { openLink, switchToTab } from "../actions";
import { displayUrl } from "../../utils/url";
import { getMatchedTabs, sortByLastAccessed } from "../../utils/tabs";
import {
  KeyTile,
  Keycap,
  PanelFooter,
  Row,
  SectionTitle,
  Star,
  SubviewHeader,
  View,
} from "./common";

const DeleteButton = ({ name, onDelete }) => {
  const [opened, setOpened] = useState(false);

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      position="bottom-end"
      withArrow
      trapFocus
      shadow="md"
      classNames={{ dropdown: "sw-popover", arrow: "sw-popover" }}
    >
      <Popover.Target>
        <Button
          className="sw-button"
          data-danger
          radius="md"
          onClick={() => setOpened((prev) => !prev)}
        >
          Delete
        </Button>
      </Popover.Target>
      <Popover.Dropdown>
        <Text size="sm" mb="sm">
          Delete ‘{name}’?
        </Text>
        <Group gap="xs" justify="flex-end">
          <Button
            className="sw-button"
            size="xs"
            radius="md"
            onClick={() => setOpened(false)}
          >
            No
          </Button>
          <Button
            color="red"
            size="xs"
            radius="md"
            onClick={onDelete}
            data-autofocus
          >
            Yes, delete
          </Button>
        </Group>
      </Popover.Dropdown>
    </Popover>
  );
};

// Only when the view itself has focus, so Enter on a focused button still clicks it
const onView = (handler) => (event) =>
  event.target === event.currentTarget ? handler() : false;

export default function ShortcutDetails({ onClose }) {
  const { shortcuts, tabs, currentTab, params, setView, deleteShortcut } =
    useSwitchStore();
  const shortcut = shortcuts.find(({ _id }) => _id === params.id);
  const matchedTabs = sortByLastAccessed(getMatchedTabs(tabs, shortcut?.url));
  const [selectedIdx, setSelectedIdx] = useState(0);

  // The shortcut was deleted (here or in another window)
  useEffect(() => {
    if (!shortcut) setView("shortcuts");
  }, [shortcut, setView]);
  if (!shortcut) return null;

  const goBack = () => setView("shortcuts");
  const edit = () => setView("edit", { id: shortcut._id });
  const open = (tab) =>
    tab ? switchToTab(tab, onClose) : openLink(shortcut.url, onClose);
  const remove = () => {
    deleteShortcut(shortcut._id);
    goBack();
  };

  const select = (idx) => setSelectedIdx(clamp(idx, 0, matchedTabs.length - 1));

  const keymap = {
    Escape: goBack,
    ArrowDown: onView(() => select(selectedIdx + 1)),
    ArrowUp: onView(() => select(selectedIdx - 1)),
    Enter: onView(() => open(matchedTabs[selectedIdx])),
    e: onView(edit),
    E: onView(edit),
  };

  return (
    <View keymap={keymap}>
      <SubviewHeader title="Shortcut" onBack={goBack} onClose={onClose} />

      <div className="flex items-center gap-4 border-b border-sw-divider px-5 py-4">
        <KeyTile className="size-16 p-2.5 text-[22px] leading-none">
          {shortcut.hotkey}
        </KeyTile>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[22px] font-semibold">
            <span className="truncate">{shortcut.name}</span>
            {shortcut.favorite && <Star size={16} />}
          </div>
          <div className="truncate font-sw-mono text-[13px] text-sw-muted">
            {shortcut.url}
          </div>
        </div>
        <Button
          className="sw-button"
          radius="md"
          rightSection={<Keycap>E</Keycap>}
          onClick={edit}
        >
          Edit
        </Button>
        <DeleteButton name={shortcut.name} onDelete={remove} />
      </div>

      <ScrollArea className="min-h-0 flex-1" type="hover" scrollbarSize={6}>
        <SectionTitle title="Open tabs" count={matchedTabs.length} />
        {matchedTabs.map((tab, idx) => (
          <Row
            key={tab.id}
            number={idx + 1}
            title={tab.title || displayUrl(tab.url)}
            subtitle={displayUrl(tab.url)}
            selected={idx === selectedIdx}
            right={
              tab.id === currentTab?.id && (
                <span className="text-[12px] text-sw-faint">Current</span>
              )
            }
            onClick={() => open(tab)}
          />
        ))}
        {!matchedTabs.length && (
          <div className="flex items-center justify-between px-5 py-3 text-[14px] text-sw-muted">
            No tabs open for {displayUrl(shortcut.url)}.
            <Button
              className="sw-button"
              data-primary
              size="xs"
              radius="md"
              rightSection={<Keycap>↵</Keycap>}
              onClick={() => open()}
            >
              Open it
            </Button>
          </div>
        )}
      </ScrollArea>

      <PanelFooter
        hints={[
          [["↑", "↓"], "select"],
          [["E"], "edit"],
          [["Esc"], "back"],
        ]}
      />
    </View>
  );
}
