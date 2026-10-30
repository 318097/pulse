// Entry for switch.html: the toolbar popup, or the small window the
// background opens (with ?windowId=) when Chrome won't show the popup
import { mount } from "../mount";
import useSwitchStore, { syncSwitch } from "./store";
import SwitchPanel from "./SwitchPanel";

const windowId = Number(new URLSearchParams(location.search).get("windowId"));
const isStandaloneWindow = windowId > 0;
const close = () => window.close();

// The toggle shortcut closes an open panel; the background finds it via this port
chrome.runtime
  .connect({ name: "switch" })
  .onMessage.addListener((message) => message?.type === "close" && close());

// A popup closes itself when it loses focus; make the fallback window do the same
if (isStandaloneWindow) window.addEventListener("blur", close);

syncSwitch();
useSwitchStore
  .getState()
  .load({ windowId: isStandaloneWindow ? windowId : undefined });

mount(<SwitchPanel popup onClose={close} />, { forceColorScheme: "dark" });
