"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { analyticsApi, surveysApi, aiApi } from "@/lib/api";
import { useAuthGuard } from "@/lib/use-auth-guard";
import { Navbar } from "@/components/dashboard/navbar";
import { StatCard } from "@/components/dashboard/stat-card";
import { TrendChart } from "@/components/charts/trend-chart";
import { ChoiceBarChart, RatingBarChart } from "@/components/charts/bar-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FadeIn, Reveal } from "@/lib/animations";
import {
  BarChart2, Brain, Copy, ExternalLink, MessageSquare,
  RefreshCw, ToggleLeft, ToggleRight, TrendingUp,
  QrCode, Download, Share2
} from "lucide-react";

const sentimentColor = {
  positive: "text-emerald-600",
  negative: "text-red-600",
  neutral:  "text-slate-600",
  mixed:    "text-amber-600",
};

const sentimentBg = {
  positive: "bg-emerald-50",
  negative: "bg-red-50",
  neutral:  "bg-slate-50",
  mixed:    "bg-amber-50",
};

export default function SurveyDetailPage() {
  useAuthGuard();
  const params = useParams();
  const router = useRouter();
  const surveyId = Number(params.id);

  const [survey, setSurvey] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analyzingAI, setAnalyzingAI] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loadingText, setLoadingText] = useState("Analyzing responses...");

  useEffect(() => {
    let interval;
    if (analyzingAI) {
      const texts = [
        "Analyzing responses...",
        "Gathering intelligence...",
        "Finding hidden patterns...",
        "Generating summaries...",
        "Finalizing insights..."
      ];
      let i = 0;
      interval = setInterval(() => {
        i = (i + 1) % texts.length;
        setLoadingText(texts[i]);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [analyzingAI]);

  async function load() {
    try {
      const [sv, an] = await Promise.all([
        surveysApi.get(surveyId),
        analyticsApi.survey(surveyId),
      ]);
      setSurvey(sv);
      setAnalytics(an);
    } catch {
      router.replace("/surveys");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { 
    load(); 
    // Failsafe
    const t = setTimeout(() => setLoading(false), 4000);
    return () => clearTimeout(t);
  }, [surveyId]);

  async function togglePublish() {
    if (!survey) return;
    setToggling(true);
    const updated = await surveysApi.update(surveyId, { is_published: !survey.is_published });
    setSurvey(updated);
    setToggling(false);
  }

  async function triggerAI() {
    setAnalyzingAI(true);
    try {
      const delay = new Promise(resolve => setTimeout(resolve, 2500));
      
      const fetchTask = (async () => {
        let existing = null;
        try {
          existing = await aiApi.latestInsight(surveyId);
        } catch (e) {}

        if (existing && existing.status !== "failed") {
          return existing;
        } else {
          return await aiApi.trigger(surveyId, true);
        }
      })();

      const [, result] = await Promise.all([delay, fetchTask]);
      setInsight(result);
    } catch (err) {
      console.error("AI mechanism failed:", err);
    } finally {
      setAnalyzingAI(false);
    }
  }

  function copyLink() {
    if (!survey) return;
    navigator.clipboard.writeText(`${window.location.origin}/s/${survey.public_token}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadQR() {
    if (!survey) return;
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(window.location.origin + '/s/' + survey.public_token)}`;
    fetch(url)
      .then(r => r.blob())
      .then(blob => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `survey-${survey.public_token}-qr.png`;
        a.click();
      });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex h-80 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#0d9488] border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <FadeIn className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900">{survey?.title}</h1>
              <Badge variant={survey?.is_published ? "success" : "secondary"}>
                {survey?.is_published ? "Live" : "Draft"}
              </Badge>
            </div>
            {survey?.description && (
              <p className="mt-1 text-sm text-slate-500">{survey.description}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setRefreshing(true); load(); }}
              loading={refreshing}
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Refresh
            </Button>

            {survey?.is_published && (
              <>
                <Button variant="outline" size="sm" onClick={copyLink}>
                  <Copy className="mr-1.5 h-3.5 w-3.5" />
                  {copied ? "Copied!" : "Copy Link"}
                </Button>
                <a href={`/s/${survey.public_token}`} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                    Open Survey
                  </Button>
                </a>
              </>
            )}

            <Button
              variant={survey?.is_published ? "secondary" : "default"}
              size="sm"
              onClick={togglePublish}
              loading={toggling}
            >
              {survey?.is_published ? (
                <><ToggleRight className="mr-1.5 h-4 w-4" />Unpublish</>
              ) : (
                <><ToggleLeft className="mr-1.5 h-4 w-4" />Publish</>
              )}
            </Button>

            <Button
              size="sm"
              onClick={triggerAI}
              loading={analyzingAI}
              disabled={analyzingAI || (analytics?.total_responses ?? 0) === 0}
            >
              <Brain className="mr-1.5 h-4 w-4" />
              {analyzingAI ? "Analysing…" : "AI Insights"}
            </Button>

            {survey?.public_token && (
              <Button
                size="sm"
                onClick={downloadQR}
                variant="outline"
              >
                <QrCode className="mr-1.5 h-4 w-4" />
                QR Code
              </Button>
            )}
          </div>
        </FadeIn>

        {/* Stat cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { title: "Total Responses", value: analytics?.total_responses ?? 0, icon: MessageSquare, color: "teal" },
            { title: "Today", value: analytics?.responses_today ?? 0, icon: TrendingUp, color: "green" },
            { title: "This Week", value: analytics?.responses_this_week ?? 0, icon: BarChart2, color: "rose" },
            { title: "Questions", value: survey?.questions.length ?? 0, icon: BarChart2, color: "orange" },
          ].map((s, i) => (
            <Reveal key={s.title} delay={i * 50}>
              <StatCard {...s} />
            </Reveal>
          ))}
        </div>

        {/* Trend + QR Code grid */}
        <div className="mb-10 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Reveal className="lg:col-span-2">
            <div className="h-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  <h2 className="text-[13px] font-semibold text-slate-800">Response Trend</h2>
                </div>
                <Badge variant="secondary" className="px-2 py-0 text-[10px] font-medium text-slate-400">
                  Last 14 Days
                </Badge>
              </div>
              <div className="p-4 pt-1 h-[calc(100%-48px)] flex-col justify-end">
                <TrendChart data={analytics?.completion_trend ?? []} />
              </div>
            </div>
          </Reveal>

          <Reveal delay={80} className="lg:col-span-1">
            <div className="h-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md group/qr">
              <div
                className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5"
                style={{ background: "linear-gradient(135deg, #f5f3ff, #eef2ff)" }}
              >
                <div className="flex items-center gap-2">
                  <QrCode className="h-4 w-4 text-indigo-500" />
                  <h2 className="text-[13px] font-semibold text-slate-800">Survey Live Access</h2>
                </div>
                <Badge variant="outline" className="bg-white/50 text-[10px] animate-pulse-soft">Live QR</Badge>
              </div>

              <div className="flex flex-col items-center justify-center p-5 text-center h-[calc(100%-48px)] min-h-[280px] relative">
                {survey?.is_published ? (
                  <>
                    <div className="relative mb-5 group">
                      {/* Scanning Line Animation */}
                      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-xl">
                        <div className="absolute left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_0_10px_#6366f1] animate-scan"></div>
                      </div>
                      
                      <div className="overflow-hidden rounded-xl border-2 border-slate-100 bg-white p-3 shadow-sm transition-all duration-500 group-hover:border-indigo-200 group-hover:shadow-indigo-100 group-hover:scale-[1.02]">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin + '/s/' + survey.public_token : '')}`} 
                          alt="Survey QR Code" 
                          className="h-32 w-32 object-contain"
                        />
                      </div>
                      
                      {/* Hint Overlay (Hidden by default, shown on hover) */}
                      <div className="absolute inset-0 flex items-center justify-center bg-indigo-600/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white/90 px-3 py-1 rounded-full text-[10px] font-bold text-indigo-600 shadow-sm border border-indigo-100">
                          Scan to Preview
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-1 mb-6">
                      <p className="text-[13px] font-bold text-slate-700">Scan & Go Live</p>
                      <p className="text-[11px] text-slate-400 leading-tight">Users can instantly access your survey form through this unique code.</p>
                    </div>

                    <div className="flex items-center justify-center gap-3 mt-auto w-full">
                      <Button variant="outline" size="sm" className="flex-1 h-8 text-xs font-medium border-slate-200 hover:bg-slate-50" onClick={copyLink}>
                        <Share2 className="mr-1.5 h-3.5 w-3.5" />
                        {copied ? "Copied" : "Share"}
                      </Button>
                      <Button size="sm" className="flex-1 h-8 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-100" onClick={downloadQR}>
                        <Download className="mr-1.5 h-3.5 w-3.5" />
                        Save
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center space-y-3 p-6 border-2 border-dashed border-slate-100 rounded-2xl">
                    <QrCode className="h-10 w-10 text-slate-200" />
                    <p className="text-xs text-slate-400 font-medium">Publish to generate live scan</p>
                    <Button size="xs" variant="secondary" onClick={togglePublish} loading={toggling} className="h-7 text-[10px]">Publish Now</Button>
                  </div>
                )}
              </div>
            </div>
          </Reveal>
        </div>

        {/* AI Insights Full Width Block */}
        <Reveal delay={120} className="mb-10">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md flex flex-col md:flex-row min-h-[350px]">
            
            {/* Left Box: Activation CTA */}
            <div className="w-full md:w-[35%] bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 p-8 xl:p-10 flex flex-col items-center justify-center text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[1.2rem] bg-rose-100 shadow-inner">
                <Brain className="h-10 w-10 text-rose-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3 tracking-tight">AI Insights</h2>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed px-4">Let our AI system instantly compile, analyze, and extract deep intelligence from your collected survey data.</p>
              
              <Button 
                onClick={triggerAI} 
                disabled={analyzingAI || (analytics?.total_responses ?? 0) === 0}
                className="w-full max-w-xs h-12 text-[15px] font-semibold transition-all duration-300 relative overflow-hidden group bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20"
              >
                <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                <Brain className={`mr-2.5 h-5 w-5 ${analyzingAI ? 'animate-pulse' : ''}`} />
                {analyzingAI ? "Processing Data..." : insight ? "Regenerate Analysis" : "Analyze Responses"}
              </Button>
            </div>
            
            {/* Right Box: Dynamic Output State */}
            <div className="w-full md:w-[65%] p-8 xl:p-10 flex flex-col justify-center bg-white relative min-h-[350px]">
              {analyzingAI ? (
                <div className="flex flex-col items-center justify-center h-full space-y-8 animate-in fade-in duration-500">
                  <div className="relative">
                     <div className="h-24 w-24 rounded-full border-4 border-rose-50 border-t-rose-500 animate-[spin_1.2s_linear_infinite]"></div>
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                       <Brain className="h-9 w-9 text-rose-500 animate-pulse" />
                     </div>
                  </div>
                  <div className="text-center space-y-2.5">
                     <h3 className="text-xl font-semibold text-slate-800 transition-all duration-300 transform scale-105">{loadingText}</h3>
                     <p className="text-sm text-slate-400 max-w-sm mx-auto">This takes a few moments depending on data volume...</p>
                  </div>
                </div>
              ) : insight?.status === "failed" ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 border border-red-100">
                     <RefreshCw className="h-7 w-7 text-red-500" />
                  </div>
                  <h3 className="text-red-700 font-bold mb-2 text-xl">Analysis Attempt Failed</h3>
                  <p className="text-red-500 text-[15px] max-w-md">The AI wasn't able to generate insights this time. Make sure you have diverse text responses or try again.</p>
                </div>
              ) : insight ? (
                <div className="h-full flex flex-col animate-in slide-in-from-bottom-6 fade-in duration-700">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5 shrink-0">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                          <span className="w-1.5 h-6 bg-rose-500 rounded-full inline-block"></span>
                          Result Summary
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 pl-3.5">Analysis created from {insight.total_responses_analyzed} responses</p>
                      </div>
                      <div className={`flex items-center gap-2.5 rounded-full px-3.5 py-1.5 border border-white/50 shadow-sm ${sentimentBg[insight.overall_sentiment ?? "neutral"]}`}>
                        <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">Net Sentiment</span>
                        <span className={`text-[13px] font-black capitalize tracking-wide ${sentimentColor[insight.overall_sentiment ?? "neutral"]}`}>
                          {insight.overall_sentiment}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                      {insight.summary && (
                        <div>
                          <p className="text-[14.5px] leading-relaxed text-slate-700 bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-inner">
                            {insight.summary}
                          </p>
                        </div>
                      )}

                      {insight.key_insights && (
                        <div>
                          <h4 className="text-sm font-bold text-slate-800 mb-4 tracking-tight">Key Takeaways</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {insight.key_insights.map((ins, i) => (
                              <div key={i} className="flex items-start gap-3.5 bg-white p-4 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-rose-300 group">
                                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-colors duration-300">
                                  <TrendingUp className="h-3 w-3" />
                                </div>
                                <span className="text-[13.5px] leading-relaxed text-slate-700">{ins}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-50 border-2 border-dashed border-slate-200 relative overflow-hidden">
                    <Brain className="h-10 w-10 text-slate-300 z-10" />
                    <div className="absolute inset-0 bg-slate-100/50 scale-0 origin-center transition-transform group-hover:scale-100 rounded-full"></div>
                  </div>
                  <h3 className="text-[22px] font-bold text-slate-800 mb-3 tracking-tight">No Insights Generated</h3>
                  <p className="text-[15px] text-slate-500 max-w-md leading-relaxed">
                    Start by clicking the analyze button. The AI will look at responses and highlight what's working and what isn't.
                  </p>
                </div>
              )}
            </div>
          </div>
        </Reveal>

        {/* Per-question analytics */}
        {(analytics?.question_analytics ?? []).length > 0 && (
          <div>
            <Reveal>
              <h2 className="mb-4 text-base font-semibold text-slate-900">Question Breakdown</h2>
            </Reveal>
            <div className="grid gap-4 sm:grid-cols-2">
              {analytics.question_analytics.map((qa, i) => (
                <Reveal key={qa.question_id} delay={i * 40}>
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-indigo-100 group">
                    <div className="mb-3">
                      <h3 className="text-[13.5px] font-semibold leading-snug text-slate-800">{qa.question_text}</h3>
                      <div className="mt-1.5 flex items-center gap-2">
                        <Badge variant="secondary">{qa.question_type.replace("_", " ")}</Badge>
                        <span className="text-[11px] text-slate-400">{qa.total_answers} answers</span>
                      </div>
                    </div>

                    {(qa.question_type === "multiple_choice" || qa.question_type === "dropdown") && qa.choice_distribution && (
                      <ChoiceBarChart data={qa.choice_distribution} />
                    )}
                    {qa.question_type === "rating" && qa.rating_distribution && qa.avg_rating !== undefined && (
                      <RatingBarChart distribution={qa.rating_distribution} avg={qa.avg_rating} max={5} />
                    )}
                    {qa.question_type === "text_input" && qa.sample_responses && (
                      <ul className="space-y-2">
                        {qa.sample_responses.slice(0, 5).map((r, idx) => (
                          <li key={idx} className="rounded-lg bg-slate-50 px-3 py-2 text-[12.5px] text-slate-600">
                            &ldquo;{r}&rdquo;
                          </li>
                        ))}
                        {qa.total_answers > 5 && (
                          <li className="text-[11px] text-slate-400">+{qa.total_answers - 5} more responses</li>
                        )}
                      </ul>
                    )}

                    {/* AI Question Insight */}
                    {insight?.question_insights?.find(qi => qi.question_id === qa.question_id) && (
                      <div className="mt-4 rounded-lg bg-rose-50 p-3 text-[11.5px] text-rose-700 border border-rose-100">
                        <div className="flex items-center gap-1.5 mb-1 text-[9px] font-bold uppercase tracking-wider text-rose-500">
                          <Brain className="h-3 w-3" />
                          AI Observation
                        </div>
                        {insight.question_insights.find(qi => qi.question_id === qa.question_id).insight}
                      </div>
                    )}


                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        )}

        {/* No responses state */}
        {analytics?.total_responses === 0 && (
          <Reveal>
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <MessageSquare className="h-7 w-7 text-slate-400" />
              </div>
              <h3 className="mb-1 text-base font-semibold text-slate-700">No responses yet</h3>
              <p className="mb-5 text-sm text-slate-500">
                Publish your survey and share the link to start collecting feedback.
              </p>
              {!survey?.is_published && (
                <Button size="sm" onClick={togglePublish} loading={toggling}>
                  Publish Survey
                </Button>
              )}
            </div>
          </Reveal>
        )}
      </main>
    </div>
  );
}
