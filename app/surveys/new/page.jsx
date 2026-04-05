"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/lib/use-auth-guard";
import { Navbar } from "@/components/dashboard/navbar";
import { SurveyBuilder } from "@/components/survey/survey-builder";
import { FadeIn } from "@/lib/animations";
import { surveysApi } from "@/lib/api";

export default function NewSurveyPage() {
  useAuthGuard();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(title, description, questions) {
    setSaving(true);
    setError("");
    try {
      const survey = await surveysApi.create({ title, description, questions });
      router.push(`/surveys/${survey.id}`);
    } catch (err) {
      setError(err.message || "Failed to create survey. Please try again.");
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <FadeIn className="mb-6">
          <h1 className="text-xl font-bold text-slate-900">Create Survey</h1>
          <p className="mt-1 text-sm text-slate-500">
            Add your questions below, then save as a draft or publish straight away.
          </p>
        </FadeIn>
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
        <FadeIn delay={80}>
          <SurveyBuilder onSave={handleSave} saving={saving} />
        </FadeIn>
      </main>
    </div>
  );
}
