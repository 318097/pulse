import { useEffect } from "react";
import { Modal } from "@mantine/core";
import { useHotkeys } from "@mantine/hooks";
import useStore from "../store";
import useSwitchStore, { syncSwitch } from "./store";
import SwitchPanel from "./SwitchPanel";
import { OPEN_SWITCH_COMMAND } from "./catalog";
import { reopenInNewTab } from "../utils/tabs";

// Marks the Pulse tab the shortcut reopens (see below), so it starts with Switch open
const OPEN_HASH = "#switch";

// Switch on Pulse's new tab: a modal over the daily card, opened from the
// header button or the shortcut (the background asks this tab to open it)
export default function SwitchModal() {
  const { showSwitch, setShowSwitch, toggleSwitch } = useStore();
  const toggleKeys = useSwitchStore(
    (state) => state.commandKeys[OPEN_SWITCH_COMMAND],
  );

  useEffect(() => syncSwitch(), []);

  useEffect(() => {
    if (location.hash !== OPEN_HASH) return;
    history.replaceState(null, "", location.pathname);
    setShowSwitch(true);
  }, [setShowSwitch]);

  useEffect(() => {
    if (!showSwitch) return;
    const { loaded, load, reopen } = useSwitchStore.getState();
    if (loaded) reopen();
    else load();
  }, [showSwitch]);

  useEffect(() => {
    let tabId;
    chrome.tabs.getCurrent((tab) => {
      tabId = tab?.id;
    });

    const listener = (message, _sender, sendResponse) => {
      if (message?.type !== "toggle-switch" || message.tabId !== tabId) {
        return;
      }
      const opening = !useStore.getState().showSwitch;
      // The address bar has keyboard focus and a page can't take it back, so
      // reopen Pulse in a tab that gets focus, with Switch already open
      if (opening && !document.hasFocus()) {
        reopenInNewTab(chrome.runtime.getURL(`index.html${OPEN_HASH}`));
      } else {
        toggleSwitch();
      }
      sendResponse(true);
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, [toggleSwitch]);

  // With no toggle key assigned, Chrome hands Alt/Option+J to the page (unless
  // another extension owns it), so catch it here. Physical keys, because
  // Option+J types "∆" on macOS.
  useHotkeys(
    toggleKeys?.length === 0
      ? [
          [
            "alt+J",
            toggleSwitch,
            { preventDefault: true, usePhysicalKeys: true },
          ],
        ]
      : [],
    [],
  );

  const close = () => setShowSwitch(false);

  return (
    <Modal
      opened={showSwitch}
      onClose={close}
      withCloseButton={false}
      closeOnEscape={false}
      centered
      size={740}
      padding={0}
      radius={12}
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
      classNames={{ content: "bg-transparent! shadow-none!", body: "p-0!" }}
    >
      <SwitchPanel onClose={close} />
    </Modal>
  );
}
