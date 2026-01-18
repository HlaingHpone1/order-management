import { create } from "zustand";
import { InventoryBatch } from "@/generated/prisma/client";

interface InventoryModalStore {
  isOpen: boolean;
  data?: InventoryBatch;
  onOpen: (data?: InventoryBatch) => void;
  onClose: () => void;
}

export const useInventoryModal = create<InventoryModalStore>((set) => ({
  isOpen: false,
  data: undefined,
  onOpen: (data) => set({ isOpen: true, data }),
  onClose: () => set({ isOpen: false, data: undefined }),
}));
