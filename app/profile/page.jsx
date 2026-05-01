"use client";
import { useEffect, useState } from "react";
import { useAuthGuard } from "@/lib/use-auth-guard";
import { Navbar } from "@/components/dashboard/navbar";
import { Footer } from "@/components/dashboard/footer";
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
    
    authApi.me().then((freshUser) => {
      setUser(freshUser);
      saveAuth(getStoredToken(), freshUser);
    }).catch(() => {});
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 flex-1">
        <FadeIn className="mb-10">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">My Profile</h1>
          <p className="text-slate-500 font-medium text-[15px]">
            Manage your personal data and secure platform identifiers.
          </p>
        </FadeIn>
        
        <div className="space-y-6">
          <Reveal>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
              <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  <UserIcon className="h-4 w-4 text-teal-600" />
                  Account Identity
                </h3>
              </div>
              <div className="p-8">
                <div className="grid gap-8 sm:grid-cols-2">
                  <ProfileField label="Full Name" value={user.full_name} icon={<UserIcon size={14} />} />
                  <ProfileField label="Email Address" value={user.email} icon={<Mail size={14} />} />
                  <ProfileField label="Role" value={user.role} icon={<Key size={14} />} isCapitalize />
                  <ProfileField label="Organisation" value={user.tenant_name || "Personal Workspace"} icon={<Building2 size={14} />} />
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
              <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  <Fingerprint className="h-4 w-4 text-teal-600" />
                  System Security Key
                </h3>
              </div>
              <div className="p-8 text-sm">
                <div className="space-y-4">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Unique Identifier (UUID)</label>
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all focus-within:ring-2 focus-within:ring-teal-500/20">
                    <code className="text-[14px] font-black tracking-widest text-teal-700 bg-teal-50/30 px-2 py-1 rounded">
                      {showUuid ? (user.user_uuid || "Pending...") : "••••••••-••••-••••-••••-••••••••••••"}
                    </code>
                    <button
                      onClick={() => setShowUuid(!showUuid)}
                      className="ml-3 p-2 text-slate-400 hover:text-teal-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-100"
                    >
                      {showUuid ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl text-[12px] text-indigo-700 leading-relaxed font-medium">
                    This ID is used for secure data separation across the platform. Never share this with unauthorized personnel.
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function ProfileField({ label, value, icon, isCapitalize = false }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
          {icon}
        </div>
        <p className={`text-[15px] font-bold text-slate-800 ${isCapitalize ? 'capitalize' : ''}`}>
          {value}
        </p>
      </div>
    </div>
  );
}
