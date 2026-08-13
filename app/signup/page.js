"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

export default function SignupPage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.fullName, phone: form.phone },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });
    setLoading(false);
    if (error) return setError(error.message);
    setDone(true);
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center">
        <h1 className="font-display text-3xl text-olive">Check your email</h1>
        <p className="mt-3 text-charcoal/60">
          We've sent a confirmation link to {form.email}. Confirm it, then sign in.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <h1 className="text-center font-display text-4xl text-olive">Create Account</h1>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <input required placeholder="Full Name" className="input-field"
          value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        <input required type="email" placeholder="Email" className="input-field"
          value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input required type="tel" placeholder="Phone Number" className="input-field"
          value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input required type="password" minLength={6} placeholder="Password" className="input-field"
          value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="btn-gold w-full">
          {loading ? "Creating account…" : "Create Account"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-charcoal/60">
        Already have an account? <Link href="/login" className="text-gold-dark">Sign in</Link>
      </p>
    </div>
  );
}
