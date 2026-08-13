import { redirect } from "next/navigation";

export default function CategoryPage({ params }) {
  redirect(`/products?category=${params.slug}`);
}
