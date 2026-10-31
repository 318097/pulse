import { useEffect } from "react";
import { Badge } from "@mantine/core";
import DynamicEntity from "./components/DynamicEntity";
import Header from "./components/Header";
import {
  DEFAULT_ACTIVE_ENTITY_KEY,
  DEFAULT_ENTITIES_KEY,
  buildDefaultEntities,
} from "./config";
import { getDataFromStorage } from "./utils/storage";
import useStore from "./store";
import Settings from "./components/Settings";
import SwitchModal from "./switch/SwitchModal";
import { useTailwindDarkMode } from "./hooks/useTailwindDarkMode";

// Handlers live at module scope so their identity is stable across renders;
// useDynamicEntity's fetch effect depends on onUpdate and would otherwise re-run every render.
const handleEntityError = (error) => {
  console.error("Entity fetch error:", error);
};

const handleEntityUpdate = (entityId, data) => {
  const { entities, setEntities } = useStore.getState();
  const updatedEntities = entities.map((entity) => {
    const history = [
      ...(entity.history || []),
      { ...data, timestamp: new Date().toISOString() },
    ];

    return entity._id === entityId
      ? {
          ...entity,
          db: data,
          history: history.slice((entity.historySize || 50) * -1), // keep only the last `historySize` items
        }
      : entity;
  });

  setEntities(updatedEntities);
};

export default function App() {
  const {
    setEntities,
    setActiveEntityIdx,
    visibleEntities,
    activeEntityIdx,
    loading,
  } = useStore();
  useTailwindDarkMode();

  // calculate it on every render so that it updates when the activeEntityIdx changes
  // falls back to the first source when the index no longer fits (sources toggled in Settings)
  const activeEntity = visibleEntities[activeEntityIdx] ?? visibleEntities[0];

  // Load entities from storage on mount (once); zustand setters are stable
  useEffect(() => {
    getDataFromStorage(
      buildDefaultEntities(),
      setEntities,
      DEFAULT_ENTITIES_KEY,
    );
    getDataFromStorage(
      null,
      (id) => setActiveEntityIdx(id === null ? 0 : id + 1),
      DEFAULT_ACTIVE_ENTITY_KEY,
    );
  }, [setEntities, setActiveEntityIdx]);

  if (loading) return null;

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        {activeEntity ? (
          <div className="flex flex-col gap-2 w-140 items-center justify-center">
            <Badge
              className="self-start mb-1 font-mono font-light"
              variant="light"
              color="blue"
              size="md"
              radius="sm"
            >
              {activeEntity.label}
            </Badge>
            <DynamicEntity
              entity={activeEntity}
              onError={handleEntityError}
              onUpdate={handleEntityUpdate}
            />
          </div>
        ) : (
          // every source is switched off; keep the header so Settings stays reachable
          <p className="font-mono text-sm text-neutral-400">
            All sources are off. Turn one on in Settings.
          </p>
        )}
      </main>
      <Settings />
      <SwitchModal />
    </div>
  );
}
