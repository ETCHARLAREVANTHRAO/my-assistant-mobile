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


export interface DoubtSolveResponse {
  answer: string;
  extracted_text: string;
}

export async function solveDoubt(input: {
  message: string;
  subject?: string;
  topic?: string;
  file?: File | null;
}): Promise<DoubtSolveResponse> {
  const form = new FormData();
  form.append('message', input.message);
  form.append('subject', input.subject ?? '');
  form.append('topic', input.topic ?? '');
  if (input.file) form.append('file', input.file);
  const { data } = await api.post<DoubtSolveResponse>('/doubts/solve', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
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

// â”€â”€ GATE PYQ mock test â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface PYQSectionSummary {
  section: string;
  section_title: string;
  subject: string | null;
  chapter: string | null;
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
  subject: string | null;
  chapter: string | null;
  question_type: 'MCQ' | 'MSQ' | 'NAT';
  marks: number;
  negative_marking: number;
  given_answer: PYQAnswer;
  correct_answer: string | string[];
  status: 'correct' | 'incorrect' | 'unattempted';
  marks_awarded: number;
  time_spent_seconds: number;
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
  time_spent_seconds: number;
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

// image_url / option-image paths come back as "/pyq-assets/..." â€” resolve against the API host.
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
  time_spent_seconds: Record<string, number> = {},
): Promise<PYQResult> {
  const { data } = await api.post<PYQResult>(`/pyq/attempts/${attemptId}/submit`, { answers, time_spent_seconds });
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


export interface StatBucket {
  key: string;
  attempted: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  accuracy: number;
  total_time_seconds: number;
  avg_time_seconds: number;
}

export interface ImprovementPoint {
  submitted_at: string;
  paper_title: string;
  total_marks: number;
  max_marks: number;
  accuracy: number;
}

export interface TimeManagementSummary {
  total_time_seconds: number;
  avg_time_per_attempted_seconds: number;
  fastest_correct_seconds: number | null;
  slowest_incorrect_seconds: number | null;
  overtime_questions: number;
}

export interface AnalyticsResponse {
  total_attempts: number;
  total_marks: number;
  total_max_marks: number;
  overall_accuracy: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  topics: StatBucket[];
  subjects: StatBucket[];
  chapters: StatBucket[];
  sections: StatBucket[];
  difficulty: StatBucket[];
  weak_topics: StatBucket[];
  strong_topics: StatBucket[];
  improvement_graph: ImprovementPoint[];
  time_management: TimeManagementSummary;
  rank_prediction: string | null;
  percentile_prediction: number | null;
  personalized_study_plan: string[];
}

export async function pyqGetAnalytics(): Promise<AnalyticsResponse> {
  const { data } = await api.get<AnalyticsResponse>('/pyq/analytics');
  return data;
}

export interface StudyPlanTaskCreate {
  title: string;
  subject?: string;
  topic?: string;
  planned_date: string;
  start_time?: string;
  duration_minutes?: number;
  priority?: string;
  notes?: string;
  reminder_enabled?: boolean;
}

export interface StudyPlanTaskUpdate {
  title?: string;
  subject?: string;
  topic?: string;
  planned_date?: string;
  start_time?: string;
  duration_minutes?: number;
  priority?: string;
  notes?: string;
  reminder_enabled?: boolean;
  completed?: boolean;
}

export interface StudyPlanTask {
  task_id: string;
  title: string;
  subject: string;
  topic: string;
  planned_date: string;
  start_time: string;
  duration_minutes: number;
  priority: string;
  notes: string;
  reminder_enabled: boolean;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudyPlannerSummary {
  tasks: StudyPlanTask[];
  today_key: string;
  weekly_hours_goal: number;
  weekly_completed_minutes: number;
  weekly_planned_minutes: number;
  completion_rate: number;
  current_streak: number;
  longest_streak: number;
  completed_today: boolean;
  revision_reminders: StudyPlanTask[];
}

export async function plannerGetSummary(): Promise<StudyPlannerSummary> {
  const { data } = await api.get<StudyPlannerSummary>('/planner/summary');
  return data;
}

export async function plannerCreateTask(input: StudyPlanTaskCreate): Promise<StudyPlanTask> {
  const { data } = await api.post<StudyPlanTask>('/planner/tasks', input);
  return data;
}

export async function plannerUpdateTask(taskId: string, input: StudyPlanTaskUpdate): Promise<StudyPlanTask> {
  const { data } = await api.patch<StudyPlanTask>(`/planner/tasks/${taskId}`, input);
  return data;
}

export async function plannerCompleteTask(taskId: string): Promise<StudyPlanTask> {
  const { data } = await api.post<StudyPlanTask>(`/planner/tasks/${taskId}/complete`);
  return data;
}

export async function plannerDeleteTask(taskId: string): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/planner/tasks/${taskId}`);
  return data;
}

export async function plannerSetGoal(weekly_hours_goal: number): Promise<StudyPlannerSummary> {
  const { data } = await api.put<StudyPlannerSummary>('/planner/goal', { weekly_hours_goal });
  return data;
}
export interface ResourceBookRecommendation {
  subject: string;
  title: string;
  author: string;
  use_for: string;
}

export interface ResourceFormulaSheet {
  subject: string;
  chapter: string;
  formulas: string[];
}

export interface ResourceCheatSheet {
  subject: string;
  chapter: string;
  points: string[];
}

export interface ResourceShortTrick {
  subject: string;
  title: string;
  trick: string;
  example: string;
}

export interface ResourcePYQSolution {
  paper_id: string;
  paper_title: string;
  question_id: string;
  subject: string | null;
  chapter: string | null;
  topic: string | null;
  difficulty: string | null;
  question_type: 'MCQ' | 'MSQ' | 'NAT';
  marks: number;
  question: string;
  options: Record<string, string> | null;
  image_url: string | null;
  correct_answer: string | string[];
  explanation: string | null;
  solution_steps: string[] | null;
}

export interface ErrorNotebookItem {
  notebook_id: string;
  attempt_id: string;
  paper_id: string;
  paper_title: string;
  submitted_at: string;
  question_id: string;
  subject: string | null;
  chapter: string | null;
  topic: string | null;
  difficulty: string | null;
  question_type: 'MCQ' | 'MSQ' | 'NAT';
  marks: number;
  marks_awarded: number;
  time_spent_seconds: number;
  question: string;
  options: Record<string, string> | null;
  image_url: string | null;
  given_answer: string | string[] | null;
  correct_answer: string | string[];
  explanation: string | null;
  solution_steps: string[] | null;
  resolved: boolean;
  status: string;
  note: string;
}

export interface ResourcesSummaryResponse {
  pyq_solutions: ResourcePYQSolution[];
  formula_sheets: ResourceFormulaSheet[];
  cheat_sheets: ResourceCheatSheet[];
  short_tricks: ResourceShortTrick[];
  error_notebook: ErrorNotebookItem[];
}

export async function resourcesGetSummary(): Promise<ResourcesSummaryResponse> {
  const { data } = await api.get<ResourcesSummaryResponse>('/resources/summary');
  return data;
}

export async function resourcesUpdateErrorNotebook(
  notebookId: string,
  input: { resolved?: boolean; note?: string },
): Promise<ResourcesSummaryResponse> {
  const { data } = await api.patch<ResourcesSummaryResponse>(`/resources/error-notebook/${encodeURIComponent(notebookId)}`, input);
  return data;
}
export async function aiTutor(input: { topic: string; level?: string }): Promise<{ answer: string }> {
  const { data } = await api.post<{ answer: string }>('/ai/tutor', input);
  return data;
}

export async function aiQuizGenerator(input: { topic: string; count?: number; difficulty?: string }): Promise<{ answer: string }> {
  const { data } = await api.post<{ answer: string }>('/ai/quiz-generator', input);
  return data;
}

export async function aiExamMentor(input: { concern: string }): Promise<{ answer: string }> {
  const { data } = await api.post<{ answer: string }>('/ai/exam-mentor', input);
  return data;
}

export async function aiRevisionPlan(input: { days: number; target: string }): Promise<{ answer: string }> {
  const { data } = await api.post<{ answer: string }>('/ai/revision-plan', input);
  return data;
}

export async function getExamInfo(): Promise<any> {
  const { data } = await api.get('/exam-info');
  return data;
}

export async function getMotivation(): Promise<any> {
  const { data } = await api.get('/motivation');
  return data;
}

export async function getRevision(): Promise<any> {
  const { data } = await api.get('/revision');
  return data;
}

export async function getCommunity(): Promise<any> {
  const { data } = await api.get('/community');
  return data;
}

export async function createCommunityPost(input: { title: string; content: string; category?: string }): Promise<any> {
  const { data } = await api.post('/community/posts', input);
  return data;
}
export interface AdminContentPayload {
  formula_sheets: ResourceFormulaSheet[];
  cheat_sheets: ResourceCheatSheet[];
  book_recommendations: ResourceBookRecommendation[];
  short_tricks: ResourceShortTrick[];
  exam_info: any;
  mentor_sessions: Array<{ title: string; status: string }>;
}

export async function adminGetContent(): Promise<AdminContentPayload> {
  const { data } = await api.get<AdminContentPayload>('/admin/content');
  return data;
}

export async function adminSaveContent(input: Partial<AdminContentPayload>): Promise<AdminContentPayload> {
  const { data } = await api.put<AdminContentPayload>('/admin/content', input);
  return data;
}

export async function adminResetContent(): Promise<AdminContentPayload> {
  const { data } = await api.post<AdminContentPayload>('/admin/content/reset');
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






