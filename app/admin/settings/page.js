"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

export default function AdminSettingsPage() {
  const supabase = getSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [storeName, setStoreName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.from("app_settings").select("*").eq("id", 1).single().then(({ data }) => {
      if (data) {
        setEmail(data.admin_notification_email);
        setStoreName(data.store_name);
      }
      setLoading(false);
    });
  }, [supabase]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    await supabase
      .from("app_settings")
      .update({ admin_notification_email: email, store_name: storeName, updated_at: new Date().toISOString() })
      .eq("id", 1);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) return <p className="text-sage">Loading…</p>;

  return (
    <div>
      <h1 className="font-display text-4xl text-olive">Settings</h1>
      <form onSubmit={handleSubmit} className="card mt-8 max-w-md space-y-4 p-6">
        <div>
          <label className="text-sm font-semibold text-olive">Store Name</label>
          <input className="input-field mt-2" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-semibold text-olive">Admin Notification Email</label>
          <p className="mt-1 text-xs text-sage">Order notification emails are sent here.</p>
          <input type="email" required className="input-field mt-2" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <button type="submit" disabled={saving} className="btn-gold">
          {saved ? "Saved ✓" : saving ? "Saving…" : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
