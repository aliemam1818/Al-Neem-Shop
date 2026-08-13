"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

export default function LoginPage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setError(error.message);
    router.push("/account");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <h1 className="text-center font-display text-4xl text-olive">Sign In</h1>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <input required type="email" placeholder="Email" className="input-field"
          value={email} onChange={(e) => setEmail(e.target.value)} />
        <input required type="password" placeholder="Password" className="input-field"
          value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="btn-gold w-full">
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>
      <div className="mt-4 flex justify-between text-sm">
        <Link href="/reset-password" className="text-gold-dark">Forgot password?</Link>
        <Link href="/signup" className="text-gold-dark">Create account</Link>
      </div>
    </div>
  );
}
