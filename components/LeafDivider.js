export default function LeafDivider({ className = "" }) {
  return (
    <div className={`flex items-center justify-center gap-4 ${className}`} aria-hidden="true">
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-gold" />
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path
          d="M14 3c3 3.5 5 7 5 10a5 5 0 01-10 0c0-3 2-6.5 5-10z"
          fill="url(#leafGrad)"
        />
        <defs>
          <linearGradient id="leafGrad" x1="9" y1="3" x2="19" y2="23" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E4C989" />
            <stop offset="1" stopColor="#9C7A3C" />
          </linearGradient>
        </defs>
      </svg>
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-gold" />
    </div>
  );
}
