import axios from 'axios';
import { Platform } from 'react-native';
import { auth } from '../config/firebase';

export const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://my-assistant-backend-nxwg.onrender.com';

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

export const documentsApi = {
  list: async (): Promise<string[]> => {
    const { data } = await api.get<{ documents: string[] }>('/documents');
    return data.documents;
  },

  upload: async (uri: string, filename: string, file?: File): Promise<string> => {
    if (Platform.OS === 'web') {
      const form = new FormData();

      if (file instanceof File) {
        form.append('file', file, filename);
      } else {
        try {
          const blobRes = await fetch(uri);
          const blob = await blobRes.blob();
          form.append('file', blob, filename);
        } catch (blobErr: any) {
          throw new Error('Could not read file: ' + (blobErr.message ?? 'unknown'));
        }
      }

      const headers: Record<string, string> = {};
      try {
        const user = auth.currentUser;
        if (user) headers['Authorization'] = `Bearer ${await user.getIdToken()}`;
      } catch {}

      let res: Response;
      try {
        res = await fetch(`${BASE_URL}/documents/upload`, { method: 'POST', headers, body: form });
      } catch (netErr: any) {
        throw new Error('Could not reach server (' + BASE_URL + '): ' + (netErr.message ?? 'network error'));
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail ?? 'Server error ' + res.status);
      }
      const json = await res.json();
      return json.message;
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
