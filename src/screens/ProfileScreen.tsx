import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { auth } from '../config/firebase';
import { usageApi, signOut } from '../services/api';

interface UsageData {
  daily:    { used: number; limit: number; resets_at: string };
  monthly:  { used: number; limit: number; resets_at: string };
  documents:{ used_bytes: number; limit_bytes: number };
}

function timeUntil(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return 'soon';
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (h >= 48) return `${Math.floor(h / 24)} days`;
  if (h > 0)   return `${h}h ${m}m`;
  return `${m}m`;
}

function fmtBytes(n: number) { return `${(n / 1_048_576).toFixed(1)} MB`; }
function fmtTokens(n: number) { return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n); }

function UsageCard({
  icon, title, used, limit, resetsLabel, color, fmt,
}: {
  icon: string; title: string; used: number; limit: number;
  resetsLabel: string; color: string; fmt: (n: number) => string;
}) {
  const pct      = Math.min((used / limit) * 100, 100);
  const barColor = pct > 85 ? '#ff6b6b' : pct > 60 ? '#ffa94d' : color;

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.cardIcon}>{icon}</Text>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={[styles.cardCount, pct > 85 && { color: '#ff6b6b' }]}>
          {fmt(used)} / {fmt(limit)}
        </Text>
      </View>
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${pct}%` as any, backgroundColor: barColor }]} />
      </View>
      <Text style={styles.resetsLabel}>{resetsLabel}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const [data, setData]       = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const user = auth.currentUser;
  const initials = (user?.email ?? 'U')[0].toUpperCase();

  useFocusEffect(useCallback(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const d = await usageApi.get();
        if (active) setData(d);
      } catch (e: any) {
        if (active) setError(e?.message ?? 'Could not load usage.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Avatar */}
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.email}>{user?.email}</Text>

        {/* Usage cards */}
        {loading ? (
          <ActivityIndicator color="#6C63FF" size="large" style={{ marginTop: 40 }} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : data ? (
          <>
            <UsageCard
              icon="💬"
              title="Daily Messages"
              used={data.daily.used}
              limit={data.daily.limit}
              resetsLabel={`Resets in ${timeUntil(data.daily.resets_at)}`}
              color="#6C63FF"
              fmt={String}
            />
            <UsageCard
              icon="🧠"
              title="Monthly Tokens"
              used={data.monthly.used}
              limit={data.monthly.limit}
              resetsLabel={`Resets in ${timeUntil(data.monthly.resets_at)}`}
              color="#51cf66"
              fmt={fmtTokens}
            />
            <UsageCard
              icon="📁"
              title="Document Storage"
              used={data.documents.used_bytes}
              limit={data.documents.limit_bytes}
              resetsLabel="Contact admin to increase limit"
              color="#ffa94d"
              fmt={fmtBytes}
            />
          </>
        ) : null}

        <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#1a1a2e' },
  scroll:       { alignItems: 'center', padding: 24, paddingBottom: 48 },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#6C63FF', justifyContent: 'center', alignItems: 'center',
    marginTop: 16, marginBottom: 12,
  },
  avatarText:   { color: '#fff', fontSize: 32, fontWeight: '700' },
  email:        { color: '#aaa', fontSize: 14, marginBottom: 32 },
  card: {
    width: '100%', backgroundColor: '#22223a', borderRadius: 14,
    padding: 16, marginBottom: 14,
  },
  cardTop:      { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cardIcon:     { fontSize: 20, marginRight: 10 },
  cardTitle:    { flex: 1, color: '#fff', fontSize: 15, fontWeight: '600' },
  cardCount:    { color: '#aaa', fontSize: 13, fontWeight: '500' },
  barBg:        { height: 8, backgroundColor: '#2a2a4a', borderRadius: 4, overflow: 'hidden' },
  barFill:      { height: 8, borderRadius: 4 },
  resetsLabel:  { color: '#666', fontSize: 12, marginTop: 8 },
  signOutBtn: {
    marginTop: 28, width: '100%', paddingVertical: 14,
    borderRadius: 12, borderWidth: 1, borderColor: '#ff6b6b',
    alignItems: 'center',
  },
  signOutText:  { color: '#ff6b6b', fontSize: 15, fontWeight: '600' },
  errorText:    { color: '#ff6b6b', marginTop: 24, textAlign: 'center' },
});
