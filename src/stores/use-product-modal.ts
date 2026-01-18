import { create } from "zustand";
import { Product } from "@/generated/prisma/client";

interface ProductModalStore {
  isOpen: boolean;
  data?: Product;
  onOpen: (data?: Product) => void;
  onClose: () => void;
}

export const useProductModal = create<ProductModalStore>((set) => ({
  isOpen: false,
  data: undefined,
  onOpen: (data) => set({ isOpen: true, data }),
  onClose: () => set({ isOpen: false, data: undefined }),
}));
