import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export const theme = {
  bg: '#F9FAFB',
  surface: '#FFFFFF',
  surface2: '#F5F2FF',
  surface3: '#EAE6F4',
  border: '#E5E7EB',
  outline: '#C7C4D8',
  text: '#111827',
  onSurface: '#1B1B24',
  muted: '#6B7280',
  primary: '#3525CD',
  primaryFixed: '#E2DFFF',
  secondary: '#006591',
  secondaryContainer: '#39B8FD',
  success: '#10B981',
  danger: '#EF4444',
  amber: '#A44100',
};

export function ScreenShell({
  title,
  subtitle,
  children,
  right,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {right}
      </View>
      {children}
    </SafeAreaView>
  );
}

export function ScrollShell(props: { title: string; subtitle?: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <ScreenShell title={props.title} subtitle={props.subtitle} right={props.right}>
      <ScrollView contentContainerStyle={styles.scroll}>{props.children}</ScrollView>
    </ScreenShell>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Pill({ label, tone = 'muted' }: { label: string; tone?: 'muted' | 'primary' | 'success' | 'danger' | 'amber' }) {
  const toneStyle =
    tone === 'primary' ? styles.pillPrimary :
    tone === 'success' ? styles.pillSuccess :
    tone === 'danger' ? styles.pillDanger :
    tone === 'amber' ? styles.pillAmber :
    styles.pillMuted;
  return (
    <View style={[styles.pill, toneStyle]}>
      <Text style={[styles.pillText, tone !== 'muted' && styles.pillTextStrong]}>{label}</Text>
    </View>
  );
}

export function PrimaryButton({ label, icon, onPress, disabled }: { label: string; icon?: keyof typeof Ionicons.glyphMap; onPress: () => void; disabled?: boolean }) {
  return (
    <TouchableOpacity style={[styles.primaryButton, disabled && styles.disabled]} onPress={onPress} disabled={disabled}>
      {icon ? <Ionicons name={icon} size={17} color="#fff" /> : null}
      <Text style={styles.primaryButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

export function GhostButton({ label, icon, onPress }: { label: string; icon?: keyof typeof Ionicons.glyphMap; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.ghostButton} onPress={onPress}>
      {icon ? <Ionicons name={icon} size={17} color={theme.primary} /> : null}
      <Text style={styles.ghostButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

export function LoadingState({ label = 'Loading...' }: { label?: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={theme.primary} size="large" />
      <Text style={styles.centerText}>{label}</Text>
    </View>
  );
}

export function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <Card style={styles.emptyCard}>
      <Ionicons name="sparkles-outline" size={28} color={theme.primary} />
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle ? <Text style={styles.emptySubtitle}>{subtitle}</Text> : null}
    </Card>
  );
}

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  header: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229,231,235,0.7)',
    backgroundColor: theme.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: { color: theme.primary, fontSize: 22, fontWeight: '800' },
  subtitle: { color: theme.muted, fontSize: 12, marginTop: 3, lineHeight: 17 },
  scroll: { padding: 16, paddingBottom: 34 },
  card: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  pill: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4, alignSelf: 'flex-start' },
  pillMuted: { backgroundColor: theme.surface3 },
  pillPrimary: { backgroundColor: theme.primaryFixed },
  pillSuccess: { backgroundColor: 'rgba(16,185,129,0.12)' },
  pillDanger: { backgroundColor: 'rgba(239,68,68,0.12)' },
  pillAmber: { backgroundColor: '#FFDBCC' },
  pillText: { color: theme.muted, fontSize: 11, fontWeight: '700' },
  pillTextStrong: { color: theme.primary },
  primaryButton: { minHeight: 44, borderRadius: 8, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, paddingHorizontal: 14 },
  primaryButtonText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  ghostButton: { minHeight: 40, borderRadius: 8, borderWidth: 1, borderColor: theme.border, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7, paddingHorizontal: 12, backgroundColor: theme.surface },
  ghostButtonText: { color: theme.primary, fontSize: 13, fontWeight: '800' },
  disabled: { opacity: 0.55 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: theme.bg },
  centerText: { color: theme.muted, marginTop: 12, fontSize: 13 },
  emptyCard: { alignItems: 'center', paddingVertical: 28 },
  emptyTitle: { color: theme.text, fontSize: 16, fontWeight: '800', marginTop: 10, textAlign: 'center' },
  emptySubtitle: { color: theme.muted, fontSize: 13, marginTop: 5, textAlign: 'center', lineHeight: 19 },
});
