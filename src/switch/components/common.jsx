import { forwardRef, useEffect, useRef } from "react";
import {
  ActionIcon,
  CloseButton,
  Highlight as MantineHighlight,
  Kbd,
  SegmentedControl,
} from "@mantine/core";
import {
  ArrowFatUpIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  InfoIcon,
  LightningIcon,
  StarIcon,
  WarningCircleIcon,
  XIcon,
} from "@phosphor-icons/react";
import useSwitchStore from "../store";

// One panel screen. It takes focus on mount (unless an input inside autofocuses)
// and maps keys to handlers, with `default` catching the rest; a handler that
// returns false lets the key through. Keys from portals (the delete popover)
// bubble here through React and are left alone.
export const View = ({ keymap, autoFocus = true, children }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  const handleKeyDown = (event) => {
    if (!ref.current?.contains(event.target)) return;
    const handler = keymap[event.key] ?? keymap.default;
    if (!handler || handler(event) === false) return;
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div
      ref={ref}
      tabIndex={-1}
      data-autofocus={autoFocus || undefined}
      className="flex min-h-0 flex-1 flex-col outline-none"
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
};

// A key's face; macOS's outlined ⇧ is hard to read that small, so it's drawn filled
export const KeyLabel = ({ label }) =>
  label === "⇧" ? (
    <ArrowFatUpIcon size="1em" weight="fill" aria-label="Shift" />
  ) : (
    label
  );

export const Keycap = ({ children, accent }) => (
  <Kbd className="sw-kbd" data-accent={accent || undefined}>
    <KeyLabel label={children} />
  </Kbd>
);

// ["⌥", "⇧", "J"] -> keycaps, with "then" (key sequences) kept as a word.
// [] reads "Not set"; undefined (keys not read yet) renders nothing.
export const Keys = ({ keys, accent }) => {
  if (!keys) return null;
  if (!keys.length) {
    return <span className="text-[12px] text-sw-faint">Not set</span>;
  }
  return (
    <span className="inline-flex shrink-0 items-center gap-1 align-middle">
      {keys.map((key, idx) =>
        key === "then" ? (
          <span key={idx} className="px-0.5 text-[12px] text-sw-faint">
            then
          </span>
        ) : (
          <Keycap key={idx} accent={accent}>
            {key}
          </Keycap>
        ),
      )}
    </span>
  );
};

// The large keycap: detail bar, shortcut details and the form's preview
export const KeyTile = ({ className = "", accent, children }) => (
  <span className={`sw-keycap ${className}`} data-accent={accent || undefined}>
    {children}
  </span>
);

// Marks a favorite shortcut
export const Star = ({ size, className = "" }) => (
  <StarIcon
    size={size}
    weight="fill"
    className={`shrink-0 text-sw-star ${className}`}
  />
);

const HIGHLIGHT_STYLES = {
  background: "none",
  color: "var(--color-sw-accent-soft)",
  fontWeight: 600,
};

// Marks each occurrence of a search token in the text
export const Highlight = ({ text = "", tokens = [] }) => (
  <MantineHighlight
    component="span"
    inherit
    highlight={tokens}
    highlightStyles={HIGHLIGHT_STYLES}
  >
    {text}
  </MantineHighlight>
);

const CloseIcon = ({ onClose }) =>
  onClose && (
    <CloseButton
      className="sw-close-button"
      icon={<XIcon size={16} />}
      onClick={onClose}
      aria-label="Close Switch"
    />
  );

// Search and Shortcuts: logo, the view's own content, view switch, close
export const HomeHeader = ({ view, active, onClose, children }) => {
  const setView = useSwitchStore((state) => state.setView);

  return (
    <header className="sw-header" data-active={active || undefined}>
      <span className="flex size-7 shrink-0 items-center justify-center rounded-[7px] bg-sw-accent text-white">
        <LightningIcon size={15} weight="fill" />
      </span>
      {children}
      <SegmentedControl
        size="sm"
        value={view}
        onChange={setView}
        withItemsBorders={false}
        classNames={{
          root: "sw-segmented",
          indicator: "sw-segmented-indicator",
          label: "sw-segmented-label",
        }}
        data={[
          { label: "Search", value: "search" },
          { label: "Shortcuts", value: "shortcuts" },
        ]}
      />
      <CloseIcon onClose={onClose} />
    </header>
  );
};

// The other views: back arrow, title, close
export const SubviewHeader = ({ title, onBack, onClose }) => (
  <header className="sw-header">
    <ActionIcon
      className="sw-icon-button"
      variant="default"
      size={30}
      radius="md"
      onClick={onBack}
      aria-label="Back"
    >
      <ArrowLeftIcon size={15} />
    </ActionIcon>
    <h2 className="flex-1 truncate text-[16px] font-semibold">{title}</h2>
    <CloseIcon onClose={onClose} />
  </header>
);

// The view's keyboard hints, as [keys, label] pairs
export const PanelFooter = ({ hints }) => (
  <footer className="sw-footer">
    {hints.map(([keys, label]) => (
      <span key={label} className="flex items-center gap-1.5">
        <Keys keys={keys} />
        {label}
      </span>
    ))}
  </footer>
);

export const SectionTitle = ({ title, count }) => (
  <div className="px-3.5 pt-3 pb-1.5 text-[11px] font-semibold tracking-[0.08em] text-sw-muted uppercase">
    {title}
    {count !== undefined && (
      <span className="ml-1.5 font-medium text-sw-faint">{count}</span>
    )}
  </div>
);

// A selectable list row: number, title and subtitle, then whatever goes on the
// right. `child` rows hang off a group and have no number; `nested` child rows
// sit one level deeper, under another child.
export const Row = forwardRef(function Row(
  { number, title, subtitle, selected, child, nested, right, onClick },
  ref,
) {
  return (
    <div
      ref={ref}
      role="option"
      aria-selected={!!selected}
      data-selected={selected || undefined}
      data-child={child || undefined}
      data-nested={nested || undefined}
      className="sw-row"
      onClick={onClick}
    >
      {!child && <span className="sw-row-number">{number}</span>}
      <div
        className={`flex min-w-0 flex-1 ${child ? "items-baseline gap-3" : "flex-col"}`}
      >
        <div className="sw-row-title">{title}</div>
        {subtitle && <div className="sw-row-subtitle">{subtitle}</div>}
      </div>
      {right}
      {selected && (
        <span
          aria-hidden
          className="flex size-5 shrink-0 items-center justify-center rounded-[5px] bg-sw-accent font-sw-mono text-[12px] font-bold text-white"
        >
          ↵
        </span>
      )}
    </div>
  );
});

const TOAST_ICONS = {
  success: (
    <CheckCircleIcon size={18} weight="fill" className="text-sw-accent" />
  ),
  info: <InfoIcon size={18} weight="fill" className="text-sw-accent" />,
  error: (
    <WarningCircleIcon size={18} weight="fill" className="text-sw-danger" />
  ),
};

export const Toast = () => {
  const { toast, hideToast, view } = useSwitchStore();
  if (!toast) return null;

  // Sits just above the footer, and the Shortcuts view's detail bar there
  const bottom = view === "shortcuts" ? "bottom-[108px]" : "bottom-[46px]";
  return (
    <div
      role="status"
      className={`absolute ${bottom} left-1/2 z-10 flex max-w-[80%] -translate-x-1/2 items-center gap-2.5 rounded-[10px] border border-sw-border bg-sw-raised py-2 pr-2.5 pl-3 text-[14px] shadow-[0_12px_30px_-10px_rgb(0_0_0/0.6)]`}
    >
      {TOAST_ICONS[toast.type]}
      <span className="min-w-0">{toast.message}</span>
      <CloseButton
        className="sw-close-button"
        size="sm"
        icon={<XIcon size={12} />}
        onClick={hideToast}
        aria-label="Dismiss"
      />
    </div>
  );
};
