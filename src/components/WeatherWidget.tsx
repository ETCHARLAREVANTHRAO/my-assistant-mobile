import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { WeatherData } from '../services/api';

interface Props {
  data: WeatherData;
}

export default function WeatherWidget({ data }: Props) {
  const iconUrl = `https://openweathermap.org/img/wn/${data.icon}@2x.png`;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.city}>{data.city}</Text>
        <Image source={{ uri: iconUrl }} style={styles.icon} />
      </View>
      <Text style={styles.temp}>{Math.round(data.temperature_c)}°C</Text>
      <Text style={styles.desc}>{data.description}</Text>
      <View style={styles.row}>
        <Stat label="Feels like" value={`${Math.round(data.feels_like_c)}°C`} />
        <Stat label="Humidity" value={`${data.humidity}%`} />
        <Stat label="Wind" value={`${data.wind_speed_ms} m/s`} />
      </View>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#2a2a3e',
    borderRadius: 20,
    padding: 20,
    margin: 16,
    alignItems: 'center',
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  city: { fontSize: 22, fontWeight: '600', color: '#fff', marginRight: 8 },
  icon: { width: 50, height: 50 },
  temp: { fontSize: 64, fontWeight: '200', color: '#fff', marginVertical: 4 },
  desc: { fontSize: 16, color: '#aaa', marginBottom: 20, textTransform: 'capitalize' },
  row: { flexDirection: 'row', gap: 24 },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 16, color: '#fff', fontWeight: '600' },
  statLabel: { fontSize: 12, color: '#888', marginTop: 2 },
});
