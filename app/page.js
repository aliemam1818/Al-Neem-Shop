import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import ProductCard from "@/components/ProductCard";
import LeafDivider from "@/components/LeafDivider";

export const revalidate = 60;

async function getFeatured() {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .eq("is_featured", true)
    .limit(8);
  return data || [];
}

async function getCategories() {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase.from("categories").select("*").limit(3);
  return data || [];
}

export default async function HomePage() {
  const [featured, categories] = await Promise.all([getFeatured(), getCategories()]);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-olive text-ivory">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 lg:grid-cols-2 lg:px-8 lg:py-28">
          <div>
            <span className="label-eyebrow text-gold-light">Ayurvedic Skincare</span>
            <h1 className="mt-4 font-display text-5xl leading-tight text-ivory lg:text-6xl">
              Rooted in Nature,<br /> Made for Your Skin
            </h1>
            <p className="mt-6 max-w-md text-ivory/70">
              ALNEEM blends Neem, Aloe Vera and time-tested herbs into formulas that calm,
              protect, and restore — gentle enough for everyday use.
            </p>
            <div className="mt-8 flex gap-4">
              <Link href="/products" className="btn-gold">Shop the Collection</Link>
              <Link href="/categories/skincare" className="btn-outline border-ivory/30 text-ivory hover:bg-ivory/10 hover:border-ivory">
                Explore Skincare
              </Link>
            </div>
          </div>
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm">
            <div
              className="h-full w-full bg-gradient-to-b from-gold/30 to-transparent"
              style={{ borderRadius: "50% 50% 0 0 / 60% 60% 0 0" }}
            >
              <div className="flex h-full items-center justify-center">
                <span className="font-display text-8xl text-gold-light/40">ॐ</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BADGES */}
      <section className="border-b border-olive/10 bg-cream">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-5 py-8 text-center text-sm text-olive md:grid-cols-4 lg:px-8">
          {["Natural Ingredients", "Ayurvedic Formula", "Soothes & Calms Skin", "Safe for Daily Use"].map((t) => (
            <div key={t} className="flex flex-col items-center gap-2">
              <span className="text-gold text-xl">❧</span>
              <span className="tracking-wide">{t}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="text-center">
          <span className="label-eyebrow">Featured</span>
          <h2 className="mt-2 font-display text-4xl text-olive">Best Loved Formulas</h2>
        </div>
        <LeafDivider className="my-8" />
        {featured.length > 0 ? (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="text-center text-sage">
            No featured products yet — add some from the Admin Dashboard.
          </p>
        )}
      </section>

      {/* CATEGORIES */}
      {categories.length > 0 && (
        <section className="bg-cream py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="text-center">
              <span className="label-eyebrow">Browse</span>
              <h2 className="mt-2 font-display text-4xl text-olive">Shop by Category</h2>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/categories/${c.slug}`}
                  className="group relative flex h-48 items-end overflow-hidden rounded-2xl bg-olive p-6"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 to-transparent transition group-hover:from-charcoal/85" />
                  <span className="relative font-display text-2xl text-ivory">{c.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
