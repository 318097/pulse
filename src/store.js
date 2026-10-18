import { create } from "zustand";
import {
  DEFAULT_ENTITIES_KEY,
  DEFAULT_ACTIVE_ENTITY_KEY,
  saveDataToStorage,
} from "./config";

const useStore = create((set) => ({
  showSettingsDialog: false,
  entities: [],
  visibleEntities: [],
  activeEntityIdx: 0,
  loading: true,
  setEntities: (entities) => {
    const visibleEntities = entities.filter((entity) => entity.enabled);

    if (entities.length) saveDataToStorage(entities, DEFAULT_ENTITIES_KEY);

    set({ entities, visibleEntities });
  },
  setActiveEntityIdx: (id) => {
    set((state) => {
      const activeEntityIdx = id % state.visibleEntities.length;
      saveDataToStorage(activeEntityIdx, DEFAULT_ACTIVE_ENTITY_KEY);
      return {
        activeEntityIdx,
        loading: false,
      };
    });
  },
  toggleSettingsDialog: () =>
    set((state) => ({ showSettingsDialog: !state.showSettingsDialog })),
}));

export default useStore;
