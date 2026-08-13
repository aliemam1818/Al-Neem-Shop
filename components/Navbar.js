"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { itemCount } = useCart();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  function handleSearch(e) {
    e.preventDefault();
    if (query.trim()) router.push(`/products?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-olive/10 bg-ivory/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 lg:px-8">
        <button
          className="lg:hidden text-olive"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>

        <Link href="/" className="flex items-center gap-2">
          <Image src="/images/alneem-logo.png" alt="ALNEEM" width={36} height={36} className="h-9 w-9 object-contain" />
          <span className="font-display text-2xl tracking-[0.15em] text-olive">ALNEEM</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8 text-sm tracking-wide text-olive">
          <Link href="/products" className="hover:text-gold-dark transition">Shop All</Link>
          <Link href="/categories/skincare" className="hover:text-gold-dark transition">Skincare</Link>
          <Link href="/categories/hair-care" className="hover:text-gold-dark transition">Hair Care</Link>
          <Link href="/categories/wellness" className="hover:text-gold-dark transition">Wellness</Link>
        </nav>

        <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-xs">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="input-field py-2 text-xs"
          />
        </form>

        <div className="flex items-center gap-5">
          <Link href="/cart" className="relative text-olive" aria-label="Cart">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 6h15l-1.5 9h-12z" />
              <path d="M6 6L4.5 3H2" />
              <circle cx="9" cy="20" r="1" />
              <circle cx="17" cy="20" r="1" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-semibold text-white">
                {itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative group">
              <Link href="/account" className="text-sm text-olive hover:text-gold-dark">Account</Link>
            </div>
          ) : (
            <Link href="/login" className="text-sm text-olive hover:text-gold-dark">Sign in</Link>
          )}
        </div>
      </div>

      {menuOpen && (
        <nav className="lg:hidden flex flex-col gap-3 border-t border-olive/10 bg-ivory px-5 py-4 text-sm text-olive">
          <Link href="/products" onClick={() => setMenuOpen(false)}>Shop All</Link>
          <Link href="/categories/skincare" onClick={() => setMenuOpen(false)}>Skincare</Link>
          <Link href="/categories/hair-care" onClick={() => setMenuOpen(false)}>Hair Care</Link>
          <Link href="/categories/wellness" onClick={() => setMenuOpen(false)}>Wellness</Link>
          <form onSubmit={handleSearch} className="pt-2">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              className="input-field text-xs"
            />
          </form>
        </nav>
      )}
    </header>
  );
}
