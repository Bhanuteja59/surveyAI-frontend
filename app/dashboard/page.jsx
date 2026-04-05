"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  BarChart2, FileText, MessageSquare, TrendingUp,
  Plus, RefreshCw, ArrowUpRight, Users, Zap,
  ChevronRight, Eye, Star, Activity, Target,
  Lightbulb, ArrowRight,
} from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip as ReTooltip, ResponsiveContainer,
} from "recharts";
import { analyticsApi, surveysApi } from "@/lib/api";
import { useAuthGuard } from "@/lib/use-auth-guard";
import { getStoredUser } from "@/lib/auth";
import { Navbar } from "@/components/dashboard/navbar";
import { TrendChart } from "@/components/charts/trend-chart";
import { Badge } from "@/components/ui/badge";
import { FadeIn, Reveal } from "@/lib/animations";
import { formatDate } from "@/lib/utils";
import styles from "./dashboard.module.css";

export default function DashboardPage() {
  useAuthGuard();
  const user = getStoredUser();
  const firstName = user?.full_name?.split(" ")[0] ?? "there";
  const [stats, setStats] = useState(null);
  const [surveys, setSurveys] = useState([]);
  const [trendData, setTrendData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [liveTime, setLiveTime] = useState("");

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
      const [s, sv] = await Promise.all([analyticsApi.dashboard(), surveysApi.list()]);
      setStats(s);
      setSurveys(sv);
      const top = sv.find((x) => x.response_count > 0);
      if (top) {
        const a = await analyticsApi.survey(top.id);
        setTrendData(a);
      }
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Real-time auto-refresh every 30 s
  useEffect(() => {
    const id = setInterval(() => load(true), 30000);
    return () => clearInterval(id);
  }, [load]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const pieData = stats ? [
    { name: "Live & Published", value: stats.published_surveys, color: "#0d9488" },
    { name: "Draft (Not yet live)", value: Math.max(0, stats.total_surveys - stats.published_surveys), color: "#e2e8f0" },
  ] : [];

  if (loading) {
    return (
      <div className={styles.page}>
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

  // Real-time Engagement Calculations
  const publishRate = totalSurveys > 0 ? Math.round((publishedSurveys / totalSurveys) * 100) : 0;
  const responseVelocity = responsesThisWeek > 0 ? Math.round((responsesToday / responsesThisWeek) * 100) : 0;
  const averageResponses = totalSurveys > 0 ? (totalResponses / totalSurveys).toFixed(1) : 0;
  const weekGrowth = responsesThisWeek > 0 ? "+" + responsesThisWeek : "0";

  const statCards = [
    {
      label: "Total Surveys",
      value: totalSurveys,
      icon: FileText,
      color: "indigo",
      accent: "#0d9488",
      engagement: `${publishRate}% live rate`,
    },
    {
      label: "Live Surveys",
      value: publishedSurveys,
      icon: Zap,
      color: "green",
      accent: "#10b981",
      engagement: `${responsesToday} new today`,
    },
    {
      label: "Total Responses",
      value: totalResponses,
      icon: MessageSquare,
      color: "blue",
      accent: "#3b82f6",
      engagement: `${averageResponses} per survey`,
    },
    {
      label: "This Week",
      value: responsesThisWeek,
      icon: TrendingUp,
      color: "amber",
      accent: "#f59e0b",
      engagement: `${weekGrowth} this week`,
    },
  ];

  return (
    <div className={styles.page}>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <FadeIn className={styles.header}>
          <div>
            <div className={styles.headerMeta}>
              <span className={styles.liveChip}>
                <span className={styles.liveDot} />
                Live
              </span>
              <span className={styles.clock}>{liveTime}</span>
              {lastUpdated && (
                <span className={styles.lastUpdated}>
                  Updated {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
            </div>
            <h1 className={styles.greeting}>{greeting}, {firstName} 👋</h1>
            <p className={styles.subtext}>
              Calculating real-time engagement across {totalSurveys} surveys with live tracking.
            </p>
          </div>
          <div className={styles.headerActions}>
            <button onClick={() => load()} disabled={refreshing} className={styles.refreshBtn}>
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing…" : "Refresh"}
            </button>
            <Link href="/surveys/new">
              <button className={styles.newBtn}>
                <Plus className="h-3.5 w-3.5" />
                New Survey
              </button>
            </Link>
          </div>
        </FadeIn>

        {/* ── Welcome banner (only if no surveys yet) ── */}
        {(!stats || totalSurveys === 0) && (
          <Reveal className="mb-6">
            <div className={styles.welcomeBanner}>
              <div className={styles.bannerIconWrap}><Lightbulb size={20} /></div>
              <div>
                <p className={styles.bannerTitle}>Welcome! Let&apos;s create your first survey 🚀</p>
                <p className={styles.bannerDesc}>
                  A survey is simply a list of questions you send to your customers or team. Once they answer, you&apos;ll see everything here — automatically!
                </p>
                <Link href="/surveys/new">
                  <button className={styles.bannerBtn}>
                    <Plus size={13} /> Create my first survey <ArrowRight size={13} />
                  </button>
                </Link>
              </div>
            </div>
          </Reveal>
        )}

        {/* ── Stat Cards ── */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statCards.map((card, i) => (
            <Reveal key={card.label} delay={i * 60}>
              <div className={styles.statCard} style={{ "--accent": card.accent }}>
                <div className={styles.statCardTop}>
                  <span className={styles.statLabel}>{card.label}</span>
                  <span className={`${styles.statIcon} ${styles[`icon_${card.color}`]}`}>
                    <card.icon size={16} />
                  </span>
                </div>
                <p className={styles.statValue}>{card.value.toLocaleString()}</p>
                <p className={styles.statEngagement}>{card.engagement}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* ── Insight bar ── */}
        {stats && (
          <Reveal className="mb-6">
            <div className={styles.insightBar}>
              <div className={styles.insightItem}>
                <Activity size={14} className="text-[#0d9488] shrink-0" />
                <span><strong>{stats.responses_today}</strong> people shared feedback today</span>
              </div>
              <div className={styles.insightDiv} />
              <div className={styles.insightItem}>
                <Target size={14} className="text-[#f43f5e] shrink-0" />
                <span><strong>{stats.published_surveys}</strong> out of <strong>{stats.total_surveys}</strong> surveys active</span>
              </div>
              <div className={styles.insightDiv} />
              <div className={styles.insightItem}>
                <Star size={14} className="text-amber-500 shrink-0" />
                <span><strong>{stats.responses_this_week}</strong> total responses this week</span>
              </div>
            </div>
          </Reveal>
        )}

        {/* ── Trend chart + Pie ── */}
        <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Reveal className="lg:col-span-2">
            <div className={styles.panel}>
              <div className={styles.panelHead}>
                <div>
                  <span className={styles.panelTitle}>Response Trend</span>
                  <p className={styles.panelSub}>Daily responses over the last 14 days</p>
                </div>
                {trendData && (
                  <span className={styles.surveyTag}>
                    <Eye size={10} /> {trendData.survey_title}
                  </span>
                )}
              </div>
              <div className={styles.panelBody}>
                {trendData ? (
                  <TrendChart data={trendData.completion_trend} surveyTitle={trendData.survey_title} />
                ) : (
                  <div className={styles.empty}>
                    <BarChart2 size={36} className="text-slate-200 mb-1" />
                    <p className="font-medium text-slate-500 text-sm">No data yet</p>
                    <p className="text-xs text-slate-400 text-center max-w-[200px]">
                      Once someone submits a response, your trend chart will appear here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className={styles.panel}>
              <div className={styles.panelHead}>
                <div>
                  <span className={styles.panelTitle}>Survey Status</span>
                  <p className={styles.panelSub}>Live vs Draft breakdown</p>
                </div>
              </div>
              <div className={styles.panelBody}>
                {stats && stats.total_surveys > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={150}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%" cy="50%"
                          innerRadius={44} outerRadius={64}
                          paddingAngle={3} dataKey="value"
                          strokeWidth={0}
                        >
                          {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                        <ReTooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-col gap-2.5 mt-2">
                      {pieData.map((d) => (
                        <div key={d.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={styles.dot} style={{ background: d.color }} />
                            <span className="text-[12px] text-slate-600">{d.name}</span>
                          </div>
                          <span className="text-[13px] font-bold text-slate-800">{d.value}</span>
                        </div>
                      ))}
                      <div className="border-t border-slate-100 pt-2 flex justify-between">
                        <span className="text-[11px] text-slate-400">Total surveys</span>
                        <span className="text-[13px] font-bold text-slate-800">{stats.total_surveys}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className={styles.empty}>
                    <Users size={32} className="text-slate-200 mb-1" />
                    <p className="font-medium text-slate-500 text-sm">No surveys yet</p>
                    <p className="text-xs text-slate-400 text-center">Create a survey to see results here.</p>
                  </div>
                )}
              </div>
            </div>
          </Reveal>
        </div>

        {/* ── Survey list + Top surveys ── */}
        <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Reveal delay={100} className="lg:col-span-2">
            <div className={styles.panel}>
              <div className={styles.panelHead}>
                <div>
                  <span className={styles.panelTitle}>Your Surveys</span>
                  <p className={styles.panelSub}>Click any survey to view details and analytics</p>
                </div>
                <Link href="/surveys" className={styles.viewAll}>
                  View all <ChevronRight size={13} />
                </Link>
              </div>
              {surveys.length === 0 ? (
                <div className={styles.empty} style={{ padding: "36px 20px" }}>
                  <FileText size={36} className="text-slate-200 mb-1" />
                  <p className="font-medium text-slate-500 text-sm">No surveys yet</p>
                  <Link href="/surveys/new">
                    <button className={styles.bannerBtn}><Plus size={12} /> Create my first survey</button>
                  </Link>
                </div>
              ) : (
                <ul>
                  {surveys.slice(0, 6).map((s, i) => (
                    <li key={s.id} className={styles.slideUp} style={{ animationDelay: `${i * 45}ms` }}>
                      <Link href={`/surveys/${s.id}`} className={styles.surveyRow}>
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`${styles.surveyDot} ${s.is_published ? styles.dotLive : styles.dotDraft}`} />
                          <div style={{ minWidth: 0 }}>
                            <p className={styles.surveyName}>{s.title}</p>
                            <p className={styles.surveyMeta}>
                              <MessageSquare size={9} className="inline mr-1 opacity-60" />
                              {s.response_count} {s.response_count === 1 ? "response" : "responses"}
                              &nbsp;·&nbsp;{formatDate(s.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 pl-2">
                          <Badge variant={s.is_published ? "success" : "secondary"}>
                            {s.is_published ? "Live" : "Draft"}
                          </Badge>
                          <ArrowUpRight size={13} className="text-slate-300" />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Reveal>

          <Reveal delay={140}>
            <div className={styles.panel}>
              <div className={styles.panelHead}>
                <div>
                  <span className={styles.panelTitle}>Top Surveys</span>
                  <p className={styles.panelSub}>Most answered surveys</p>
                </div>
              </div>
              <div className={styles.panelBody}>
                {surveys.filter(s => s.response_count > 0).length === 0 ? (
                  <div className={styles.empty}>
                    <MessageSquare size={32} className="text-slate-200 mb-1" />
                    <p className="font-medium text-slate-500 text-sm">No answers yet</p>
                    <p className="text-xs text-slate-400 text-center max-w-[180px]">
                      Share your live survey link to start collecting answers.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {surveys.filter(s => s.response_count > 0).slice(0, 4).map((s) => {
                      const max = Math.max(...surveys.map(x => x.response_count));
                      const pct = max > 0 ? (s.response_count / max) * 100 : 0;
                      return (
                        <div key={s.id}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[12px] font-semibold text-slate-700 truncate max-w-[150px]">{s.title}</span>
                            <span className="text-[12px] font-bold text-[#0d9488] ml-2 shrink-0">{s.response_count}</span>
                          </div>
                          <div className={styles.bar}>
                            <div className={styles.barFill} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                    <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                      {stats?.total_responses ?? 0} total responses across all surveys
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Reveal>
        </div>

        {/* ── Tips ── */}
        <Reveal delay={180}>
          <div className={styles.tipsWrap}>
            <p className={styles.tipsHeading}>💡 Grow your response rate</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { icon: "💬", title: "Treat it like a conversation", desc: "Don't sound like a robot. Write questions like you're actually talking to your customer." },
                { icon: "⏱️", title: "Keep it under 3 mins", desc: "Your customers are busy. We found 3-5 questions is the golden rule for high completion rates." },
                { icon: "🎁", title: "Show you care", desc: "Respond to negative feedback instantly. They will respect you for listening to them." },
              ].map((t) => (
                <div key={t.title} className={styles.tipCard}>
                  <span className="text-xl shrink-0">{t.icon}</span>
                  <div>
                    <p className="text-[13px] font-bold text-slate-800 mb-0.5">{t.title}</p>
                    <p className="text-[12px] text-slate-500 leading-relaxed">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

      </main>
    </div>
  );
}