import { getStoredToken } from "@/lib/auth";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function request(path, options = {}) {
  const token = getStoredToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${BASE}${path}`, { 
    ...options, 
    headers,
    cache: "no-store",
  });

  if (res.status === 204) return null;

  if (!res.ok) {
    let detail = `Request failed: ${res.status}`;
    try {
      const data = await res.json();
      if (data.detail) {
        detail = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
      }
    } catch {}
    throw new Error(detail);
  }

  return res.json();
}

// ── Auth ───────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(data) }),

  login: (data) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(data) }),

  me: () => request("/auth/me"),
};

// ── Surveys ────────────────────────────────────────────────────────────────

export const surveysApi = {
  list: () => request("/surveys"),

  get: (id) => request(`/surveys/${id}`),

  create: (data) =>
    request("/surveys", { method: "POST", body: JSON.stringify(data) }),

  update: (id, data) =>
    request(`/surveys/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  delete: (id) =>
    request(`/surveys/${id}`, { method: "DELETE" }),

  getPublic: (token) => request(`/surveys/public/${token}`),

  addQuestion: (surveyId, data) =>
    request(`/surveys/${surveyId}/questions`, { method: "POST", body: JSON.stringify(data) }),

  updateQuestion: (surveyId, questionId, data) =>
    request(`/surveys/${surveyId}/questions/${questionId}`, { method: "PATCH", body: JSON.stringify(data) }),

  deleteQuestion: (surveyId, questionId) =>
    request(`/surveys/${surveyId}/questions/${questionId}`, { method: "DELETE" }),
};

// ── Responses ──────────────────────────────────────────────────────────────

export const responsesApi = {
  submit: (token, data) =>
    request(`/surveys/public/${token}/respond`, { method: "POST", body: JSON.stringify(data) }),

  list: (surveyId) => request(`/surveys/${surveyId}/responses`),
};

// ── Analytics ──────────────────────────────────────────────────────────────

export const analyticsApi = {
  dashboard: () => request("/analytics/dashboard"),

  survey: (surveyId) => request(`/analytics/surveys/${surveyId}`),
};

// ── AI ─────────────────────────────────────────────────────────────────────

export const aiApi = {
  trigger: (surveyId) =>
    request(`/ai/surveys/${surveyId}/analyze`, { method: "POST" }),

  latestInsight: (surveyId) => request(`/ai/surveys/${surveyId}/insights/latest`),
};
