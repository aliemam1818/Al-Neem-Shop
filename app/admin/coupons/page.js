"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

export default function AdminCouponsPage() {
  const supabase = getSupabaseBrowserClient();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    code: "",
    discount_type: "percentage",
    discount_value: "",
    min_order_amount: "",
    max_uses: "",
    expires_at: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    setCoupons(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const { error } = await supabase.from("coupons").insert({
      code: form.code.trim().toUpperCase(),
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      min_order_amount: form.min_order_amount ? Number(form.min_order_amount) : 0,
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
    });
    setSaving(false);
    if (error) return setError(error.message);
    setForm({ code: "", discount_type: "percentage", discount_value: "", min_order_amount: "", max_uses: "", expires_at: "" });
    load();
  }

  async function toggleActive(coupon) {
    await supabase.from("coupons").update({ is_active: !coupon.is_active }).eq("id", coupon.id);
    load();
  }

  return (
    <div>
      <h1 className="font-display text-4xl text-olive">Coupons</h1>

      <form onSubmit={handleSubmit} className="card mt-8 grid gap-4 p-6 sm:grid-cols-2">
        <input required placeholder="Code (e.g. WELCOME10)" className="input-field"
          value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
        <select className="input-field" value={form.discount_type}
          onChange={(e) => setForm({ ...form, discount_type: e.target.value })}>
          <option value="percentage">Percentage off</option>
          <option value="flat">Flat amount off (₹)</option>
        </select>
        <input required type="number" step="0.01" placeholder="Discount value" className="input-field"
          value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} />
        <input type="number" step="0.01" placeholder="Minimum order amount (₹, optional)" className="input-field"
          value={form.min_order_amount} onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })} />
        <input type="number" placeholder="Max uses (optional)" className="input-field"
          value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} />
        <input type="date" className="input-field"
          value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
        {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
        <button type="submit" disabled={saving} className="btn-gold sm:col-span-2">
          {saving ? "Creating…" : "Create Coupon"}
        </button>
      </form>

      {loading ? (
        <p className="mt-8 text-sage">Loading…</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-olive/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-cream text-olive">
              <tr>
                <th className="p-4">Code</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Used</th>
                <th className="p-4">Expires</th>
                <th className="p-4">Status</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-olive/10">
              {coupons.map((c) => (
                <tr key={c.id}>
                  <td className="p-4 font-semibold">{c.code}</td>
                  <td className="p-4">
                    {c.discount_type === "percentage" ? `${c.discount_value}%` : `₹${c.discount_value}`}
                  </td>
                  <td className="p-4">{c.used_count}{c.max_uses ? ` / ${c.max_uses}` : ""}</td>
                  <td className="p-4">{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "—"}</td>
                  <td className="p-4">
                    <span className={`rounded-full px-3 py-1 text-xs ${c.is_active ? "bg-green-100 text-green-700" : "bg-charcoal/10 text-charcoal/50"}`}>
                      {c.is_active ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="p-4">
                    <button onClick={() => toggleActive(c)} className="text-gold-dark">
                      {c.is_active ? "Disable" : "Enable"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
