import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import WeatherWidget from '../components/WeatherWidget';
import { weatherApi, WeatherData } from '../services/api';

export default function WeatherScreen() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = async () => {
    const q = city.trim();
    if (!q) return;
    setLoading(true);
    try {
      setWeather(await weatherApi.get(q));
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.detail ?? 'Could not fetch weather');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Weather</Text>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.input}
            value={city}
            onChangeText={setCity}
            placeholder="Enter city name..."
            placeholderTextColor="#666"
            returnKeyType="search"
            onSubmitEditing={fetch}
          />
          <TouchableOpacity style={styles.btn} onPress={fetch} disabled={loading}>
            <Ionicons name="search" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        {loading && <ActivityIndicator style={styles.loader} color="#6C63FF" size="large" />}
        {weather && !loading && <WeatherWidget data={weather} />}
        {!weather && !loading && (
          <Text style={styles.hint}>Search for any city to see current weather.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  title: { fontSize: 24, fontWeight: '700', color: '#fff', marginHorizontal: 20, marginTop: 16, marginBottom: 12 },
  searchRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#2a2a3e',
    color: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
  },
  btn: {
    backgroundColor: '#6C63FF',
    width: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: { marginTop: 40 },
  hint: { color: '#555', textAlign: 'center', marginTop: 60, fontSize: 15 },
});
