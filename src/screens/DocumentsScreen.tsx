import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
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

  const loadDocs = useCallback(async () => {
    setLoading(true);
    try {
      setDocs(await documentsApi.list());
    } catch {
      Alert.alert('Error', 'Could not load documents. Is the server running?');
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
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    setUploading(true);
    try {
      const msg = await documentsApi.upload(asset.uri, asset.name);
      Alert.alert('Uploaded', msg);
      await loadDocs();
    } catch (e: any) {
      Alert.alert('Upload failed', e?.response?.data?.detail ?? 'Unknown error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (filename: string) => {
    Alert.alert('Delete', `Remove "${filename}" from the knowledge base?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await documentsApi.delete(filename);
            setDocs(prev => prev.filter(d => d !== filename));
          } catch {
            Alert.alert('Error', 'Could not delete document');
          }
        },
      },
    ]);
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
      {loading
        ? <ActivityIndicator style={styles.center} color="#6C63FF" />
        : docs.length === 0
          ? <Text style={styles.empty}>No documents yet. Tap + to upload a Markdown file.</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a3e',
  },
  title: { fontSize: 20, fontWeight: '700', color: '#fff' },
  uploadBtn: {
    backgroundColor: '#6C63FF',
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: { flex: 1, alignSelf: 'center' },
  empty: { color: '#666', textAlign: 'center', marginTop: 60, paddingHorizontal: 40, fontSize: 15, lineHeight: 22 },
});
