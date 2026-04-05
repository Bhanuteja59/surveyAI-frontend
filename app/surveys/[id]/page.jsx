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

  async function load() {
    try {
      const [sv, an] = await Promise.all([
        surveysApi.get(surveyId),
        analyticsApi.survey(surveyId),
      ]);
      setSurvey(sv);
      setAnalytics(an);
      aiApi.latestInsight(surveyId).then((i) => setInsight(i)).catch(() => {});
    } catch {
      router.replace("/surveys");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, [surveyId]); // eslint-disable-line react-hooks/exhaustive-deps

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
      await aiApi.trigger(surveyId);
      await new Promise((res) => setTimeout(res, 2000));
      const i = await aiApi.latestInsight(surveyId);
      setInsight(i);
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

        {/* Trend + AI insight */}
        <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Reveal className="lg:col-span-2">
            <div className="h-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
              <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-4">
                <h2 className="text-sm font-semibold text-slate-800">Response Trend — last 14 days</h2>
              </div>
              <div className="p-5">
                <TrendChart data={analytics?.completion_trend ?? []} />
              </div>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="h-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
              <div
                className="flex items-center justify-between border-b border-slate-100 px-5 py-4"
                style={{ background: "linear-gradient(135deg, #f5f3ff, #eef2ff)" }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-md"
                    style={{ background: "#f43f5e" }}
                  >
                    <Brain className="h-3.5 w-3.5 text-white" />
                  </div>
                  <h2 className="text-sm font-semibold text-slate-800">AI Insights</h2>
                </div>
                {analyzingAI && (
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#0d9488] border-t-transparent" />
                )}
              </div>

              <div className="p-5">
                {!insight || insight.status === "pending" ? (
                  <div className="flex flex-col items-center py-8 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                      <Brain className="h-6 w-6 text-slate-300" />
                    </div>
                    <p className="text-sm text-slate-500">
                      {(analytics?.total_responses ?? 0) === 0
                        ? "Collect some responses first, then run AI analysis."
                        : "Click 'AI Insights' to analyse your responses."}
                    </p>
                  </div>
                ) : insight.status === "failed" ? (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    Analysis failed. Try again.
                  </div>
                ) : insight.status === "processing" ? (
                  <p className="py-6 text-center text-sm text-slate-500">
                    Analysing {insight.total_responses_analyzed} responses…
                  </p>
                ) : (
                  <div className="space-y-4">
                    <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 ${sentimentBg[insight.overall_sentiment ?? "neutral"]}`}>
                      <span className="text-[12px] text-slate-500">Sentiment:</span>
                      <span className={`text-[12px] font-semibold capitalize ${sentimentColor[insight.overall_sentiment ?? "neutral"]}`}>
                        {insight.overall_sentiment}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        ({(parseFloat(insight.sentiment_score ?? "0") * 100).toFixed(0)}%)
                      </span>
                    </div>

                    {insight.summary && (
                      <p className="text-[13px] leading-relaxed text-slate-600">{insight.summary}</p>
                    )}

                    {insight.key_insights && insight.key_insights.length > 0 && (
                      <div>
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Key Insights</p>
                        <ul className="space-y-1.5">
                          {insight.key_insights.map((ins, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-[12.5px] text-slate-600">
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#f43f5e]" />
                              {ins}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {insight.suggestions && insight.suggestions.length > 0 && (
                      <div>
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Suggestions</p>
                        <ul className="space-y-1.5">
                          {insight.suggestions.map((s, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-[12.5px] text-slate-600">
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <p className="text-[11px] text-slate-400">
                      Based on {insight.total_responses_analyzed} responses
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Per-question analytics */}
        {(analytics?.question_analytics ?? []).length > 0 && (
          <div>
            <Reveal>
              <h2 className="mb-4 text-base font-semibold text-slate-900">Question Breakdown</h2>
            </Reveal>
            <div className="grid gap-4 sm:grid-cols-2">
              {analytics.question_analytics.map((qa, i) => (
                <Reveal key={qa.question_id} delay={i * 40}>
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
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
