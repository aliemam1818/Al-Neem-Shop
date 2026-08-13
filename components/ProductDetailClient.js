"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function ProductDetailClient({ product }) {
  const { addItem } = useCart();
  const router = useRouter();
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [variant, setVariant] = useState(
    product.variants?.[0]?.options?.[0] || null
  );
  const [added, setAdded] = useState(false);

  const onSale = product.compare_at_price && product.compare_at_price > product.price;
  const inStock = product.stock > 0;

  function handleAddToCart() {
    addItem(product, qty, variant);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleBuyNow() {
    addItem(product, qty, variant);
    router.push("/cart");
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Images */}
        <div>
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-cream">
            {product.images?.[activeImg] ? (
              <Image
                src={product.images[activeImg]}
                alt={product.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sage">No image</div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="mt-4 flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={img + i}
                  onClick={() => setActiveImg(i)}
                  className={`relative h-16 w-16 overflow-hidden rounded-lg border-2 ${
                    activeImg === i ? "border-gold" : "border-transparent"
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <span className="label-eyebrow">{product.categories?.name}</span>
          <h1 className="mt-2 font-display text-4xl text-olive">{product.title}</h1>
          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-semibold text-charcoal">₹{Number(product.price).toFixed(0)}</span>
            {onSale && (
              <span className="text-base text-charcoal/40 line-through">
                ₹{Number(product.compare_at_price).toFixed(0)}
              </span>
            )}
          </div>
          <p className="mt-6 leading-relaxed text-charcoal/70">{product.description}</p>

          {product.variants?.map((v) => (
            <div key={v.name} className="mt-6">
              <span className="text-sm font-semibold text-olive">{v.name}</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {v.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setVariant(opt)}
                    className={`rounded-full border px-4 py-1.5 text-sm ${
                      variant === opt
                        ? "border-olive bg-olive text-ivory"
                        : "border-olive/20 text-olive"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center rounded-full border border-olive/20">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-4 py-2 text-olive"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="w-8 text-center">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                className="px-4 py-2 text-olive"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <span className="text-sm text-sage">
              {inStock ? `${product.stock} in stock` : "Out of stock"}
            </span>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button onClick={handleAddToCart} disabled={!inStock} className="btn-outline flex-1">
              {added ? "Added ✓" : "Add to Cart"}
            </button>
            <button onClick={handleBuyNow} disabled={!inStock} className="btn-gold flex-1">
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
