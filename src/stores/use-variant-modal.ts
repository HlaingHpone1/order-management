import { create } from "zustand";
import { ProductVariant } from "@/generated/prisma/client";

interface VariantModalStore {
  isOpen: boolean;
  data?: ProductVariant;
  onOpen: (data?: ProductVariant) => void;
  onClose: () => void;
}

export const useVariantModal = create<VariantModalStore>((set) => ({
  isOpen: false,
  data: undefined,
  onOpen: (data) => set({ isOpen: true, data }),
  onClose: () => set({ isOpen: false, data: undefined }),
}));
