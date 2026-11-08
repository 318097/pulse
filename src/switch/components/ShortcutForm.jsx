import { useEffect, useState } from "react";
import { Button, Switch, TextInput } from "@mantine/core";
import useSwitchStore from "../store";
import { getSiteName, isValidUrl, withProtocol } from "../../utils/url";
import { isNewTabPage } from "../../utils/tabs";
import {
  KeyTile,
  Keycap,
  PanelFooter,
  Star,
  SubviewHeader,
  View,
} from "./common";

const inputClassNames = {
  input: "sw-input",
  label: "sw-input-label",
  description: "sw-input-description",
  error: "sw-input-error",
};

// Editing starts from the shortcut; adding prefills from the page Switch
// was opened on, like the old in-page form did
const initialValues = (editing, currentTab, hotkey = "") => {
  if (editing) {
    const { name, url, favorite } = editing;
    return { name, url, hotkey: editing.hotkey, favorite: !!favorite };
  }
  const fromPage =
    /^https?:/.test(currentTab?.url || "") && !isNewTabPage(currentTab);
  return {
    name: fromPage ? getSiteName(currentTab) : "",
    url: fromPage ? currentTab.url : "",
    hotkey,
    favorite: false,
    fromPage,
  };
};

// Add (params.hotkey may preset the key) or edit (params.id) a shortcut
export default function ShortcutForm({ onClose }) {
  const {
    shortcuts,
    params,
    currentTab,
    setView,
    addShortcut,
    updateShortcut,
  } = useSwitchStore();
  const editing = params.id && shortcuts.find(({ _id }) => _id === params.id);
  const [values, setValues] = useState(() =>
    initialValues(editing, currentTab, params.hotkey),
  );
  const [urlTouched, setUrlTouched] = useState(false);
  const [keyHint, setKeyHint] = useState(null);

  // The shortcut was deleted from another Switch window
  const missing = params.id && !editing;
  useEffect(() => {
    if (missing) setView("shortcuts");
  }, [missing, setView]);
  if (missing) return null;

  const update = (patch) => setValues((prev) => ({ ...prev, ...patch }));
  const takenBy = shortcuts.find(
    (s) => s._id !== editing?._id && s.hotkey === values.hotkey,
  );
  const hotkeyError =
    keyHint || (takenBy && `Hotkey used by ‘${takenBy.name}’`);
  const urlError =
    urlTouched && values.url && !isValidUrl(values.url) && "Invalid URL";
  const canSave =
    values.name.trim() && isValidUrl(values.url) && values.hotkey && !takenBy;

  const goBack = () =>
    setView(editing ? "view" : "shortcuts", editing ? { id: editing._id } : {});

  const save = (event) => {
    event.preventDefault();
    if (!canSave) return setUrlTouched(true);

    const { name, url, hotkey, favorite } = values;
    const data = { name: name.trim(), url: url.trim(), hotkey, favorite };
    if (editing) {
      updateShortcut(editing._id, data);
      setView("view", { id: editing._id });
    } else {
      addShortcut(data);
      setView("shortcuts", { hotkey });
    }
  };

  // The hotkey box holds one letter: typing replaces it, Backspace clears it
  const handleHotkeyKeyDown = (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const isLetter = /^[a-z]$/i.test(event.key);
    if (isLetter || event.key === "Backspace" || event.key === "Delete") {
      event.preventDefault();
      setKeyHint(null);
      update({ hotkey: isLetter ? event.key.toUpperCase() : "" });
    } else if (event.key.length === 1) {
      event.preventDefault();
      setKeyHint("Hotkey can only be from A-Z");
    }
  };

  return (
    <View keymap={{ Escape: goBack }} autoFocus={false}>
      <SubviewHeader
        title={editing ? `Edit ‘${editing.name}’ shortcut` : "Add shortcut"}
        onBack={goBack}
        onClose={onClose}
      />

      <form className="flex min-h-0 flex-1 flex-col" onSubmit={save}>
        <div className="flex flex-1 gap-6 px-6 pt-5">
          <div className="flex w-40 shrink-0 flex-col items-center gap-3 pt-1">
            <KeyTile className="size-[120px] p-4">
              <span
                className={`text-[40px] leading-none ${hotkeyError ? "text-sw-danger" : ""}`}
              >
                {values.hotkey || "?"}
              </span>
              <span className="truncate font-sans text-[15px] font-semibold">
                {values.name || "Name"}
              </span>
              {values.favorite && (
                <Star size={15} className="absolute top-3.5 right-3.5" />
              )}
            </KeyTile>
            <span className="text-[13px] text-sw-muted">Key preview</span>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-3.5">
            <TextInput
              label="Label"
              placeholder="Gmail"
              radius="md"
              classNames={inputClassNames}
              value={values.name}
              onChange={(event) => update({ name: event.currentTarget.value })}
              data-autofocus
              autoFocus
            />
            <TextInput
              label="URL"
              placeholder="https://mail.google.com"
              radius="md"
              classNames={inputClassNames}
              value={values.url}
              description={
                values.fromPage && !urlError && "From the current page"
              }
              inputWrapperOrder={["label", "input", "description", "error"]}
              error={urlError}
              onChange={(event) =>
                update({ url: event.currentTarget.value, fromPage: false })
              }
              onBlur={() => {
                update({ url: withProtocol(values.url.trim()) });
                setUrlTouched(true);
              }}
              spellCheck={false}
            />
            <div>
              <div className="sw-input-label">Hotkey</div>
              <div className="flex items-center gap-5">
                <TextInput
                  aria-label="Hotkey"
                  radius="md"
                  classNames={{
                    input:
                      "sw-input size-11! p-0! text-center! font-sw-mono text-[17px]! font-bold",
                  }}
                  value={values.hotkey}
                  error={!!hotkeyError}
                  onKeyDown={handleHotkeyKeyDown}
                  onChange={() => {}}
                  placeholder="A"
                />
                <Switch
                  label="Add to favorites"
                  color="blue"
                  checked={values.favorite}
                  onChange={(event) =>
                    update({ favorite: event.currentTarget.checked })
                  }
                  classNames={{ label: "text-[15px] text-sw-text" }}
                />
              </div>
              {hotkeyError && (
                <div className="sw-input-error">{hotkeyError}</div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2.5 px-6 pb-4">
          <Button className="sw-button" radius="md" onClick={goBack}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="sw-button"
            data-primary
            radius="md"
            disabled={!canSave}
            rightSection={<Keycap>↵</Keycap>}
          >
            {editing ? "Update" : "Add shortcut"}
          </Button>
        </div>
      </form>

      <PanelFooter
        hints={[
          [["Tab"], "next field"],
          [["↵"], "save"],
          [["Esc"], "back"],
        ]}
      />
    </View>
  );
}
