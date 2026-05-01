"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BarChart2, FileText, MessageSquare, TrendingUp,
  Plus, RefreshCw, ArrowUpRight, Users, Zap,
  ChevronRight, Eye, Star, Activity, Target,
  Lightbulb, ArrowRight, LayoutDashboard,
  ShieldAlert, Mail, Lock, Info
} from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip as ReTooltip, ResponsiveContainer,
} from "recharts";
import { analyticsApi, surveysApi } from "@/lib/api";
import { useAuthGuard } from "@/lib/use-auth-guard";
import { getStoredUser } from "@/lib/auth";
import { Navbar } from "@/components/dashboard/navbar";
import { Footer } from "@/components/dashboard/footer";
import { TrendChart } from "@/components/charts/trend-chart";
import { Badge } from "@/components/ui/badge";
import { FadeIn, Reveal } from "@/lib/animations";
import { formatDate } from "@/lib/utils";
import { AIGenerator } from "@/components/survey/ai-generator";
import styles from "./dashboard.module.css";

export default function DashboardPage() {
  useAuthGuard();
  const router = useRouter();
  const user = getStoredUser();
  const firstName = user?.full_name?.split(" ")[0] ?? "there";
  const [stats, setStats] = useState(null);
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [liveTime, setLiveTime] = useState("");
  const [isSuspended, setIsSuspended] = useState(false);

  // Live ticking clock
  useEffect(() => {
    const tick = () => {
      setLiveTime(new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit", minute: "2-digit", second: "2-digit",
      }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const load = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      // Return to Promise.all for speed, but with a faster parallel execution
      const [sv, dash] = await Promise.all([
        surveysApi.list({ skipAutoRedirect: true }),
        analyticsApi.dashboard({ skipAutoRedirect: true })
      ]);
      
      setSurveys(sv || []);
      setStats(dash || null);
      setLastUpdated(new Date());
      setIsSuspended(false);
    } catch(e) {
      console.error("Dashboard list error:", e);
      if (e.status === 403 || e.message.toLowerCase().includes("suspended")) {
         setIsSuspended(true);
      }
    } finally {
      if (!silent) setRefreshing(false);
      setLoading(false);
    }
  }, []);

  const onAutoCreateSurvey = async (title, description, questions) => {
    sessionStorage.setItem("ai_survey_draft", JSON.stringify({
      title,
      description,
      questions: questions.map((q, i) => ({
        key: `q-ai-${i}`,
        text: q.text,
        question_type: q.question_type || "multiple_choice",
        options: q.options || { choices: ["Option 1", "Option 2"] },
        is_required: q.is_required !== false,
      }))
    }));
    router.push("/surveys/new");
  };

  useEffect(() => {
    // Initial load
    load();

    // Setup polling every 20 seconds
    const pollId = setInterval(() => load(true), 20000);

    // CRITICAL: Auto-refresh failsafe
    // If we are still loading after 5 seconds, attempt one automatic 
    // browser reload to clear any hanging cache/socket issues.
    const failsafeId = setTimeout(() => {
      const isStillLoading = document.getElementById("loading-indicator");
      if (isStillLoading) {
        const hasAutoReloaded = sessionStorage.getItem("dash_failsafe_reloaded");
        if (!hasAutoReloaded) {
          sessionStorage.setItem("dash_failsafe_reloaded", "true");
          window.location.reload();
        } else {
          // If already reloaded once and still hanging, just force-show the UI
          setLoading(false);
          sessionStorage.removeItem("dash_failsafe_reloaded");
        }
      }
    }, 3000);

    return () => {
      clearInterval(pollId);
      clearTimeout(failsafeId);
    };
  }, [load]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  if (loading) {
    return (
      <div className={styles.page} id="loading-indicator">
        <Navbar />
        <div className="flex flex-col h-72 items-center justify-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#0d9488] border-t-transparent" />
          <p className="text-sm text-slate-400 animate-pulse">Loading Lumino dashboard…</p>
        </div>
      </div>
    );
  }

  const totalSurveys = stats?.total_surveys ?? 0;
  const publishedSurveys = stats?.published_surveys ?? 0;
  const totalResponses = stats?.total_responses ?? 0;
  const responsesToday = stats?.responses_today ?? 0;
  const responsesThisWeek = stats?.responses_this_week ?? 0;

  const publishRate = totalSurveys > 0 ? Math.round((publishedSurveys / totalSurveys) * 100) : 0;
  const averageResponses = totalSurveys > 0 ? (totalResponses / totalSurveys).toFixed(1) : 0;

  const statCards = [
    { label: "Total Surveys", value: totalSurveys, icon: FileText, color: "indigo", engagement: `${publishRate}% live rate` },
    { label: "Live Surveys", value: publishedSurveys, icon: Zap, color: "green", engagement: `${responsesToday} new today` },
    { label: "Total Responses", value: totalResponses, icon: MessageSquare, color: "blue", engagement: `${averageResponses} per survey` },
    { label: "This Week", value: responsesThisWeek, icon: TrendingUp, color: "amber", engagement: `+${responsesThisWeek} response(s)` },
  ];

  if (isSuspended) {
    return (
      <div className={styles.page}>
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
          <FadeIn className="max-w-xl w-full">
            <div className="relative mb-12">
               {/* Animated rings around the alert icon */}
               <div className="absolute inset-0 m-auto h-32 w-32 animate-ping rounded-full bg-rose-400 opacity-20" />
               <div className="absolute inset-0 m-auto h-24 w-24 animate-[ping_2s_infinite] rounded-full bg-rose-500 opacity-10" />
               <div className="relative z-10 mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] bg-rose-500 text-white shadow-2xl shadow-rose-200">
                 <ShieldAlert size={48} className="animate-pulse" />
               </div>
            </div>

            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Account Suspended</h1>
            <p className="text-lg text-slate-500 font-medium leading-relaxed mb-10">
              Your business organization has been temporarily flagged for review. 
              During this period, active surveys and data analytics are disabled.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-12">
               <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <Info size={20} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase text-slate-400 mb-1">Status</h3>
                    <p className="text-sm font-black text-rose-600 uppercase">Inactive</p>
                  </div>
               </div>
               <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <Lock size={20} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase text-slate-400 mb-1">Access</h3>
                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight font-mono">Restricted</p>
                  </div>
               </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
               <a href="mailto:admin@lumino.ai" className="w-full sm:w-auto">
                 <button className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-slate-900 text-white font-black shadow-xl shadow-slate-200 hover:bg-black transition-all active:scale-95 group">
                   <Mail size={18} className="group-hover:rotate-12 transition-transform" />
                   Contact Support
                 </button>
               </a>
               <button 
                 onClick={() => load()}
                 className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white border border-slate-200 text-slate-600 font-black hover:bg-slate-50 transition-all active:scale-95"
               >
                 <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
                 Try Again
               </button>
            </div>
          </FadeIn>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8 relative">
        {/* Background Decorative Orbs */}
        <div className="absolute top-0 left-1/4 h-64 w-64 bg-teal-400 rounded-full bg-orb" />
        <div className="absolute top-40 right-1/4 h-96 w-96 bg-indigo-400 rounded-full bg-orb" style={{ animationDelay: '-10s' }} />        {/* ── Header ── */}
        <FadeIn className="mb-12 flex flex-col md:flex-row md:items-start justify-between gap-8 relative z-10">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-[1.2rem] bg-teal-500 shadow-xl shadow-teal-500/20 text-white">
                <LayoutDashboard size={28} />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[12px] font-black uppercase tracking-[0.3em] text-teal-600">Platform Overview</span>
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                  <span className="text-xs font-black tabular-nums tracking-[0.05em] text-teal-800 bg-white/40 backdrop-blur-xl border border-white/60 px-3 py-1 rounded-full shadow-sm">
                    {liveTime}
                  </span>
                </div>
              </div>
            </div>

            <h1 className="text-5xl font-black tracking-tight text-slate-900 mb-4 leading-tight">
              {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">{firstName}</span>
              <span className="inline-block ml-3">👋</span>
            </h1>
            <p className="text-slate-500 text-[17px] max-w-2xl leading-relaxed font-medium">
              Your intelligence hub is live. Track engagement across <span className="text-slate-900 font-bold underline decoration-teal-500/30 decoration-4 underline-offset-4">{totalSurveys} active surveys</span> and manage your real-time data streams.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0 pt-2">
            <button
              onClick={() => load(false)}
              disabled={refreshing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-[13px] font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all hover:shadow-sm active:scale-95 disabled:opacity-50 shadow-sm"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Updating..." : "Sync Data"}
            </button>
            <Link href="/surveys/new">
              <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[13px] font-bold text-white hover:bg-black transition-all hover:shadow-xl hover:shadow-slate-200 active:scale-95 group">
                <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                New Survey
              </button>
            </Link>
          </div>
        </FadeIn>

        {/* ── AI Quick Builder ── */}
        <Reveal className="mb-10">
          <AIGenerator
            onStart={() => { }}
            onMeta={() => { }}
            onQuestion={() => { }}
            onDone={() => { }}
            onError={() => { }}
            onFinalize={onAutoCreateSurvey}
          />
        </Reveal>

        {/* ── Stat Cards ── */}
        <div className="mb-10 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {statCards.map((card, i) => (
            <Reveal key={card.label} delay={i * 80}>
              <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-slate-200/50 hover:border-teal-100">
                <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-slate-50 transition-all duration-500 group-hover:scale-150 group-hover:bg-teal-50/50" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-teal-600 transition-colors uppercase">{card.label}</span>
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 ${styles[`icon_${card.color}`]}`}>
                      <card.icon size={18} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-3xl font-black tracking-tight text-slate-900 tabular-nums">{card.value.toLocaleString()}</p>
                    <div className="flex items-center gap-1.5">
                      <div className="h-1 w-1 rounded-full bg-teal-500 animate-pulse" />
                      <p className="text-[11px] font-bold text-teal-600/80 uppercase tracking-tight">{card.engagement}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* ── Trend chart + Live Activity ── */}
        <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Reveal className="lg:col-span-2">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md h-full">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/30">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Platform Traffic Volume</h2>
                  <p className="text-[11px] text-slate-400">Live responses captured over 14 days</p>
                </div>
              </div>
              <div className="p-6">
                {stats?.completion_trend && stats.completion_trend.length > 0 ? (
                  <TrendChart data={stats.completion_trend} surveyTitle="All Surveys" />
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-300">
                    <BarChart2 size={36} className="mb-2" />
                    <p className="text-xs font-bold">No trend data captured yet</p>
                  </div>
                )}
              </div>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md h-full">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/30">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Live Feed</h2>
                  <p className="text-[11px] text-slate-400">Real-time telemetry from active surveys</p>
                </div>
              </div>
              <div className="p-0">
                {(stats?.recent_activity?.length ?? 0) === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 px-6 text-slate-300">
                    <Activity size={32} className="mb-2" />
                    <p className="text-xs font-bold uppercase tracking-widest">Awaiting intake...</p>
                  </div>
                ) : (
                  <ul className="flex flex-col h-[280px] overflow-y-auto px-6 py-2 divide-y divide-slate-50">
                    {stats.recent_activity.map(act => (
                      <li key={act.id} className="py-4">
                        <div className="flex items-center gap-2 mb-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                          Captured
                        </div>
                        <p className="text-[13px] text-slate-600 leading-snug">
                          Secure response telemetry captured on <strong className="text-slate-900">{act.survey_title}</strong>.
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </Reveal>
        </div>

        {/* ── Survey list + Platform Performance ── */}
        <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Reveal delay={100} className="lg:col-span-2">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/30">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Your Survey Ecosystem</h2>
                  <p className="text-[11px] text-slate-400">Real-time management for your active streams</p>
                </div>
                <Link href="/surveys" className="text-[12px] font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors">
                  Explorer All <ChevronRight size={14} />
                </Link>
              </div>

              <div className="divide-y divide-slate-50">
                {surveys.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                    <div className="mb-4 h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200">
                      <FileText size={32} />
                    </div>
                    <p className="text-sm font-bold text-slate-600 mb-1">No surveys in orbit</p>
                    <p className="text-xs text-slate-400 mb-6">Launch your first survey to start collecting intelligence.</p>
                    <Link href="/surveys/new">
                      <button className="px-5 py-2 rounded-lg bg-teal-600 text-[12px] font-bold text-white hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/20">
                        Launch First Survey
                      </button>
                    </Link>
                  </div>
                ) : (
                  surveys.slice(0, 5).map((s, i) => (
                    <Link key={s.id} href={`/surveys/${s.id}`} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-all duration-300 group">
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 ${s.is_published ? 'bg-teal-50 text-teal-600' : 'bg-slate-100 text-slate-400'}`}>
                          <FileText size={18} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-[13.5px] font-bold text-slate-800 line-clamp-1 group-hover:text-teal-600 transition-colors uppercase tracking-tight">{s.title}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                              <MessageSquare size={10} />
                              {s.response_count} captured
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-[11px] font-medium text-slate-400">{formatDate(s.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${s.is_published ? 'bg-teal-100 text-teal-700 border-teal-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                          {s.is_published ? "Live" : "Draft"}
                        </Badge>
                        <div className="h-8 w-8 rounded-full flex items-center justify-center bg-slate-50 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                          <ArrowRight size={14} className="text-slate-400" />
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </Reveal>

          <Reveal delay={140}>
            <div className="flex flex-col gap-6 h-full">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex-1">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100 transform -rotate-6">
                    <Target size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">Sync Status</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Platform Health</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[11px] font-bold text-slate-500 tracking-tight">Deployment Success</span>
                      <span className="text-[11px] font-black text-indigo-600">{publishRate}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(79,70,229,0.3)]" style={{ width: `${publishRate}%` }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-6">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Weekly Delta</span>
                      <span className="text-lg font-black text-slate-800 tabular-nums">+{responsesThisWeek}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Density</span>
                      <span className="text-lg font-black text-slate-800 tabular-nums">{averageResponses}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-900 p-6 text-white overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform duration-500">
                  <Zap size={80} />
                </div>
                <h3 className="text-sm font-bold mb-1 relative z-10 uppercase tracking-widest text-teal-400">Quick Connect</h3>
                <p className="text-[11px] text-slate-400 mb-4 relative z-10 leading-relaxed">Ready to expand? Use AI to generate new survey kategorii instantly.</p>
                <Link href="/surveys/new">
                  <button className="flex items-center gap-2 text-[11px] font-black bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg border border-white/10 transition-all active:scale-95">
                    Open AI Builder <ChevronRight size={12} />
                  </button>
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </main>
      <Footer />
    </div>
  );
}