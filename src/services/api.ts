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

export const signOut = async () => {
  await auth.signOut();
};
