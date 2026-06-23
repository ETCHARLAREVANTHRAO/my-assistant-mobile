import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import DocumentCard from '../components/DocumentCard';
import { documentsApi } from '../services/api';

export default function DocumentsScreen() {
  const [docs, setDocs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  const showMsg = (text: string, error = false) => {
    setMessage({ text, error });
    setTimeout(() => setMessage(null), 4000);
  };

  const loadDocs = useCallback(async () => {
    setLoading(true);
    try {
      setDocs(await documentsApi.list());
    } catch (e: any) {
      showMsg('Could not load documents: ' + (e?.message ?? 'Unknown error'), true);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDocs();
    }, [loadDocs])
  );

  const pickAndUpload = async () => {
    if (Platform.OS === 'web') {
      // Use native browser file picker — expo-document-picker blob URIs are unreliable on web
      const doc = typeof document !== 'undefined' ? document : null;
      if (!doc) return;
      const input = doc.createElement('input');
      input.type = 'file';
      input.accept = '*/*';
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
          const msg = await documentsApi.upload('', file.name, file);
          showMsg(msg || 'Uploaded successfully!');
          await loadDocs();
        } catch (e: any) {
          showMsg('Upload failed: ' + (e?.message ?? 'Unknown error'), true);
        } finally {
          setUploading(false);
          input.value = '';
        }
      };
      input.click();
      return;
    }

    // Mobile: use expo-document-picker
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    setUploading(true);
    try {
      const msg = await documentsApi.upload(asset.uri, asset.name);
      showMsg(msg || 'Uploaded successfully!');
      await loadDocs();
    } catch (e: any) {
      const detail = e?.response?.data?.detail ?? e?.message ?? 'Unknown error';
      showMsg('Upload failed: ' + detail, true);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (filename: string) => {
    const confirmed = Platform.OS === 'web'
      ? window.confirm(`Remove "${filename}" from the knowledge base?`)
      : true;
    if (!confirmed) return;

    try {
      await documentsApi.delete(filename);
      setDocs(prev => prev.filter(d => d !== filename));
      showMsg(`"${filename}" deleted.`);
    } catch {
      showMsg('Could not delete document.', true);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Documents</Text>
        <TouchableOpacity style={styles.uploadBtn} onPress={pickAndUpload} disabled={uploading}>
          {uploading
            ? <ActivityIndicator color="#fff" size="small" />
            : <Ionicons name="add" size={22} color="#fff" />}
        </TouchableOpacity>
      </View>

      {message && (
        <View style={[styles.toast, message.error ? styles.toastError : styles.toastSuccess]}>
          <Text style={styles.toastText}>{message.text}</Text>
        </View>
      )}

      {loading
        ? <ActivityIndicator style={styles.center} color="#6C63FF" />
        : docs.length === 0
          ? <Text style={styles.empty}>No documents yet. Tap + to upload.</Text>
          : (
            <FlatList
              data={docs}
              keyExtractor={d => d}
              renderItem={({ item }) => <DocumentCard filename={item} onDelete={handleDelete} />}
            />
          )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#2a2a3e',
  },
  title: { fontSize: 20, fontWeight: '700', color: '#fff' },
  uploadBtn: {
    backgroundColor: '#6C63FF', width: 38, height: 38,
    borderRadius: 19, justifyContent: 'center', alignItems: 'center',
  },
  toast: {
    margin: 12, padding: 12, borderRadius: 10,
  },
  toastSuccess: { backgroundColor: '#1a3a2a' },
  toastError: { backgroundColor: '#3a1a1a' },
  toastText: { color: '#fff', fontSize: 14, textAlign: 'center' },
  center: { flex: 1, alignSelf: 'center' },
  empty: { color: '#666', textAlign: 'center', marginTop: 60, paddingHorizontal: 40, fontSize: 15, lineHeight: 22 },
});
