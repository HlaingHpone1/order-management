import { create } from "zustand";
import { Category } from "@/generated/prisma/client";

interface CategoryModalStore {
  isOpen: boolean;
  data?: Category; // Editing data
  onOpen: (data?: Category) => void;
  onClose: () => void;
}

export const useCategoryModal = create<CategoryModalStore>((set) => ({
  isOpen: false,
  data: undefined,
  onOpen: (data) => set({ isOpen: true, data }),
  onClose: () => set({ isOpen: false, data: undefined }),
}));
