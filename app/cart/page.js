"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { items, updateQty, removeItem, subtotal, hydrated } = useCart();

  if (hydrated && items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <h1 className="font-display text-3xl text-olive">Your cart is empty</h1>
        <p className="mt-3 text-charcoal/60">Nothing here yet — go find something you'll love.</p>
        <Link href="/products" className="btn-gold mt-8 inline-flex">Shop All Products</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-14 lg:px-8">
      <h1 className="font-display text-4xl text-olive">Your Cart</h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 divide-y divide-olive/10">
          {items.map((item) => (
            <div key={`${item.productId}-${item.variant}`} className="flex gap-4 py-6">
              <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-cream">
                {item.image && (
                  <Image src={item.image} alt={item.title} fill className="object-cover" sizes="96px" />
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-display text-lg text-olive">{item.title}</h3>
                    {item.variant && <p className="text-xs text-sage">{item.variant}</p>}
                  </div>
                  <span className="font-semibold text-charcoal">
                    ₹{(item.price * item.qty).toFixed(0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center rounded-full border border-olive/20">
                    <button
                      onClick={() => updateQty(item.productId, item.variant, item.qty - 1)}
                      className="px-3 py-1 text-olive"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.productId, item.variant, item.qty + 1)}
                      className="px-3 py-1 text-olive"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId, item.variant)}
                    className="text-xs text-charcoal/40 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card h-fit p-6">
          <h2 className="font-display text-xl text-olive">Order Summary</h2>
          <div className="mt-4 flex justify-between text-sm text-charcoal/70">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(0)}</span>
          </div>
          <p className="mt-1 text-xs text-sage">Shipping & coupons applied at checkout.</p>
          <Link href="/checkout" className="btn-gold mt-6 w-full">
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
