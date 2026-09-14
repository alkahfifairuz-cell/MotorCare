"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const supabase = createClient();

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (loginError) {
        setError(loginError.message);
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan saat menghubungkan ke server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#07090c] text-white">
      <div className="flex min-h-screen items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-6 flex justify-center">
              <Image
                src="/motorcare-logo.png"
                alt="MotorCare"
                width={180}
                height={180}
                className="h-auto w-[150px] object-contain"
                priority
              />
            </div>

            <p className="mb-2 text-xs font-medium uppercase tracking-[0.35em] text-blue-400">
              MotorCare Admin
            </p>

            <h1 className="text-3xl font-semibold tracking-tight">
              Welcome back.
            </h1>

            <p className="mt-3 text-sm leading-6 text-white/50">
              Login untuk mengelola MotorCare.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-white/80"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@motorcare.com"
                  required
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-blue-400/50 focus:bg-black/30"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-white/80"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-blue-400/50 focus:bg-black/30"
                />
              </div>

              {error && (
                <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm leading-5 text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-white px-4 py-3.5 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Login"}
              </button>
            </form>

            <button
              type="button"
              onClick={() => router.push("/")}
              className="mt-5 w-full text-center text-sm text-white/40 transition hover:text-white/70"
            >
              ← Kembali ke website
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-white/25">
            MotorCare • Clean Ride • Better Journey
          </p>
        </div>
      </div>
    </main>
  );
}