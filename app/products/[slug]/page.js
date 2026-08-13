import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import ProductDetailClient from "@/components/ProductDetailClient";

export const revalidate = 30;

async function getProduct(slug) {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from("products")
    .select("*, categories(name, slug)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();
  return data;
}

export async function generateMetadata({ params }) {
  const product = await getProduct(params.slug);
  return { title: product ? `${product.title} — ALNEEM` : "Product — ALNEEM" };
}

export default async function ProductPage({ params }) {
  const product = await getProduct(params.slug);
  if (!product) notFound();
  return <ProductDetailClient product={product} />;
}
