import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '../config/firebase';

type Mode = 'signin' | 'signup';

export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const clearState = () => { setError(''); setResetSent(false); };

  const handleSubmit = async () => {
    if (!email || !password) { setError('Please enter email and password.'); return; }
    setLoading(true);
    setError('');
    try {
      if (mode === 'signup') {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (e: any) {
      setError(friendlyError(e.code));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) { setError('Enter your email above first.'); return; }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setError('');
    } catch (e: any) {
      setError(friendlyError(e.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>My Assistant</Text>
        <Text style={styles.subtitle}>Your personal AI</Text>

        {/* Mode tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, mode === 'signin' && styles.tabActive]}
            onPress={() => { setMode('signin'); clearState(); }}
          >
            <Text style={[styles.tabText, mode === 'signin' && styles.tabTextActive]}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, mode === 'signup' && styles.tabActive]}
            onPress={() => { setMode('signup'); clearState(); }}
          >
            <Text style={[styles.tabText, mode === 'signup' && styles.tabTextActive]}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        {/* Inputs */}
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {resetSent ? <Text style={styles.success}>Password reset email sent!</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>{mode === 'signin' ? 'Sign In' : 'Create Account'}</Text>
          }
        </TouchableOpacity>

        {mode === 'signin' && (
          <TouchableOpacity onPress={handleForgotPassword} disabled={loading}>
            <Text style={styles.link}>Forgot password?</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function friendlyError(code: string): string {
  switch (code) {
    case 'auth/invalid-email': return 'Invalid email address.';
    case 'auth/user-not-found': return 'No account found with this email.';
    case 'auth/wrong-password': return 'Incorrect password.';
    case 'auth/email-already-in-use': return 'An account with this email already exists.';
    case 'auth/weak-password': return 'Password must be at least 6 characters.';
    case 'auth/invalid-credential': return 'Incorrect email or password.';
    case 'auth/too-many-requests': return 'Too many attempts. Try again later.';
    default: return 'Something went wrong. Please try again.';
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#1a1a2e' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 28 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 16, color: '#888', textAlign: 'center', marginBottom: 40 },
  tabs: { flexDirection: 'row', backgroundColor: '#2a2a3e', borderRadius: 12, marginBottom: 24, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: '#6C63FF' },
  tabText: { color: '#888', fontWeight: '600', fontSize: 15 },
  tabTextActive: { color: '#fff' },
  input: {
    backgroundColor: '#2a2a3e', color: '#fff', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 15,
    marginBottom: 14, borderWidth: 1, borderColor: '#3a3a4e',
  },
  error: { color: '#ff6b6b', marginBottom: 12, textAlign: 'center', fontSize: 14 },
  success: { color: '#51cf66', marginBottom: 12, textAlign: 'center', fontSize: 14 },
  button: {
    backgroundColor: '#6C63FF', borderRadius: 12, paddingVertical: 15,
    alignItems: 'center', marginBottom: 16,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  link: { color: '#6C63FF', textAlign: 'center', fontSize: 14, marginTop: 4 },
});
