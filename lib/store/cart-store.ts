import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Product {
  id: string;
  name: string;
  color: string;
  brand: string;
  size: string;
  price: number;
  stockQty: number;
  category: string;
  description?: string;
  imageUrl?: string;
  usageInstructions?: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getSubtotal: () => number;
  getTaxAmount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product: Product, quantity = 1) => {
        const { items } = get();
        const existingItem = items.find((item) => item.id === product.id);

        if (existingItem) {
          const newQuantity = existingItem.quantity + quantity;
          if (newQuantity <= product.stockQty) {
            set({
              items: items.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: newQuantity }
                  : item
              ),
            });
          }
        } else {
          if (quantity <= product.stockQty) {
            set({
              items: [...items, { ...product, quantity }],
            });
          }
        }
      },

      removeItem: (productId: string) => {
        set({
          items: get().items.filter((item) => item.id !== productId),
        });
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        const { items } = get();
        const product = items.find((item) => item.id === productId);

        if (product && quantity <= product.stockQty) {
          set({
            items: items.map((item) =>
              item.id === productId ? { ...item, quantity } : item
            ),
          });
        }
      },

      clearCart: () => {
        set({ items: [] });
      },

      openCart: () => {
        set({ isOpen: true });
      },

      closeCart: () => {
        set({ isOpen: false });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      getTaxAmount: () => {
        const subtotal = get().getSubtotal();
        return subtotal * 0.08; // 8% tax
      },

      getTotalPrice: () => {
        const subtotal = get().getSubtotal();
        const tax = get().getTaxAmount();
        return subtotal + tax;
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
