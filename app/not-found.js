import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-5 py-32 text-center">
      <span className="font-display text-6xl text-gold-dark">404</span>
      <h1 className="mt-4 font-display text-3xl text-olive">Page Not Found</h1>
      <p className="mt-3 text-charcoal/60">
        The page you're looking for doesn't exist or has moved.
      </p>
      <Link href="/" className="btn-gold mt-8 inline-flex">Back to Home</Link>
    </div>
  );
}
