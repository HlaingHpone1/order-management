import { create } from "zustand";
import { Brand } from "@/generated/prisma/client";

interface BrandModalStore {
  isOpen: boolean;
  data?: Brand; // If data exists, it's Edit mode
  onOpen: (data?: Brand) => void;
  onClose: () => void;
}

export const useBrandModal = create<BrandModalStore>((set) => ({
  isOpen: false,
  data: undefined,
  onOpen: (data) => set({ isOpen: true, data }),
  onClose: () => set({ isOpen: false, data: undefined }),
}));
