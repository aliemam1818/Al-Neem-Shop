"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

export default function ResetPasswordPage() {
  const supabase = getSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    setLoading(false);
    if (error) return setError(error.message);
    setSent(true);
  }

  return (
    <div className="mx-auto max-w-md px-5 py-16 text-center">
      <h1 className="font-display text-4xl text-olive">Reset Password</h1>
      {sent ? (
        <p className="mt-6 text-charcoal/60">Check {email} for a password reset link.</p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-4 text-left">
          <input required type="email" placeholder="Your account email" className="input-field"
            value={email} onChange={(e) => setEmail(e.target.value)} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="btn-gold w-full">
            {loading ? "Sending…" : "Send Reset Link"}
          </button>
        </form>
      )}
    </div>
  );
}
