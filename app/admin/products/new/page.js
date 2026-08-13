import ProductForm from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="font-display text-4xl text-olive">New Product</h1>
      <div className="mt-8">
        <ProductForm />
      </div>
    </div>
  );
}
