import { Checkbox, Popover, UnstyledButton } from "@mantine/core";
import { useShallow } from "zustand/react/shallow";
import useSwitchStore from "../store";
import { SECTIONS, isSectionVisible } from "../search";

// Soon sections are listed but can't be toggled
const FILTERS = SECTIONS.filter((section) => section.filterable);
const FILTERABLE = FILTERS.filter((section) => !section.soon);
// "Recently used, Favorites, and Shortcuts"
const ALWAYS_SHOWN = new Intl.ListFormat("en").format(
  SECTIONS.filter((section) => !section.filterable).map(({ label }) => label),
);

// Three lines narrowing like a funnel, sized to the design; they thicken once
// some sections are hidden
const FilterIcon = ({ filtered }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    stroke="currentColor"
    strokeWidth={filtered ? 2 : 1.5}
    strokeLinecap="round"
    aria-hidden
  >
    <path d="M2.75 3.75h8.5M4.25 7h5.5M5.75 10.25h2.5" />
  </svg>
);

// The search header's section filter: a funnel icon, tinted once some
// sections are hidden. `onClose` hands focus back to the search box.
export default function SectionFilter({ onClose }) {
  const { sectionVisibility, toggleSection, showAllSections } = useSwitchStore(
    useShallow(({ sectionVisibility, toggleSection, showAllSections }) => ({
      sectionVisibility,
      toggleSection,
      showAllSections,
    })),
  );
  const filtered = FILTERABLE.some(
    ({ id }) => !isSectionVisible(id, sectionVisibility),
  );
  const label = filtered ? "Filter sections (some hidden)" : "Filter sections";

  return (
    <Popover
      position="bottom-end"
      offset={8}
      width={268}
      shadow="md"
      returnFocus={false}
      onClose={onClose}
      classNames={{ dropdown: "sw-popover sw-filter" }}
    >
      <Popover.Target>
        <UnstyledButton
          className="sw-filter-button"
          data-filtered={filtered || undefined}
          aria-label={label}
          title={label}
        >
          <FilterIcon filtered={filtered} />
        </UnstyledButton>
      </Popover.Target>
      <Popover.Dropdown>
        <div className="flex items-center justify-between px-3 pt-3 pb-1.5">
          <span className="text-[11px] font-semibold tracking-[0.08em] text-sw-muted uppercase">
            Show in search
          </span>
          {filtered && (
            <UnstyledButton
              className="text-[13px] text-sw-accent-soft hover:text-sw-text"
              onClick={showAllSections}
            >
              Select all
            </UnstyledButton>
          )}
        </div>
        {FILTERS.map(({ id, label, soon }) => (
          <label
            key={id}
            className="sw-filter-option"
            data-disabled={soon || undefined}
          >
            <Checkbox
              size="xs"
              radius="sm"
              checked={isSectionVisible(id, sectionVisibility)}
              disabled={soon}
              onChange={() => toggleSection(id)}
              classNames={{ input: "sw-checkbox" }}
            />
            <span className="flex-1">{label}</span>
            {soon && <span className="text-[12px] text-sw-faint">Soon</span>}
          </label>
        ))}
        <div className="mx-3 mt-1.5 border-t border-sw-divider py-2.5 text-[12px] text-sw-faint">
          {ALWAYS_SHOWN} always show.
        </div>
      </Popover.Dropdown>
    </Popover>
  );
}
