"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

function StatCard({ label, value, sub }) {
  return (
    <div className="card p-6">
      <p className="label-eyebrow">{label}</p>
      <p className="mt-2 font-display text-3xl text-olive">{value}</p>
      {sub && <p className="mt-1 text-xs text-sage">{sub}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const supabase = getSupabaseBrowserClient();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      setOrders(data || []);
      setLoading(false);
    }
    load();
  }, [supabase]);

  if (loading) return <p className="text-sage">Loading analytics…</p>;

  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + Number(o.total), 0);
  const orderCount = orders.length;
  const pendingCount = orders.filter((o) => o.status === "pending").length;

  const salesByProduct = {};
  orders.forEach((o) => {
    (o.items || []).forEach((i) => {
      salesByProduct[i.title] = (salesByProduct[i.title] || 0) + i.qty;
    });
  });
  const bestSellers = Object.entries(salesByProduct)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div>
      <h1 className="font-display text-4xl text-olive">Dashboard</h1>
      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        <StatCard label="Total Revenue" value={`₹${totalRevenue.toFixed(0)}`} />
        <StatCard label="Total Orders" value={orderCount} />
        <StatCard label="Pending Orders" value={pendingCount} sub="Awaiting fulfilment" />
      </div>

      <div className="mt-10 card p-6">
        <h2 className="font-display text-xl text-olive">Best-Selling Products</h2>
        {bestSellers.length === 0 ? (
          <p className="mt-4 text-sage">No sales yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {bestSellers.map(([title, qty]) => (
              <div key={title} className="flex items-center justify-between text-sm">
                <span className="text-charcoal">{title}</span>
                <span className="text-gold-dark font-semibold">{qty} sold</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-10 card p-6">
        <h2 className="font-display text-xl text-olive">Recent Orders</h2>
        <div className="mt-4 divide-y divide-olive/10">
          {orders.slice(0, 8).map((o) => (
            <div key={o.id} className="flex items-center justify-between py-3 text-sm">
              <span className="font-medium text-charcoal">{o.order_number}</span>
              <span className="text-charcoal/60">{o.customer_name}</span>
              <span className="capitalize text-sage">{o.status}</span>
              <span className="font-semibold text-charcoal">₹{Number(o.total).toFixed(0)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
