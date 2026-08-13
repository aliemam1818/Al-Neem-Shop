import Link from "next/link";
import Image from "next/image";

export default function ProductCard({ product }) {
  const img = product.images?.[0];
  const onSale = product.compare_at_price && product.compare_at_price > product.price;

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-cream">
        {img ? (
          <Image
            src={img}
            alt={product.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sage">No image</div>
        )}
        {onSale && (
          <span className="absolute left-3 top-3 rounded-full bg-gold px-3 py-1 text-[11px] font-semibold text-white">
            Sale
          </span>
        )}
        {product.stock <= 0 && (
          <span className="absolute inset-0 flex items-center justify-center bg-charcoal/50 text-sm text-white">
            Out of stock
          </span>
        )}
      </div>
      <div className="mt-3">
        <h3 className="font-display text-lg text-olive">{product.title}</h3>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm font-semibold text-charcoal">₹{Number(product.price).toFixed(0)}</span>
          {onSale && (
            <span className="text-xs text-charcoal/40 line-through">
              ₹{Number(product.compare_at_price).toFixed(0)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
