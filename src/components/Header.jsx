import { useState, useEffect } from "react";
import { UnstyledButton } from "@mantine/core";
import { GearIcon } from "@phosphor-icons/react";
import dayjs from "dayjs";
import useStore from "../store";
import logo from "../../images/icon-128.png";

const formatNow = () => dayjs().format("ddd D MMM · h:mm a");

export default function Header() {
  const { toggleSettingsDialog } = useStore();
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
      <UnstyledButton
        className="flex items-center gap-2 text-sm text-neutral-300 transition-colors hover:text-white"
        onClick={toggleSettingsDialog}
      >
        <GearIcon size={18} />
        Settings
      </UnstyledButton>
    </header>
  );
}
