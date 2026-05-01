import { getStoredToken } from "@/lib/auth";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

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

  if ((res.status === 401 || res.status === 403) && !options.skipAutoRedirect) {
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      const { clearAuth } = await import("@/lib/auth");
      clearAuth();
      window.location.href = "/login?error=" + encodeURIComponent(res.status === 403 ? "Your organization is suspended." : "Session expired.");
    }
  }

  if (!res.ok) {
    let detail = `Request failed: ${res.status}`;
    try {
      const data = await res.json();
      if (data.detail) {
        detail = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
      }
    } catch { }
    const error = new Error(detail);
    error.status = res.status;
    throw error;
  }

  return res.json();
}

// ── Auth ───────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(data) }),

  login: (data) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(data) }),

  verifyOtp: (data) =>
    request("/auth/verify-otp", { method: "POST", body: JSON.stringify(data) }),

  me: () => request("/auth/me"),
};

// ── Surveys ────────────────────────────────────────────────────────────────

export const surveysApi = {
  list: (opts = {}) => request("/surveys", opts),

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
  dashboard: (opts = {}) => request("/analytics/dashboard", opts),

  survey: (surveyId) => request(`/analytics/surveys/${surveyId}`),

  openDashboardStream: (onData, onError) => {
    const ctrl = new AbortController();
    const token = getStoredToken();

    fetch(`${BASE}/analytics/dashboard/stream`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: ctrl.signal,
    })
      .then(async (res) => {
        if (!res.ok) { onError(new Error("Not authorized")); return; }
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let buf = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop(); // keep remainder
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const raw = line.slice(6).trim();
              if (raw && raw !== "{}") {
                try { onData(JSON.parse(raw)); } catch { }
              }
            }
          }
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") onError(err);
      });

    return ctrl;
  }
};

// ── AI ─────────────────────────────────────────────────────────────────────

export const aiApi = {
  trigger: (surveyId, sync = true) =>
    request(`/ai/surveys/${surveyId}/analyze${sync ? "?sync=true" : ""}`, { method: "POST" }),

  latestInsight: (surveyId) => request(`/ai/surveys/${surveyId}/insights/latest`),

  async generate(prompt, num_questions, signal) {
    const token = getStoredToken();
    const res = await fetch(`${BASE}/ai/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ prompt, num_questions }),
      signal,
    });

    if (!res.ok) {
      let detail = `Request failed: ${res.status}`;
      try {
        const d = await res.json();
        if (d.detail) detail = typeof d.detail === "string" ? d.detail : JSON.stringify(d.detail);
      } catch { }
      throw new Error(detail);
    }

    return res.json();
  },

};
