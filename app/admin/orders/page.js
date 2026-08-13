"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

const STATUSES = ["pending", "shipped", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const supabase = getSupabaseBrowserClient();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState("");

  async function load() {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(order, status) {
    await supabase.from("orders").update({ status }).eq("id", order.id);
    load();
  }

  const filtered = filter ? orders.filter((o) => o.status === filter) : orders;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-4xl text-olive">Orders</h1>
        <select className="input-field w-48" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <p className="mt-8 text-sage">Loading…</p>
      ) : (
        <div className="mt-8 space-y-3">
          {filtered.map((o) => (
            <div key={o.id} className="card p-5">
              <button
                onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                className="flex w-full flex-wrap items-center justify-between gap-2 text-left"
              >
                <span className="font-semibold text-charcoal">{o.order_number}</span>
                <span className="text-sm text-charcoal/60">{o.customer_name}</span>
                <span className="text-sm text-sage">{new Date(o.created_at).toLocaleString()}</span>
                <span className="font-semibold text-charcoal">₹{Number(o.total).toFixed(0)}</span>
                <select
                  value={o.status}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => updateStatus(o, e.target.value)}
                  className="input-field w-36 py-1.5 text-xs"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </button>

              {expanded === o.id && (
                <div className="mt-4 grid gap-6 border-t border-olive/10 pt-4 sm:grid-cols-2 text-sm">
                  <div>
                    <h4 className="mb-2 font-semibold text-olive">Customer</h4>
                    <p>{o.customer_name}</p>
                    <p>{o.customer_email}</p>
                    <p>{o.customer_phone}</p>
                    <h4 className="mb-2 mt-4 font-semibold text-olive">Shipping Address</h4>
                    <p>{o.shipping_address.line1}{o.shipping_address.line2 ? `, ${o.shipping_address.line2}` : ""}</p>
                    <p>{o.shipping_address.city}, {o.shipping_address.state} {o.shipping_address.postal_code}</p>
                    <p>{o.shipping_address.country}</p>
                  </div>
                  <div>
                    <h4 className="mb-2 font-semibold text-olive">Items</h4>
                    {o.items.map((i, idx) => (
                      <div key={idx} className="flex justify-between text-charcoal/70">
                        <span>{i.title}{i.variant ? ` (${i.variant})` : ""} × {i.qty}</span>
                        <span>₹{(i.price * i.qty).toFixed(0)}</span>
                      </div>
                    ))}
                    <div className="mt-3 space-y-1 border-t border-olive/10 pt-2">
                      <div className="flex justify-between"><span>Subtotal</span><span>₹{Number(o.subtotal).toFixed(0)}</span></div>
                      {o.discount > 0 && (
                        <div className="flex justify-between text-gold-dark">
                          <span>Discount {o.coupon_code ? `(${o.coupon_code})` : ""}</span>
                          <span>-₹{Number(o.discount).toFixed(0)}</span>
                        </div>
                      )}
                      <div className="flex justify-between"><span>Shipping</span><span>₹{Number(o.shipping_fee).toFixed(0)}</span></div>
                      <div className="flex justify-between font-semibold"><span>Total</span><span>₹{Number(o.total).toFixed(0)}</span></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
