import { useEffect } from "react";
import { ActionIcon, Badge, useMantineColorScheme } from "@mantine/core";
import DynamicEntity from "./components/DynamicEntity";
import {
  DEFAULT_ACTIVE_ENTITY_KEY,
  DEFAULT_ENTITIES_KEY,
  buildDefaultEntities,
  getDataFromStorage,
} from "./config";
import { SunDimIcon, MoonIcon, GearIcon } from "@phosphor-icons/react";
import useStore from "./store";
import Settings from "./components/Settings";
import { useTailwindDarkMode } from "./hooks/useTailwindDarkMode";

// Handlers live at module scope so their identity is stable across renders;
// useDynamicEntity's fetch effect depends on onUpdate and would otherwise re-run every render.
const handleEntityError = (error) => {
  console.error("Entity fetch error:", error);
};

const handleEntityUpdate = (entityId, data) => {
  const { entities, setEntities } = useStore.getState();
  const updatedEntities = entities.map((entity) =>
    entity._id === entityId
      ? {
          ...entity,
          db: data,
          history: [
            ...(entity.history || []),
            { ...data, timestamp: new Date().toISOString() },
          ],
        }
      : entity,
  );

  setEntities(updatedEntities);
};

export default function App() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const {
    toggleSettingsDialog,
    setEntities,
    setActiveEntityIdx,
    visibleEntities,
    activeEntityIdx,
    loading,
  } = useStore();
  useTailwindDarkMode();

  // calculate it on every render so that it updates when the activeEntityIdx changes
  const activeEntity = visibleEntities[activeEntityIdx];

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

  if (!activeEntity || loading) return null;

  return (
    <div className="w-full h-full flex items-center justify-center overflow-y-auto">
      <div className="flex flex-col gap-2 w-140 h-full items-center justify-center">
        <Badge
          className="self-start mb-2"
          variant="light"
          color="blue"
          size="sm"
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
      <div className="fixed bottom-4 right-4 flex flex-col gap-1">
        <ActionIcon
          variant="subtle"
          color="cyan"
          onClick={() => toggleColorScheme()}
        >
          {colorScheme === "dark" ? <SunDimIcon /> : <MoonIcon />}
        </ActionIcon>
        <ActionIcon
          variant="subtle"
          color="pink"
          onClick={() => toggleSettingsDialog()}
        >
          <GearIcon />
        </ActionIcon>
      </div>
      <Settings />
    </div>
  );
}
