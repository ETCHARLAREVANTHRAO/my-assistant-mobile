import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type PaletteStatus = 'answered' | 'not-answered' | 'not-visited' | 'marked' | 'current';

const PALETTE_STATUSES: PaletteStatus[] = [
  'answered', 'answered', 'not-answered', 'answered', 'marked', 'answered', 'not-answered',
  'not-visited', 'not-visited', 'marked', 'answered', 'answered', 'not-answered', 'current',
  'not-visited', 'not-visited', 'not-visited', 'not-visited', 'not-visited', 'not-visited',
];

function paletteClasses(status: PaletteStatus): string {
  switch (status) {
    case 'answered':
      return 'bg-success text-on-primary shadow-sm hover:opacity-90';
    case 'not-answered':
      return 'bg-error-container text-on-error-container hover:bg-error-container/80';
    case 'marked':
      return 'bg-secondary text-on-secondary shadow-sm hover:opacity-90';
    case 'current':
      return 'font-bold bg-primary text-on-primary ring-2 ring-primary-fixed-dim ring-offset-2 ring-offset-surface shadow-md';
    default:
      return 'bg-surface border border-outline-variant text-on-surface hover:bg-surface-container';
  }
}

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
}

export default function MockTestSession() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [secondsLeft, setSecondsLeft] = useState(2 * 3600 + 45 * 60 + 13);
  const [section, setSection] = useState<'technical' | 'aptitude'>('technical');

  useEffect(() => {
    const id = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  const timerLow = secondsLeft < 5 * 60;

  return (
    <div className="bg-background text-on-surface h-screen w-screen overflow-hidden flex flex-col antialiased">
      {/* Top Navigation Bar (Test Header) */}
      <header className="h-16 bg-surface border-b border-border shadow-sm flex items-center justify-between px-gutter shrink-0 z-20">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              school
            </span>
          </div>
          <h1 className="font-headline-sm text-headline-sm text-on-surface">GATE CS Mock Test #1</h1>
        </div>
        <nav className="hidden md:flex bg-surface-container p-1 rounded-lg">
          <button
            onClick={() => setSection('technical')}
            className={
              section === 'technical'
                ? 'px-4 py-1.5 rounded bg-surface shadow-sm font-label-md text-label-md text-primary font-semibold'
                : 'px-4 py-1.5 rounded font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors'
            }
          >
            Technical
          </button>
          <button
            onClick={() => setSection('aptitude')}
            className={
              section === 'aptitude'
                ? 'px-4 py-1.5 rounded bg-surface shadow-sm font-label-md text-label-md text-primary font-semibold'
                : 'px-4 py-1.5 rounded font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors'
            }
          >
            General Aptitude
          </button>
        </nav>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Time Left
            </span>
            <div className={`flex items-center gap-1.5 ${timerLow ? 'text-error' : 'text-primary'}`}>
              <span className="material-symbols-outlined text-[20px] pb-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
                timer
              </span>
              <span className="font-code text-headline-md font-bold tracking-wider">{formatTime(secondsLeft)}</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/mock-test/results')}
            className="h-10 px-6 rounded-lg bg-error hover:bg-on-error-container text-on-error font-label-md text-label-md font-bold transition-colors shadow-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              send
            </span>
            Submit Test
          </button>
        </div>
      </header>
      {/* Main Workspace */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left Area: Question Canvas */}
        <section className="flex-1 flex flex-col overflow-hidden relative">
          <div className="flex-1 overflow-y-auto p-gutter pb-32">
            <div className="max-w-[900px] mx-auto">
              <div className="flex items-center justify-between mb-stack-md border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-container text-on-primary-container font-headline-sm text-headline-sm">
                    14
                  </span>
                  <span className="font-label-md text-label-md text-on-surface-variant">Multiple Choice Question</span>
                </div>
                <div className="flex gap-2">
                  <span className="px-2 py-1 rounded bg-surface-container-high text-on-surface font-label-sm text-label-sm border border-outline-variant">
                    +2.0 Marks
                  </span>
                  <span className="px-2 py-1 rounded bg-error-container text-on-error-container font-label-sm text-label-sm border border-error-container">
                    -0.66 Marks
                  </span>
                </div>
              </div>
              <div className="font-body-lg text-body-lg text-on-surface space-y-stack-md">
                <p>Consider the following C program. What will be the output of the program?</p>
                <div className="bg-surface-container border border-outline-variant rounded-lg p-4 font-code text-code text-on-surface overflow-x-auto shadow-sm">
                  <pre>
                    <code>
                      <span className="text-secondary">#include</span> &lt;stdio.h&gt;
                      {'\n\n'}
                      <span className="text-primary">void</span> <span className="text-tertiary">swap</span>(
                      <span className="text-primary">char</span> *x, <span className="text-primary">char</span> *y)
                      {' {\n'}
                      {'    '}
                      <span className="text-primary">char</span> *t = x;
                      {'\n    x = y;\n    y = t;\n}'}
                      {'\n\n'}
                      <span className="text-primary">int</span> <span className="text-tertiary">main</span>()
                      {' {\n    '}
                      <span className="text-primary">char</span> *t1 ={' '}
                      <span className="text-success">"GATE"</span>;{'\n    '}
                      <span className="text-primary">char</span> *t2 ={' '}
                      <span className="text-success">"2024"</span>;{'\n    swap(t1, t2);\n    '}
                      <span className="text-tertiary">printf</span>(<span className="text-success">"%s %s"</span>,
                      t1, t2);
                      {'\n    '}
                      <span className="text-primary">return</span> 0;{'\n}'}
                    </code>
                  </pre>
                </div>
                <p>Assume standard environment and compilation without errors. Select the most appropriate option below.</p>
              </div>
              <div className="mt-stack-lg space-y-stack-sm">
                {[
                  { key: 'A' as const, text: 'GATE 2024', code: true },
                  { key: 'B' as const, text: '2024 GATE', code: true },
                  { key: 'C' as const, text: 'Segmentation fault (core dumped)', code: false },
                  { key: 'D' as const, text: 'Compilation Error', code: false },
                ].map((opt) => (
                  <label
                    key={opt.key}
                    className="flex items-start gap-4 p-4 rounded-lg bg-surface border border-outline-variant hover:border-primary cursor-pointer transition-colors group shadow-sm"
                  >
                    <div className="flex items-center h-6">
                      <input
                        checked={selected === opt.key}
                        onChange={() => setSelected(opt.key)}
                        className="w-5 h-5 text-primary border-outline focus:ring-primary bg-surface"
                        name="q14"
                        type="radio"
                      />
                    </div>
                    <div className="flex-1 font-body-lg text-body-lg text-on-surface pt-0.5">
                      <span className="font-bold mr-2 text-on-surface-variant group-hover:text-primary">{opt.key}.</span>
                      {opt.code ? <span className="font-code text-code">{opt.text}</span> : opt.text}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
          {/* Action Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-md border-t border-border p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10 flex justify-between items-center">
            <div className="flex gap-4">
              <button className="px-6 py-2.5 rounded-lg bg-surface border border-outline text-on-surface font-label-md text-label-md hover:bg-surface-container transition-colors">
                Clear Response
              </button>
              <button className="px-6 py-2.5 rounded-lg bg-secondary/10 text-secondary font-label-md text-label-md font-semibold hover:bg-secondary/20 transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">bookmark</span>
                Mark for Review &amp; Next
              </button>
            </div>
            <button className="px-8 py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-surface-tint transition-colors shadow-sm">
              Save &amp; Next
            </button>
          </div>
        </section>
        {/* Right Area: Question Palette */}
        <aside className="w-[320px] bg-surface border-l border-border flex flex-col shrink-0 z-20 shadow-sm">
          <div className="p-4 border-b border-border flex items-center gap-3 bg-surface-container-lowest">
            <div className="w-10 h-10 rounded-full bg-surface-dim flex items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined">person</span>
            </div>
            <div>
              <div className="font-label-md text-label-md font-bold text-on-surface">Candidate</div>
              <div className="font-label-sm text-label-sm text-on-surface-variant">Reg No: CS24A10098</div>
            </div>
          </div>
          <div className="p-4 border-b border-border bg-surface-container-low grid grid-cols-2 gap-y-3 gap-x-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-success flex items-center justify-center text-on-primary text-[10px] font-bold shadow-sm">1</div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-error-container text-on-error-container flex items-center justify-center text-[10px] font-bold">2</div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Not Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-surface border border-outline-variant flex items-center justify-center text-[10px] font-bold text-on-surface">3</div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Not Visited</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-secondary text-on-secondary flex items-center justify-center text-[10px] font-bold shadow-sm">4</div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Marked</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 bg-surface">
            <h3 className="font-label-md text-label-md font-bold text-on-surface mb-3">Technical Section</h3>
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 65 }, (_, i) => i + 1).map((n) => {
                const status = PALETTE_STATUSES[n - 1] ?? 'not-visited';
                return (
                  <button
                    key={n}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center font-label-md text-label-md transition-colors ${paletteClasses(status)}`}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="p-4 border-t border-border bg-surface flex flex-col gap-2">
            <button className="w-full py-2 rounded bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-md text-label-md transition-colors text-left px-3 flex justify-between items-center">
              <span>View Instructions</span>
              <span className="material-symbols-outlined text-[18px]">info</span>
            </button>
            <button className="w-full py-2 rounded bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-md text-label-md transition-colors text-left px-3 flex justify-between items-center">
              <span>Question Paper</span>
              <span className="material-symbols-outlined text-[18px]">article</span>
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}
