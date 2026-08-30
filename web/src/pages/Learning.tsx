import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import {
  learningDownloadAllPdf,
  learningDownloadSubjectPdf,
  learningGetProgress,
  learningGetSyllabus,
  learningUpdateProgress,
  type LearningSubjectDetail,
  type LearningTopic,
} from '../services/api';

const weightTone: Record<string, string> = {
  'Very High': 'bg-error/10 text-error border-error/20',
  High: 'bg-primary/10 text-primary border-primary/20',
  Medium: 'bg-secondary-container/20 text-secondary border-secondary/20',
  Low: 'bg-surface-variant text-on-surface-variant border-outline-variant',
};

const progressOptions = ['not-started', 'learning', 'revised', 'mastered'] as const;
type TopicProgress = (typeof progressOptions)[number];

export default function Learning() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<LearningSubjectDetail[]>([]);
  const [activeSubjectSlug, setActiveSubjectSlug] = useState('');
  const [activeTopicSlug, setActiveTopicSlug] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [progress, setProgress] = useState<Record<string, TopicProgress>>({});
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      setProgress(JSON.parse(localStorage.getItem('learning-topic-progress') || '{}'));
      setBookmarks(JSON.parse(localStorage.getItem('learning-topic-bookmarks') || '{}'));
    } catch {
      setProgress({});
      setBookmarks({});
    }

    learningGetProgress()
      .then((items) => {
        const nextProgress: Record<string, TopicProgress> = {};
        const nextBookmarks: Record<string, boolean> = {};
        for (const item of items) {
          if (progressOptions.includes(item.status as TopicProgress)) {
            nextProgress[item.topic_key] = item.status as TopicProgress;
          }
          nextBookmarks[item.topic_key] = item.bookmarked;
        }
        setProgress(nextProgress);
        setBookmarks(nextBookmarks);
        localStorage.setItem('learning-topic-progress', JSON.stringify(nextProgress));
        localStorage.setItem('learning-topic-bookmarks', JSON.stringify(nextBookmarks));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    learningGetSyllabus()
      .then((data) => {
        setSubjects(data);
        const firstSubject = data[0];
        setActiveSubjectSlug(firstSubject?.slug ?? '');
        setActiveTopicSlug(firstSubject?.topics[0]?.slug ?? '');
      })
      .catch(() => setError('Could not load the learning syllabus. Please refresh to try again.'))
      .finally(() => setLoading(false));
  }, []);

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const visibleSubjects = useMemo(
    () =>
      subjects.filter((subject) => {
        const hasSaved = subject.topics.some((topic) => bookmarks[`${subject.slug}:${topic.slug}`]);
        if (showSavedOnly && !hasSaved) return false;
        if (!normalizedSearch) return true;
            const subjectText = `${subject.name} ${subject.description}`.toLowerCase();
            const topicHit = subject.topics.some((topic) =>
              `${topic.title} ${topic.concepts.join(' ')} ${topic.pyq_concepts.join(' ')}`.toLowerCase().includes(normalizedSearch),
            );
            return subjectText.includes(normalizedSearch) || topicHit;
          }),
    [bookmarks, normalizedSearch, showSavedOnly, subjects],
  );

  const activeSubject = useMemo(
    () => visibleSubjects.find((subject) => subject.slug === activeSubjectSlug) ?? visibleSubjects[0] ?? subjects[0],
    [subjects, visibleSubjects, activeSubjectSlug],
  );

  const visibleTopics = useMemo(() => {
    if (!activeSubject) return [];
    return activeSubject.topics.filter((topic) => {
      if (showSavedOnly && !bookmarks[`${activeSubject.slug}:${topic.slug}`]) return false;
      if (!normalizedSearch) return true;
      return `${topic.title} ${topic.concepts.join(' ')} ${topic.pyq_concepts.join(' ')}`.toLowerCase().includes(normalizedSearch);
    });
  }, [activeSubject, bookmarks, normalizedSearch, showSavedOnly]);

  const activeTopic = useMemo(
    () => visibleTopics.find((topic) => topic.slug === activeTopicSlug) ?? visibleTopics[0] ?? activeSubject?.topics[0],
    [activeSubject, visibleTopics, activeTopicSlug],
  );

  const totalTopics = subjects.reduce((sum, subject) => sum + subject.topics.length, 0);
  const savedCount = Object.values(bookmarks).filter(Boolean).length;
  const masteredCount = Object.values(progress).filter((value) => value === 'mastered').length;
  const revisedCount = Object.values(progress).filter((value) => value === 'revised' || value === 'mastered').length;

  function chooseSubject(subject: LearningSubjectDetail) {
    setActiveSubjectSlug(subject.slug);
    setActiveTopicSlug(subject.topics[0]?.slug ?? '');
  }

  function topicKey(subjectSlug: string, topicSlug: string) {
    return `${subjectSlug}:${topicSlug}`;
  }

  function updateProgress(key: string, value: TopicProgress) {
    const next = { ...progress, [key]: value };
    setProgress(next);
    localStorage.setItem('learning-topic-progress', JSON.stringify(next));
    learningUpdateProgress(key, { status: value }).catch(() => {});
  }

  function toggleBookmark(key: string) {
    const next = { ...bookmarks, [key]: !bookmarks[key] };
    setBookmarks(next);
    localStorage.setItem('learning-topic-bookmarks', JSON.stringify(next));
    learningUpdateProgress(key, { bookmarked: next[key] }).catch(() => {});
  }

  function downloadSubjectSheet(subject: LearningSubjectDetail) {
    const body = [
      `# ${subject.name}`,
      '',
      subject.description,
      '',
      '## Roadmap',
      ...subject.roadmap.map((item) => `- ${item}`),
      '',
      '## Exam Strategy',
      ...subject.exam_strategy.map((item) => `- ${item}`),
      '',
      '## Topics',
      ...subject.topics.flatMap((topic) => [
        '',
        `### ${topic.title}`,
        `Difficulty: ${topic.difficulty}`,
        `Estimated study time: ${topic.estimated_study_minutes} minutes`,
        '',
        'Concepts:',
        ...topic.concepts.map((item) => `- ${item}`),
        '',
        'Formula Sheet:',
        ...topic.formula_sheet.map((item) => `- ${item}`),
        '',
        'PYQ Concepts:',
        ...topic.pyq_concepts.map((item) => `- ${item}`),
      ]),
    ].join('\n');
    const blob = new Blob([body], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${subject.slug}-complete-sheet.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function downloadAllSheets() {
    const body = subjects.map((subject) => [
      `# ${subject.name}`,
      '',
      subject.description,
      '',
      '## Roadmap',
      ...subject.roadmap.map((item) => `- ${item}`),
      '',
      '## Exam Strategy',
      ...subject.exam_strategy.map((item) => `- ${item}`),
      '',
      '## Topics',
      ...subject.topics.flatMap((topic) => [
        '',
        `### ${topic.title}`,
        `Difficulty: ${topic.difficulty}`,
        `Estimated study time: ${topic.estimated_study_minutes} minutes`,
        '',
        'Concepts:',
        ...topic.concepts.map((item) => `- ${item}`),
        '',
        'Formula Sheet:',
        ...topic.formula_sheet.map((item) => `- ${item}`),
        '',
        'Quick Checks:',
        ...topic.quick_checks.map((item) => `- ${item}`),
      ]),
    ].join('\n')).join('\n\n---\n\n');
    const blob = new Blob([body], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'complete-cs-learning-bank.md';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function saveBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function downloadAllPdf() {
    learningDownloadAllPdf().then((blob) => saveBlob(blob, 'complete-cs-learning-bank.pdf')).catch(() => {});
  }

  function downloadSubjectPdf(subject: LearningSubjectDetail) {
    learningDownloadSubjectPdf(subject.slug).then((blob) => saveBlob(blob, `${subject.slug}-cheat-sheet.pdf`)).catch(() => {});
  }

  return (
    <Layout activePage="learning" title="Learning" searchPlaceholder="Search subjects...">
      <div className="max-w-container-max mx-auto px-4 md:px-gutter pb-margin-desktop flex flex-col gap-stack-lg">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-text-primary">GATE CS Learning</h2>
            <p className="font-body-md text-body-md text-text-muted mt-2 max-w-3xl">
              Complete subject-wise syllabus map for Computer Science and Information Technology.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
            <Metric label="Subjects" value={subjects.length || 0} />
            <Metric label="Topics" value={totalTopics || 0} />
            <Metric label="Saved" value={savedCount} />
            <Metric label="Revised" value={revisedCount} />
            <Metric label="Mastered" value={masteredCount} />
          </div>
        </div>

        <button
          onClick={downloadAllSheets}
          className="self-start inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 font-label-md text-label-md text-text-primary hover:border-primary/40"
        >
          <span className="material-symbols-outlined text-sm">download</span>
          Download All Sheets
        </button>
        <button
          onClick={downloadAllPdf}
          className="self-start inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 font-label-md text-label-md text-text-primary hover:border-primary/40"
        >
          <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
          Download All PDF
        </button>

        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-lg">search</span>
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search subjects, topics, concepts, or PYQ patterns"
            className="w-full rounded-lg border border-border bg-surface px-10 py-3 font-body-md text-body-md text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-primary"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              aria-label="Clear search"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          )}
        </div>

        <button
          onClick={() => setShowSavedOnly((value) => !value)}
          className={
            showSavedOnly
              ? 'self-start inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-label-md text-label-md text-on-primary'
              : 'self-start inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 font-label-md text-label-md text-text-muted hover:border-primary/40'
          }
        >
          <span className="material-symbols-outlined text-sm">bookmark</span>
          Saved only
        </button>

        <div className="self-start inline-flex overflow-hidden rounded-lg border border-border bg-surface">
          <button
            onClick={() => setLanguage('en')}
            className={language === 'en' ? 'bg-primary px-4 py-2 font-label-md text-label-md text-on-primary' : 'px-4 py-2 font-label-md text-label-md text-text-muted'}
          >
            English
          </button>
          <button
            onClick={() => setLanguage('hi')}
            className={language === 'hi' ? 'bg-primary px-4 py-2 font-label-md text-label-md text-on-primary' : 'px-4 py-2 font-label-md text-label-md text-text-muted'}
          >
            Hindi
          </button>
        </div>

        {error && (
          <div className="bg-error-container/30 border border-error/30 text-on-error-container rounded-lg p-4 font-body-md text-body-md">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-3 text-text-muted font-label-md text-label-md">
            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            Loading syllabus...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
            <aside className="lg:col-span-4 xl:col-span-3 space-y-3">
              {visibleSubjects.map((subject) => {
                const active = subject.slug === activeSubject?.slug;
                return (
                  <button
                    key={subject.slug}
                    onClick={() => chooseSubject(subject)}
                    className={
                      active
                        ? 'w-full text-left bg-primary text-on-primary rounded-lg p-4 shadow-soft border border-primary transition-all'
                        : 'w-full text-left bg-surface rounded-lg p-4 shadow-soft border border-border hover:border-primary/30 hover:shadow-hover transition-all'
                    }
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="font-headline-sm text-headline-sm">{subject.name}</span>
                      <span
                        className={
                          active
                            ? 'shrink-0 text-[11px] px-2 py-1 rounded-full bg-white/15 text-white border border-white/20 font-label-sm'
                            : `shrink-0 text-[11px] px-2 py-1 rounded-full border font-label-sm ${weightTone[subject.exam_weight] ?? weightTone.Medium}`
                        }
                      >
                        {subject.exam_weight}
                      </span>
                    </div>
                    <p className={active ? 'font-label-sm text-label-sm text-white/80 mt-2' : 'font-label-sm text-label-sm text-text-muted mt-2'}>
                      {subject.topic_count} topics
                    </p>
                  </button>
                );
              })}
            </aside>

            {activeSubject && activeTopic && (
              <section className="lg:col-span-8 xl:col-span-9 grid grid-cols-1 xl:grid-cols-12 gap-gutter items-start">
                <div className="xl:col-span-5 space-y-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className={`text-[11px] px-2 py-1 rounded-full border font-label-sm ${weightTone[activeSubject.exam_weight] ?? weightTone.Medium}`}>
                        {activeSubject.exam_weight}
                      </span>
                      <span className="text-[11px] px-2 py-1 rounded-full border border-border bg-surface text-text-muted font-label-sm">
                        {activeSubject.topics.length} topics
                      </span>
                      {activeSubject.pyq_available && (
                        <span className="text-[11px] px-2 py-1 rounded-full border border-success/30 bg-success/10 text-success font-label-sm">
                          PYQ linked
                        </span>
                      )}
                    </div>
                    <h3 className="font-headline-md text-headline-md text-text-primary">{activeSubject.name}</h3>
                    <p className="font-body-md text-body-md text-text-muted mt-2">{activeSubject.description}</p>
                    <button
                      onClick={() => downloadSubjectSheet(activeSubject)}
                      className="mt-3 inline-flex items-center gap-2 bg-surface-container-low text-text-primary px-4 py-2 rounded-lg border border-border font-label-md text-label-md hover:border-primary/40 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">download</span>
                      Subject Sheet
                    </button>
                    <button
                      onClick={() => downloadSubjectPdf(activeSubject)}
                      className="ml-2 mt-3 inline-flex items-center gap-2 bg-surface-container-low text-text-primary px-4 py-2 rounded-lg border border-border font-label-md text-label-md hover:border-primary/40 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                      PDF
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-4">
                    <SubjectMiniBlock icon="route" title="Roadmap" items={activeSubject.roadmap} />
                    <SubjectMiniBlock icon="target" title="Exam Strategy" items={activeSubject.exam_strategy} />
                    <SubjectMiniBlock icon="flag" title="Milestones" items={activeSubject.milestones} />
                    <SubjectLinksBlock links={activeSubject.curated_resources} />
                  </div>

                  <div className="bg-surface rounded-lg border border-border shadow-soft divide-y divide-border overflow-hidden">
                    {visibleTopics.map((topic) => (
                      <button
                        key={topic.slug}
                        onClick={() => setActiveTopicSlug(topic.slug)}
                        className={
                          topic.slug === activeTopic.slug
                            ? 'w-full text-left px-4 py-3 bg-primary-fixed text-primary transition-colors'
                            : 'w-full text-left px-4 py-3 hover:bg-surface-container-lowest text-text-primary transition-colors'
                        }
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-label-md text-label-md">{topic.title}</span>
                          <span className="material-symbols-outlined text-sm">chevron_right</span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          {bookmarks[topicKey(activeSubject.slug, topic.slug)] && (
                            <span className="material-symbols-outlined text-amber-500 text-sm">bookmark</span>
                          )}
                          <p className="font-label-sm text-label-sm text-text-muted line-clamp-1">
                            {topic.concepts.slice(0, 4).join(', ')}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <TopicPanel
                  topic={activeTopic}
                  progressValue={progress[topicKey(activeSubject.slug, activeTopic.slug)] ?? 'not-started'}
                  bookmarked={!!bookmarks[topicKey(activeSubject.slug, activeTopic.slug)]}
                  onProgress={(value) => updateProgress(topicKey(activeSubject.slug, activeTopic.slug), value)}
                  onBookmark={() => toggleBookmark(topicKey(activeSubject.slug, activeTopic.slug))}
                  language={language}
                  onPractice={() => {
                    const practiceSubject = activeSubject.pyq_subject || activeSubject.name;
                    navigate(`/quiz?subject=${encodeURIComponent(practiceSubject)}`);
                  }}
                />
              </section>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

function SubjectMiniBlock({ icon, title, items }: { icon: string; title: string; items: string[] }) {
  return (
    <div className="bg-surface rounded-lg border border-border shadow-soft p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-primary text-base">{icon}</span>
        <h4 className="font-label-md text-label-md text-text-primary">{title}</h4>
      </div>
      <ul className="space-y-2">
        {items.slice(0, 4).map((item) => (
          <li key={item} className="flex gap-2 font-label-sm text-label-sm text-text-muted">
            <span className="material-symbols-outlined text-success text-sm mt-0.5">check_circle</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SubjectLinksBlock({ links }: { links: LearningSubjectDetail['curated_resources'] }) {
  return (
    <div className="bg-surface rounded-lg border border-border shadow-soft p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-primary text-base">travel_explore</span>
        <h4 className="font-label-md text-label-md text-text-primary">Curated Resources</h4>
      </div>
      <div className="space-y-2">
        {links.map((link) => (
          <a key={link.url} href={link.url} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-2 font-label-sm text-label-sm text-text-muted hover:text-primary">
            <span>{link.title}</span>
            <span className="material-symbols-outlined text-sm">open_in_new</span>
          </a>
        ))}
      </div>
    </div>
  );
}

function TopicPanel({
  topic,
  progressValue,
  bookmarked,
  onProgress,
  onBookmark,
  language,
  onPractice,
}: {
  topic: LearningTopic;
  progressValue: TopicProgress;
  bookmarked: boolean;
  onProgress: (value: TopicProgress) => void;
  onBookmark: () => void;
  language: 'en' | 'hi';
  onPractice: () => void;
}) {
  const firstVideo = topic.video_lectures.find((lecture) => lecture.embed_url);
  const writtenNotes = topic.notes_by_language[language] || topic.written_notes;
  const revisionNotes = topic.revision_by_language[language] || topic.revision_summary;
  const downloadCheatSheet = () => {
    const body = [
      `# ${topic.title}`,
      '',
      `Difficulty: ${topic.difficulty}`,
      `Estimated study time: ${topic.estimated_study_minutes} minutes`,
      '',
      '## Written Notes',
      writtenNotes,
      '',
      '## Revision Summary',
      revisionNotes,
      '',
      '## Formula Sheet',
      ...topic.formula_sheet.map((item) => `- ${item}`),
      '',
      '## PYQ Concepts',
      ...topic.pyq_concepts.map((item) => `- ${item}`),
      '',
      '## Quick Checks',
      ...topic.quick_checks.map((item) => `- ${item}`),
    ].join('\n');
    const blob = new Blob([body], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${topic.slug}-cheat-sheet.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="xl:col-span-7 space-y-5">
      <div className="bg-surface rounded-lg border border-border shadow-soft p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="font-label-sm text-label-sm text-text-muted uppercase">Topic {topic.priority}</p>
            <h3 className="font-headline-md text-headline-md text-text-primary mt-1">{topic.title}</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-full border border-border bg-surface-container-low px-3 py-1 font-label-sm text-label-sm text-text-muted">
                {topic.difficulty}
              </span>
              <span className="rounded-full border border-border bg-surface-container-low px-3 py-1 font-label-sm text-label-sm text-text-muted">
                {topic.estimated_study_minutes} min
              </span>
              <span className="rounded-full border border-border bg-surface-container-low px-3 py-1 font-label-sm text-label-sm text-text-muted capitalize">
                {progressValue.replace('-', ' ')}
              </span>
              {topic.pyq_match_count > 0 && (
                <span className="rounded-full border border-success/30 bg-success/10 px-3 py-1 font-label-sm text-label-sm text-success">
                  {topic.pyq_match_count} PYQs
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onBookmark}
              className="inline-flex items-center gap-2 bg-surface-container-low text-text-primary px-4 py-2 rounded-lg border border-border font-label-md text-label-md hover:border-primary/40 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">{bookmarked ? 'bookmark' : 'bookmark_add'}</span>
              {bookmarked ? 'Saved' : 'Save'}
            </button>
            <button
              onClick={downloadCheatSheet}
              className="inline-flex items-center gap-2 bg-surface-container-low text-text-primary px-4 py-2 rounded-lg border border-border font-label-md text-label-md hover:border-primary/40 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              Sheet
            </button>
            {firstVideo?.url && (
              <a
                href={firstVideo.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-surface-container-low text-text-primary px-4 py-2 rounded-lg border border-border font-label-md text-label-md hover:border-primary/40 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">smart_display</span>
                YouTube
              </a>
            )}
            <button
              onClick={onPractice}
              className="inline-flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md text-label-md hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">quiz</span>
              Practice
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {progressOptions.map((option) => (
            <button
              key={option}
              onClick={() => onProgress(option)}
              className={
                option === progressValue
                  ? 'rounded-lg bg-primary px-3 py-2 font-label-sm text-label-sm text-on-primary'
                  : 'rounded-lg border border-border bg-surface-container-lowest px-3 py-2 font-label-sm text-label-sm text-text-muted hover:border-primary/40'
              }
            >
              {option.replace('-', ' ')}
            </button>
          ))}
        </div>

        <div className="mt-5 aspect-video w-full overflow-hidden rounded-lg border border-border bg-surface-container-low flex items-center justify-center">
          {firstVideo?.embed_url ? (
            <iframe
              className="h-full w-full"
              src={firstVideo.embed_url}
              title={firstVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 text-text-muted px-4 text-center">
              <span className="material-symbols-outlined text-4xl text-primary">smart_display</span>
              <p className="font-label-md text-label-md">Video lecture slot ready</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <DiagramBlock topic={topic} />
        <FocusTimer topic={topic} />
        <StudyQuest topic={topic} />
        <ExamSprint topic={topic} />
        <ResourceBlock icon="playlist_add_check" title="Prerequisites" items={topic.prerequisites} />
        <ResourceBlock icon="workspace_premium" title="Learning Outcomes" items={topic.learning_outcomes} />
        <TextBlock icon="notes" title="Written Notes" text={writtenNotes} />
        <TextBlock icon="summarize" title="Revision Notes" text={revisionNotes} />
        <ResourceBlock icon="functions" title="Formula Sheet" items={topic.formula_sheet.length ? topic.formula_sheet : topic.concepts.slice(0, 4)} />
        <ResourceBlock icon="account_tree" title="Mind Map" items={topic.mind_map} />
        <ResourceBlock icon="route" title="Study Flow" items={topic.study_flow} />
        <ResourceBlock icon="warning" title="Common Mistakes" items={topic.common_mistakes} />
        <ResourceBlock icon="task_alt" title="Practice Tasks" items={topic.practice_tasks} />
        <ResourceBlock icon="quiz" title="Quick Checks" items={topic.quick_checks} />
        <ResourceBlock icon="forum" title="Interview Prompts" items={topic.interview_prompts} />
        <ResourceBlock icon="tips_and_updates" title="Memory Hooks" items={topic.memory_hooks} />
        <ResourceBlock icon="menu_book" title="Reading Pointers" items={topic.reading_pointers} />
        <ResourceBlock icon="military_tech" title="Mastery Rubric" items={topic.mastery_rubric} />
      </div>

      <WorkedExamplesBlock topic={topic} />
      <DeepNotesBlock topic={topic} />
      <RevisionScheduleBlock topic={topic} />

      <FlashcardDeck topic={topic} />

      <TopicQuiz topic={topic} />

      <div className="bg-surface rounded-lg border border-border shadow-soft p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-primary">smart_display</span>
          <h4 className="font-headline-sm text-headline-sm text-text-primary">Video Links</h4>
        </div>
        <div className="space-y-2">
          {topic.video_lectures.map((lecture) => (
            <a
              key={lecture.url}
              href={lecture.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-container-lowest px-3 py-2 text-text-primary hover:border-primary/40 transition-colors"
            >
              <span className="font-label-md text-label-md">{lecture.title}</span>
              <span className="material-symbols-outlined text-sm text-primary">open_in_new</span>
            </a>
          ))}
        </div>
      </div>

      <div className="bg-surface rounded-lg border border-border shadow-soft p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-primary">link</span>
          <h4 className="font-headline-sm text-headline-sm text-text-primary">Reference Links</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {topic.reference_links.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-container-lowest px-3 py-2 text-text-primary hover:border-primary/40 transition-colors"
            >
              <span>
                <span className="block font-label-md text-label-md">{link.title}</span>
                <span className="block font-label-sm text-label-sm text-text-muted capitalize">{link.type}</span>
              </span>
              <span className="material-symbols-outlined text-sm text-primary">open_in_new</span>
            </a>
          ))}
        </div>
      </div>

      <div className="bg-surface rounded-lg border border-border shadow-soft p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-primary">history_edu</span>
          <h4 className="font-headline-sm text-headline-sm text-text-primary">PYQ Concepts</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {topic.pyq_concepts.map((concept) => (
            <span key={concept} className="px-3 py-1.5 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm">
              {concept}
            </span>
          ))}
        </div>
        {topic.pyq_matches.length > 0 && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {topic.pyq_matches.map((match) => (
              <div key={`${match.chapter}-${match.name}`} className="rounded-lg border border-border bg-surface-container-lowest p-3">
                <p className="font-label-md text-label-md text-text-primary">{match.name}</p>
                <p className="mt-1 font-label-sm text-label-sm text-text-muted">{match.question_count} questions</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DeepNotesBlock({ topic }: { topic: LearningTopic }) {
  return (
    <div className="bg-surface rounded-lg border border-border shadow-soft p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary">article</span>
        <h4 className="font-headline-sm text-headline-sm text-text-primary">Deep Notes</h4>
      </div>
      <div className="space-y-4">
        {topic.deep_notes.map((section) => (
          <section key={section.heading}>
            <h5 className="font-label-md text-label-md text-text-primary">{section.heading}</h5>
            <p className="mt-1 font-body-md text-body-md text-text-muted leading-relaxed">{section.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}

function RevisionScheduleBlock({ topic }: { topic: LearningTopic }) {
  return (
    <div className="bg-surface rounded-lg border border-border shadow-soft p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary">event_repeat</span>
        <h4 className="font-headline-sm text-headline-sm text-text-primary">Revision Schedule</h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {topic.revision_schedule.map((item) => (
          <div key={item.when} className="rounded-lg border border-border bg-surface-container-lowest p-3">
            <p className="font-label-md text-label-md text-primary">{item.when}</p>
            <p className="font-body-sm text-body-sm text-text-muted mt-1 leading-relaxed">{item.task}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function WorkedExamplesBlock({ topic }: { topic: LearningTopic }) {
  return (
    <div className="bg-surface rounded-lg border border-border shadow-soft p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary">school</span>
        <h4 className="font-headline-sm text-headline-sm text-text-primary">Worked Examples</h4>
      </div>
      <div className="space-y-3">
        {topic.worked_examples.map((example) => (
          <div key={example.title} className="rounded-lg border border-border bg-surface-container-lowest p-4">
            <p className="font-label-md text-label-md text-text-primary">{example.title}</p>
            <p className="mt-2 font-body-sm text-body-sm text-text-muted leading-relaxed">{example.problem}</p>
            <p className="mt-2 font-body-sm text-body-sm text-on-surface-variant leading-relaxed">{example.solution}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function FocusTimer({ topic }: { topic: LearningTopic }) {
  const [secondsLeft, setSecondsLeft] = useState(Math.min(topic.estimated_study_minutes, 25) * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setSecondsLeft(Math.min(topic.estimated_study_minutes, 25) * 60);
    setRunning(false);
  }, [topic.slug, topic.estimated_study_minutes]);

  useEffect(() => {
    if (!running) return undefined;
    const timer = window.setInterval(() => {
      setSecondsLeft((value) => {
        if (value <= 1) {
          window.clearInterval(timer);
          setRunning(false);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
  const seconds = (secondsLeft % 60).toString().padStart(2, '0');

  return (
    <div className="bg-surface rounded-lg border border-border shadow-soft p-5 min-h-[210px]">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary">timer</span>
        <h4 className="font-headline-sm text-headline-sm text-text-primary">Focus Timer</h4>
      </div>
      <p className="font-headline-lg text-headline-lg text-primary">{minutes}:{seconds}</p>
      <p className="mt-2 font-body-sm text-body-sm text-text-muted">Use this for one focused pass on notes, examples, or PYQs.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={() => setRunning((value) => !value)} className="rounded-lg bg-primary px-4 py-2 font-label-sm text-label-sm text-on-primary">
          {running ? 'Pause' : 'Start'}
        </button>
        <button onClick={() => { setRunning(false); setSecondsLeft(5 * 60); }} className="rounded-lg border border-border px-4 py-2 font-label-sm text-label-sm text-text-muted">5 min</button>
        <button onClick={() => { setRunning(false); setSecondsLeft(25 * 60); }} className="rounded-lg border border-border px-4 py-2 font-label-sm text-label-sm text-text-muted">25 min</button>
      </div>
    </div>
  );
}

function StudyQuest({ topic }: { topic: LearningTopic }) {
  const [done, setDone] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setDone({});
  }, [topic.slug]);

  const steps = [
    `Read: ${topic.deep_notes[0]?.heading ?? 'Core notes'}`,
    `Recall: ${topic.flashcards[0]?.front ?? topic.concepts[0] ?? topic.title}`,
    `Solve: ${topic.practice_tasks[0] ?? 'one practice task'}`,
    `Check: ${topic.quiz_questions[0]?.question ?? 'one quick question'}`,
    `Revise: ${topic.revision_schedule[0]?.task ?? 'add this topic to revision'}`,
  ];
  const completed = steps.filter((_, index) => done[index]).length;

  return (
    <div className="bg-surface rounded-lg border border-border shadow-soft p-5 min-h-[210px]">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">checklist</span>
          <h4 className="font-headline-sm text-headline-sm text-text-primary">Study Quest</h4>
        </div>
        <span className="rounded-full bg-primary-fixed px-3 py-1 font-label-sm text-label-sm text-primary">{completed}/{steps.length}</span>
      </div>
      <div className="space-y-2">
        {steps.map((step, index) => (
          <button
            key={step}
            onClick={() => setDone((current) => ({ ...current, [index]: !current[index] }))}
            className={
              done[index]
                ? 'flex w-full items-start gap-3 rounded-lg border border-success bg-success/10 px-3 py-2 text-left'
                : 'flex w-full items-start gap-3 rounded-lg border border-border bg-surface-container-lowest px-3 py-2 text-left hover:border-primary/40'
            }
          >
            <span className="material-symbols-outlined text-base text-primary">{done[index] ? 'check_circle' : 'radio_button_unchecked'}</span>
            <span className="font-body-sm text-body-sm text-text-primary leading-relaxed">{step}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ExamSprint({ topic }: { topic: LearningTopic }) {
  const cards = [
    { icon: 'functions', label: 'Must Know', value: topic.formula_sheet[0] ?? topic.concepts[0] ?? topic.title },
    { icon: 'history_edu', label: 'PYQ Trigger', value: topic.pyq_concepts[0] ?? topic.concepts[1] ?? topic.title },
    { icon: 'warning', label: 'Avoid', value: topic.common_mistakes[0] ?? 'Do not skip edge cases.' },
    { icon: 'edit_note', label: 'Do Now', value: topic.practice_tasks[0] ?? topic.quick_checks[0] ?? 'Solve one previous-year style question.' },
  ];

  return (
    <div className="bg-surface rounded-lg border border-border shadow-soft p-5 min-h-[210px]">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary">bolt</span>
        <h4 className="font-headline-sm text-headline-sm text-text-primary">Exam Sprint</h4>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {cards.map((card) => (
          <div key={card.label} className="flex items-start gap-3 rounded-lg border border-border bg-surface-container-lowest px-3 py-2">
            <span className="material-symbols-outlined text-base text-primary">{card.icon}</span>
            <span>
              <span className="block font-label-sm text-label-sm text-text-muted">{card.label}</span>
              <span className="block font-body-sm text-body-sm text-text-primary leading-relaxed">{card.value}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FlashcardDeck({ topic }: { topic: LearningTopic }) {
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setRevealed({});
  }, [topic.slug]);

  return (
    <div className="bg-surface rounded-lg border border-border shadow-soft p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">style</span>
          <h4 className="font-headline-sm text-headline-sm text-text-primary">Flashcards</h4>
        </div>
        <button
          onClick={() => setRevealed({})}
          className="rounded-lg border border-border bg-surface-container-lowest px-3 py-1.5 font-label-sm text-label-sm text-text-muted hover:border-primary/40"
        >
          Reset
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {topic.flashcards.map((card, index) => {
          const showBack = revealed[index];
          return (
            <button
              key={`${card.front}-${card.back}`}
              onClick={() => setRevealed((current) => ({ ...current, [index]: !current[index] }))}
              className={
                showBack
                  ? 'min-h-[130px] rounded-lg border border-primary bg-primary-fixed p-4 text-left transition-colors'
                  : 'min-h-[130px] rounded-lg border border-border bg-surface-container-lowest p-4 text-left hover:border-primary/40 transition-colors'
              }
            >
              <p className="font-label-sm text-label-sm text-text-muted">{showBack ? 'Answer' : 'Prompt'}</p>
              <p className="mt-2 font-label-md text-label-md text-text-primary">{showBack ? card.back : card.front}</p>
              <p className="mt-3 font-label-sm text-label-sm text-primary">{showBack ? 'Tap to hide' : 'Tap to reveal'}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TopicQuiz({ topic }: { topic: LearningTopic }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});

  return (
    <div className="bg-surface rounded-lg border border-border shadow-soft p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary">psychology_alt</span>
        <h4 className="font-headline-sm text-headline-sm text-text-primary">Topic Quiz</h4>
      </div>
      <div className="space-y-4">
        {topic.quiz_questions.map((question, index) => {
          const selected = answers[index];
          return (
            <div key={question.question} className="rounded-lg border border-border bg-surface-container-lowest p-4">
              <p className="font-label-md text-label-md text-text-primary">{question.question}</p>
              <div className="mt-3 grid grid-cols-1 gap-2">
                {question.options.map((option) => {
                  const isSelected = selected === option;
                  const isCorrect = selected && option === question.answer;
                  return (
                    <button
                      key={option}
                      onClick={() => setAnswers((current) => ({ ...current, [index]: option }))}
                      className={
                        isCorrect
                          ? 'rounded-lg border border-success bg-success/10 px-3 py-2 text-left font-label-sm text-label-sm text-success'
                          : isSelected
                            ? 'rounded-lg border border-error bg-error/10 px-3 py-2 text-left font-label-sm text-label-sm text-error'
                            : 'rounded-lg border border-border bg-surface px-3 py-2 text-left font-label-sm text-label-sm text-text-muted hover:border-primary/40'
                      }
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              {selected && (
                <p className="mt-3 font-body-sm text-body-sm text-text-muted leading-relaxed">
                  {selected === question.answer ? 'Correct. ' : `Correct answer: ${question.answer}. `}
                  {question.explanation}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DiagramBlock({ topic }: { topic: LearningTopic }) {
  if (!topic.diagram) return null;
  const nodes = topic.diagram.nodes.slice(0, 7);
  const centerX = 220;
  const centerY = 120;
  const radius = 86;
  const positioned = nodes.map((node, index) => {
    if (index === 0) return { node, x: centerX, y: centerY };
    const angle = ((index - 1) / Math.max(1, nodes.length - 1)) * Math.PI * 2 - Math.PI / 2;
    return { node, x: centerX + Math.cos(angle) * radius, y: centerY + Math.sin(angle) * radius };
  });
  return (
    <div className="bg-surface rounded-lg border border-border shadow-soft p-5 min-h-[210px]">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary">hub</span>
        <h4 className="font-headline-sm text-headline-sm text-text-primary">Concept Diagram</h4>
      </div>
      <svg viewBox="0 0 440 240" className="h-64 w-full rounded-lg border border-border bg-surface-container-lowest">
        {positioned.slice(1).map((item) => (
          <line key={`edge-${item.node}`} x1={centerX} y1={centerY} x2={item.x} y2={item.y} stroke="currentColor" strokeWidth="1.5" className="text-outline" />
        ))}
        {positioned.map((item, index) => (
          <g key={item.node}>
            <rect
              x={item.x - (index === 0 ? 78 : 58)}
              y={item.y - 18}
              width={index === 0 ? 156 : 116}
              height="36"
              rx="8"
              className={index === 0 ? 'fill-primary' : 'fill-surface'}
              stroke="currentColor"
            />
            <text
              x={item.x}
              y={item.y + 4}
              textAnchor="middle"
              className={index === 0 ? 'fill-on-primary text-[10px] font-bold' : 'fill-text-primary text-[9px] font-semibold'}
            >
              {item.node.length > 18 ? `${item.node.slice(0, 17)}...` : item.node}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function TextBlock({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div className="bg-surface rounded-lg border border-border shadow-soft p-5 min-h-[210px]">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary">{icon}</span>
        <h4 className="font-headline-sm text-headline-sm text-text-primary">{title}</h4>
      </div>
      <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
        {text || 'Notes are ready for this topic.'}
      </p>
    </div>
  );
}

function ResourceBlock({ icon, title, items }: { icon: string; title: string; items: string[] }) {
  return (
    <div className="bg-surface rounded-lg border border-border shadow-soft p-5 min-h-[210px]">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary">{icon}</span>
        <h4 className="font-headline-sm text-headline-sm text-text-primary">{title}</h4>
      </div>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 font-body-md text-body-md text-on-surface-variant">
            <span className="material-symbols-outlined text-success text-base mt-0.5">check_circle</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-surface rounded-lg border border-border shadow-soft px-4 py-3 min-w-[110px]">
      <p className="font-label-sm text-label-sm text-text-muted">{label}</p>
      <p className="font-headline-md text-headline-md text-primary">{value}</p>
    </div>
  );
}
