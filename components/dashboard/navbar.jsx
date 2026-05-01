"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, LayoutDashboard, ListChecks, Plus, User, Link2 } from "lucide-react";
import { ProfileDropdown } from "./profile-dropdown";

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-slate-200 bg-white shadow-sm shadow-slate-900/[0.03]">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: logo + nav links */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-md transition-all duration-500 group-hover:rotate-[360deg] shadow-sm"
              style={{ background: "#0d9488" }}
            >
              <MessageCircle className="h-4 w-4 text-white" />
            </div>
            <span className="text-[16px] font-black tracking-tight text-slate-900 group-hover:text-[#0d9488] transition-colors">Lumino.</span>
          </Link>

          <div className="hidden items-center gap-1 sm:flex">
            <NavLink href="/dashboard" active={pathname === "/dashboard"} icon={<LayoutDashboard className="h-4 w-4" />}>
              Dashboard
            </NavLink>
            <NavLink href="/surveys" active={pathname.startsWith("/surveys")} icon={<ListChecks className="h-4 w-4" />}>
              Surveys
            </NavLink>
            <NavLink href="/integrate" active={pathname.startsWith("/integrate")} icon={<Link2 className="h-4 w-4" />}>
              Integrate
            </NavLink>
            <NavLink href="/profile" active={pathname === "/profile"} icon={<User className="h-4 w-4" />}>
              Profile
            </NavLink>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          <Link
            href="/surveys/new"
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-bold text-white transition-all hover:bg-[#e11d48] hover:shadow-md hover:scale-105 active:scale-95 group shadow-sm shadow-rose-100"
            style={{ background: "#f43f5e" }}
          >
            <Plus className="h-3.5 w-3.5 transition-transform group-hover:rotate-180 duration-500" />
            <span className="hidden sm:inline">New Survey</span>
          </Link>

          <ProfileDropdown />
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, active, icon, children }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-semibold transition-all duration-300 hover:scale-105 ${
        active
          ? "bg-teal-50 text-teal-800 shadow-sm shadow-teal-100/50"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}
