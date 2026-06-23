import axios from 'axios';
import { Platform } from 'react-native';
import { auth } from '../config/firebase';

export const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://my-assistant-backend-nxwg.onrender.com';

const api = axios.create({ baseURL: BASE_URL, timeout: 30000 });

// Attach Firebase ID token to every request
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
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

  upload: async (uri: string, filename: string): Promise<string> => {
    const form = new FormData();
    if (Platform.OS === 'web') {
      const response = await fetch(uri);
      const blob = await response.blob();
      form.append('file', blob, filename);
    } else {
      form.append('file', { uri, name: filename, type: 'application/octet-stream' } as any);
    }
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
