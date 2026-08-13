"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "◆" },
  { href: "/admin/products", label: "Products", icon: "❧" },
  { href: "/admin/coupons", label: "Coupons", icon: "%" },
  { href: "/admin/orders", label: "Orders", icon: "▤" },
  { href: "/admin/settings", label: "Settings", icon: "⚙" },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();

  if (pathname === "/admin/login") return children;

  return (
    <div className="mx-auto flex max-w-7xl gap-8 px-5 py-10 lg:px-8">
      <aside className="hidden w-56 flex-shrink-0 lg:block">
        <div className="font-display text-xl text-olive">ALNEEM Admin</div>
        <nav className="mt-8 space-y-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                pathname === item.href
                  ? "bg-olive text-ivory"
                  : "text-charcoal/70 hover:bg-cream"
              }`}
            >
              <span className="text-gold">{item.icon}</span> {item.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={async () => { await signOut(); router.push("/"); }}
          className="mt-8 text-sm text-charcoal/50 hover:text-red-600"
        >
          Sign out
        </button>
      </aside>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
