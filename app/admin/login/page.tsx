"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      // Supabase client dibuat saat login,
      // bukan saat halaman sedang di-build oleh Next.js.
      const supabase = createClient();

      const { error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError) {
        setError(
          loginError.message || "Email atau password salah."
        );
        setLoading(false);
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan. Coba lagi.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#07090c] text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-220px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute bottom-[-180px] right-[-100px] h-[420px] w-[420px] rounded-full bg-cyan-400/5 blur-[120px]" />
      </div>

      {/* Navbar */}
      <header className="relative z-10 border-b border-white/[0.06]">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="group flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]">
              <img
                src="/motorcare-logo.png"
                alt="MotorCare"
                className="h-full w-full object-contain p-1"
              />
            </div>

            <div className="text-left">
              <p className="text-sm font-semibold tracking-[0.18em] text-white">
                MOTORCARE
              </p>
              <p className="text-[9px] uppercase tracking-[0.2em] text-white/35">
                Clean Ride • Better Journey
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-medium text-white/60 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
          >
            ← Kembali
          </button>
        </div>
      </header>

      {/* Login */}
      <section className="relative z-10 flex min-h-[calc(100vh-72px)] items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          {/* Heading */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/30">
              <div className="text-2xl">⚙</div>
            </div>

            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-blue-400">
              MotorCare Admin
            </p>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Welcome back.
            </h1>

            <p className="mt-3 text-sm leading-6 text-white/40">
              Masuk untuk mengelola motor, jadwal, perawatan,
              pembayaran, dan inventory.
            </p>
          </div>

          {/* Card */}
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.035] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-white/50"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  disabled={loading}
                  className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-blue-400/50 focus:bg-black/30 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-white/50"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  required
                  disabled={loading}
                  className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-blue-400/50 focus:bg-black/30 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3">
                  <p className="text-xs leading-5 text-red-300">
                    {error}
                  </p>
                </div>
              )}

              {/* Button */}
              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                    Memproses...
                  </span>
                ) : (
                  "Masuk ke Dashboard"
                )}
              </button>
            </form>

            {/* Security note */}
            <div className="mt-6 border-t border-white/[0.06] pt-5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-xs text-blue-400">
                  ●
                </div>

                <p className="text-[11px] leading-5 text-white/30">
                  Area ini khusus administrator MotorCare.
                  Pastikan akun Supabase Auth sudah terdaftar
                  sebelum melakukan login.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-[10px] uppercase tracking-[0.2em] text-white/20">
            MOTORCARE • CLEAN RIDE • BETTER JOURNEY
          </p>
        </div>
      </section>
    </main>
  );
}