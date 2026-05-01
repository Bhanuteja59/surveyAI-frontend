"use client";
import { useState, useRef } from "react";
import { Sparkles, Loader2, CheckCircle2, XCircle, StopCircle, Plus, Send, Settings2, Code2, PenLine, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { aiApi } from "@/lib/api";

/**
 * AIGenerator — prompt input + SSE trigger.
 *
 * Props:
 *   onStart(numQuestions)         — generation began; builder should clear & prepare N slots
 *   onMeta(title, description)    — survey title/description arrived; fill the meta fields
 *   onQuestion(questionObj)       — one question arrived; append it to the form live
 *   onDone()                      — stream finished (or cancelled); stop skeleton state
 *   onError(message)              — unrecoverable error
 *   onFinalize(title, desc, questions) — (Optional) callback to create survey directly
 */
export function AIGenerator({ onStart, onMeta, onQuestion, onDone, onError, onFinalize }) {
  const [prompt, setPrompt] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);

  // "idle" | "streaming" | "done" | "error"
  const [phase, setPhase] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [streamTitle, setStreamTitle] = useState("");
  const [streamDesc, setStreamDesc] = useState("");
  const [tempQuestions, setTempQuestions] = useState([]);

  const abortRef = useRef(null);

  // ── Cancel ──────────────────────────────────────────────────────────────────

  function cancel() {
    abortRef.current?.abort();
    setPhase("idle");
    setStreamTitle("");
    setStreamDesc("");
    setTempQuestions([]);
    onDone(); // keep whatever questions already arrived in the form
  }

  // ── Generate ────────────────────────────────────────────────────────────────

  async function handleGenerate() {
    const trimmed = prompt.trim();
    if (!trimmed) {
      setErrorMsg("Please describe what the survey is about.");
      setPhase("error");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setErrorMsg("");
    setStreamTitle("");
    setPhase("streaming");
    onStart(numQuestions);

    try {
      const data = await aiApi.generate(trimmed, numQuestions, controller.signal);

      // Update meta immediately
      const title = data.title || "";
      const description = data.description || "";
      setStreamTitle(title);
      setStreamDesc(description);
      onMeta(title, description);

      // "Stream" the questions visually using timeouts
      const questions = data.questions || [];
      if (questions.length === 0) {
        throw new Error("No questions were generated.");
      }

      questions.forEach((q, index) => {
        setTimeout(() => {
          onQuestion(q);
          setTempQuestions(prev => [...prev, q]);
        }, index * 200); // 200ms stagger between questions appearing
      });

      // Cleanup phase after the last question timeout
      setTimeout(() => {
        setPhase("done");
        if (!onFinalize) {
          setTimeout(() => {
            setPhase("idle");
            setPrompt("");
            setStreamTitle("");
            onDone();
          }, 1200);
        }
      }, questions.length * 200);

    } catch (err) {
      if (err.name === "AbortError") return;
      const msg = err.message || "Generation failed. Please try again.";
      setErrorMsg(msg);
      setPhase("error");
      onError(msg);
    }
  }

  // ── Derived state ───────────────────────────────────────────────────────────

  const isStreaming = phase === "streaming";
  const isDone = phase === "done";
  const isError = phase === "error";

  async function handleFinalize() {
    if (!onFinalize) return;
    setPhase("streaming"); // Use streaming state for loading
    try {
      await onFinalize(streamTitle, streamDesc, tempQuestions);
      setPhase("idle");
      setPrompt("");
      setTempQuestions([]);
    } catch (err) {
      setErrorMsg(err.message || "Failed to finalize.");
      setPhase("error");
    }
  }

  return (
    <div className="relative group p-[2.5px] rounded-[26px] bg-white transition-all duration-500 hover:scale-[1.01] hover:shadow-2xl hover:shadow-indigo-200/40">
      
      {/* ── Rotating 4-Side Magical Border ── */}
      <div className="absolute inset-0 rounded-[26px] overflow-hidden">
        <div className="absolute inset-[-1000%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#3b82f6_0%,#6366f1_25%,#a855f7_50%,#ec4899_75%,#3b82f6_100%)] opacity-30 group-hover:opacity-100 blur-sm transition-opacity duration-500" />
      </div>

      <div className="relative rounded-[24px] bg-white p-6 sm:p-8 overflow-hidden">
        {/* Subtle mesh background inside */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, #4f46e5 1px, transparent 0)`, backgroundSize: '32px 32px' }} />

        
        {/* ── Friendly & Attractive Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text text-xl sm:text-2xl font-black tracking-tight">
                The Best Survey Builder with AI
              </span>
              <Sparkles className="h-6 w-6 text-purple-500 animate-[bounce_3s_infinite]" />
            </div>
            <p className="text-sm font-semibold text-slate-500">
               Just tell us what you want to know! Our magical AI writes perfectly human questions for you.
            </p>
          </div>
        </div>

        {/* ── Input Box (Human Style) ── */}
        <div className="relative rounded-2xl bg-slate-50 border-2 border-slate-100 p-1 transition-all duration-300 focus-within:bg-white focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-50">
          <textarea
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              if (isError) { setErrorMsg(""); setPhase("idle"); }
            }}
            placeholder="Type your idea here... Example: 'I want to know if my customers liked the new chocolate cake.'"
            className="w-full min-h-[100px] bg-transparent resize-none text-slate-800 placeholder:text-slate-400 focus:outline-none text-[16px] font-medium leading-relaxed p-4"
            disabled={isStreaming || isDone}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && !isStreaming && !isDone) {
                handleGenerate();
              }
            }}
          />
        </div>

        {/* ── Processing & Feedback States ── */}
        {isError && errorMsg && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border-2 border-rose-200 bg-rose-50 px-5 py-4 text-rose-700 animate-slide-up shadow-sm">
            <XCircle className="h-5 w-5 shrink-0" />
            <p className="font-bold text-sm">Oops! {errorMsg}</p>
          </div>
        )}

        {isStreaming && (
          <div className="mt-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 p-[2px] animate-slide-up shadow-lg">
            <div className="bg-white rounded-[10px] px-5 py-4 flex items-center gap-4">
              <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
              <div className="flex flex-col">
                <span className="text-[15px] font-bold text-indigo-950">
                  {streamTitle ? `Writing your questions for: "${streamTitle}"...` : "Waking up the AI..."}
                </span>
                <span className="text-[12px] text-indigo-500 font-semibold mt-0.5">Please wait a few seconds!</span>
              </div>
            </div>
          </div>
        )}

        {isDone && (
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border-2 border-emerald-200 bg-emerald-50 p-4 gap-4 animate-slide-up">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 shadow-md shadow-emerald-200">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[15px] font-black text-emerald-900">All done! Your questions are ready.</span>
                <span className="text-[12px] font-bold text-emerald-600">Review them below and click Publish.</span>
              </div>
            </div>
            <Button variant="outline" onClick={cancel} className="h-9 border-emerald-300 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 font-bold hover:border-emerald-400">
              Clear & Start Over
            </Button>
          </div>
        )}

        {/* ── Interactive Footer Controls ── */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-5">
            
          {/* Question Counter (Highly Interactive) */}
          <div className="flex items-center gap-3 bg-white border-2 border-slate-100 rounded-xl px-2 py-1.5 shadow-sm w-full sm:w-auto justify-between sm:justify-start">
             <span className="text-[12px] font-black text-slate-500 uppercase px-2">How many questions?</span>
             <div className="flex items-center bg-slate-50 rounded-lg border border-slate-200 p-0.5">
               <button 
                 onClick={() => setNumQuestions(prev => Math.max(1, prev - 1))}
                 disabled={isStreaming || isDone}
                 className="flex h-8 w-8 items-center justify-center rounded-md bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 active:scale-95 disabled:opacity-50 transition-all font-bold text-lg"
               >
                 -
               </button>
               <span className="w-10 text-center text-[15px] font-black text-slate-800">{numQuestions}</span>
               <button 
                 onClick={() => setNumQuestions(prev => Math.min(15, prev + 1))}
                 disabled={isStreaming || isDone}
                 className="flex h-8 w-8 items-center justify-center rounded-md bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 active:scale-95 disabled:opacity-50 transition-all font-bold text-lg"
               >
                 +
               </button>
             </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full sm:w-auto space-y-2 sm:space-y-0">
            {isStreaming ? (
              <Button
                onClick={cancel}
                className="w-full sm:w-auto h-12 bg-slate-800 font-bold text-white hover:bg-black rounded-xl px-8 transition-transform active:scale-95 shadow-md shadow-slate-200 text-[15px]"
              >
                <StopCircle className="mr-2 h-5 w-5 text-rose-400" />
                Stop AI
              </Button>
            ) : isDone ? (
              onFinalize ? (
                <Button onClick={handleFinalize} className="w-full sm:w-auto h-12 bg-indigo-600 font-bold text-white hover:bg-indigo-700 shadow-xl shadow-indigo-200 rounded-xl px-8 animate-pulse transition-transform active:scale-95 text-[15px]">
                  <Plus className="mr-2 h-5 w-5" />
                  Save My Survey
                </Button>
              ) : null
            ) : (
              <Button
                onClick={handleGenerate}
                className="w-full sm:w-auto h-12 bg-indigo-600 font-black text-[15px] text-white shadow-lg shadow-indigo-200/80 hover:shadow-xl hover:shadow-indigo-300 hover:bg-indigo-700 rounded-xl px-8 transition-all active:scale-95 group/gen"
              >
                <Sparkles className="mr-2.5 h-5 w-5 text-indigo-300 group-hover/gen:text-white group-hover/gen:rotate-12 transition-all" />
                Generate Now
                <Send className="ml-2 h-4 w-4 opacity-50 group-hover/gen:opacity-100 group-hover/gen:translate-x-1 transition-all" />
              </Button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
