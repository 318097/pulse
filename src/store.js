import { create } from "zustand";

const useStore = create((set) => ({
  showSettingsDialog: false,
  entities: [],
  setEntities: (entities) => set({ entities }),
  toggleSettingsDialog: () =>
    set((state) => ({ showSettingsDialog: !state.showSettingsDialog })),
}));

export default useStore;
