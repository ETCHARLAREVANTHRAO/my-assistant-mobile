import axios from 'axios';
import { Platform } from 'react-native';
import { auth } from '../config/firebase';

// Web: route through Vercel proxy (/backend → Render) — no CORS needed
// Mobile: call Render directly
const RENDER_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://my-assistant-backend-nxwg.onrender.com';
export const BASE_URL = Platform.OS === 'web' ? '/backend' : RENDER_URL;

const api = axios.create({ baseURL: BASE_URL, timeout: 30000 });

// Attach Firebase ID token to every request (if logged in)
api.interceptors.request.use(async (config) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // Firebase not ready — proceed without auth header
  }
  return config;
});

export interface ChatResponse {
  reply: string;
  sources: string[];
}

export interface WeatherData {
  city: string;
  temperature_c: number;
  feels_like_c: number;
  description: string;
  humidity: number;
  wind_speed_ms: number;
  icon: string;
}

export const chatApi = {
  send: async (message: string): Promise<ChatResponse> => {
    const { data } = await api.post<ChatResponse>('/chat', { message });
    return data;
  },
};

export interface DocumentsResponse {
  documents: string[];
  used_bytes: number;
  limit_bytes: number;
}

export const documentsApi = {
  list: async (): Promise<DocumentsResponse> => {
    const { data } = await api.get<DocumentsResponse>('/documents');
    return data;
  },

  upload: async (uri: string, filename: string, file?: File): Promise<string> => {
    if (Platform.OS === 'web') {
      // `file` is always a real File object when called from the native <input type="file">
      if (!(file instanceof File)) throw new Error('No file provided.');

      const form = new FormData();
      form.append('file', file, file.name);

      const headers: Record<string, string> = {};
      try {
        const user = auth.currentUser;
        if (user) headers['Authorization'] = `Bearer ${await user.getIdToken()}`;
      } catch {}

      let res: Response;
      try {
        res = await fetch(`${BASE_URL}/documents/upload`, { method: 'POST', headers, body: form });
      } catch (netErr: any) {
        throw new Error('Network error — could not reach server: ' + (netErr.message ?? 'Failed to fetch'));
      }

      if (!res.ok) {
        let detail = `Server error ${res.status}`;
        try {
          const body = await res.text();
          try { detail = (JSON.parse(body).detail) || detail; } catch { if (body) detail = body.slice(0, 300); }
        } catch {}
        throw new Error(detail);
      }
      const json = await res.json();
      return json.message || 'Uploaded successfully!';
    }
    // Mobile: use axios with RN file object
    const form = new FormData();
    form.append('file', { uri, name: filename, type: 'application/octet-stream' } as any);
    const { data } = await api.post<{ message: string }>('/documents/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.message;
  },

  delete: async (filename: string): Promise<void> => {
    await api.delete(`/documents/${encodeURIComponent(filename)}`);
  },
};

export const weatherApi = {
  get: async (city: string): Promise<WeatherData> => {
    const { data } = await api.get<WeatherData>('/weather', { params: { city } });
    return data;
  },
};

export const usageApi = {
  get: async () => {
    const { data } = await api.get('/usage');
    return data;
  },
};

export const signOut = async () => {
  await auth.signOut();
};

// ── GATE PYQ mock test ──────────────────────────────────────────────────────

export interface PYQSectionSummary {
  section: string;
  section_title: string;
  question_count: number;
  total_marks: number;
}

export interface PYQPaperSummary {
  paper_id: string;
  title: string;
  year: number;
  shift: number;
  duration_minutes: number;
  total_questions: number;
  total_marks: number;
  sections: PYQSectionSummary[];
}

export interface PYQQuestion {
  question_id: string;
  question_type: 'MCQ' | 'MSQ' | 'NAT';
  section: string;
  section_title: string;
  question: string;
  image_url: string | null;
  options: Record<string, string> | null;
  marks: number;
  negative_marking: number;
}

export interface PYQPaperDetail extends PYQPaperSummary {
  questions: PYQQuestion[];
}

export interface PYQAttemptStartResponse {
  attempt_id: string;
  started_at: string;
  duration_minutes: number;
  paper: PYQPaperDetail;
}

export type PYQAnswer = string | string[] | null;

export interface PYQQuestionResult {
  question_id: string;
  section: string;
  section_title: string;
  question_type: 'MCQ' | 'MSQ' | 'NAT';
  marks: number;
  negative_marking: number;
  given_answer: PYQAnswer;
  correct_answer: string | string[];
  status: 'correct' | 'incorrect' | 'unattempted';
  marks_awarded: number;
  question: string;
  options: Record<string, string> | null;
  image_url: string | null;
  explanation: string | null;
  solution_steps: string[] | null;
  topic: string | null;
  difficulty: string | null;
}

export interface PYQSectionResult {
  section: string;
  section_title: string;
  total_questions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  max_marks: number;
  marks_scored: number;
}

export interface PYQResult {
  attempt_id: string;
  paper_id: string;
  paper_title: string;
  total_marks: number;
  max_marks: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  duration_minutes: number;
  time_taken_seconds: number;
  submitted_at: string;
  sections: PYQSectionResult[];
  questions: PYQQuestionResult[];
}

export interface PYQAttemptSummary {
  attempt_id: string;
  paper_id: string;
  paper_title: string;
  total_marks: number;
  max_marks: number;
  submitted_at: string;
}

// image_url / option-image paths come back as "/pyq-assets/..." — resolve against
// the same host the API client is already using.
export const pyqAssetUrl = (path: string): string => `${BASE_URL}${path}`;

export const pyqApi = {
  listPapers: async (): Promise<PYQPaperSummary[]> => {
    const { data } = await api.get<PYQPaperSummary[]>('/pyq/papers');
    return data;
  },

  getPaper: async (paperId: string): Promise<PYQPaperDetail> => {
    const { data } = await api.get<PYQPaperDetail>(`/pyq/papers/${paperId}`);
    return data;
  },

  startAttempt: async (paperId: string): Promise<PYQAttemptStartResponse> => {
    const { data } = await api.post<PYQAttemptStartResponse>(`/pyq/papers/${paperId}/attempts`);
    return data;
  },

  submitAttempt: async (attemptId: string, answers: Record<string, PYQAnswer>): Promise<PYQResult> => {
    const { data } = await api.post<PYQResult>(`/pyq/attempts/${attemptId}/submit`, { answers });
    return data;
  },

  getResult: async (attemptId: string): Promise<PYQResult> => {
    const { data } = await api.get<PYQResult>(`/pyq/attempts/${attemptId}`);
    return data;
  },

  listAttempts: async (): Promise<PYQAttemptSummary[]> => {
    const { data } = await api.get<PYQAttemptSummary[]>('/pyq/attempts');
    return data;
  },
};

// ── Exam RAG backend ──────────────────────────────────────────────────────────
const EXAM_URL = Platform.OS === 'web' ? '/exam' : 'https://exam-rag-backend.onrender.com';

export interface ExamChatResponse {
  reply: string;
  sources: string[];
}

export const examApi = {
  chat: async (message: string): Promise<ExamChatResponse> => {
    const user = auth.currentUser;
    const user_id = user?.uid ?? 'anon';
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (user) {
      try { headers['Authorization'] = `Bearer ${await user.getIdToken()}`; } catch {}
    }
    const res = await fetch(`${EXAM_URL}/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message, user_id }),
    });
    if (!res.ok) throw new Error(`Server error ${res.status}`);
    return res.json();
  },
};
