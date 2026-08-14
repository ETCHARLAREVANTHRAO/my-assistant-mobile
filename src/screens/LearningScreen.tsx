import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Card, EmptyState, Pill, ScreenShell, theme } from '../components/MobileScaffold';
import { learningApi, LearningSubjectDetail, LearningTopic } from '../services/api';

export default function LearningScreen() {
  const [subjects, setSubjects] = useState<LearningSubjectDetail[]>([]);
  const [subjectSlug, setSubjectSlug] = useState('');
  const [topicSlug, setTopicSlug] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    learningApi.syllabus()
      .then((data) => {
        setSubjects(data);
        setSubjectSlug(data[0]?.slug ?? '');
        setTopicSlug(data[0]?.topics[0]?.slug ?? '');
      })
      .catch(() => setError('Could not load syllabus.'))
      .finally(() => setLoading(false));
  }, []);

  const activeSubject = useMemo(() => subjects.find((s) => s.slug === subjectSlug) ?? subjects[0], [subjects, subjectSlug]);
  const activeTopic = useMemo(() => activeSubject?.topics.find((t) => t.slug === topicSlug) ?? activeSubject?.topics[0], [activeSubject, topicSlug]);

  return (
    <ScreenShell title="Learning" subtitle="Subject-wise GATE CS syllabus, notes, formulas, and PYQ concepts.">
      {loading ? (
        <View style={local.center}><ActivityIndicator color={theme.primary} /></View>
      ) : error ? (
        <View style={local.center}><Text style={local.error}>{error}</Text></View>
      ) : !activeSubject || !activeTopic ? (
        <EmptyState title="No syllabus found" />
      ) : (
        <ScrollView contentContainerStyle={local.scroll}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            {subjects.map((subject) => {
              const active = subject.slug === activeSubject.slug;
              return (
                <TouchableOpacity
                  key={subject.slug}
                  style={[local.subjectChip, active && local.subjectChipActive]}
                  onPress={() => {
                    setSubjectSlug(subject.slug);
                    setTopicSlug(subject.topics[0]?.slug ?? '');
                  }}
                >
                  <Text style={[local.subjectChipText, active && { color: '#fff' }]}>{subject.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Card>
            <View style={local.subjectTop}>
              <Text style={local.subjectTitle}>{activeSubject.name}</Text>
              <Pill label={activeSubject.exam_weight} tone={activeSubject.exam_weight === 'Very High' ? 'danger' : 'primary'} />
            </View>
            <Text style={local.muted}>{activeSubject.description}</Text>
          </Card>

          <Text style={local.section}>Topics</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            {activeSubject.topics.map((topic) => (
              <TouchableOpacity
                key={topic.slug}
                style={[local.topicChip, topic.slug === activeTopic.slug && local.topicChipActive]}
                onPress={() => setTopicSlug(topic.slug)}
              >
                <Text style={[local.topicChipText, topic.slug === activeTopic.slug && { color: '#fff' }]}>{topic.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TopicPanel topic={activeTopic} />
        </ScrollView>
      )}
    </ScreenShell>
  );
}

function TopicPanel({ topic }: { topic: LearningTopic }) {
  return (
    <>
      <Card>
        <Pill label={`Priority ${topic.priority}`} tone="amber" />
        <Text style={local.topicTitle}>{topic.title}</Text>
        <Text style={local.muted}>{topic.written_notes || topic.revision_summary || 'Study notes are ready for this topic.'}</Text>
      </Card>
      <ListCard title="Core Concepts" items={topic.concepts} />
      <ListCard title="Formula Sheet" items={topic.formula_sheet.length ? topic.formula_sheet : topic.concepts.slice(0, 4)} />
      <ListCard title="Mind Map" items={topic.mind_map} />
      <ListCard title="PYQ Concepts" items={topic.pyq_concepts} />
      <ListCard title="Video Lectures" items={topic.video_lectures.map((v) => `${v.title} - ${v.provider}`)} empty="Video slots are ready." />
    </>
  );
}

function ListCard({ title, items, empty = 'No items yet.' }: { title: string; items: string[]; empty?: string }) {
  return (
    <Card>
      <Text style={local.cardTitle}>{title}</Text>
      {(items.length ? items : [empty]).slice(0, 10).map((item, index) => (
        <Text key={`${item}-${index}`} style={local.listItem}>- {item}</Text>
      ))}
    </Card>
  );
}

const local = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 36 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  error: { color: theme.danger },
  subjectChip: { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 999, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, marginRight: 8 },
  subjectChipActive: { backgroundColor: theme.primary, borderColor: theme.primary },
  subjectChipText: { color: theme.muted, fontWeight: '800', fontSize: 12 },
  subjectTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 },
  subjectTitle: { color: theme.text, fontSize: 18, fontWeight: '900', flex: 1 },
  muted: { color: theme.muted, fontSize: 13, lineHeight: 20 },
  section: { color: theme.text, fontWeight: '900', fontSize: 15, marginBottom: 9 },
  topicChip: { maxWidth: 210, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 9, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, marginRight: 8 },
  topicChipActive: { backgroundColor: theme.primary, borderColor: theme.primary },
  topicChipText: { color: theme.muted, fontWeight: '800', fontSize: 12 },
  topicTitle: { color: theme.text, fontWeight: '900', fontSize: 19, marginTop: 10, marginBottom: 8 },
  cardTitle: { color: theme.text, fontSize: 15, fontWeight: '900', marginBottom: 8 },
  listItem: { color: theme.muted, fontSize: 13, lineHeight: 20, marginBottom: 5 },
});
