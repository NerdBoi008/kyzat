"use client";

import { useUserProfile } from "@/hooks/useUserProfile";
import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  slug: string;
  quantity: number;
  stock: number;
  creator: {
    id: string;
    name: string;
    isVerified: boolean;
  };
  variantId?: string;
  variantName?: string;
}

export interface SavedItem {
  id: string;
  name: string;
  price: number;
  image: string;
  slug: string;
  stock: number;
  creator: {
    id: string;
    name: string;
    isVerified: boolean;
  };
  variantId?: string;
  variantName?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  savedItems: SavedItem[];
  isLoading: boolean;
  cartCount: number;
  cartTotal: number;
  addToCart: (
    product: Omit<CartItem, "quantity">,
    quantity?: number
  ) => Promise<void>;
  removeFromCart: (productId: string, variantId?: string) => Promise<void>;
  updateQuantity: (
    productId: string,
    quantity: number,
    variantId?: string
  ) => Promise<void>;
  clearCart: () => Promise<void>;
  isInCart: (productId: string, variantId?: string) => boolean;
  getCartItemQuantity: (productId: string, variantId?: string) => number;
  moveToSaved: (item: CartItem) => Promise<void>;
  moveToCart: (item: SavedItem) => Promise<void>;
  removeSaved: (productId: string, variantId?: string) => Promise<void>;
}

export const CartContext = createContext<CartContextType | undefined>(
  undefined
);

interface CartProviderProps {
  children: ReactNode;
}

interface CartApiResponse {
  cartItems: CartItem[];
  savedItems: SavedItem[];
}

// Type-safe action types
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type CartActionType =
  | "add"
  | "add-more"
  | "remove"
  | "update"
  | "move-to-saved"
  | "move-to-cart"
  | "remove-saved"
  | "clear";

// Type-safe action data unions
type ActionData =
  | {
      action: "add";
      data: { name: string; variantName?: string; quantity: number };
    }
  | {
      action: "add-more";
      data: { name: string; addedQuantity: number; totalQuantity: number };
    }
  | { action: "remove"; data: { name: string } }
  | { action: "update"; data: { name: string; quantity: number } }
  | { action: "move-to-saved"; data: { name: string } }
  | { action: "move-to-cart"; data: { name: string } }
  | { action: "remove-saved"; data: { name: string } }
  | { action: "clear"; data: { count: number } };

const fetcher = (url: string): Promise<CartApiResponse> =>
  fetch(url).then((res) => res.json());

export const CartProvider = ({ children }: CartProviderProps) => {
  const { data: session, isPending } = useSession();
  const [localCartItems, setLocalCartItems] = useState<CartItem[]>([]);
  const [localSavedItems, setLocalSavedItems] = useState<SavedItem[]>([]);
  const [, setIsLocalInitialized] = useState(false);
  const { refetchProfile } = useUserProfile();

  const lastSyncRef = useRef<{
    cartItems: CartItem[];
    savedItems: SavedItem[];
  } | null>(null);
  const pendingActionsRef = useRef<Map<string, ActionData>>(new Map());

  const {
    data,
    mutate,
    isLoading: swrLoading,
  } = useSWR(session?.user?.id ? "/api/cart" : null, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 10000,
  });

  // Initialize local storage for guest users
  useEffect(() => {
    if (isPending) return;

    if (!session?.user?.id) {
      try {
        const savedCart = localStorage.getItem("cartItems");
        const savedForLater = localStorage.getItem("savedItems");

        if (savedCart) setLocalCartItems(JSON.parse(savedCart) as CartItem[]);
        if (savedForLater)
          setLocalSavedItems(JSON.parse(savedForLater) as SavedItem[]);
      } catch (error) {
        console.error("Error loading cart from localStorage:", error);
      }
      setIsLocalInitialized(true);
    }
  }, [session, isPending]);

  // Sync SWR data with local state
  useEffect(() => {
    if (session?.user?.id && data?.cartItems) {
      setLocalCartItems(data.cartItems || []);
      setLocalSavedItems(data.savedItems || []);
      lastSyncRef.current = {
        cartItems: data.cartItems || [],
        savedItems: data.savedItems || [],
      };
      setIsLocalInitialized(true);
    }
  }, [data, session?.user?.id]);

  // Show appropriate success toast based on action
  const showSuccessToast = useCallback((action: ActionData) => {
    switch (action.action) {
      case "add":
        toast.success("Added to cart", {
          description: `${action.data.name}${
            action.data.variantName ? ` - ${action.data.variantName}` : ""
          } (${action.data.quantity})`,
        });
        break;
      case "add-more":
        toast.success(`Added ${action.data.addedQuantity} more`, {
          description: `${action.data.name} (${action.data.totalQuantity} total)`,
        });
        break;
      case "remove":
        toast.success("Removed from cart", {
          description: action.data.name,
        });
        break;
      case "update":
        toast.success("Cart updated", {
          description: `${action.data.name} quantity: ${action.data.quantity}`,
        });
        break;
      case "move-to-saved":
        toast.success("Moved to saved items", {
          description: action.data.name,
        });
        break;
      case "move-to-cart":
        toast.success("Moved to cart", {
          description: action.data.name,
        });
        break;
      case "remove-saved":
        toast.success("Removed from saved items", {
          description: action.data.name,
        });
        break;
      case "clear":
        toast.success("Cart cleared", {
          description: `Removed ${action.data.count} item${
            action.data.count !== 1 ? "s" : ""
          }`,
        });
        break;
    }
  }, []);

  // Sync to database with toast feedback
  const syncToDatabase = useCallback(
    async (
      cartItems: CartItem[],
      savedItems: SavedItem[],
      actionKey?: string
    ): Promise<boolean> => {
      if (session?.user?.id) {
        try {
          const response = await fetch("/api/cart", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cartItems, savedItems }),
          });

          if (!response.ok) throw new Error("Sync failed");

          lastSyncRef.current = { cartItems, savedItems };
          await mutate();
          await refetchProfile();

          // Show success toast only after successful DB operation
          if (actionKey && pendingActionsRef.current.has(actionKey)) {
            const action = pendingActionsRef.current.get(actionKey);
            if (action) {
              showSuccessToast(action);
              pendingActionsRef.current.delete(actionKey);
            }
          }

          return true;
        } catch (error) {
          console.error("Error syncing to database:", error);

          // Revert on error and show error toast
          if (lastSyncRef.current) {
            setLocalCartItems(lastSyncRef.current.cartItems);
            setLocalSavedItems(lastSyncRef.current.savedItems);
          }
          await mutate();

          toast.error("Failed to update cart", {
            description: "Your changes could not be saved. Please try again.",
          });

          if (actionKey) pendingActionsRef.current.delete(actionKey);
          return false;
        }
      } else {
        // For guest users, save to localStorage and show toast immediately
        try {
          localStorage.setItem("cartItems", JSON.stringify(cartItems));
          localStorage.setItem("savedItems", JSON.stringify(savedItems));

          if (actionKey && pendingActionsRef.current.has(actionKey)) {
            const action = pendingActionsRef.current.get(actionKey);
            if (action) {
              showSuccessToast(action);
              pendingActionsRef.current.delete(actionKey);
            }
          }
          return true;
        } catch (error) {
          console.error("Error saving to localStorage:", error);
          toast.error("Failed to save cart locally");
          return false;
        }
      }
    },
    [session?.user?.id, mutate, refetchProfile, showSuccessToast]
  );

  // Add item to cart
  const addToCart = useCallback(
    async (product: Omit<CartItem, "quantity">, quantity = 1) => {
      const actionKey = `add-${product.id}-${
        product.variantId || "default"
      }-${Date.now()}`;

      const existingItem = localCartItems.find(
        (item) => item.id === product.id && item.variantId === product.variantId
      );

      let newCartItems: CartItem[];
      let actionData: ActionData;

      if (existingItem) {
        const newQuantity = Math.min(
          existingItem.quantity + quantity,
          existingItem.stock
        );
        const addedQuantity = newQuantity - existingItem.quantity;

        if (addedQuantity <= 0) {
          toast.warning("Maximum stock reached", {
            description: `${product.name} is already at maximum quantity`,
          });
          return;
        }

        actionData = {
          action: "add-more",
          data: {
            name: product.name,
            addedQuantity,
            totalQuantity: newQuantity,
          },
        };

        newCartItems = localCartItems.map((item) =>
          item.id === product.id && item.variantId === product.variantId
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        const addedQuantity = Math.min(quantity, product.stock);

        actionData = {
          action: "add",
          data: {
            name: product.name,
            variantName: product.variantName,
            quantity: addedQuantity,
          },
        };

        newCartItems = [
          ...localCartItems,
          { ...product, quantity: addedQuantity },
        ];
      }

      pendingActionsRef.current.set(actionKey, actionData);
      setLocalCartItems(newCartItems);

      await syncToDatabase(newCartItems, localSavedItems, actionKey);
    },
    [localCartItems, localSavedItems, syncToDatabase]
  );

  // Remove item from cart
  const removeFromCart = useCallback(
    async (productId: string, variantId?: string) => {
      const actionKey = `remove-${productId}-${
        variantId || "default"
      }-${Date.now()}`;

      const removedItem = localCartItems.find(
        (item) => item.id === productId && item.variantId === variantId
      );

      if (!removedItem) return;

      const actionData: ActionData = {
        action: "remove",
        data: { name: removedItem.name },
      };

      const newCartItems = localCartItems.filter(
        (item) => !(item.id === productId && item.variantId === variantId)
      );

      pendingActionsRef.current.set(actionKey, actionData);
      setLocalCartItems(newCartItems);

      await syncToDatabase(newCartItems, localSavedItems, actionKey);
    },
    [localCartItems, localSavedItems, syncToDatabase]
  );

  // Update item quantity
  const updateQuantity = useCallback(
    async (productId: string, quantity: number, variantId?: string) => {
      if (quantity <= 0) {
        await removeFromCart(productId, variantId);
        return;
      }

      const actionKey = `update-${productId}-${
        variantId || "default"
      }-${Date.now()}`;

      const item = localCartItems.find(
        (item) => item.id === productId && item.variantId === variantId
      );

      if (!item) return;

      const newQuantity = Math.min(quantity, item.stock);

      if (newQuantity === item.quantity) return;

      if (newQuantity >= item.stock) {
        toast.warning("Maximum stock reached", {
          description: `${item.name} is at maximum available quantity`,
        });
      }

      const actionData: ActionData = {
        action: "update",
        data: {
          name: item.name,
          quantity: newQuantity,
        },
      };

      const newCartItems = localCartItems.map((cartItem) =>
        cartItem.id === productId && cartItem.variantId === variantId
          ? { ...cartItem, quantity: newQuantity }
          : cartItem
      );

      pendingActionsRef.current.set(actionKey, actionData);
      setLocalCartItems(newCartItems);

      await syncToDatabase(newCartItems, localSavedItems, actionKey);
    },
    [localCartItems, localSavedItems, syncToDatabase, removeFromCart]
  );

  // Move item from cart to saved
  const moveToSaved = useCallback(
    async (item: CartItem) => {
      const actionKey = `move-to-saved-${item.id}-${
        item.variantId || "default"
      }-${Date.now()}`;

      const exists = localSavedItems.some(
        (saved) => saved.id === item.id && saved.variantId === item.variantId
      );

      if (exists) {
        toast.info("Already in saved items", {
          description: item.name,
        });
        return;
      }

      const actionData: ActionData = {
        action: "move-to-saved",
        data: { name: item.name },
      };

      const newCartItems = localCartItems.filter(
        (cartItem) =>
          !(cartItem.id === item.id && cartItem.variantId === item.variantId)
      );

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { quantity: _, ...savedItem } = item; // Remove quantity field
      const newSavedItems = [...localSavedItems, savedItem];

      pendingActionsRef.current.set(actionKey, actionData);
      setLocalCartItems(newCartItems);
      setLocalSavedItems(newSavedItems);

      await syncToDatabase(newCartItems, newSavedItems, actionKey);
    },
    [localCartItems, localSavedItems, syncToDatabase]
  );

  // Move item from saved to cart
  const moveToCart = useCallback(
    async (item: SavedItem) => {
      const actionKey = `move-to-cart-${item.id}-${
        item.variantId || "default"
      }-${Date.now()}`;

      const actionData: ActionData = {
        action: "move-to-cart",
        data: { name: item.name },
      };

      const newSavedItems = localSavedItems.filter(
        (savedItem) =>
          !(savedItem.id === item.id && savedItem.variantId === item.variantId)
      );

      const existingCartItem = localCartItems.find(
        (cartItem) =>
          cartItem.id === item.id && cartItem.variantId === item.variantId
      );

      let newCartItems: CartItem[];

      if (existingCartItem) {
        newCartItems = localCartItems.map((cartItem) =>
          cartItem.id === item.id && cartItem.variantId === item.variantId
            ? {
                ...cartItem,
                quantity: Math.min(cartItem.quantity + 1, cartItem.stock),
              }
            : cartItem
        );
      } else {
        newCartItems = [...localCartItems, { ...item, quantity: 1 }];
      }

      pendingActionsRef.current.set(actionKey, actionData);
      setLocalSavedItems(newSavedItems);
      setLocalCartItems(newCartItems);

      await syncToDatabase(newCartItems, newSavedItems, actionKey);
    },
    [localCartItems, localSavedItems, syncToDatabase]
  );

  // Remove item from saved
  const removeSaved = useCallback(
    async (productId: string, variantId?: string) => {
      const actionKey = `remove-saved-${productId}-${
        variantId || "default"
      }-${Date.now()}`;

      const removedItem = localSavedItems.find(
        (item) => item.id === productId && item.variantId === variantId
      );

      if (!removedItem) return;

      const actionData: ActionData = {
        action: "remove-saved",
        data: { name: removedItem.name },
      };

      const newSavedItems = localSavedItems.filter(
        (item) => !(item.id === productId && item.variantId === variantId)
      );

      pendingActionsRef.current.set(actionKey, actionData);
      setLocalSavedItems(newSavedItems);

      await syncToDatabase(localCartItems, newSavedItems, actionKey);
    },
    [localCartItems, localSavedItems, syncToDatabase]
  );

  // Clear entire cart
  const clearCart = useCallback(async () => {
    const actionKey = `clear-${Date.now()}`;
    const itemCount = localCartItems.length;

    if (itemCount === 0) return;

    const actionData: ActionData = {
      action: "clear",
      data: { count: itemCount },
    };

    pendingActionsRef.current.set(actionKey, actionData);
    setLocalCartItems([]);

    await syncToDatabase([], localSavedItems, actionKey);
  }, [localCartItems, localSavedItems, syncToDatabase]);

  // Check if item is in cart
  const isInCart = useCallback(
    (productId: string, variantId?: string) => {
      return localCartItems.some(
        (item) => item.id === productId && item.variantId === variantId
      );
    },
    [localCartItems]
  );

  // Get quantity of specific item in cart
  const getCartItemQuantity = useCallback(
    (productId: string, variantId?: string) => {
      const item = localCartItems.find(
        (item) => item.id === productId && item.variantId === variantId
      );
      return item ? item.quantity : 0;
    },
    [localCartItems]
  );

  // Calculate cart totals
  const cartCount = localCartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );
  const cartTotal = localCartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems: localCartItems,
        savedItems: localSavedItems,
        isLoading: swrLoading,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isInCart,
        getCartItemQuantity,
        moveToSaved,
        moveToCart,
        removeSaved,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// "use client";

// import { useUserProfile } from '@/hooks/useUserProfile';
// import { useSession } from 'next-auth/react';
// import { createContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
// import useSWR from 'swr';
// import { toast } from 'sonner';

// export interface CartItem {
//   id: string;
//   name: string;
//   price: number;
//   image: string;
//   slug: string;
//   quantity: number;
//   stock: number;
//   creator: {
//     id: string;
//     name: string;
//     isVerified: boolean;
//   };
//   variantId?: string;
//   variantName?: string;
// }

// export interface SavedItem {
//   id: string;
//   name: string;
//   price: number;
//   image: string;
//   slug: string;
//   stock: number;
//   creator: {
//     id: string;
//     name: string;
//     isVerified: boolean;
//   };
//   variantId?: string;
//   variantName?: string;
// }

// interface CartContextType {
//   cartItems: CartItem[];
//   savedItems: SavedItem[];
//   isLoading: boolean;
//   cartCount: number;
//   cartTotal: number;
//   addToCart: (product: Omit<CartItem, 'quantity'>, quantity?: number) => Promise<void>;
//   removeFromCart: (productId: string, variantId?: string) => Promise<void>;
//   updateQuantity: (productId: string, quantity: number, variantId?: string) => Promise<void>;
//   clearCart: () => Promise<void>;
//   isInCart: (productId: string, variantId?: string) => boolean;
//   getCartItemQuantity: (productId: string, variantId?: string) => number;
//   moveToSaved: (item: CartItem) => Promise<void>;
//   moveToCart: (item: SavedItem) => Promise<void>;
//   removeSaved: (productId: string, variantId?: string) => Promise<void>;
// }

// export const CartContext = createContext<CartContextType | undefined>(undefined);

// interface CartProviderProps {
//   children: ReactNode;
// }

// interface CartApiResponse {
//   cartItems: CartItem[],
//   savedItems: SavedItem[],
// }

// const fetcher = (url: string): Promise<CartApiResponse> => fetch(url).then((res) => res.json());

// export const CartProvider = ({ children }: CartProviderProps) => {
//   const { data: session, status } = useSession();
//   const [localCartItems, setLocalCartItems] = useState<CartItem[]>([]);
//   const [localSavedItems, setLocalSavedItems] = useState<SavedItem[]>([]);
//   const [,setIsLocalInitialized] = useState(false);
//   const { refetchProfile } = useUserProfile();

//   // const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
//   const lastSyncRef = useRef<{ cartItems: CartItem[], savedItems: SavedItem[] } | null>(null);
//   const pendingActionsRef = useRef<Map<string, { action: string, data: any }>>(new Map());

//   const { data, mutate, isLoading: swrLoading } = useSWR(
//     session?.user?.id ? '/api/cart' : null,
//     fetcher,
//     {
//       revalidateOnFocus: false,
//       revalidateOnReconnect: true,
//       dedupingInterval: 10000,
//     }
//   );

//   // Initialize local storage for guest users
//   useEffect(() => {
//     if (status === 'loading') return;

//     if (!session?.user?.id) {
//       try {
//         const savedCart = localStorage.getItem('cartItems');
//         const savedForLater = localStorage.getItem('savedItems');

//         if (savedCart) setLocalCartItems(JSON.parse(savedCart));
//         if (savedForLater) setLocalSavedItems(JSON.parse(savedForLater));
//       } catch (error) {
//         console.error('Error loading cart from localStorage:', error);
//       }
//       setIsLocalInitialized(true);
//     }
//   }, [session, status]);

//   // Sync SWR data with local state
//   useEffect(() => {
//     if (session?.user?.id && data?.cartItems) {
//       setLocalCartItems(data.cartItems || []);
//       setLocalSavedItems(data.savedItems || []);
//       lastSyncRef.current = {
//         cartItems: data.cartItems || [],
//         savedItems: data.savedItems || []
//       };
//       setIsLocalInitialized(true);
//     }
//   }, [data, session?.user?.id]);

//   // Sync to database with toast feedback
//   const syncToDatabase = useCallback(
//     async (cartItems: CartItem[], savedItems: SavedItem[], actionKey?: string) => {
//       if (session?.user?.id) {
//         try {
//           const response = await fetch('/api/cart', {
//             method: 'PUT',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ cartItems, savedItems }),
//           });

//           if (!response.ok) throw new Error('Sync failed');

//           lastSyncRef.current = { cartItems, savedItems };
//           await mutate();
//           await refetchProfile();

//           // Show success toast only after successful DB operation
//           if (actionKey && pendingActionsRef.current.has(actionKey)) {
//             const action = pendingActionsRef.current.get(actionKey);
//             showSuccessToast(action!);
//             pendingActionsRef.current.delete(actionKey);
//           }

//           return true;
//         } catch (error) {
//           console.error('Error syncing to database:', error);

//           // Revert on error and show error toast
//           if (lastSyncRef.current) {
//             setLocalCartItems(lastSyncRef.current.cartItems);
//             setLocalSavedItems(lastSyncRef.current.savedItems);
//           }
//           await mutate();

//           toast.error('Failed to update cart', {
//             description: 'Your changes could not be saved. Please try again.',
//           });

//           if (actionKey) pendingActionsRef.current.delete(actionKey);
//           return false;
//         }
//       } else {
//         // For guest users, save to localStorage and show toast immediately
//         try {
//           localStorage.setItem('cartItems', JSON.stringify(cartItems));
//           localStorage.setItem('savedItems', JSON.stringify(savedItems));

//           if (actionKey && pendingActionsRef.current.has(actionKey)) {
//             const action = pendingActionsRef.current.get(actionKey);
//             showSuccessToast(action!);
//             pendingActionsRef.current.delete(actionKey);
//           }
//           return true;
//         } catch (error) {
//           console.error('Error saving to localStorage:', error);
//           toast.error('Failed to save cart locally');
//           return false;
//         }
//       }
//     },
//     [session?.user?.id, mutate, refetchProfile]
//   );

//   // Show appropriate success toast based on action
//   const showSuccessToast = (action: { action: string, data: any }) => {
//     switch (action.action) {
//       case 'add':
//         toast.success('Added to cart', {
//           description: `${action.data.name}${action.data.variantName ? ` - ${action.data.variantName}` : ''} (${action.data.quantity})`,
//         });
//         break;
//       case 'add-more':
//         toast.success(`Added ${action.data.addedQuantity} more`, {
//           description: `${action.data.name} (${action.data.totalQuantity} total)`,
//         });
//         break;
//       case 'remove':
//         toast.success('Removed from cart', {
//           description: action.data.name,
//         });
//         break;
//       case 'update':
//         toast.success('Cart updated', {
//           description: `${action.data.name} quantity: ${action.data.quantity}`,
//         });
//         break;
//       case 'move-to-saved':
//         toast.success('Moved to saved items', {
//           description: action.data.name,
//         });
//         break;
//       case 'move-to-cart':
//         toast.success('Moved to cart', {
//           description: action.data.name,
//         });
//         break;
//       case 'remove-saved':
//         toast.success('Removed from saved items', {
//           description: action.data.name,
//         });
//         break;
//       case 'clear':
//         toast.success('Cart cleared', {
//           description: `Removed ${action.data.count} item${action.data.count !== 1 ? 's' : ''}`,
//         });
//         break;
//     }
//   };

//   // Add item to cart
//   const addToCart = useCallback(async (product: Omit<CartItem, 'quantity'>, quantity = 1) => {
//     const actionKey = `add-${product.id}-${product.variantId || 'default'}-${Date.now()}`;

//     let actionData: any;
//     const existingItem = localCartItems.find(
//       item => item.id === product.id && item.variantId === product.variantId
//     );

//     let newCartItems: CartItem[];

//     if (existingItem) {
//       const newQuantity = Math.min(existingItem.quantity + quantity, existingItem.stock);
//       const addedQuantity = newQuantity - existingItem.quantity;

//       if (addedQuantity <= 0) {
//         toast.warning('Maximum stock reached', {
//           description: `${product.name} is already at maximum quantity`,
//         });
//         return;
//       }

//       actionData = {
//         action: 'add-more',
//         data: {
//           name: product.name,
//           addedQuantity,
//           totalQuantity: newQuantity,
//         }
//       };

//       newCartItems = localCartItems.map(item =>
//         item.id === product.id && item.variantId === product.variantId
//           ? { ...item, quantity: newQuantity }
//           : item
//       );
//     } else {
//       const addedQuantity = Math.min(quantity, product.stock);

//       actionData = {
//         action: 'add',
//         data: {
//           name: product.name,
//           variantName: product.variantName,
//           quantity: addedQuantity,
//         }
//       };

//       newCartItems = [...localCartItems, { ...product, quantity: addedQuantity }];
//     }

//     pendingActionsRef.current.set(actionKey, actionData);
//     setLocalCartItems(newCartItems);

//     // Sync to database
//     await syncToDatabase(newCartItems, localSavedItems, actionKey);
//   }, [localCartItems, localSavedItems, syncToDatabase]);

//   // Remove item from cart
//   const removeFromCart = useCallback(async (productId: string, variantId?: string) => {
//     const actionKey = `remove-${productId}-${variantId || 'default'}-${Date.now()}`;

//     const removedItem = localCartItems.find(
//       item => item.id === productId && item.variantId === variantId
//     );

//     if (!removedItem) return;

//     const actionData = {
//       action: 'remove',
//       data: { name: removedItem.name }
//     };

//     const newCartItems = localCartItems.filter(item =>
//       !(item.id === productId && item.variantId === variantId)
//     );

//     pendingActionsRef.current.set(actionKey, actionData);
//     setLocalCartItems(newCartItems);

//     await syncToDatabase(newCartItems, localSavedItems, actionKey);
//   }, [localCartItems, localSavedItems, syncToDatabase]);

//   // Update item quantity
//   const updateQuantity = useCallback(async (productId: string, quantity: number, variantId?: string) => {
//     if (quantity <= 0) {
//       await removeFromCart(productId, variantId);
//       return;
//     }

//     const actionKey = `update-${productId}-${variantId || 'default'}-${Date.now()}`;

//     const item = localCartItems.find(
//       item => item.id === productId && item.variantId === variantId
//     );

//     if (!item) return;

//     const newQuantity = Math.min(quantity, item.stock);

//     if (newQuantity === item.quantity) return; // No change

//     if (newQuantity >= item.stock) {
//       toast.warning('Maximum stock reached', {
//         description: `${item.name} is at maximum available quantity`,
//       });
//     }

//     const actionData = {
//       action: 'update',
//       data: {
//         name: item.name,
//         quantity: newQuantity,
//       }
//     };

//     const newCartItems = localCartItems.map(cartItem =>
//       cartItem.id === productId && cartItem.variantId === variantId
//         ? { ...cartItem, quantity: newQuantity }
//         : cartItem
//     );

//     pendingActionsRef.current.set(actionKey, actionData);
//     setLocalCartItems(newCartItems);

//     await syncToDatabase(newCartItems, localSavedItems, actionKey);
//   }, [localCartItems, localSavedItems, syncToDatabase, removeFromCart]);

//   // Move item from cart to saved
//   const moveToSaved = useCallback(async (item: CartItem) => {
//     const actionKey = `move-to-saved-${item.id}-${item.variantId || 'default'}-${Date.now()}`;

//     const exists = localSavedItems.some(
//       saved => saved.id === item.id && saved.variantId === item.variantId
//     );

//     if (exists) {
//       toast.info('Already in saved items', {
//         description: item.name,
//       });
//       return;
//     }

//     const actionData = {
//       action: 'move-to-saved',
//       data: { name: item.name }
//     };

//     const newCartItems = localCartItems.filter(cartItem =>
//       !(cartItem.id === item.id && cartItem.variantId === item.variantId)
//     );

//     const { ...savedItem } = item;
//     const newSavedItems = [...localSavedItems, savedItem];

//     pendingActionsRef.current.set(actionKey, actionData);
//     setLocalCartItems(newCartItems);
//     setLocalSavedItems(newSavedItems);

//     await syncToDatabase(newCartItems, newSavedItems, actionKey);
//   }, [localCartItems, localSavedItems, syncToDatabase]);

//   // Move item from saved to cart
//   const moveToCart = useCallback(async (item: SavedItem) => {
//     const actionKey = `move-to-cart-${item.id}-${item.variantId || 'default'}-${Date.now()}`;

//     const actionData = {
//       action: 'move-to-cart',
//       data: { name: item.name }
//     };

//     const newSavedItems = localSavedItems.filter(savedItem =>
//       !(savedItem.id === item.id && savedItem.variantId === item.variantId)
//     );

//     const existingCartItem = localCartItems.find(
//       cartItem => cartItem.id === item.id && cartItem.variantId === item.variantId
//     );

//     let newCartItems: CartItem[];

//     if (existingCartItem) {
//       newCartItems = localCartItems.map(cartItem =>
//         cartItem.id === item.id && cartItem.variantId === item.variantId
//           ? { ...cartItem, quantity: Math.min(cartItem.quantity + 1, cartItem.stock) }
//           : cartItem
//       );
//     } else {
//       newCartItems = [...localCartItems, { ...item, quantity: 1 }];
//     }

//     pendingActionsRef.current.set(actionKey, actionData);
//     setLocalSavedItems(newSavedItems);
//     setLocalCartItems(newCartItems);

//     await syncToDatabase(newCartItems, newSavedItems, actionKey);
//   }, [localCartItems, localSavedItems, syncToDatabase]);

//   // Remove item from saved
//   const removeSaved = useCallback(async (productId: string, variantId?: string) => {
//     const actionKey = `remove-saved-${productId}-${variantId || 'default'}-${Date.now()}`;

//     const removedItem = localSavedItems.find(
//       item => item.id === productId && item.variantId === variantId
//     );

//     if (!removedItem) return;

//     const actionData = {
//       action: 'remove-saved',
//       data: { name: removedItem.name }
//     };

//     const newSavedItems = localSavedItems.filter(item =>
//       !(item.id === productId && item.variantId === variantId)
//     );

//     pendingActionsRef.current.set(actionKey, actionData);
//     setLocalSavedItems(newSavedItems);

//     await syncToDatabase(localCartItems, newSavedItems, actionKey);
//   }, [localCartItems, localSavedItems, syncToDatabase]);

//   // Clear entire cart
//   const clearCart = useCallback(async () => {
//     const actionKey = `clear-${Date.now()}`;
//     const itemCount = localCartItems.length;

//     if (itemCount === 0) return;

//     const actionData = {
//       action: 'clear',
//       data: { count: itemCount }
//     };

//     pendingActionsRef.current.set(actionKey, actionData);
//     setLocalCartItems([]);

//     await syncToDatabase([], localSavedItems, actionKey);
//   }, [localCartItems, localSavedItems, syncToDatabase]);

//   // Check if item is in cart
//   const isInCart = useCallback((productId: string, variantId?: string) => {
//     return localCartItems.some(item =>
//       item.id === productId && item.variantId === variantId
//     );
//   }, [localCartItems]);

//   // Get quantity of specific item in cart
//   const getCartItemQuantity = useCallback((productId: string, variantId?: string) => {
//     const item = localCartItems.find(item =>
//       item.id === productId && item.variantId === variantId
//     );
//     return item ? item.quantity : 0;
//   }, [localCartItems]);

//   // Calculate cart totals
//   const cartCount = localCartItems.reduce((total, item) => total + item.quantity, 0);
//   const cartTotal = localCartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

//   return (
//     <CartContext.Provider
//       value={{
//         cartItems: localCartItems,
//         savedItems: localSavedItems,
//         isLoading: swrLoading,
//         cartCount,
//         cartTotal,
//         addToCart,
//         removeFromCart,
//         updateQuantity,
//         clearCart,
//         isInCart,
//         getCartItemQuantity,
//         moveToSaved,
//         moveToCart,
//         removeSaved,
//       }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// };
