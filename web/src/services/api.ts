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

// image_url / option-image paths come back as "/pyq-assets/..." — resolve against the API host.
export const pyqAssetUrl = (path: string): string => `${API_URL}${path}`;

export async function pyqListPapers(): Promise<PYQPaperSummary[]> {
  const { data } = await api.get<PYQPaperSummary[]>('/pyq/papers');
  return data;
}

export async function pyqGetPaper(paperId: string): Promise<PYQPaperDetail> {
  const { data } = await api.get<PYQPaperDetail>(`/pyq/papers/${paperId}`);
  return data;
}

export async function pyqStartAttempt(paperId: string): Promise<PYQAttemptStartResponse> {
  const { data } = await api.post<PYQAttemptStartResponse>(`/pyq/papers/${paperId}/attempts`);
  return data;
}

export async function pyqSubmitAttempt(
  attemptId: string,
  answers: Record<string, PYQAnswer>,
): Promise<PYQResult> {
  const { data } = await api.post<PYQResult>(`/pyq/attempts/${attemptId}/submit`, { answers });
  return data;
}

export async function pyqGetResult(attemptId: string): Promise<PYQResult> {
  const { data } = await api.get<PYQResult>(`/pyq/attempts/${attemptId}`);
  return data;
}


export interface PracticeFilter {
  subjects?: string[];
  chapters?: string[];
  topics?: string[];
  sections?: string[];
  difficulty?: string[];
  question_types?: string[];
  count?: number;
}

export interface PracticeOption {
  name: string;
  question_count: number;
}

export interface PracticeChapterOption extends PracticeOption {
  subject: string;
}

export interface PracticeTopicOption extends PracticeOption {
  subject: string;
  chapter: string;
}

export interface PracticeTaxonomyResponse {
  subjects: PracticeOption[];
  chapters: PracticeChapterOption[];
  topics: PracticeTopicOption[];
  difficulty: PracticeOption[];
  question_types: PracticeOption[];
}

export async function pyqGetPracticeTaxonomy(): Promise<PracticeTaxonomyResponse> {
  const { data } = await api.get<PracticeTaxonomyResponse>('/pyq/practice/taxonomy');
  return data;
}

export async function pyqStartPractice(filter: PracticeFilter): Promise<PYQAttemptStartResponse> {
  const { data } = await api.post<PYQAttemptStartResponse>('/pyq/practice/start', filter);
  return data;
}

export async function pyqListAttempts(): Promise<PYQAttemptSummary[]> {
  const { data } = await api.get<PYQAttemptSummary[]>('/pyq/attempts');
  return data;
}

export default api;

// Learning syllabus

export interface VideoLecture {
  title: string;
  provider: string;
  url: string;
  embed_url: string | null;
  duration_minutes: number | null;
}

export interface LearningTopic {
  slug: string;
  title: string;
  priority: number;
  status: string;
  concepts: string[];
  written_notes: string;
  revision_summary: string;
  formula_sheet: string[];
  mind_map: string[];
  pyq_concepts: string[];
  video_lectures: VideoLecture[];
}

export interface LearningSubjectSummary {
  slug: string;
  name: string;
  exam_weight: string;
  description: string;
  topic_count: number;
}

export interface LearningSubjectDetail extends LearningSubjectSummary {
  topics: LearningTopic[];
}

export async function learningGetSyllabus(): Promise<LearningSubjectDetail[]> {
  const { data } = await api.get<LearningSubjectDetail[]>('/learning/syllabus');
  return data;
}

export async function learningGetSubject(subjectSlug: string): Promise<LearningSubjectDetail> {
  const { data } = await api.get<LearningSubjectDetail>(`/learning/subjects/${subjectSlug}`);
  return data;
}
