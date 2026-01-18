import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface ModalStore {
  open: boolean;
  selectedId: string | null;
  name: string | null;
  setOpen: (open: boolean) => void;
  setSelectedId: (selectedId: string | null) => void;
  setName: (name: string | null) => void;
}

export const useDeleteModalStore = create<ModalStore>()(
  immer((set) => ({
    open: false,
    selectedId: null,
    name: null,
    setName: (name: string | null) => set({ name }),
    setOpen: (open: boolean) => set({ open }),
    setSelectedId: (selectedId: string | null) => set({ selectedId }),
  })),
);
