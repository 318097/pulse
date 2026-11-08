import useSwitchStore from "./store";
import SearchView from "./components/SearchView";
import ShortcutsView from "./components/ShortcutsView";
import ShortcutForm from "./components/ShortcutForm";
import ShortcutDetails from "./components/ShortcutDetails";
import { Toast } from "./components/common";

const VIEWS = {
  search: SearchView,
  shortcuts: ShortcutsView,
  add: ShortcutForm,
  edit: ShortcutForm,
  view: ShortcutDetails,
};

// The panel fills the toolbar popup, or sits as a card in the new tab's modal
export default function SwitchPanel({ onClose, popup }) {
  const { loaded, view, params } = useSwitchStore();
  const Screen = VIEWS[view];

  return (
    <div className={`sw-panel ${popup ? "" : "sw-panel-modal"}`}>
      {/* Keyed per view and shortcut, so each starts with fresh state */}
      {loaded && (
        <Screen
          key={`${view}:${params.id ?? params.hotkey ?? ""}`}
          onClose={onClose}
        />
      )}
      <Toast />
    </div>
  );
}
