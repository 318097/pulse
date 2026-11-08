import { useMemo, useState } from "react";
import { Button, Indicator } from "@mantine/core";
import { PlusIcon } from "@phosphor-icons/react";
import clamp from "lodash/clamp";
import keyBy from "lodash/keyBy";
import useSwitchStore from "../store";
import { openLink } from "../actions";
import { pluralize } from "../../utils/text";
import { displayUrl } from "../../utils/url";
import { getMatchedTabs } from "../../utils/tabs";
import { SHIFT } from "../../utils/keys";
import { OPEN_SWITCH_COMMAND } from "../catalog";
import {
  HomeHeader,
  KeyTile,
  Keycap,
  Keys,
  PanelFooter,
  Star,
  View,
} from "./common";

const KEYBOARD_ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"].map((row) => [
  ...row,
]);
// Rows are staggered like a real keyboard (¼ and ¾ of a key)
const ROW_OFFSETS = [0, 16, 46];
const LETTERS = KEYBOARD_ROWS.flat();
// Long enough for the pressed key to show before the tab switches
const SWITCH_DELAY = 150;
const ARROWS = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];

const Key = ({
  letter,
  shortcut,
  openTabs,
  selected,
  pressed,
  onSelect,
  onPick,
}) => (
  <Indicator
    label={openTabs}
    disabled={!openTabs}
    color="blue"
    size={18}
    offset={2}
    zIndex={2}
    classNames={{ indicator: `sw-key-badge ${pressed ? "border-white!" : ""}` }}
  >
    <button
      type="button"
      className="sw-key"
      data-assigned={!!shortcut || undefined}
      data-selected={selected || undefined}
      data-pressed={pressed || undefined}
      onMouseEnter={onSelect}
      onFocus={onSelect}
      onClick={(event) => onPick(event.shiftKey)}
      title={
        shortcut ? `${shortcut.name} · ${shortcut.url}` : `Assign ${letter}`
      }
    >
      <span className="font-sw-mono text-[17px] leading-none font-bold">
        {letter}
      </span>
      {shortcut && <span className="sw-key-name">{shortcut.name}</span>}
      {shortcut?.favorite && (
        <Star
          size={11}
          className={`absolute top-2 right-2 ${pressed ? "text-white" : ""}`}
        />
      )}
    </button>
  </Indicator>
);

// The strip under the keyboard: what the selected key does, plus an action
const DetailBar = ({ letter, pressed, title, subtitle, mono, children }) => (
  <div className="flex h-[62px] shrink-0 items-center gap-3 border-t border-sw-divider bg-sw-sunken px-4">
    {letter && (
      <KeyTile
        className="size-9 items-center justify-center rounded-lg! border-b-2! text-[15px]"
        accent={pressed}
      >
        {letter}
      </KeyTile>
    )}
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-1.5 text-[15px] font-semibold">
        {title}
      </div>
      <div
        className={`truncate text-sw-muted ${mono ? "font-sw-mono text-[12.5px]" : "text-[13px]"}`}
      >
        {subtitle}
      </div>
    </div>
    {children}
  </div>
);

const detailButton = { className: "sw-button", size: "sm", radius: "md" };

export default function ShortcutsView({ onClose }) {
  const { shortcuts, tabs, commandKeys, params, setView } = useSwitchStore();
  const byLetter = useMemo(() => keyBy(shortcuts, "hotkey"), [shortcuts]);
  // Start on the key just added, else the first assigned one
  const [selected, setSelected] = useState(() =>
    byLetter[params.hotkey]
      ? params.hotkey
      : LETTERS.find((letter) => byLetter[letter]) || "Q",
  );
  const [pressed, setPressed] = useState(null);

  const openTabsFor = (shortcut) =>
    shortcut ? getMatchedTabs(tabs, shortcut.url).length : 0;
  const addShortcut = (hotkey) => setView("add", { hotkey });

  // A free key opens the form for it; Shift shows a shortcut's details;
  // otherwise the key lights up and its site opens
  const pick = (letter, shift = false) => {
    const shortcut = byLetter[letter];
    setSelected(letter);
    if (!shortcut) return addShortcut(letter);
    if (shift) return setView("view", { id: shortcut._id });

    setPressed(letter);
    setTimeout(
      () => openLink(shortcut.url, onClose).finally(() => setPressed(null)),
      SWITCH_DELAY,
    );
  };

  // Arrows walk the keyboard; up/down keep the column where the row allows
  const move = (key) => {
    if (key === "ArrowLeft" || key === "ArrowRight") {
      const idx = LETTERS.indexOf(selected) + (key === "ArrowLeft" ? -1 : 1);
      return setSelected(LETTERS[clamp(idx, 0, LETTERS.length - 1)]);
    }
    const rowIdx = KEYBOARD_ROWS.findIndex((row) => row.includes(selected));
    const nextRow = KEYBOARD_ROWS[rowIdx + (key === "ArrowDown" ? 1 : -1)];
    const colIdx = KEYBOARD_ROWS[rowIdx].indexOf(selected);
    if (nextRow) setSelected(nextRow[Math.min(colIdx, nextRow.length - 1)]);
  };

  const keymap = pressed
    ? {}
    : {
        Enter: () => pick(selected),
        Tab: () => setView("search"),
        Escape: () => onClose?.(),
        ...Object.fromEntries(ARROWS.map((key) => [key, () => move(key)])),
        default: (event) => {
          if (event.metaKey || event.ctrlKey || event.altKey) return false;
          if (event.key === "+" || event.key === "=") return addShortcut();
          if (!/^[a-z]$/i.test(event.key)) return false;

          const letter = event.key.toUpperCase();
          // A bare press on a free key only selects it, so a typo can't open the form
          if (!byLetter[letter] && !event.shiftKey) return setSelected(letter);
          pick(letter, event.shiftKey);
        },
      };

  const shortcut = byLetter[selected];
  const openTabs = openTabsFor(shortcut);
  const toggleKeys = commandKeys[OPEN_SWITCH_COMMAND];

  const renderDetailBar = () => {
    if (!shortcuts.length) {
      return (
        <DetailBar
          title="Welcome to Switch: add your first shortcut"
          subtitle={
            <>
              Give a site a key. Then{" "}
              {toggleKeys?.length ? <Keys keys={toggleKeys} /> : "open Switch"}{" "}
              and that key takes you there.
            </>
          }
        >
          <Button
            {...detailButton}
            data-primary
            rightSection={<Keycap>+</Keycap>}
            onClick={() => addShortcut()}
          >
            Add shortcut
          </Button>
        </DetailBar>
      );
    }
    if (!shortcut) {
      return (
        <DetailBar
          letter={selected}
          title={`${selected} is free`}
          subtitle={
            <>
              Give it a site: click the key or press{" "}
              <Keys keys={[SHIFT, selected]} />.
            </>
          }
        >
          <Button {...detailButton} onClick={() => addShortcut(selected)}>
            Assign {selected}
          </Button>
        </DetailBar>
      );
    }
    if (pressed) {
      return (
        <DetailBar
          letter={selected}
          pressed
          mono
          title={`Switching to ${shortcut.name}…`}
          subtitle={`${displayUrl(shortcut.url)} · ${
            openTabs
              ? `${pluralize(openTabs, "open tab")}, jumping to the last used`
              : "opening it"
          }`}
        />
      );
    }
    return (
      <DetailBar
        letter={selected}
        mono
        title={
          <>
            <span className="truncate">{shortcut.name}</span>
            {shortcut.favorite && <Star size={13} />}
          </>
        }
        subtitle={displayUrl(shortcut.url)}
      >
        <span className="text-[13px] text-sw-muted">
          {openTabs ? pluralize(openTabs, "open tab") : "Not open"}
        </span>
        <Button
          {...detailButton}
          rightSection={<Keys keys={[SHIFT, selected]} />}
          onClick={() => setView("view", { id: shortcut._id })}
        >
          Details
        </Button>
      </DetailBar>
    );
  };

  return (
    <View keymap={keymap}>
      <HomeHeader view="shortcuts" onClose={onClose}>
        <div className="flex min-w-0 flex-1 items-baseline gap-3">
          <h2 className="text-[16px] font-semibold">Switch</h2>
          <span className="truncate text-[14px] text-sw-muted">
            {shortcuts.length
              ? `${shortcuts.length} of 26 keys assigned`
              : "No shortcuts yet"}
          </span>
        </div>
      </HomeHeader>

      <div className="flex flex-1 items-center justify-center">
        <div className="flex w-[692px] flex-col gap-2">
          {KEYBOARD_ROWS.map((row, rowIdx) => (
            <div
              key={rowIdx}
              className="flex gap-2"
              style={{ paddingLeft: ROW_OFFSETS[rowIdx] }}
            >
              {row.map((letter) => (
                <Key
                  key={letter}
                  letter={letter}
                  shortcut={byLetter[letter]}
                  openTabs={openTabsFor(byLetter[letter])}
                  selected={
                    !!shortcuts.length && selected === letter && !pressed
                  }
                  pressed={pressed === letter}
                  onSelect={() => !pressed && setSelected(letter)}
                  onPick={(shift) => pick(letter, shift)}
                />
              ))}
              {rowIdx === KEYBOARD_ROWS.length - 1 && (
                <button
                  type="button"
                  className="sw-new-key"
                  data-highlight={!shortcuts.length || undefined}
                  onClick={() => addShortcut()}
                >
                  <PlusIcon size={14} weight="bold" />
                  New shortcut
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {renderDetailBar()}

      <PanelFooter
        hints={[
          [["A-Z"], "switch"],
          [[SHIFT, "A-Z"], "details"],
          [["+"], "add"],
        ]}
      />
    </View>
  );
}
