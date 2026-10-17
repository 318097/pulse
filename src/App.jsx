import React from "react";
import { ActionIcon, Stack, useMantineColorScheme } from "@mantine/core";
import DynamicEntity from "./components/DynamicEntity";
import {
  buildDefaultEntities,
  getDataFromStorage,
  saveDataToStorage,
} from "./config";
import { SunDimIcon, MoonIcon, GearIcon } from "@phosphor-icons/react";
import useStore from "./store";
import Settings from "./components/Settings";
import { useTailwindDarkMode } from "./hooks/useTailwindDarkMode";

const DEFAULT_ENTITIES = buildDefaultEntities();

export default function App() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const { toggleSettingsDialog, entities, setEntities } = useStore();
  useTailwindDarkMode();

  // Load entities from storage on mount (once)
  React.useEffect(() => {
    getDataFromStorage(DEFAULT_ENTITIES, setEntities);
  }, []);

  // Sync entities to storage whenever they change
  React.useEffect(() => {
    if (entities.length) saveDataToStorage(entities);
  }, [entities]);

  const handleEntityError = (error) => {
    console.error("Entity fetch error:", error);
  };

  const handleEntityUpdate = (entityId, data) => {
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

  return (
    <div className="w-full h-full flex items-center justify-center overflow-y-auto">
      <div className="flex flex-col gap-4 w-140 h-full items-center justify-center">
        {entities
          .filter((entity) => entity.enabled)
          .map((entity) => (
            <DynamicEntity
              key={entity._id}
              entity={entity}
              onError={handleEntityError}
              onUpdate={handleEntityUpdate}
            />
          ))}
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
