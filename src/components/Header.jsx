import { useState, useEffect } from "react";
import { Kbd, Tooltip, UnstyledButton } from "@mantine/core";
import { GearIcon, LightningIcon } from "@phosphor-icons/react";
import dayjs from "dayjs";
import useStore from "../store";
import useSwitchStore from "../switch/store";
import { openShortcutSettings } from "../utils/keys";
import { OPEN_SWITCH_COMMAND } from "../switch/catalog";
import { KeyLabel } from "../switch/components/common";
import logo from "../../images/icon-128.png";

const formatNow = () => dayjs().format("ddd D MMM · h:mm a");

export default function Header() {
  const { toggleSettingsDialog, toggleSwitch } = useStore();
  const toggleKeys = useSwitchStore(
    (state) => state.commandKeys[OPEN_SWITCH_COMMAND],
  );
  const [now, setNow] = useState(formatNow);

  // tick every second; React skips the re-render while the formatted minute is unchanged
  useEffect(() => {
    const intervalId = setInterval(() => setNow(formatNow()), 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <header className="flex items-center justify-between px-8 py-5">
      <div className="flex items-center gap-3">
        <img src={logo} alt="" className="size-7 rounded-md" />
        <span className="text-base font-semibold text-white">Pulse</span>
        <span className="h-4 w-px bg-white/15" />
        <time className="font-mono text-sm text-neutral-400">{now}</time>
      </div>
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] py-1.5 pr-1.5 pl-3 transition-colors hover:border-white/20">
          <UnstyledButton
            className="flex items-center gap-2 text-sm text-neutral-300 transition-colors hover:text-white"
            onClick={toggleSwitch}
          >
            <LightningIcon size={15} weight="fill" />
            Switch
            {toggleKeys?.map((key) => (
              <Kbd
                key={key}
                size="xs"
                className="border-white/10! bg-white/5! font-mono! text-[11px]! text-neutral-300!"
              >
                <KeyLabel label={key} />
              </Kbd>
            ))}
          </UnstyledButton>
          {/* Chrome gives a key to the first extension that asks for it; when
              another one (like the old QuickSwitch extension) holds it, ours stays unassigned */}
          {toggleKeys?.length === 0 && (
            <Tooltip
              label="Its keyboard shortcut is taken by another extension. Pick one in Chrome's shortcut settings."
              multiline
              w={240}
              withArrow
            >
              <UnstyledButton
                className="rounded-md border border-amber-300/30 bg-amber-300/10 px-1.5 py-0.5 font-mono text-[11px] text-amber-200 transition-colors hover:bg-amber-300/20"
                onClick={openShortcutSettings}
              >
                Set key
              </UnstyledButton>
            </Tooltip>
          )}
        </div>
        <UnstyledButton
          className="flex items-center gap-2 text-sm text-neutral-300 transition-colors hover:text-white"
          onClick={toggleSettingsDialog}
        >
          <GearIcon size={18} />
          Settings
        </UnstyledButton>
      </div>
    </header>
  );
}
