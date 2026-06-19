import axios from 'axios';

// Change this to your Railway URL after deploying, or your PC's IP for local dev
// e.g. "http://192.168.1.100:8000" for local, "https://my-assistant.up.railway.app" for cloud
export const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

const api = axios.create({ baseURL: BASE_URL, timeout: 30000 });

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
    form.append('file', { uri, name: filename, type: 'text/markdown' } as any);
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
