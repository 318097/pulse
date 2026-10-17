import { create } from "zustand";
import { ENTITY_MAP, KEYS_TO_SKIP } from "./config";
import _ from "lodash";

const useStore = create((set) => ({
  showSettingsDialog: false,
  entities: [],
  setEntities: (entities) =>
    set({
      entities: entities.map((entity) => {
        const defaultEntity = ENTITY_MAP[entity._id];

        if (!defaultEntity) {
          return entity;
        }
        return {
          ...defaultEntity,
          ..._.pick(entity, KEYS_TO_SKIP),
        };
      }),
    }),
  toggleSettingsDialog: () =>
    set((state) => ({ showSettingsDialog: !state.showSettingsDialog })),
}));

export default useStore;
