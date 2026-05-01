"use client";
import Link from "next/link";
import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-white border-t border-slate-100 py-10 px-4 sm:px-6 lg:px-8 mt-auto relative z-10">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <div className="h-8 w-8 bg-teal-500 rounded-lg flex items-center justify-center text-white transition-transform group-hover:rotate-12">
                <Zap size={18} />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900">Lumino AI</span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed">
              AI-powered survey platform. Build, analyze, and scale your feedback ecosystem.
            </p>
          </div>

          <div>
            <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-5">Platform</h4>
            <ul className="space-y-3">
              <FooterLink href="/dashboard" label="Dashboard" />
              <FooterLink href="/surveys" label="My Surveys" />
              <FooterLink href="/integrate" label="Integrations" />
              <FooterLink href="/surveys/new" label="AI Builder" />
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-5">Account</h4>
            <ul className="space-y-3">
              <FooterLink href="/login" label="Sign In" />
              <FooterLink href="/register" label="Get Started" />
              <FooterLink href="/profile" label="Profile" />
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
          <p className="text-[11px] font-medium text-slate-400">
            © 2026 Lumino AI Technologies. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, label }) {
  return (
    <li>
      <Link href={href} className="text-[13px] font-semibold text-slate-500 hover:text-teal-600 transition-all flex items-center gap-2 group">
        <span className="h-1 w-1 rounded-full bg-teal-500 opacity-0 group-hover:opacity-100 transition-all" />
        {label}
      </Link>
    </li>
  );
}
