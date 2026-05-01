"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { surveysApi } from "@/lib/api";
import { useAuthGuard } from "@/lib/use-auth-guard";
import { Navbar } from "@/components/dashboard/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FadeIn, Reveal } from "@/lib/animations";
import { formatDate } from "@/lib/utils";
import { BarChart2, Copy, ExternalLink, FileText, Plus, Trash2 } from "lucide-react";

export default function SurveysPage() {
  useAuthGuard();
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);

  const load = useCallback(async () => {
    try {
      const data = await surveysApi.list();
      setSurveys(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, [load]);

  function copyLink(token, id) {
    navigator.clipboard.writeText(`${window.location.origin}/s/${token}`);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  async function deleteSurvey(id) {
    if (!confirm("Delete this survey? This cannot be undone.")) return;
    try {
      await surveysApi.delete(id);
      setSurveys((s) => s.filter((sv) => sv.id !== id));
    } catch (err) {
      alert(err.message || "Failed to delete survey.");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex h-80 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <FadeIn className="mb-7 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Surveys</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              {surveys.length === 0
                ? "No surveys yet"
                : `${surveys.length} ${surveys.length === 1 ? "survey" : "surveys"} in your workspace`}
            </p>
          </div>
          <Link href="/surveys/new">
            <Button size="sm">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New Survey
            </Button>
          </Link>
        </FadeIn>

        {/* Empty state */}
        {/* Empty state */}
        {surveys.length === 0 ? (
          <Reveal>
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50">
                <FileText className="h-7 w-7 text-teal-500" />
              </div>
              <h3 className="mb-1 text-base font-semibold text-slate-700">No surveys yet</h3>
              <p className="mb-5 text-sm text-slate-500">
                Create your first survey and start collecting responses.
              </p>
              <Link href="/surveys/new">
                <Button size="sm">Create your first survey</Button>
              </Link>
            </div>
          </Reveal>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            
            {/* Left Column: Live Section */}
            <section className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                   <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                   <h2 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-500">Live Channels</h2>
                </div>
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100">
                  {surveys.filter(s => s.is_published).length} Active
                </span>
              </div>
              <div className="grid gap-4">
                {surveys.filter(s => s.is_published).length > 0 ? (
                  surveys.filter(s => s.is_published).map((survey, i) => (
                    <SurveyCard 
                      key={survey.id} 
                      survey={survey} 
                      index={i} 
                      copied={copied} 
                      onCopy={copyLink} 
                      onDelete={deleteSurvey} 
                    />
                  ))
                ) : (
                  <div className="py-12 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
                    <p className="text-xs text-slate-400 font-medium tracking-tight">No live surveys found.</p>
                  </div>
                )}
              </div>
            </section>

            {/* Right Column: Drafts Section */}
            <section className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                   <div className="h-2 w-2 rounded-full bg-amber-500" />
                   <h2 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-500">Draft Blueprints</h2>
                </div>
                <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-100">
                  {surveys.filter(s => !s.is_published).length} Pending
                </span>
              </div>
              <div className="grid gap-4">
                {surveys.filter(s => !s.is_published).length > 0 ? (
                  surveys.filter(s => !s.is_published).map((survey, i) => (
                    <SurveyCard 
                      key={survey.id} 
                      survey={survey} 
                      index={i} 
                      copied={copied} 
                      onCopy={copyLink} 
                      onDelete={deleteSurvey} 
                    />
                  ))
                ) : (
                  <div className="py-12 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
                    <p className="text-xs text-slate-400 font-medium tracking-tight">Your staging area is empty.</p>
                  </div>
                )}
              </div>
            </section>

          </div>
        )}
      </main>
    </div>
  );
}

function SurveyCard({ survey, index, copied, onCopy, onDelete }) {
  return (
    <Reveal delay={index * 40}>
      <div className="group relative flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-100 hover:shadow-lg">
        {/* Colored top accent */}
        <div
          className="absolute inset-x-0 top-0 h-1 rounded-t-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          style={{ background: survey.is_published ? "linear-gradient(90deg, #10b981, #3b82f6)" : "linear-gradient(90deg, #f59e0b, #ef4444)" }}
        />

        {/* Title row */}
        <div className="mb-2 flex items-start justify-between gap-2">
          <Link href={`/surveys/${survey.id}`} className="min-w-0 flex-1 group/title">
            <h3 className="truncate text-[14px] font-bold text-slate-900 transition-colors group-hover:text-indigo-600">
              {survey.title}
            </h3>
          </Link>
          <Badge variant={survey.is_published ? "success" : "secondary"} className="shrink-0 text-[10px] uppercase font-bold tracking-tight">
            {survey.is_published ? "Live" : "Draft"}
          </Badge>
        </div>

        {/* Description */}
        {survey.description && (
          <p className="mb-3 line-clamp-2 text-[12px] text-slate-500 leading-relaxed font-medium">{survey.description}</p>
        )}

        {/* Meta */}
        <div className="mb-4 mt-auto flex items-center gap-3 text-[11px] text-slate-400 font-bold">
          <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
            <BarChart2 className="h-3 w-3" />
            {survey.response_count} {survey.response_count === 1 ? "response" : "responses"}
          </span>
          <span>{formatDate(survey.created_at)}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
          <Link href={`/surveys/${survey.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full text-[11px] font-bold h-8 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-600">
              View Analytics
            </Button>
          </Link>

          {survey.is_published && (
            <button
              title="Copy survey link"
              onClick={() => onCopy(survey.public_token, survey.id)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-colors hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600"
            >
              {copied === survey.id ? (
                <span className="text-[10px] font-bold text-emerald-600">✓</span>
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          )}

          {survey.is_published && (
            <a href={`/s/${survey.public_token}`} target="_blank" rel="noreferrer">
              <button
                title="Open survey"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-colors hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </a>
          )}

          <button
            title="Delete survey"
            onClick={() => onDelete(survey.id)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-500"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </Reveal>
  );
}
