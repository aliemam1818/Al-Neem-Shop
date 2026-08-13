"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

export default function AdminProductsPage() {
  const supabase = getSupabaseBrowserClient();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    setProducts(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function toggleActive(product) {
    await supabase.from("products").update({ is_active: !product.is_active }).eq("id", product.id);
    load();
  }

  async function deleteProduct(product) {
    if (!confirm(`Delete "${product.title}" permanently?`)) return;
    await supabase.from("products").delete().eq("id", product.id);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl text-olive">Products</h1>
        <Link href="/admin/products/new" className="btn-gold">+ New Product</Link>
      </div>

      {loading ? (
        <p className="mt-8 text-sage">Loading…</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-olive/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-cream text-olive">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-olive/10">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="flex items-center gap-3 p-4">
                    <div className="h-10 w-10 overflow-hidden rounded-lg bg-cream">
                      {p.images?.[0] && <img src={p.images[0]} alt="" className="h-full w-full object-cover" />}
                    </div>
                    {p.title}
                  </td>
                  <td className="p-4">₹{Number(p.price).toFixed(0)}</td>
                  <td className="p-4">{p.stock}</td>
                  <td className="p-4">
                    <span className={`rounded-full px-3 py-1 text-xs ${p.is_active ? "bg-green-100 text-green-700" : "bg-charcoal/10 text-charcoal/50"}`}>
                      {p.is_active ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="p-4 space-x-3">
                    <Link href={`/admin/products/${p.id}/edit`} className="text-gold-dark">Edit</Link>
                    <button onClick={() => toggleActive(p)} className="text-charcoal/60">
                      {p.is_active ? "Disable" : "Enable"}
                    </button>
                    <button onClick={() => deleteProduct(p)} className="text-red-600">Delete</button>
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
