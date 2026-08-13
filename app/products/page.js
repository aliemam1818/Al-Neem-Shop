import { getSupabaseServerClient } from "@/lib/supabaseServer";
import ProductCard from "@/components/ProductCard";
import LeafDivider from "@/components/LeafDivider";

export const revalidate = 30;

async function getProducts({ q, category }) {
  const supabase = getSupabaseServerClient();
  const selectClause = category ? "*, categories!inner(name, slug)" : "*, categories(name, slug)";
  let query = supabase.from("products").select(selectClause).eq("is_active", true);

  if (q) query = query.ilike("title", `%${q}%`);
  if (category) query = query.eq("categories.slug", category);

  const { data } = await query.order("created_at", { ascending: false });
  return data || [];
}

async function getCategories() {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase.from("categories").select("*");
  return data || [];
}

export default async function ProductsPage({ searchParams }) {
  const q = searchParams?.q || "";
  const category = searchParams?.category || "";
  const [products, categories] = await Promise.all([
    getProducts({ q, category }),
    getCategories(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
      <div className="text-center">
        <span className="label-eyebrow">Full Collection</span>
        <h1 className="mt-2 font-display text-4xl text-olive">
          {q ? `Results for "${q}"` : "Shop All Products"}
        </h1>
      </div>
      <LeafDivider className="my-8" />

      <div className="mb-10 flex flex-wrap justify-center gap-3">
        <a
          href="/products"
          className={`rounded-full border px-4 py-1.5 text-sm ${
            !category ? "border-olive bg-olive text-ivory" : "border-olive/20 text-olive"
          }`}
        >
          All
        </a>
        {categories.map((c) => (
          <a
            key={c.id}
            href={`/products?category=${c.slug}`}
            className={`rounded-full border px-4 py-1.5 text-sm ${
              category === c.slug ? "border-olive bg-olive text-ivory" : "border-olive/20 text-olive"
            }`}
          >
            {c.name}
          </a>
        ))}
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <p className="text-center text-sage">No products found.</p>
      )}
    </div>
  );
}
