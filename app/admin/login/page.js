"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

export default function AdminLoginPage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(params.get("denied") ? "That account doesn't have admin access." : "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setError(error.message);
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-olive px-5">
      <div className="w-full max-w-sm rounded-2xl bg-ivory p-8 shadow-card">
        <div className="text-center font-display text-2xl tracking-widest text-olive">ALNEEM</div>
        <p className="mt-1 text-center text-xs uppercase tracking-widest text-gold-dark">Admin Portal</p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input required type="email" placeholder="Admin email" className="input-field"
            value={email} onChange={(e) => setEmail(e.target.value)} />
          <input required type="password" placeholder="Password" className="input-field"
            value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
