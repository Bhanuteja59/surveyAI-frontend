"use client";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/dashboard/navbar";
import { surveysApi } from "@/lib/api";
import { useAuthGuard } from "@/lib/use-auth-guard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/lib/animations";
import { Link2, Code, Webhook, CheckCircle2, ChevronDown, Copy, Zap } from "lucide-react";

export default function IntegratePage() {
  useAuthGuard();
  const [surveys, setSurveys] = useState([]);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [loading, setLoading] = useState(true);

  // Webhook form state
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Snippet state
  const [copiedIframe, setCopiedIframe] = useState(false);

  const [activeTab, setActiveTab] = useState("web"); // "web" | "mobile" | "webhooks"
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const [copiedScript, setCopiedScript] = useState(false);

  useEffect(() => {
    surveysApi.list().then((res) => {
      setSurveys(res);
      setLoading(false);
      const live = res.filter(s => s.is_published);
      if (live.length > 0) {
        loadSurveyDetails(live[0].id);
      }
    }).catch(() => setLoading(false));
  }, []);

  async function loadSurveyDetails(id) {
    try {
      const fullSurvey = await surveysApi.get(id);
      setSelectedSurvey(fullSurvey);
      setWebhookUrl(fullSurvey.webhook_url || "");
      setWebhookSecret(fullSurvey.webhook_secret || "");
      setSaveSuccess(false);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleSaveWebhook(e) {
    e.preventDefault();
    if (!selectedSurvey) return;
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      const updated = await surveysApi.update(selectedSurvey.id, {
        webhook_url: webhookUrl,
        webhook_secret: webhookSecret
      });
      setSelectedSurvey(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }

  function copyToClipboard(text, setCopied) {
    navigator.clipboard.writeText(text);
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

  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const publicUrl = selectedSurvey ? `${origin}/s/${selectedSurvey.public_token}` : '';
  const iframeSnippet = `<iframe src="${publicUrl}" width="100%" height="600" frameborder="0" allowfullscreen></iframe>`;
  const scriptSnippet = `<script \n  src="${origin}/embed.js" \n  data-survey-token="${selectedSurvey?.public_token}" \n  async>\n</script>`;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        <FadeIn className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Link2 className="h-6 w-6 text-indigo-500" />
            Integrate Lumino
          </h1>
          <p className="mt-2 text-sm text-slate-500 max-w-2xl">
            Seamlessly embed your surveys into external platforms. Choose between web embedding, mobile apps, or set up real-time webhooks.
          </p>
        </FadeIn>

        {surveys.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            You don't have any surveys yet. Create a survey to integrate it.
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-12">
            
            {/* 1. Category Side-nav (Mindset first: Web or App?) */}
            <div className="lg:col-span-2 space-y-1">
              <h3 className="mb-2 px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Method</h3>
              <TabBtn 
                active={activeTab === "web"} 
                onClick={() => setActiveTab("web")}
                icon={<Code className="h-4 w-4" />}
                label="Webpage"
                sub="Embedded"
              />
              <TabBtn 
                active={activeTab === "mobile"} 
                onClick={() => setActiveTab("mobile")}
                icon={<Link2 className="h-4 w-4" />}
                label="Mobile App"
                sub="Native/WebView"
              />
              <TabBtn 
                active={activeTab === "webhooks"} 
                onClick={() => setActiveTab("webhooks")}
                icon={<Webhook className="h-4 w-4" />}
                label="Webhooks"
                sub="API Push"
              />
            </div>

            {/* 2. Survey Selector (Which content?) */}
            <div className="lg:col-span-3">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm h-full max-h-[600px] overflow-y-auto">
                <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Select Survey</h3>
                <div className="space-y-1">
                  {surveys.filter(s => s.is_published).map((s) => (
                    <button
                      key={s.id}
                      onClick={() => loadSurveyDetails(s.id)}
                      className={`w-full text-left flex flex-col p-2.5 rounded-lg border transition-all ${
                        selectedSurvey?.id === s.id 
                          ? "border-indigo-200 bg-indigo-50/60 text-indigo-700 shadow-sm" 
                          : "border-transparent text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span className="font-semibold text-sm truncate">{s.title}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="success" className="text-[8px] px-1 py-0">
                          Live
                        </Badge>
                        <span className="text-[10px] text-slate-400 font-medium">{s.id}</span>
                      </div>
                    </button>
                  ))}
                  {surveys.filter(s => s.is_published).length === 0 && (
                    <div className="py-8 text-center px-4">
                       <p className="text-xs text-slate-400">No live surveys found. Publish a survey to see it here.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Integration Details (Final Output) */}
            <div className="lg:col-span-7">
              {selectedSurvey ? (
                <div className="space-y-6">
                    {!selectedSurvey.is_published && (
                      <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-[13px] text-amber-800 flex items-start gap-2.5">
                        <ChevronDown className="h-4 w-4 rotate-90 shrink-0" />
                        <span><strong>Draft Mode:</strong> This survey is not yet published. Integration tokens will not work until you go live.</span>
                      </div>
                    )}

                    {/* ── Webpage Content ── */}
                    {activeTab === "web" && (
                      <FadeIn className="space-y-6">
                        <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                          <Header icon={<Zap className="text-amber-500" />} title="Smart Script Tag" />
                          <div className="p-5 space-y-4">
                            <p className="text-[13px] text-slate-500">The modern way. Just drop this script tag anywhere on your page and we handle the rest.</p>
                            <CodeBlock 
                              label="Auto-Loader Script" 
                              code={scriptSnippet} 
                              onCopy={() => copyToClipboard(scriptSnippet, setCopiedScript)}
                              isCopied={copiedScript}
                            />
                            <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg text-[11px] text-indigo-700 leading-relaxed">
                               <strong>Custom Container?</strong> Add <code className="bg-white px-1 border rounded">data-container="my-div-id"</code> to the script to inject the survey into a specific element.
                            </div>
                          </div>
                        </section>

                        <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                          <Header icon={<Code className="text-indigo-500" />} title="Classic Iframe" />
                          <div className="p-5 space-y-4">
                            <p className="text-[13px] text-slate-500">Traditional embedding using a standard iframe container.</p>
                            <CodeBlock 
                              label="HTML Iframe Snippet" 
                              code={iframeSnippet} 
                              onCopy={() => copyToClipboard(iframeSnippet, setCopiedIframe)}
                              isCopied={copiedIframe}
                            />
                          </div>
                        </section>

                        <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                          <Header icon={<Link2 className="text-teal-500" />} title="Direct Public Link" />
                          <div className="p-5 space-y-4">
                            <p className="text-[13px] text-slate-500">Use this link for "Share" buttons, newsletters, or simple hyper-links.</p>
                            <CodeBlock 
                              label="Full Survey URL" 
                              code={publicUrl} 
                              onCopy={() => copyToClipboard(publicUrl, setCopiedLink)}
                              isCopied={copiedLink}
                            />
                          </div>
                        </section>
                      </FadeIn>
                    )}

                    {/* ── Mobile App Content ── */}
                    {activeTab === "mobile" && (
                      <FadeIn className="space-y-6">
                        <section className="rounded-2xl border border-blue-100 bg-blue-50/40 p-10 flex flex-col items-center text-center shadow-sm">
                           <div className="mb-6 h-20 w-20 rounded-[2rem] bg-blue-100/50 flex items-center justify-center text-blue-600 animate-float">
                              <Zap size={32} />
                           </div>
                           <h2 className="text-2xl font-black text-blue-900 mb-3 tracking-tight">Mobile Integration (Beta)</h2>
                           <p className="text-slate-500 text-sm max-w-md leading-relaxed mb-6">
                             Our development team is currently in progress of finalizing the Native SDKs for Flutter and React Native.
                           </p>
                           <div className="flex items-center gap-2 px-4 py-2 bg-blue-100/50 rounded-full border border-blue-200">
                             <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                             <span className="text-[11px] font-bold text-blue-700 uppercase tracking-widest text-[10px]">Coding in progress</span>
                           </div>
                           <p className="mt-8 text-xs text-blue-400 font-medium">We will release these modules very soon. Stay tuned!</p>
                        </section>
                      </FadeIn>
                    )}

                    {/* ── Webhooks Content ── */}
                    {activeTab === "webhooks" && (
                      <FadeIn className="space-y-6">
                        <section className="rounded-2xl border border-fuchsia-100 bg-fuchsia-50/40 p-10 flex flex-col items-center text-center shadow-sm">
                           <div className="mb-6 h-20 w-20 rounded-[2rem] bg-fuchsia-100/50 flex items-center justify-center text-fuchsia-600 animate-float-slow">
                              <Webhook size={32} />
                           </div>
                           <h2 className="text-2xl font-black text-fuchsia-900 mb-3 tracking-tight">Real-time Webhooks</h2>
                           <p className="text-slate-500 text-sm max-w-md leading-relaxed mb-6">
                             Our core engineers are currently architecting the high-concurrency webhook dispatcher.
                           </p>
                           <div className="flex items-center gap-2 px-4 py-2 bg-fuchsia-100/50 rounded-full border border-fuchsia-200">
                             <div className="h-2 w-2 rounded-full bg-fuchsia-500 animate-pulse" />
                             <span className="text-[11px] font-bold text-fuchsia-700 uppercase tracking-widest text-[10px]">Under Construction</span>
                           </div>
                           <p className="mt-8 text-xs text-fuchsia-400 font-medium whitespace-pre-wrap">The development team will fix and activate these live streams shortly.</p>
                        </section>
                      </FadeIn>
                    )}

                </div>
              ) : (
                <div className="h-64 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 bg-white/40">
                  <Link2 className="h-8 w-8 mb-2 opacity-20" />
                  <p className="text-sm font-medium">Select a survey to view integration snippets</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function TabBtn({ active, onClick, icon, label, sub }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 ${
        active 
          ? "border-slate-800 bg-slate-900 text-white shadow-lg" 
          : "border-transparent bg-white text-slate-600 hover:border-slate-200 hover:bg-slate-50"
      }`}
    >
      <div className={`p-2 rounded-lg ${active ? "bg-slate-800" : "bg-slate-100"}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-[13px] font-bold leading-tight">{label}</p>
        <p className={`text-[10px] ${active ? "text-slate-400" : "text-slate-400"}`}>{sub}</p>
      </div>
    </button>
  );
}

function Header({ icon, title }) {
  return (
    <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-3.5 flex items-center gap-2">
      {icon}
      <h3 className="font-semibold text-sm text-slate-800">{title}</h3>
    </div>
  );
}

function CodeBlock({ label, code, onCopy, isCopied }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-[12px] font-bold text-slate-600">{label}</label>
        <button onClick={onCopy} className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
          {isCopied ? <><CheckCircle2 className="h-3 w-3" /> Copied!</> : <><Copy className="h-3 w-3" /> Copy Snippet</>}
        </button>
      </div>
      <pre className="overflow-x-auto rounded-lg bg-slate-900 p-3.5 text-[12px] text-indigo-300 font-mono leading-relaxed border border-slate-800">
        <code>{code}</code>
      </pre>
    </div>
  );
}
