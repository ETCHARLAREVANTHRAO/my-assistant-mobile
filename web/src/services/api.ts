import axios from 'axios';
import { auth } from '../config/firebase';

const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ||
  'https://my-assistant-backend-nxwg.onrender.com';

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface ChatResponse {
  reply: string;
  sources: string[];
}

export async function sendChatMessage(
  message: string,
  sessionId?: string,
): Promise<ChatResponse> {
  const { data } = await api.post<ChatResponse>('/chat', {
    message,
    session_id: sessionId,
  });
  return data;
}

export interface DocumentsResponse {
  documents: string[];
  used_bytes: number;
  limit_bytes: number;
}

export async function getDocuments(): Promise<DocumentsResponse> {
  const { data } = await api.get<DocumentsResponse>('/documents');
  return data;
}

export interface UploadResponse {
  filename: string;
  chunks_stored: number;
  message: string;
}

export async function uploadDocument(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post<UploadResponse>('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function deleteDocument(filename: string): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(
    `/documents/${encodeURIComponent(filename)}`,
  );
  return data;
}

export interface DriveSyncResponse {
  ingested: string[];
  skipped: string[];
  failed: string[];
}

export async function syncDrive(): Promise<DriveSyncResponse> {
  const { data } = await api.post<DriveSyncResponse>('/documents/drive-sync');
  return data;
}

export default api;
