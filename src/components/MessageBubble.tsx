import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  text: string;
  isUser: boolean;
  sources?: string[];
}

export default function MessageBubble({ text, isUser, sources }: Props) {
  return (
    <View style={[styles.wrapper, isUser ? styles.userWrapper : styles.botWrapper]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
        <Text style={[styles.text, isUser ? styles.userText : styles.botText]}>{text}</Text>
        {!isUser && sources && sources.length > 0 && (
          <Text style={styles.sources}>Sources: {sources.join(', ')}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginVertical: 4, paddingHorizontal: 12 },
  userWrapper: { alignItems: 'flex-end' },
  botWrapper: { alignItems: 'flex-start' },
  bubble: { maxWidth: '80%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  userBubble: { backgroundColor: '#6C63FF', borderBottomRightRadius: 4 },
  botBubble: { backgroundColor: '#2a2a3e', borderBottomLeftRadius: 4 },
  text: { fontSize: 15, lineHeight: 22 },
  userText: { color: '#fff' },
  botText: { color: '#e0e0e0' },
  sources: { marginTop: 6, fontSize: 11, color: '#8888aa', fontStyle: 'italic' },
});
