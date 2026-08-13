"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ProductForm({ product }) {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const isEdit = Boolean(product);

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: product?.title || "",
    description: product?.description || "",
    category_id: product?.category_id || "",
    price: product?.price || "",
    compare_at_price: product?.compare_at_price || "",
    stock: product?.stock ?? 0,
    is_active: product?.is_active ?? true,
    is_featured: product?.is_featured ?? false,
  });
  const [images, setImages] = useState(product?.images || []);
  const [newFiles, setNewFiles] = useState([]);
  const [variantName, setVariantName] = useState(product?.variants?.[0]?.name || "");
  const [variantOptions, setVariantOptions] = useState(
    product?.variants?.[0]?.options?.join(", ") || ""
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.from("categories").select("*").then(({ data }) => setCategories(data || []));
  }, [supabase]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function removeImage(url) {
    setImages((imgs) => imgs.filter((i) => i !== url));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setUploading(true);
    try {
      // Upload any newly selected files
      const uploadedUrls = [];
      for (const file of newFiles) {
        const path = `${Date.now()}-${slugify(file.name)}`;
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(path, file);
        if (uploadError) throw uploadError;
        const { data: pub } = supabase.storage.from("product-images").getPublicUrl(path);
        uploadedUrls.push(pub.publicUrl);
      }

      const finalImages = [...images, ...uploadedUrls];
      const variants =
        variantName && variantOptions
          ? [{ name: variantName, options: variantOptions.split(",").map((o) => o.trim()).filter(Boolean) }]
          : [];

      const payload = {
        title: form.title,
        slug: isEdit ? product.slug : slugify(form.title),
        description: form.description,
        category_id: form.category_id || null,
        price: Number(form.price),
        compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
        stock: Number(form.stock),
        images: finalImages,
        variants,
        is_active: form.is_active,
        is_featured: form.is_featured,
        updated_at: new Date().toISOString(),
      };

      if (isEdit) {
        const { error: updateError } = await supabase.from("products").update(payload).eq("id", product.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from("products").insert(payload);
        if (insertError) throw insertError;
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="card space-y-4 p-6">
        <input required placeholder="Product Title" className="input-field"
          value={form.title} onChange={(e) => update("title", e.target.value)} />
        <textarea required placeholder="Description" rows={4} className="input-field"
          value={form.description} onChange={(e) => update("description", e.target.value)} />
        <div className="grid gap-4 sm:grid-cols-2">
          <select className="input-field" value={form.category_id}
            onChange={(e) => update("category_id", e.target.value)}>
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input type="number" min="0" placeholder="Stock" className="input-field"
            value={form.stock} onChange={(e) => update("stock", e.target.value)} />
          <input required type="number" step="0.01" min="0" placeholder="Price (₹)" className="input-field"
            value={form.price} onChange={(e) => update("price", e.target.value)} />
          <input type="number" step="0.01" min="0" placeholder="Compare-at Price (₹, optional)" className="input-field"
            value={form.compare_at_price} onChange={(e) => update("compare_at_price", e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <input placeholder="Variant name (e.g. Size)" className="input-field"
            value={variantName} onChange={(e) => setVariantName(e.target.value)} />
          <input placeholder="Options, comma separated (e.g. 50g, 100g)" className="input-field"
            value={variantOptions} onChange={(e) => setVariantOptions(e.target.value)} />
        </div>
        <div className="flex gap-6 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.is_active} onChange={(e) => update("is_active", e.target.checked)} />
            Active (visible in store)
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.is_featured} onChange={(e) => update("is_featured", e.target.checked)} />
            Featured on homepage
          </label>
        </div>
      </div>

      <div className="card space-y-4 p-6">
        <h3 className="font-display text-lg text-olive">Product Photos</h3>
        {images.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {images.map((url) => (
              <div key={url} className="relative h-20 w-20 overflow-hidden rounded-lg border border-olive/10">
                <img src={url} alt="" className="h-full w-full object-cover" />
                <button type="button" onClick={() => removeImage(url)}
                  className="absolute right-0 top-0 bg-charcoal/70 px-1.5 text-xs text-white">✕</button>
              </div>
            ))}
          </div>
        )}
        <input type="file" multiple accept="image/*"
          onChange={(e) => setNewFiles(Array.from(e.target.files))}
          className="text-sm" />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={uploading} className="btn-gold">
        {uploading ? "Saving…" : isEdit ? "Save Changes" : "Create Product"}
      </button>
    </form>
  );
}
