import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  filename: string;
  onDelete: (filename: string) => void;
}

export default function DocumentCard({ filename, onDelete }: Props) {
  return (
    <View style={styles.card}>
      <Ionicons name="document-text-outline" size={22} color="#6C63FF" style={styles.icon} />
      <Text style={styles.name} numberOfLines={1}>{filename}</Text>
      <TouchableOpacity onPress={() => onDelete(filename)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginVertical: 5,
    marginHorizontal: 16,
  },
  icon: { marginRight: 10 },
  name: { flex: 1, color: '#e0e0e0', fontSize: 14 },
});
