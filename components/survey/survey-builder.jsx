"use client";
import { useState } from "react";
import { GripVertical, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { AIGenerator } from "./ai-generator";

const QUESTION_TYPES = [
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "rating", label: "Rating Scale" },
  { value: "text_input", label: "Text Input" },
  { value: "dropdown", label: "Dropdown" },
];

function newQuestion(index) {
  return {
    key: `q-${Date.now()}-${index}`,
    text: "",
    question_type: "multiple_choice",
    options: { choices: ["Option 1", "Option 2"] },
    is_required: true,
    order_index: index,
    tenant_id: 0,
  };
}

export function SurveyBuilder({ initialTitle = "", initialDescription = "", initialQuestions = [], onSave, saving }) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [questions, setQuestions] = useState(
    initialQuestions.length > 0 ? initialQuestions : [newQuestion(0)]
  );
  const [errors, setErrors] = useState({});

  function addQuestion() {
    setQuestions((qs) => [...qs, newQuestion(qs.length)]);
  }

  function removeQuestion(key) {
    setQuestions((qs) => qs.filter((q) => q.key !== key).map((q, i) => ({ ...q, order_index: i })));
  }

  function updateQuestion(key, patch) {
    setQuestions((qs) => qs.map((q) => (q.key === key ? { ...q, ...patch } : q)));
  }

  function moveQuestion(key, dir) {
    setQuestions((qs) => {
      const idx = qs.findIndex((q) => q.key === key);
      if (idx + dir < 0 || idx + dir >= qs.length) return qs;
      const next = [...qs];
      [next[idx], next[idx + dir]] = [next[idx + dir], next[idx]];
      return next.map((q, i) => ({ ...q, order_index: i }));
    });
  }

  function addChoice(key) {
    setQuestions((qs) =>
      qs.map((q) => {
        if (q.key !== key) return q;
        const choices = q.options?.choices || [];
        return { ...q, options: { ...q.options, choices: [...choices, `Option ${choices.length + 1}`] } };
      })
    );
  }

  function updateChoice(key, i, val) {
    setQuestions((qs) =>
      qs.map((q) => {
        if (q.key !== key) return q;
        const choices = [...(q.options?.choices || [])];
        choices[i] = val;
        return { ...q, options: { ...q.options, choices } };
      })
    );
  }

  function removeChoice(key, i) {
    setQuestions((qs) =>
      qs.map((q) => {
        if (q.key !== key) return q;
        const choices = (q.options?.choices || []).filter((_, idx) => idx !== i);
        return { ...q, options: { ...q.options, choices } };
      })
    );
  }

  function handleTypeChange(key, type) {
    setQuestions((qs) =>
      qs.map((q) => {
        if (q.key !== key) return q;
        let options = null;
        if (type === "multiple_choice" || type === "dropdown") {
          options = { choices: ["Option 1", "Option 2"] };
        } else if (type === "rating") {
          options = { min: 1, max: 5, labels: { "1": "Poor", "5": "Excellent" } };
        }
        return { ...q, question_type: type, options };
      })
    );
  }

  function validate() {
    const errs = {};
    if (!title.trim()) errs.title = "Survey title is required";
    questions.forEach((q) => {
      if (!q.text.trim()) errs[q.key] = "Question text is required";
      if ((q.question_type === "multiple_choice" || q.question_type === "dropdown") && (q.options?.choices?.length || 0) < 2) {
        errs[`${q.key}_choices`] = "At least 2 choices required";
      }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleAIStart() {
    setTitle("");
    setDescription("");
    // Clear out the starting blank question so it can fill smoothly
    setQuestions([]);
    setErrors({});
  }

  function handleAIMeta(newTitle, newDesc) {
    if (newTitle) setTitle(newTitle);
    if (newDesc) setDescription(newDesc);
  }

  function handleAIQuestion(q) {
    if (!q.text) return; // Ignore malformed questions
    setQuestions((prev) => [
      ...prev,
      {
        key: `ai-q-${Date.now()}-${prev.length}`,
        text: q.text,
        question_type: q.question_type || "multiple_choice",
        options: q.options || { choices: ["Option 1", "Option 2"] },
        is_required: q.is_required !== false,
        order_index: prev.length,
        tenant_id: 0,
      },
    ]);
  }

  function handleAIDone() {
    // If it errored out totally or returned 0 questions, give them at least one blank slot
    setQuestions((prev) => (prev.length === 0 ? [newQuestion(0)] : prev));
  }

  function handleAIError(msg) {
    console.error("AI Error:", msg);
    setErrors({ fetch: msg });
  }

  function handleSubmit(_publish) {
    if (!validate()) return;
    const qs = questions.map(({ key, ...rest }) => rest);
    onSave(title, description, qs);
  }

  return (
    <div className="space-y-6">
      <AIGenerator 
        onStart={handleAIStart}
        onMeta={handleAIMeta}
        onQuestion={handleAIQuestion}
        onDone={handleAIDone}
        onError={handleAIError}
      />
      
      {/* Survey meta */}
      <Card>
        <CardHeader>
          <CardTitle>Survey Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Survey Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Customer Satisfaction Q4 2025"
            error={errors.title}
          />
          <Textarea
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Briefly describe what this survey is about"
          />
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((q, idx) => (
          <Card key={q.key}>
            <CardContent className="p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <button onClick={() => moveQuestion(q.key, -1)} disabled={idx === 0} className="text-slate-400 hover:text-slate-600 disabled:opacity-30">
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button onClick={() => moveQuestion(q.key, 1)} disabled={idx === questions.length - 1} className="text-slate-400 hover:text-slate-600 disabled:opacity-30">
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-600">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <Input
                    value={q.text}
                    onChange={(e) => updateQuestion(q.key, { text: e.target.value })}
                    placeholder="Enter your question"
                    error={errors[q.key]}
                  />
                </div>
                <div className="w-44 shrink-0">
                  <Select
                    options={QUESTION_TYPES}
                    value={q.question_type}
                    onChange={(e) => handleTypeChange(q.key, e.target.value)}
                  />
                </div>
                <button
                  onClick={() => removeQuestion(q.key)}
                  disabled={questions.length === 1}
                  className="shrink-0 text-red-400 hover:text-red-600 disabled:opacity-30"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {(q.question_type === "multiple_choice" || q.question_type === "dropdown") && (
                <div className="ml-10 space-y-2">
                  {(q.options?.choices || []).map((choice, ci) => (
                    <div key={ci} className="flex items-center gap-2">
                      <div className={cn("h-4 w-4 shrink-0 border-2 border-slate-300", q.question_type === "multiple_choice" ? "rounded-full" : "rounded")} />
                      <Input
                        value={choice}
                        onChange={(e) => updateChoice(q.key, ci, e.target.value)}
                        className="flex-1"
                        placeholder={`Choice ${ci + 1}`}
                      />
                      <button onClick={() => removeChoice(q.key, ci)} disabled={(q.options?.choices?.length || 0) <= 2} className="text-slate-400 hover:text-red-500 disabled:opacity-30">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  {errors[`${q.key}_choices`] && <p className="text-xs text-red-600">{errors[`${q.key}_choices`]}</p>}
                  <button onClick={() => addChoice(q.key)} className="flex items-center gap-1 text-sm text-indigo-600 hover:underline">
                    <Plus className="h-3.5 w-3.5" /> Add choice
                  </button>
                </div>
              )}

              {q.question_type === "rating" && (
                <div className="ml-10 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Input
                      label="Min"
                      type="number"
                      className="w-20"
                      value={q.options?.min ?? 1}
                      onChange={(e) => updateQuestion(q.key, { options: { ...q.options, min: parseInt(e.target.value) } })}
                    />
                    <Input
                      label="Max"
                      type="number"
                      className="w-20"
                      value={q.options?.max ?? 5}
                      onChange={(e) => updateQuestion(q.key, { options: { ...q.options, max: parseInt(e.target.value) } })}
                    />
                  </div>
                  <div className="flex gap-0.5 mt-5">
                    {Array.from({ length: (q.options?.max ?? 5) - (q.options?.min ?? 1) + 1 }).map((_, i) => (
                      <div key={i} className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-indigo-200 bg-indigo-50 text-xs font-semibold text-indigo-600">
                        {(q.options?.min ?? 1) + i}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {q.question_type === "text_input" && (
                <div className="ml-10">
                  <div className="rounded-lg border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-400">
                    Respondents will type their answer here…
                  </div>
                </div>
              )}

              <div className="ml-10 mt-3 flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`required-${q.key}`}
                  checked={q.is_required}
                  onChange={(e) => updateQuestion(q.key, { is_required: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                />
                <label htmlFor={`required-${q.key}`} className="text-sm text-slate-600">Required</label>
              </div>
            </CardContent>
          </Card>
        ))}

        <button onClick={addQuestion} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-4 text-sm font-medium text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors">
          <Plus className="h-4 w-4" />
          Add Question
        </button>
      </div>

      {/* Save actions */}
      <div className="flex justify-end gap-3 pb-8">
        <Button variant="outline" onClick={() => handleSubmit(false)} loading={saving} disabled={saving}>
          Save as Draft
        </Button>
        <Button onClick={() => handleSubmit(true)} loading={saving} disabled={saving}>
          Save Survey
        </Button>
      </div>
    </div>
  );
}
