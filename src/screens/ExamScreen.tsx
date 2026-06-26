import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { examApi } from '../services/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  sources?: string[];
}

export default function ExamScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList>(null);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await examApi.chat(text);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: res.reply,
        sources: res.sources,
      };
      setMessages(prev => [...prev, botMsg]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: 'Failed to get response. Please try again.',
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
        <Text style={styles.bubbleText}>{item.text}</Text>
        {item.sources && item.sources.length > 0 && (
          <Text style={styles.sources}>📄 {item.sources.join(', ')}</Text>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📚 Exam Assistant</Text>
        <Text style={styles.headerSub}>GATE · GRE · GMAT</Text>
      </View>

      {messages.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Ask anything about your exam topics</Text>
          <Text style={styles.emptyHint}>e.g. "Explain binary trees" · "What is the OSI model?"</Text>
        </View>
      )}

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={m => m.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
      />

      {loading && <ActivityIndicator color="#6C63FF" style={{ marginBottom: 8 }} />}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask an exam question..."
          placeholderTextColor="#555"
          onSubmitEditing={send}
          returnKeyType="send"
          multiline
        />
        <TouchableOpacity style={styles.sendBtn} onPress={send} disabled={loading}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#12121f' },
  header: { paddingTop: 60, paddingBottom: 16, paddingHorizontal: 20, backgroundColor: '#1a1a2e', borderBottomColor: '#2a2a3e', borderBottomWidth: 1 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  headerSub: { color: '#6C63FF', fontSize: 13, marginTop: 2 },
  list: { padding: 16, paddingBottom: 8 },
  bubble: { maxWidth: '80%', borderRadius: 16, padding: 12, marginBottom: 10 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#6C63FF' },
  botBubble: { alignSelf: 'flex-start', backgroundColor: '#1e1e30' },
  bubbleText: { color: '#fff', fontSize: 15, lineHeight: 22 },
  sources: { color: '#aaa', fontSize: 11, marginTop: 6 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyText: { color: '#aaa', fontSize: 16, textAlign: 'center' },
  emptyHint: { color: '#555', fontSize: 13, textAlign: 'center', marginTop: 8 },
  inputRow: { flexDirection: 'row', padding: 12, borderTopColor: '#2a2a3e', borderTopWidth: 1, backgroundColor: '#1a1a2e' },
  input: { flex: 1, backgroundColor: '#12121f', color: '#fff', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, maxHeight: 100 },
  sendBtn: { marginLeft: 8, backgroundColor: '#6C63FF', borderRadius: 20, paddingHorizontal: 18, justifyContent: 'center' },
  sendText: { color: '#fff', fontWeight: '700' },
});
