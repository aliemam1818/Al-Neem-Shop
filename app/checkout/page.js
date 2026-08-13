"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    customerName: "",
    customerEmail: user?.email || "",
    customerPhone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
    paymentMethod: "cod",
  });
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.customerName,
          customerEmail: form.customerEmail,
          customerPhone: form.customerPhone,
          shippingAddress: {
            line1: form.line1,
            line2: form.line2,
            city: form.city,
            state: form.state,
            postal_code: form.postal_code,
            country: form.country,
          },
          items: items.map((i) => ({ productId: i.productId, qty: i.qty, variant: i.variant })),
          couponCode: couponCode || null,
          paymentMethod: form.paymentMethod,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");

      clearCart();
      router.push(`/order-confirmation?order=${data.order.order_number}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <h1 className="font-display text-3xl text-olive">Your cart is empty</h1>
        <a href="/products" className="btn-gold mt-8 inline-flex">Shop All Products</a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 lg:px-8">
      <h1 className="font-display text-4xl text-olive">Checkout</h1>

      <form onSubmit={handleSubmit} className="mt-10 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <section className="card p-6">
            <h2 className="font-display text-xl text-olive">Contact Details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <input required placeholder="Full Name" className="input-field sm:col-span-2"
                value={form.customerName} onChange={(e) => update("customerName", e.target.value)} />
              <input required type="email" placeholder="Email" className="input-field"
                value={form.customerEmail} onChange={(e) => update("customerEmail", e.target.value)} />
              <input required type="tel" placeholder="Phone Number" className="input-field"
                value={form.customerPhone} onChange={(e) => update("customerPhone", e.target.value)} />
            </div>
          </section>

          <section className="card p-6">
            <h2 className="font-display text-xl text-olive">Shipping Address</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <input required placeholder="Address Line 1" className="input-field sm:col-span-2"
                value={form.line1} onChange={(e) => update("line1", e.target.value)} />
              <input placeholder="Address Line 2 (optional)" className="input-field sm:col-span-2"
                value={form.line2} onChange={(e) => update("line2", e.target.value)} />
              <input required placeholder="City" className="input-field"
                value={form.city} onChange={(e) => update("city", e.target.value)} />
              <input required placeholder="State" className="input-field"
                value={form.state} onChange={(e) => update("state", e.target.value)} />
              <input required placeholder="Postal Code" className="input-field"
                value={form.postal_code} onChange={(e) => update("postal_code", e.target.value)} />
              <input required placeholder="Country" className="input-field"
                value={form.country} onChange={(e) => update("country", e.target.value)} />
            </div>
          </section>

          <section className="card p-6">
            <h2 className="font-display text-xl text-olive">Payment Method</h2>
            <div className="mt-4 space-y-3">
              <label className="flex items-center gap-3 rounded-lg border border-olive/20 p-3">
                <input type="radio" name="pay" checked={form.paymentMethod === "cod"}
                  onChange={() => update("paymentMethod", "cod")} />
                Cash on Delivery
              </label>
              <label className="flex items-center gap-3 rounded-lg border border-olive/20 p-3 opacity-60">
                <input type="radio" name="pay" checked={form.paymentMethod === "online"}
                  onChange={() => update("paymentMethod", "online")} />
                Pay Online (connect Razorpay/Stripe to enable)
              </label>
            </div>
          </section>
        </div>

        <div className="card h-fit space-y-4 p-6">
          <h2 className="font-display text-xl text-olive">Order Summary</h2>
          <div className="space-y-2 text-sm">
            {items.map((i) => (
              <div key={`${i.productId}-${i.variant}`} className="flex justify-between text-charcoal/70">
                <span>{i.title} × {i.qty}</span>
                <span>₹{(i.price * i.qty).toFixed(0)}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input placeholder="Coupon code" className="input-field flex-1"
              value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
          </div>
          <div className="border-t border-olive/10 pt-4 flex justify-between font-semibold text-charcoal">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(0)}</span>
          </div>
          <p className="text-xs text-sage">Discount & final shipping calculated on confirmation.</p>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="btn-gold w-full">
            {loading ? "Placing Order…" : "Place Order"}
          </button>
        </div>
      </form>
    </div>
  );
}
