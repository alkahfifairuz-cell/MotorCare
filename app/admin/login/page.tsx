"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Email atau password salah.");
      setLoading(false);
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#07090c] text-white flex items-center justify-center px-5">
      <div className="w-full max-w-md">

        {/* LOGO */}
        <div className="flex justify-center mb-8">
          <img
            src="/motorcare-logo.png"
            alt="MotorCare"
            className="w-44 h-auto object-contain"
          />
        </div>

        {/* CARD */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-7 sm:p-9 shadow-2xl shadow-black/30">

          <div className="mb-8">
            <p className="text-[11px] uppercase tracking-[0.28em] text-blue-400 font-semibold mb-3">
              MotorCare Admin
            </p>

            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Selamat datang kembali.
            </h1>

            <p className="text-sm text-white/45 mt-2 leading-relaxed">
              Login untuk mengelola pemilik, motor, jadwal, pembayaran,
              perawatan, dan inventaris.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">

            {/* EMAIL */}
            <div>
              <label className="block text-xs font-medium text-white/65 mb-2">
                Email Admin
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@email.com"
                required
                autoComplete="email"
                className="w-full h-12 rounded-xl border border-white/10 bg-black/25 px-4 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-blue-400/50 focus:bg-white/[0.045]"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-xs font-medium text-white/65 mb-2">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                required
                autoComplete="current-password"
                className="w-full h-12 rounded-xl border border-white/10 bg-black/25 px-4 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-blue-400/50 focus:bg-white/[0.045]"
              />
            </div>

            {/* ERROR */}
            {error && (
              <div className="rounded-xl border border-red-400/15 bg-red-400/5 px-4 py-3">
                <p className="text-sm text-red-300">
                  {error}
                </p>
              </div>
            )}

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-blue-500 hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold text-white transition shadow-lg shadow-blue-500/10"
            >
              {loading ? "Memproses..." : "Login ke Admin"}
            </button>
          </form>

          <div className="mt-7 pt-6 border-t border-white/8">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="w-full text-sm text-white/40 hover:text-white/70 transition"
            >
              ← Kembali ke website
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] text-white/20 mt-6">
          MotorCare • Admin Area
        </p>
      </div>
    </main>
  );
}