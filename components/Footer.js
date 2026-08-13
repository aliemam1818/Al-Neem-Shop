import Link from "next/link";
import LeafDivider from "./LeafDivider";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-olive/10 bg-olive text-ivory/80">
      <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="text-center">
          <div className="font-display text-2xl tracking-[0.2em] text-gold-light">ALNEEM</div>
          <p className="mt-2 text-sm text-ivory/60">Goodness of Neem — trusted by nature, made for you.</p>
        </div>
        <LeafDivider className="my-8 opacity-60" />
        <div className="grid grid-cols-2 gap-8 text-sm md:grid-cols-4">
          <div>
            <h4 className="mb-3 text-gold-light">Shop</h4>
            <ul className="space-y-2 text-ivory/60">
              <li><Link href="/products">All Products</Link></li>
              <li><Link href="/categories/skincare">Skincare</Link></li>
              <li><Link href="/categories/hair-care">Hair Care</Link></li>
              <li><Link href="/categories/wellness">Wellness</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-gold-light">Account</h4>
            <ul className="space-y-2 text-ivory/60">
              <li><Link href="/login">Sign In</Link></li>
              <li><Link href="/signup">Create Account</Link></li>
              <li><Link href="/account">Order History</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-gold-light">Support</h4>
            <ul className="space-y-2 text-ivory/60">
              <li>alneemcare@gmail.com</li>
              <li>Mon–Sat, 10am–6pm</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-gold-light">Promise</h4>
            <ul className="space-y-2 text-ivory/60">
              <li>Made with natural extracts</li>
              <li>Ayurvedic formula</li>
              <li>Safe for daily use</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 text-center text-xs text-ivory/40">
          © {new Date().getFullYear()} ALNEEM. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
