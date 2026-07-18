import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

type Source = 'notes' | 'pyq';
type TestMode = 'practice' | 'timed';

export default function QuizSetup() {
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [source, setSource] = useState<Source>('notes');
  const [questionCount, setQuestionCount] = useState(15);
  const [mode, setMode] = useState<TestMode>('practice');

  return (
    <Layout activePage="quiz" title="Quiz Setup">
      <div className="p-gutter overflow-y-auto w-full max-w-container-max mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Setup Card */}
          <div className="lg:col-span-8">
            <div className="bg-surface rounded-xl shadow-soft border border-border p-6 transition-all duration-200 ease-in-out hover:shadow-hover flex flex-col gap-stack-lg">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-text-primary mb-2">Configure Your Practice Session</h3>
                <p className="font-body-md text-body-md text-text-muted">
                  Tailor the quiz to target specific topics and formats to match your current preparation phase.
                </p>
              </div>
              {/* Subject Picker */}
              <div className="flex flex-col gap-2">
                <label className="font-label-md text-label-md text-text-primary" htmlFor="subject-picker">
                  Subject / Topic
                </label>
                <div className="relative">
                  <select
                    className="w-full bg-surface-container-lowest border border-border text-on-background rounded-lg px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-body-md transition-all"
                    id="subject-picker"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  >
                    <option disabled value="">
                      Select a subject...
                    </option>
                    <option value="algorithms">Algorithms</option>
                    <option value="data-structures">Data Structures</option>
                    <option value="os">Operating Systems</option>
                    <option value="dbms">Database Management Systems</option>
                    <option value="toc">Theory of Computation</option>
                    <option value="mixed">Mixed Subject Mock</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-on-surface-variant">
                    <span className="material-symbols-outlined">expand_more</span>
                  </div>
                </div>
              </div>
              {/* Source Toggle */}
              <div className="flex flex-col gap-2">
                <label className="font-label-md text-label-md text-text-primary mb-1">Question Source</label>
                <div className="flex p-1 bg-surface-container rounded-lg max-w-md">
                  <button
                    onClick={() => setSource('notes')}
                    className={
                      source === 'notes'
                        ? 'flex-1 py-2 px-4 rounded-md bg-surface text-primary shadow-sm font-label-md text-label-md transition-all text-center'
                        : 'flex-1 py-2 px-4 rounded-md text-on-surface-variant hover:text-primary transition-all font-label-md text-label-md text-center'
                    }
                  >
                    My Notes (RAG)
                  </button>
                  <button
                    onClick={() => setSource('pyq')}
                    className={
                      source === 'pyq'
                        ? 'flex-1 py-2 px-4 rounded-md bg-surface text-primary shadow-sm font-label-md text-label-md transition-all text-center'
                        : 'flex-1 py-2 px-4 rounded-md text-on-surface-variant hover:text-primary transition-all font-label-md text-label-md text-center'
                    }
                  >
                    Previous Year Questions (PYQs)
                  </button>
                </div>
                <p className="font-body-md text-[13px] text-text-muted mt-1 ml-1">
                  {source === 'notes'
                    ? 'Generate questions based on your uploaded documents.'
                    : 'Practice with real GATE previous year questions.'}
                </p>
              </div>
              {/* Number of Questions */}
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <label className="font-label-md text-label-md text-text-primary" htmlFor="question-count">
                    Number of Questions
                  </label>
                  <span className="font-code text-code text-primary bg-primary-fixed px-2 py-1 rounded-md font-medium">
                    {questionCount}
                  </span>
                </div>
                <input
                  className="w-full h-2 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary"
                  id="question-count"
                  max={50}
                  min={5}
                  step={5}
                  type="range"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                />
                <div className="flex justify-between text-text-muted font-label-sm text-label-sm px-1">
                  <span>5 (Quick Review)</span>
                  <span>50 (Full Test)</span>
                </div>
              </div>
              {/* Mode Toggle */}
              <div className="flex flex-col gap-3">
                <label className="font-label-md text-label-md text-text-primary">Test Mode</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Practice Mode */}
                  <label
                    className={
                      mode === 'practice'
                        ? 'cursor-pointer relative flex p-4 bg-surface-container-lowest border-2 border-primary rounded-xl shadow-sm items-start gap-4 transition-all hover:bg-surface-container-low group'
                        : 'cursor-pointer relative flex p-4 bg-surface border border-border rounded-xl shadow-sm items-start gap-4 transition-all hover:border-outline-variant hover:shadow-soft group'
                    }
                  >
                    <input
                      checked={mode === 'practice'}
                      onChange={() => setMode('practice')}
                      className="peer sr-only"
                      name="test_mode"
                      type="radio"
                      value="practice"
                    />
                    <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-primary">psychology</span>
                    </div>
                    <div>
                      <h4 className="font-label-md text-label-md text-text-primary group-hover:text-primary transition-colors">
                        Practice Mode
                      </h4>
                      <p className="font-body-md text-[13px] text-text-muted mt-1 leading-relaxed">
                        Untimed. Immediate feedback and detailed step-by-step solutions after each question.
                      </p>
                    </div>
                    {mode === 'practice' && (
                      <div className="absolute top-4 right-4 text-primary">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                          check_circle
                        </span>
                      </div>
                    )}
                  </label>
                  {/* Timed Mode */}
                  <label
                    className={
                      mode === 'timed'
                        ? 'cursor-pointer relative flex p-4 bg-surface-container-lowest border-2 border-secondary rounded-xl shadow-sm items-start gap-4 transition-all hover:bg-surface-container-low group'
                        : 'cursor-pointer relative flex p-4 bg-surface border border-border rounded-xl shadow-sm items-start gap-4 transition-all hover:border-outline-variant hover:shadow-soft group'
                    }
                  >
                    <input
                      checked={mode === 'timed'}
                      onChange={() => setMode('timed')}
                      className="peer sr-only"
                      name="test_mode"
                      type="radio"
                      value="timed"
                    />
                    <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center shrink-0 group-hover:bg-secondary-fixed transition-colors">
                      <span className="material-symbols-outlined text-on-surface-variant group-hover:text-secondary">timer</span>
                    </div>
                    <div>
                      <h4 className="font-label-md text-label-md text-text-primary group-hover:text-secondary transition-colors">
                        Timed Speed Drill
                      </h4>
                      <p className="font-body-md text-[13px] text-text-muted mt-1 leading-relaxed">
                        Simulates exam conditions. Countdown timer per question. Results at the end.
                      </p>
                    </div>
                    {mode === 'timed' && (
                      <div className="absolute top-4 right-4 text-secondary">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                          check_circle
                        </span>
                      </div>
                    )}
                  </label>
                </div>
              </div>
              {/* Start Action */}
              <div className="pt-4 border-t border-border mt-2 flex justify-end">
                <button
                  onClick={() => navigate('/quiz/results')}
                  disabled={!subject}
                  className="bg-primary hover:bg-on-primary-fixed-variant text-white font-label-md text-label-md py-3 px-8 rounded-lg shadow-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  <span>Start Quiz</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
          {/* Secondary Info Panel / Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Analytics Snippet Card */}
            <div className="bg-surface rounded-xl shadow-soft border border-border p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-secondary">insights</span>
                <h3 className="font-headline-sm text-headline-sm text-text-primary">GATE CS Focus Areas</h3>
              </div>
              <p className="font-body-md text-[14px] text-text-muted leading-relaxed">
                Based on recent trends, these topics have the highest weightage in the exam. Consider prioritizing
                them in your drills.
              </p>
              <div className="flex flex-col gap-3 mt-2">
                {[
                  { label: 'Algorithms', pct: 15, width: 75, color: 'bg-primary' },
                  { label: 'Operating Systems', pct: 12, width: 60, color: 'bg-secondary' },
                  { label: 'Computer Networks', pct: 10, width: 50, color: 'bg-secondary-container' },
                  { label: 'Data Structures', pct: 9, width: 45, color: 'bg-outline' },
                ].map((row) => (
                  <div key={row.label} className="flex flex-col gap-1">
                    <div className="flex justify-between font-label-sm text-label-sm">
                      <span className="text-on-surface">{row.label}</span>
                      <span className="text-text-muted font-code">{row.pct}%</span>
                    </div>
                    <div className="w-full h-2 bg-surface-variant rounded-full overflow-hidden">
                      <div className={`h-full ${row.color} rounded-full`} style={{ width: `${row.width}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Quick Tips Card */}
            <div className="bg-surface-bright rounded-xl border border-primary-fixed-dim p-5 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary-fixed rounded-full opacity-50 blur-xl group-hover:scale-110 transition-transform duration-500" />
              <div className="relative z-10">
                <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-sm">lightbulb</span>
                </div>
                <h4 className="font-label-md text-label-md text-text-primary mb-2">Reduce Test Anxiety</h4>
                <ul className="font-body-md text-[14px] text-text-muted space-y-2 list-disc list-inside">
                  <li>Start with shorter, 10-question practice drills to build momentum.</li>
                  <li>Focus on accuracy over speed during the early stages of preparation.</li>
                  <li>Review all detailed solutions, even for questions you answered correctly.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
