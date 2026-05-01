"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MessageCircle, CheckCircle2 } from "lucide-react";
import { surveysApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { FadeIn } from "@/lib/animations";

function SurveyProgress({ current, total }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between text-[12px]">
        <span className="font-medium text-slate-600">
          {current} of {total} {total === 1 ? "question" : "questions"} answered
        </span>
        <span className="font-bold text-indigo-600">{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full transition-all duration-500 bg-[#0d9488]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function PublicSurveyPage() {
  const params = useParams();
  const token = params.token;

  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [answers, setAnswers] = useState({});
  const [respondentName, setRespondentName] = useState("");
  const [respondentEmail, setRespondentEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [hasStarted, setHasStarted] = useState(false);
  const [isPreFilled, setIsPreFilled] = useState(false);

  useEffect(() => {
    // Secure level: Check if already completed to prevent duplicate filling UI
    if (typeof window !== "undefined") {
      const hasCompleted = localStorage.getItem(`survey_completed_${token}`);
      if (hasCompleted) {
        setSubmitted(true);
        setIsPreFilled(true);
        setLoading(false);
        return;
      }
    }

    surveysApi
      .getPublic(token)
      .then((data) => setSurvey(data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [token]);

  function setAnswer(question, value) {
    setAnswers((prev) => ({
      ...prev,
      [question.id]: { question_id: question.id, value },
    }));
  }

  function validate() {
    const errs = {};
    survey?.questions.forEach((q) => {
      if (q.is_required && !answers[q.id]?.value?.trim()) {
        errs[String(q.id)] = "This question is required";
      }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        respondent_name: respondentName || null,
        respondent_email: respondentEmail || null,
        answers: Object.values(answers).map(({ question_id, value }) => ({
          question_id,
          value,
        })),
      };
      await import("@/lib/api").then(({ responsesApi }) => responsesApi.submit(token, payload));
      if (typeof window !== "undefined") {
        localStorage.setItem(`survey_completed_${token}`, "true");
      }
      setSubmitted(true);
    } catch (err) {
      if (err.status === 409 || (err.message && err.message.toLowerCase().includes("already completed"))) {
        if (typeof window !== "undefined") {
          localStorage.setItem(`survey_completed_${token}`, "true");
        }
        setIsPreFilled(true);
        setSubmitted(true);
      } else {
        setErrors({ _submit: err.message || "Failed to submit. Please try again." });
      }
    } finally {
      setSubmitting(false);
    }
  }

  // Count how many required questions have been answered
  const answeredCount = survey
    ? survey.questions.filter((q) => answers[q.id]?.value?.trim()).length
    : 0;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#0d9488] border-t-transparent" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
          <MessageCircle className="h-7 w-7 text-slate-400" />
        </div>
        <h1 className="mb-1.5 text-lg font-bold text-slate-900">Survey not found</h1>
        <p className="text-sm text-slate-500">
          This survey doesn&apos;t exist or is no longer accepting responses.
        </p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center relative overflow-hidden">
        {/* Floating party elements */}
        <div className="absolute top-[15%] left-[10%] text-4xl animate-float-slow opacity-80">🎉</div>
        <div className="absolute top-[25%] right-[15%] text-5xl animate-float opacity-80">🥳</div>
        <div className="absolute bottom-[20%] left-[20%] text-3xl animate-float-delay opacity-80">✨</div>
        <div className="absolute bottom-[30%] right-[10%] text-4xl animate-float opacity-80">🎊</div>
        <div className="absolute top-[5%] left-[50%] text-2xl animate-float-slow opacity-60">💖</div>
        
        <FadeIn className="relative z-10 bg-white p-10 rounded-3xl shadow-xl max-w-md w-full border border-slate-100">
          <div
            className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full shadow-[0_0_40px_rgba(16,185,129,0.3)] transition-transform hover:scale-110 duration-500"
            style={{ background: "linear-gradient(135deg, #10b981, #34d399)" }}
          >
            <CheckCircle2 className="h-12 w-12 text-white" />
          </div>
          <h1 className="mb-3 text-3xl font-extrabold text-slate-900">
            {isPreFilled ? "Welcome Back!" : "You're Awesome!"}
          </h1>
          <p className="max-w-sm mx-auto text-[15px] leading-relaxed text-slate-500">
            {isPreFilled 
              ? "It looks like you've already shared your feedback for this survey. We really appreciate your earlier contribution!" 
              : "Your response has been safely recorded. Thank you so much for taking the time to share your thoughts with us today."
            }
          </p>
          <div className="mt-10 flex items-center justify-center gap-1.5 text-xs text-slate-400 font-semibold tracking-wide uppercase">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-[#0d9488]">
              <MessageCircle className="h-3 w-3 text-white" />
            </div>
            Powered by Lumino
          </div>
        </FadeIn>
      </div>
    );
  }

  if (!hasStarted && survey) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
        <FadeIn className="w-full max-w-md">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
            {/* Header / Cover */}
            <div className="px-8 py-12 text-center text-white relative animate-gradient-x overflow-hidden" style={{ background: "linear-gradient(-45deg, #0d9488, #3b82f6, #8b5cf6, #14b8a6)", backgroundSize: "400% 400%" }}>
              {/* Floating Emojis */}
              <div className="absolute top-4 left-6 text-3xl animate-float-slow opacity-90 cursor-default">✨</div>
              <div className="absolute bottom-6 right-8 text-4xl animate-float opacity-80 cursor-default">📝</div>
              <div className="absolute top-10 right-6 text-2xl animate-float-delay opacity-70 cursor-default">💡</div>
              <div className="absolute bottom-4 left-8 text-2xl animate-float-slow opacity-70 cursor-default">🚀</div>

              <div className="mx-auto mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-3xl bg-white/20 backdrop-blur-md shadow-lg relative z-10 transition-transform hover:scale-110 duration-500">
                <span className="text-4xl animate-waving-hand inline-block origin-[70%_70%]">👋</span>
              </div>
              <h1 className="text-[26px] font-extrabold relative z-10 leading-tight">{survey.title}</h1>
              {survey.description && (
                <p className="mt-4 text-[15px] font-medium text-white/90 relative z-10 max-w-sm mx-auto">{survey.description}</p>
              )}
            </div>
            
            {/* Action Area */}
            <div className="p-8 text-center bg-white">
              <p className="mb-8 text-[15px] leading-relaxed text-slate-500">
                It only takes a few minutes to complete this survey. We highly appreciate your feedback!
              </p>
              <Button 
                onClick={() => setHasStarted(true)} 
                size="lg" 
                className="w-full h-14 rounded-xl bg-slate-900 text-[15px] font-bold text-white shadow hover:bg-slate-800 transition-all active:scale-[0.98]"
              >
                Start Survey
              </Button>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <div className="flex h-4 w-4 items-center justify-center rounded bg-[#0d9488]">
              <MessageCircle className="h-2.5 w-2.5 text-white" />
            </div>
            Powered by Lumino
          </div>
        </FadeIn>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="mx-auto max-w-xl">

        <FadeIn className="mb-5 flex items-center justify-center gap-1.5">
          <div
            className="flex h-5 w-5 items-center justify-center rounded bg-[#0d9488]"
          >
            <MessageCircle className="h-3 w-3 text-white" />
          </div>
          <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">Lumino</span>
        </FadeIn>

        <FadeIn delay={60}>
          <div className="mb-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm" style={{ borderTop: "3px solid #0d9488" }}>
            <h1 className="text-lg font-bold text-slate-900">{survey?.title}</h1>
            {survey?.description && (
              <p className="mt-1.5 text-sm text-slate-500">{survey.description}</p>
            )}
          </div>
        </FadeIn>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Progress bar */}
          {survey && survey.questions.length > 0 && (
            <FadeIn delay={80}>
              <SurveyProgress current={answeredCount} total={survey.questions.length} />
            </FadeIn>
          )}

          <FadeIn delay={100}>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="mb-4 text-[12px] font-semibold uppercase tracking-wide text-slate-400">
                Your details <span className="normal-case font-normal text-slate-400">(optional)</span>
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Name"
                  value={respondentName}
                  onChange={(e) => setRespondentName(e.target.value)}
                  placeholder="Your name"
                />
                <Input
                  label="Email"
                  type="email"
                  value={respondentEmail}
                  onChange={(e) => setRespondentEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
            </div>
          </FadeIn>

          {survey?.questions.map((q, idx) => (
            <FadeIn key={q.id} delay={120 + idx * 50}>
              <div
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200"
                style={answers[q.id]?.value ? { borderLeft: "3px solid #0d9488" } : {}}
              >
                <div className="mb-4">
                  <label className="flex items-start gap-2.5 text-[13.5px] font-semibold text-slate-800">
                    <span
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white bg-[#0d9488]"
                    >
                      {idx + 1}
                    </span>
                    <span>
                      {q.text}
                      {q.is_required && <span className="ml-1 text-red-500">*</span>}
                    </span>
                  </label>
                  {errors[String(q.id)] && (
                    <p className="ml-7 mt-1 text-xs text-red-500">{errors[String(q.id)]}</p>
                  )}
                </div>

                {q.question_type === "multiple_choice" && (
                  <div className="ml-7 space-y-2">
                    {q.options?.choices?.map((choice) => (
                      <label
                        key={choice}
                        className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm text-slate-700 transition-all hover:border-teal-300 hover:bg-teal-50/50 has-[:checked]:border-teal-400 has-[:checked]:bg-teal-50"
                      >
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          value={choice}
                          checked={answers[q.id]?.value === choice}
                          onChange={() => setAnswer(q, choice)}
                          className="h-4 w-4 text-[#0d9488]"
                        />
                        {choice}
                      </label>
                    ))}
                  </div>
                )}

                {q.question_type === "dropdown" && (
                  <div className="ml-7">
                    <select
                      className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-[#0d9488] focus:outline-none focus:ring-1 focus:ring-[#0d9488]"
                      value={answers[q.id]?.value || ""}
                      onChange={(e) => setAnswer(q, e.target.value)}
                    >
                      <option value="">Select an option…</option>
                      {q.options?.choices?.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                )}

                {q.question_type === "rating" && (
                  <div className="ml-7">
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: (q.options?.max ?? 5) - (q.options?.min ?? 1) + 1 }).map((_, i) => {
                        const val = String((q.options?.min ?? 1) + i);
                        const selected = answers[q.id]?.value === val;
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setAnswer(q, val)}
                            className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 text-sm font-semibold transition-all ${
                              selected
                                ? "border-[#0d9488] bg-[#0d9488] text-white shadow-md shadow-teal-200"
                                : "border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:bg-teal-50"
                            }`}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                    {q.options?.labels && (
                      <div className="mt-2 flex justify-between text-xs text-slate-400">
                        <span>{q.options.labels[String(q.options.min ?? 1)] || ""}</span>
                        <span>{q.options.labels[String(q.options.max ?? 5)] || ""}</span>
                      </div>
                    )}
                  </div>
                )}

                {q.question_type === "text_input" && (
                  <div className="ml-7">
                    <Textarea
                      placeholder="Your answer…"
                      value={answers[q.id]?.value || ""}
                      onChange={(e) => setAnswer(q, e.target.value)}
                      rows={3}
                    />
                  </div>
                )}
              </div>
            </FadeIn>
          ))}

          {errors._submit && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {errors._submit}
            </div>
          )}

          <div className="flex justify-end pb-8">
            <Button
              type="submit"
              size="lg"
              loading={submitting}
              className="min-w-40"
            >
              Submit Response
            </Button>
          </div>
        </form>

        <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <div
            className="flex h-4 w-4 items-center justify-center rounded bg-[#0d9488]"
          >
            <MessageCircle className="h-2.5 w-2.5 text-white" />
          </div>
          Powered by Lumino
        </div>
      </div>
    </div>
  );
}
