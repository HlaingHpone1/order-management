import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export interface CartItem {
  variantId: string;
  productId: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  concentration: string;
  size: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  getCartCount: () => number;
}

/**
 * FIX: Use create<CartState>() with empty parentheses for the generic.
 * Do NOT pass [["zustand/immer", ...]] inside the generic.
 * The middleware types are inferred automatically from persist(immer(...)).
 */
export const useCartStore = create<CartState>()(
  persist(
    immer((set, get) => ({
      items: [],

      addItem: (newItem: CartItem) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.variantId === newItem.variantId,
          );

          if (existingItem) {
            existingItem.quantity += newItem.quantity;
          } else {
            state.items.push(newItem);
          }
        });
      },

      removeItem: (variantId: string) => {
        set((state) => {
          // Immer allows direct mutation (splice) or returning a new value
          const index = state.items.findIndex(
            (item) => item.variantId === variantId,
          );
          if (index !== -1) {
            state.items.splice(index, 1);
          }
        });
      },

      updateQuantity: (variantId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(variantId);
        } else {
          set((state) => {
            const item = state.items.find((i) => i.variantId === variantId);
            if (item) {
              item.quantity = quantity;
            }
          });
        }
      },

      clearCart: () => {
        set((state) => {
          state.items = [];
        });
      },

      getCartCount: () => {
        return get().items.reduce((acc, item) => acc + item.quantity, 0);
      },
    })),
    {
      name: "fragrance-hub-cart",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
