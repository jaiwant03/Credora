import { useState, useCallback } from 'react';
import { verifyQuestion } from '../services/api';

const STEPS = [
  { id: 'understanding', label: 'Understanding question' },
  { id: 'generating', label: 'Generating initial answer' },
  { id: 'checking_agents', label: 'Checking with verification agents' },
  { id: 'external_sources', label: 'Checking external sources' },
  { id: 'detecting_conflicts', label: 'Detecting conflicts' },
  { id: 'calculating', label: 'Calculating confidence' },
  { id: 'generating_final', label: 'Generating final answer' },
];

export function useVerification() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeStepIndex, setActiveStepIndex] = useState(-1);

  const verify = useCallback(async (question) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setActiveStepIndex(0);

    // Simulate step progression during API call
    let stepIdx = 0;
    const stepInterval = setInterval(() => {
      stepIdx++;
      if (stepIdx < STEPS.length) {
        setActiveStepIndex(stepIdx);
      }
    }, 300);

    try {
      const data = await verifyQuestion(question);
      clearInterval(stepInterval);
      setActiveStepIndex(STEPS.length); // all complete
      setResult(data);
    } catch (err) {
      clearInterval(stepInterval);
      setActiveStepIndex(-1);
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setActiveStepIndex(-1);
    setLoading(false);
  }, []);

  return {
    verify,
    reset,
    result,
    loading,
    error,
    steps: STEPS,
    activeStepIndex,
  };
}
