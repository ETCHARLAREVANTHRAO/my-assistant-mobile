import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { pyqApi, PYQAttemptStartResponse, PYQPaperSummary, PYQResult } from '../services/api';
import HomeScreen from './pyq/HomeScreen';
import GeneralInstructions from './pyq/GeneralInstructions';
import PaperInstructions from './pyq/PaperInstructions';
import ExamPlayer from './pyq/ExamPlayer';
import ResultScreen from './pyq/ResultScreen';
import SolutionReview from './pyq/SolutionReview';

type Step = 'home' | 'general' | 'paper_instructions' | 'exam' | 'result' | 'review';

export default function PYQScreen() {
  const [step, setStep] = useState<Step>('home');
  const [selectedPaper, setSelectedPaper] = useState<PYQPaperSummary | null>(null);
  const [attempt, setAttempt] = useState<PYQAttemptStartResponse | null>(null);
  const [result, setResult] = useState<PYQResult | null>(null);
  const [starting, setStarting] = useState(false);

  function selectPaper(paper: PYQPaperSummary) {
    setSelectedPaper(paper);
    setStep('general');
  }

  async function viewPastAttempt(attemptId: string) {
    try {
      const r = await pyqApi.getResult(attemptId);
      setResult(r);
      setStep('result');
    } catch {
      Alert.alert('Could not load result', 'Please try again.');
    }
  }

  async function beginAttempt() {
    if (!selectedPaper) return;
    setStarting(true);
    try {
      const a = await pyqApi.startAttempt(selectedPaper.paper_id);
      setAttempt(a);
      setStep('exam');
    } catch {
      Alert.alert('Could not start test', 'Please check your connection and try again.');
    } finally {
      setStarting(false);
    }
  }

  function handleSubmitted(r: PYQResult) {
    setResult(r);
    setAttempt(null);
    setStep('result');
  }

  function retake() {
    setResult(null);
    setStep('paper_instructions');
  }

  function backToHome() {
    setSelectedPaper(null);
    setAttempt(null);
    setResult(null);
    setStep('home');
  }

  return (
    <View style={styles.container}>
      {step === 'home' && (
        <HomeScreen onSelectPaper={selectPaper} onViewAttempt={viewPastAttempt} />
      )}

      {step === 'general' && selectedPaper && (
        <GeneralInstructions
          paperTitle={selectedPaper.title}
          durationMinutes={selectedPaper.duration_minutes}
          onBack={backToHome}
          onNext={() => setStep('paper_instructions')}
        />
      )}

      {step === 'paper_instructions' && selectedPaper && (
        <PaperInstructions
          paperId={selectedPaper.paper_id}
          starting={starting}
          onBack={() => setStep('general')}
          onBegin={beginAttempt}
        />
      )}

      {step === 'exam' && attempt && (
        <ExamPlayer attempt={attempt} onSubmitted={handleSubmitted} />
      )}

      {step === 'result' && result && (
        <ResultScreen
          result={result}
          onRetake={retake}
          onViewSolutions={() => setStep('review')}
          onBackHome={backToHome}
        />
      )}

      {step === 'review' && result && (
        <SolutionReview result={result} onBack={() => setStep('result')} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
});
