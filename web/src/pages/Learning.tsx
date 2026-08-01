import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { learningGetSyllabus, type LearningSubjectDetail, type LearningTopic } from '../services/api';

const weightTone: Record<string, string> = {
  'Very High': 'bg-error/10 text-error border-error/20',
  High: 'bg-primary/10 text-primary border-primary/20',
  Medium: 'bg-secondary-container/20 text-secondary border-secondary/20',
  Low: 'bg-surface-variant text-on-surface-variant border-outline-variant',
};

export default function Learning() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<LearningSubjectDetail[]>([]);
  const [activeSubjectSlug, setActiveSubjectSlug] = useState('');
  const [activeTopicSlug, setActiveTopicSlug] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const activeSubject = useMemo(
    () => subjects.find((subject) => subject.slug === activeSubjectSlug) ?? subjects[0],
    [subjects, activeSubjectSlug],
  );

  const activeTopic = useMemo(
    () => activeSubject?.topics.find((topic) => topic.slug === activeTopicSlug) ?? activeSubject?.topics[0],
    [activeSubject, activeTopicSlug],
  );

  const totalTopics = subjects.reduce((sum, subject) => sum + subject.topics.length, 0);

  function chooseSubject(subject: LearningSubjectDetail) {
    setActiveSubjectSlug(subject.slug);
    setActiveTopicSlug(subject.topics[0]?.slug ?? '');
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
          </div>
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
              {subjects.map((subject) => {
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
                    </div>
                    <h3 className="font-headline-md text-headline-md text-text-primary">{activeSubject.name}</h3>
                    <p className="font-body-md text-body-md text-text-muted mt-2">{activeSubject.description}</p>
                  </div>

                  <div className="bg-surface rounded-lg border border-border shadow-soft divide-y divide-border overflow-hidden">
                    {activeSubject.topics.map((topic) => (
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
                        <p className="font-label-sm text-label-sm text-text-muted mt-1 line-clamp-1">
                          {topic.concepts.slice(0, 4).join(', ')}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <TopicPanel topic={activeTopic} onPractice={() => navigate('/quiz')} />
              </section>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

function TopicPanel({ topic, onPractice }: { topic: LearningTopic; onPractice: () => void }) {
  const firstVideo = topic.video_lectures.find((lecture) => lecture.embed_url);

  return (
    <div className="xl:col-span-7 space-y-5">
      <div className="bg-surface rounded-lg border border-border shadow-soft p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="font-label-sm text-label-sm text-text-muted uppercase">Topic {topic.priority}</p>
            <h3 className="font-headline-md text-headline-md text-text-primary mt-1">{topic.title}</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onPractice}
              className="inline-flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md text-label-md hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">quiz</span>
              Practice
            </button>
          </div>
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
        <ResourceBlock icon="notes" title="Written Notes" items={topic.concepts} />
        <ResourceBlock icon="summarize" title="Revision Notes" items={topic.concepts.slice(0, 5)} />
        <ResourceBlock icon="functions" title="Formula Sheet" items={topic.formula_sheet.length ? topic.formula_sheet : topic.concepts.slice(0, 4)} />
        <ResourceBlock icon="account_tree" title="Mind Map" items={topic.mind_map} />
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
      </div>
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
