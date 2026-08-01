import { useEffect, useMemo, useState } from 'react';
import { adminGetContent, adminResetContent, adminSaveContent, type AdminContentPayload } from '../services/api';

type SectionKey = keyof AdminContentPayload;

const SECTIONS: Array<{ key: SectionKey; label: string; icon: string }> = [
  { key: 'formula_sheets', label: 'Formulas', icon: 'functions' },
  { key: 'cheat_sheets', label: 'Cheat Sheets', icon: 'article_shortcut' },
  { key: 'book_recommendations', label: 'Books', icon: 'menu_book' },
  { key: 'exam_info', label: 'Exam Notices', icon: 'campaign' },
  { key: 'mentor_sessions', label: 'Mentor Sessions', icon: 'groups' },
  { key: 'short_tricks', label: 'Short Tricks', icon: 'tips_and_updates' },
];

export default function AdminContent() {
  const [content, setContent] = useState<AdminContentPayload | null>(null);
  const [section, setSection] = useState<SectionKey>('formula_sheets');
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    adminGetContent()
      .then((data) => {
        setContent(data);
        setDraft(JSON.stringify(data.formula_sheets, null, 2));
      })
      .catch((err: any) => setError(err?.response?.data?.detail || 'Admin content could not be loaded.'))
      .finally(() => setLoading(false));
  }, []);

  const selectedMeta = useMemo(() => SECTIONS.find((item) => item.key === section)!, [section]);

  function selectSection(next: SectionKey) {
    setSection(next);
    setError('');
    setMessage('');
    setDraft(JSON.stringify(content?.[next] ?? null, null, 2));
  }

  async function save() {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const parsed = JSON.parse(draft);
      const data = await adminSaveContent({ [section]: parsed });
      setContent(data);
      setDraft(JSON.stringify(data[section], null, 2));
      setMessage(`${selectedMeta.label} saved.`);
    } catch (err: any) {
      setError(err instanceof SyntaxError ? 'Invalid JSON. Fix the structure and try again.' : err?.response?.data?.detail || 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  async function reset() {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const data = await adminResetContent();
      setContent(data);
      setDraft(JSON.stringify(data[section], null, 2));
      setMessage('Content reset to defaults.');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Reset failed.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-on-background p-gutter">
      <div className="max-w-container-max mx-auto space-y-5">
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-text-primary">Admin Content</h1>
            <p className="font-body-md text-body-md text-text-muted mt-2">Manage formulas, cheat sheets, books, exam notices, mentor sessions, and short tricks.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={reset} disabled={saving || loading} className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 font-label-md text-label-md hover:bg-surface-container disabled:opacity-50">
              <span className="material-symbols-outlined text-sm">restart_alt</span>Reset Defaults
            </button>
            <button onClick={save} disabled={saving || loading} className="inline-flex items-center gap-2 rounded-lg bg-primary text-white px-4 py-2 font-label-md text-label-md disabled:opacity-50">
              <span className="material-symbols-outlined text-sm">save</span>{saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </header>

        {error && <div className="rounded-lg border border-error/30 bg-error-container/30 p-4 text-on-error-container">{error}</div>}
        {message && <div className="rounded-lg border border-success/30 bg-success/10 p-4 text-success">{message}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          <aside className="lg:col-span-3 bg-surface rounded-lg border border-border shadow-soft p-4 grid gap-2">
            {SECTIONS.map((item) => (
              <button key={item.key} onClick={() => selectSection(item.key)} className={section === item.key ? 'flex items-center gap-2 rounded-lg bg-primary text-white px-3 py-2.5 text-left' : 'flex items-center gap-2 rounded-lg text-on-surface-variant hover:bg-surface-container px-3 py-2.5 text-left'}>
                <span className="material-symbols-outlined text-sm">{item.icon}</span>{item.label}
              </button>
            ))}
          </aside>

          <main className="lg:col-span-9 bg-surface rounded-lg border border-border shadow-soft p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary">{selectedMeta.icon}</span>
              <h2 className="font-headline-sm text-headline-sm text-text-primary">{selectedMeta.label}</h2>
            </div>
            {loading ? (
              <div className="text-text-muted">Loading...</div>
            ) : (
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                spellCheck={false}
                className="w-full min-h-[620px] rounded-lg border border-border bg-surface-container-lowest p-4 font-code text-code text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
