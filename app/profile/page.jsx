"use client";
import { useEffect, useState } from "react";
import { useAuthGuard } from "@/lib/use-auth-guard";
import { Navbar } from "@/components/dashboard/navbar";
import { getStoredUser, saveAuth, getStoredToken } from "@/lib/auth";
import { authApi } from "@/lib/api";
import { FadeIn, Reveal } from "@/lib/animations";
import { User as UserIcon, Building2, Fingerprint, Mail, Key, Eye, EyeOff } from "lucide-react";

export default function ProfilePage() {
  useAuthGuard();
  const [user, setUser] = useState(null);
  const [showUuid, setShowUuid] = useState(false);

  useEffect(() => {
    const cachedUser = getStoredUser();
    setUser(cachedUser);
    
    // Dynamically fully refresh the user data from server so new columns like UUID show up without relogging
    authApi.me().then((freshUser) => {
      setUser(freshUser);
      saveAuth(getStoredToken(), freshUser);
    }).catch(() => {});
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <FadeIn className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Your Profile</h1>
          <p className="mt-1 text-sm text-slate-500">
            View your personal identity settings and unique platform identifiers.
          </p>
        </FadeIn>
        
        <Reveal>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <UserIcon className="h-4 w-4 text-indigo-500" />
                Account Information
              </h3>
            </div>
            <div className="p-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-500">Full Name</label>
                  <p className="text-sm font-medium text-slate-900">{user.full_name}</p>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-500">Email Address</label>
                  <p className="flex items-center gap-1.5 text-sm font-medium text-slate-900">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    {user.email}
                  </p>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-500">Role</label>
                  <p className="flex items-center gap-1.5 text-sm font-medium text-slate-900 capitalize">
                    <Key className="h-3.5 w-3.5 text-slate-400" />
                    {user.role}
                  </p>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-500">Organisation</label>
                  <p className="flex items-center gap-1.5 text-sm font-medium text-slate-900">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                    {user.tenant_name || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Fingerprint className="h-4 w-4 text-indigo-500" />
                Security & Identifier
              </h3>
            </div>
            <div className="p-6">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500">Unique User ID (UUID)</label>
                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5">
                  <code className="text-[13px] font-semibold tracking-wide text-indigo-600">
                    {showUuid ? (user.user_uuid || "UUID not generated") : "••••••••-••••-••••-••••-••••••••••••"}
                  </code>
                  <button
                    onClick={() => setShowUuid(!showUuid)}
                    className="ml-3 p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-md transition-all shadow-sm"
                    title={showUuid ? "Hide unique ID" : "Show unique ID"}
                  >
                    {showUuid ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="mt-2 text-[12px] text-slate-500">
                  This secure unique identifier is permanently tied to your account. It encrypts and forms the basis of all uniquely identifiable, secure URLs you generate within the platform.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </main>
    </div>
  );
}
