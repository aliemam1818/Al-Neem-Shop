"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import ProductForm from "@/components/admin/ProductForm";

export default function EditProductPage() {
  const { id } = useParams();
  const supabase = getSupabaseBrowserClient();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("products").select("*").eq("id", id).single().then(({ data }) => {
      setProduct(data);
      setLoading(false);
    });
  }, [id, supabase]);

  if (loading) return <p className="text-sage">Loading…</p>;
  if (!product) return <p className="text-red-600">Product not found.</p>;

  return (
    <div>
      <h1 className="font-display text-4xl text-olive">Edit Product</h1>
      <div className="mt-8">
        <ProductForm product={product} />
      </div>
    </div>
  );
}
