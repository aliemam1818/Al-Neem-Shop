"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loadCart, saveCart } from "@/lib/cartStorage";

const CartContext = createContext(null);

function lineKey(productId, variant) {
  return `${productId}::${variant || "default"}`;
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(loadCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveCart(items);
  }, [items, hydrated]);

  function addItem(product, qty = 1, variant = null) {
    setItems((prev) => {
      const key = lineKey(product.id, variant);
      const existing = prev.find((i) => lineKey(i.productId, i.variant) === key);
      if (existing) {
        return prev.map((i) =>
          lineKey(i.productId, i.variant) === key ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          slug: product.slug,
          title: product.title,
          price: product.price,
          image: product.images?.[0] || null,
          variant,
          qty,
        },
      ];
    });
  }

  function updateQty(productId, variant, qty) {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => lineKey(i.productId, i.variant) !== lineKey(productId, variant))
        : prev.map((i) =>
            lineKey(i.productId, i.variant) === lineKey(productId, variant) ? { ...i, qty } : i
          )
    );
  }

  function removeItem(productId, variant) {
    setItems((prev) => prev.filter((i) => lineKey(i.productId, i.variant) !== lineKey(productId, variant)));
  }

  function clearCart() {
    setItems([]);
  }

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.qty, 0),
    [items]
  );
  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items]);

  return (
    <CartContext.Provider
      value={{ items, addItem, updateQty, removeItem, clearCart, subtotal, itemCount, hydrated }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
