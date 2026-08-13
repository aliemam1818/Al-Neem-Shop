"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700",
  shipped: "bg-blue-100 text-blue-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function AccountPage() {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  useEffect(() => {
    async function fetchOrders() {
      if (!user) return;
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setOrders(data || []);
      setOrdersLoading(false);
    }
    fetchOrders();
  }, [user, supabase]);

  if (loading || !user) return <div className="px-5 py-24 text-center text-sage">Loading…</div>;

  return (
    <div className="mx-auto max-w-4xl px-5 py-14 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl text-olive">My Account</h1>
          <p className="mt-1 text-charcoal/60">{profile?.full_name || user.email} · {user.email}</p>
        </div>
        <button onClick={() => { signOut(); router.push("/"); }} className="btn-outline">
          Sign Out
        </button>
      </div>

      <h2 className="mt-12 font-display text-2xl text-olive">Order History</h2>
      {ordersLoading ? (
        <p className="mt-4 text-sage">Loading orders…</p>
      ) : orders.length === 0 ? (
        <p className="mt-4 text-sage">No orders yet.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-charcoal">{o.order_number}</p>
                  <p className="text-xs text-sage">{new Date(o.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[o.status]}`}>
                  {o.status}
                </span>
                <span className="font-semibold text-charcoal">₹{Number(o.total).toFixed(0)}</span>
              </div>
              <div className="mt-3 text-sm text-charcoal/60">
                {o.items.map((i) => i.title).join(", ")}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
