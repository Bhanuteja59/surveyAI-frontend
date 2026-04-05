"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FadeIn } from "@/lib/animations";
import { authApi } from "@/lib/api";
import { saveAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await authApi.login(form);
      saveAuth(data.access_token, data.user);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Left panel — visible on lg+ */}
      <div
        className="relative hidden overflow-hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
        style={{ background: "linear-gradient(145deg, #0f0c29, #1e1b4b, #0f172a)" }}
      >
        {/* Decorative orbs */}
        <div
          className="orb-animate pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #0d9488, transparent 70%)" }}
        />
        <div
          className="orb-animate-slow pointer-events-none absolute bottom-10 right-0 h-64 w-64 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #f43f5e, transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute top-1/2 left-1/3 h-48 w-48 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #14b8a6, transparent 70%)" }}
        />

        <div className="relative flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: "#0d9488" }}
          >
            <MessageCircle className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="text-xl font-black text-white tracking-tight">Lumino.</span>
        </div>

        <div className="relative">
          <div className="mb-2 text-4xl text-teal-400 font-serif leading-none opacity-60">&ldquo;</div>
          <blockquote className="mb-6 text-lg font-medium leading-relaxed text-slate-200">
            The AI summary alone saves our team two hours every week. We went from reading every response to just reading the report.
          </blockquote>
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ background: "#0d9488" }}
            >
              SC
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">Sarah Chen</p>
              <p className="text-xs text-slate-400">Head of Product at Finlo</p>
            </div>
          </div>
        </div>

        <p className="relative text-xs text-slate-600">© {new Date().getFullYear()} Lumino. All rights reserved.</p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <FadeIn className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-md"
              style={{ background: "#0d9488" }}
            >
              <MessageCircle className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-black text-slate-900 tracking-tight">Lumino.</span>
          </div>

          <div className="mb-7">
            <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
            <p className="mt-1.5 text-sm text-slate-500">Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@company.com"
              required
            />
            <div>
              <Input
                label="Password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
              />
            </div>

            <Button type="submit" className="mt-1 w-full" loading={loading}>
              Sign in
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-teal-600 hover:text-teal-700">
              Create one free
            </Link>
          </p>
        </FadeIn>
      </div>
    </div>
  );
}
