import { useState, useCallback } from 'react';
import { verifyQuestion } from '../services/api';

const STEPS = [
  { id: 'understanding', label: 'Semantic Claim Parsing', detail: 'Deconstructing core entities, temporal anchors, and factual claims' },
  { id: 'generating', label: 'Initial Answer Synthesis', detail: 'Querying high-confidence factual baselines across models' },
  { id: 'checking_agents', label: 'Multi-Agent Consensus Evaluation', detail: 'Parallel verification by independent verifier agents' },
  { id: 'external_sources', label: 'Live Grounding & Reference Retrieval', detail: 'Fetching Google News Live Wire and Wikipedia Open REST API' },
  { id: 'detecting_conflicts', label: 'Conflict & Anomaly Detection', detail: 'Cross-correlating evidence to flag discrepancies' },
  { id: 'calculating', label: 'Consensus Confidence Scoring', detail: 'Weighting source authority and agreement indices' },
  { id: 'generating_final', label: 'Single Verified Consensus Delivery', detail: 'Formulating final truth-grounded synthesis' },
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
