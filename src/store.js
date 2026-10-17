import { create } from "zustand";
import {
  DEFAULT_ENTITIES_KEY,
  DEFAULT_ACTIVE_ENTITY_KEY,
  ENTITY_MAP,
  KEYS_TO_SKIP,
  saveDataToStorage,
} from "./config";
import _ from "lodash";

const useStore = create((set) => ({
  showSettingsDialog: false,
  entities: [],
  visibleEntities: [],
  activeEntityIdx: 0,
  loading: true,
  setEntities: (data) => {
    const entities = data.map((entity) => {
      const defaultEntity = ENTITY_MAP[entity._id];

      if (!defaultEntity) {
        return entity;
      }
      return {
        ...defaultEntity,
        ..._.pick(entity, KEYS_TO_SKIP),
      };
    });

    const visibleEntities = entities.filter((entity) => entity.enabled);

    if (entities.length) saveDataToStorage(entities, DEFAULT_ENTITIES_KEY);

    set((state) => ({
      entities,
      visibleEntities,
    }));
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
