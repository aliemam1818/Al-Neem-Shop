import Link from "next/link";
import LeafDivider from "@/components/LeafDivider";

export default function OrderConfirmationPage({ searchParams }) {
  const orderNumber = searchParams?.order;

  return (
    <div className="mx-auto max-w-lg px-5 py-24 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold-gradient text-2xl text-white">
        ✓
      </div>
      <h1 className="mt-6 font-display text-4xl text-olive">Order Confirmed</h1>
      <p className="mt-3 text-charcoal/60">
        Thank you — your order has been placed and a confirmation has been sent to your email.
      </p>
      {orderNumber && (
        <p className="mt-4 font-display text-xl text-gold-dark">Order #{orderNumber}</p>
      )}
      <LeafDivider className="my-8" />
      <div className="flex justify-center gap-4">
        <Link href="/products" className="btn-outline">Continue Shopping</Link>
        <Link href="/account" className="btn-gold">View Orders</Link>
      </div>
    </div>
  );
}
