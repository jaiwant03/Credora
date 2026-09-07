const { connectDb } = require('./database');
const Verification = require('../models/Verification');
const Source = require('../models/Source');
const SystemSetting = require('../models/SystemSetting');
const VerificationAgent = require('../models/VerificationAgent');

async function runMigration() {
  try {
    // Seed default settings
    const defaultSettings = [
      { _id: 'min_confidence_threshold', value: '60' },
      { _id: 'additional_verification_on_conflict', value: 'true' },
      { _id: 'num_verification_agents', value: '3' },
      { _id: 'source_verification_enabled', value: 'true' },
      { _id: 'demo_mode', value: 'true' },
      { _id: 'ai_agreement_weight', value: '30' },
      { _id: 'evidence_support_weight', value: '30' },
      { _id: 'source_reliability_weight', value: '25' },
      { _id: 'consistency_weight', value: '15' },
    ];

    for (const setting of defaultSettings) {
      await SystemSetting.findByIdAndUpdate(
        setting._id,
        { value: setting.value, updated_at: new Date() },
        { upsert: true }
      );
    }

    // Seed default agents
    const defaultAgents = [
      { _id: 'agent-gemini', name: 'Google Gemini', provider: 'gemini', enabled: true, status: 'unknown' },
      { _id: 'agent-groq', name: 'Groq', provider: 'groq', enabled: true, status: 'unknown' },
      { _id: 'agent-huggingface', name: 'Hugging Face', provider: 'huggingface', enabled: true, status: 'unknown' },
      { _id: 'agent-ollama', name: 'Ollama', provider: 'ollama', enabled: !!process.env.OLLAMA_URL, status: 'unknown' },
      { _id: 'agent-n8n', name: 'n8n Workflow', provider: 'n8n', enabled: !!process.env.N8N_WEBHOOK_URL, status: 'unknown' },
    ];

    for (const agent of defaultAgents) {
      await VerificationAgent.findByIdAndUpdate(
        agent._id,
        agent,
        { upsert: true }
      );
    }

    // Seed default sources
    const defaultSources = [
      { _id: 'src-wikipedia', name: 'Wikipedia', title: 'Wikipedia Encyclopedia', url: 'https://en.wikipedia.org', type: 'wikipedia', reliability: 'high', usage_count: 42, usageCount: 42 },
      { _id: 'src-google', name: 'Google Search', title: 'Google Knowledge Graph', url: 'https://www.google.com', type: 'web', reliability: 'high', usage_count: 38, usageCount: 38 },
      { _id: 'src-britannica', name: 'Encyclopaedia Britannica', title: 'Encyclopaedia Britannica', url: 'https://www.britannica.com', type: 'knowledge', reliability: 'high', usage_count: 21, usageCount: 21 },
      { _id: 'src-arxiv', name: 'arXiv', title: 'arXiv Academic Repository', url: 'https://arxiv.org', type: 'academic', reliability: 'high', usage_count: 9, usageCount: 9 },
      { _id: 'src-news', name: 'News Sources', title: 'Global News Aggregator', url: 'https://news.google.com', type: 'web', reliability: 'medium', usage_count: 15, usageCount: 15 },
    ];

    for (const source of defaultSources) {
      await Source.findByIdAndUpdate(
        source._id,
        source,
        { upsert: true }
      );
    }

    // Seed demo verifications if none exist
    const count = await Verification.countDocuments();
    if (count === 0) {
      await seedDemoVerifications();
    }

    console.log('✓ MongoDB database initialization and seeding complete');
  } catch (err) {
    console.error('Migration error:', err.message);
  }
}

async function seedDemoVerifications() {
  const now = new Date();
  const verifierDetails = [
    { provider: 'Gemini', role: 'Fact Checker', agreement: true, confidence: 0.95, reason: 'Strong historical consensus confirmed', sourcesFound: true },
    { provider: 'Groq', role: 'Critical Reviewer', agreement: true, confidence: 0.92, reason: 'Multiple reliable sources agree', sourcesFound: true },
    { provider: 'Hugging Face', role: 'Evidence Reviewer', agreement: true, confidence: 0.89, reason: 'Consistent with training data', sourcesFound: false },
  ];

  const demos = [
    {
      _id: 'demo-1',
      question: 'Who discovered gravity?',
      classification: 'historical',
      initialAnswer: 'Sir Isaac Newton is credited with formulating the law of universal gravitation.',
      initial_answer: 'Sir Isaac Newton is credited with formulating the law of universal gravitation.',
      finalAnswer: 'Sir Isaac Newton is widely credited with discovering and mathematically formulating the law of universal gravitation, published in his landmark work Principia Mathematica in 1687. The famous apple story symbolizes his insight that the same force causing objects to fall on Earth governs planetary motion.',
      final_answer: 'Sir Isaac Newton is widely credited with discovering and mathematically formulating the law of universal gravitation, published in his landmark work Principia Mathematica in 1687. The famous apple story symbolizes his insight that the same force causing objects to fall on Earth governs planetary motion.',
      confidenceScore: 96,
      confidence_score: 96,
      confidenceLevel: 'very_high',
      confidence_level: 'very_high',
      status: 'verified',
      conflictDetected: false,
      conflict_detected: false,
      sources: ['Wikipedia', 'Britannica', 'History of Science', 'Physics Archive'],
      verificationSummary: { aiAgreement: true, evidenceFound: true, conflictDetected: false },
      verification_results: { aiAgreement: true, evidenceFound: true, conflictDetected: false },
      verifierDetails,
      verifier_details: verifierDetails,
      created_at: new Date(now.getTime() - 2 * 3600 * 1000),
    },
    {
      _id: 'demo-2',
      question: 'What is the current population of India?',
      classification: 'numerical',
      initialAnswer: 'India has a population of approximately 1.44 billion people.',
      initial_answer: 'India has a population of approximately 1.44 billion people.',
      finalAnswer: 'As of 2024, India has surpassed China to become the world\'s most populous country with approximately 1.44 billion people. The UN World Population Prospects and Indian census data confirm this milestone.',
      final_answer: 'As of 2024, India has surpassed China to become the world\'s most populous country with approximately 1.44 billion people. The UN World Population Prospects and Indian census data confirm this milestone.',
      confidenceScore: 88,
      confidence_score: 88,
      confidenceLevel: 'high',
      confidence_level: 'high',
      status: 'verified',
      conflictDetected: false,
      conflict_detected: false,
      sources: ['UN Population Division', 'World Bank', 'Census India', 'Worldometer', 'Reuters'],
      verificationSummary: { aiAgreement: true, evidenceFound: true, conflictDetected: false },
      verification_results: { aiAgreement: true, evidenceFound: true, conflictDetected: false },
      verifierDetails,
      verifier_details: verifierDetails,
      created_at: new Date(now.getTime() - 1 * 3600 * 1000),
    },
    {
      _id: 'demo-3',
      question: 'Who invented the telephone?',
      classification: 'historical',
      initialAnswer: 'Alexander Graham Bell is credited with inventing the telephone.',
      initial_answer: 'Alexander Graham Bell is credited with inventing the telephone.',
      finalAnswer: 'Alexander Graham Bell is widely credited with inventing the telephone and received the key U.S. patent in 1876. Historical records also show that Italian inventor Antonio Meucci filed a caveat in 1871, and the U.S. Congress recognized Meucci\'s contributions in 2002.',
      final_answer: 'Alexander Graham Bell is widely credited with inventing the telephone and received the key U.S. patent in 1876. Historical records also show that Italian inventor Antonio Meucci filed a caveat in 1871, and the U.S. Congress recognized Meucci\'s contributions in 2002.',
      confidenceScore: 78,
      confidence_score: 78,
      confidenceLevel: 'high',
      confidence_level: 'high',
      status: 'conflict_resolved',
      conflictDetected: true,
      conflict_detected: true,
      sources: ['Wikipedia', 'U.S. Congress Records', 'Smithsonian', 'Patent Office Archives', 'History Channel', 'Britannica'],
      verificationSummary: { aiAgreement: true, evidenceFound: true, conflictDetected: true, conflictResolved: true },
      verification_results: { aiAgreement: true, evidenceFound: true, conflictDetected: true, conflictResolved: true },
      verifierDetails,
      verifier_details: verifierDetails,
      created_at: new Date(now.getTime() - 24 * 3600 * 1000),
    },
    {
      _id: 'demo-4',
      question: 'Who discovered penicillin?',
      classification: 'historical',
      initialAnswer: 'Alexander Fleming discovered penicillin in 1928.',
      initial_answer: 'Alexander Fleming discovered penicillin in 1928.',
      finalAnswer: 'Alexander Fleming discovered penicillin in 1928. Howard Florey and Ernst Boris Chain later developed it into a practical antibiotic. All three shared the Nobel Prize in Physiology or Medicine in 1945.',
      final_answer: 'Alexander Fleming discovered penicillin in 1928. Howard Florey and Ernst Boris Chain later developed it into a practical antibiotic. All three shared the Nobel Prize in Physiology or Medicine in 1945.',
      confidenceScore: 94,
      confidence_score: 94,
      confidenceLevel: 'very_high',
      confidence_level: 'very_high',
      status: 'verified',
      conflictDetected: false,
      conflict_detected: false,
      sources: ['Nobel Prize Records', 'Wikipedia', 'British Medical Journal', 'History of Medicine'],
      verificationSummary: { aiAgreement: true, evidenceFound: true, conflictDetected: false },
      verification_results: { aiAgreement: true, evidenceFound: true, conflictDetected: false },
      verifierDetails,
      verifier_details: verifierDetails,
      created_at: new Date(now.getTime() - 48 * 3600 * 1000),
    },
    {
      _id: 'demo-5',
      question: 'What is the speed of dark matter?',
      classification: 'scientific',
      initialAnswer: 'Dark matter does not have a definitive speed as it has not been directly observed.',
      initial_answer: 'Dark matter does not have a definitive speed as it has not been directly observed.',
      finalAnswer: 'Dark matter\'s exact speed cannot be definitively stated because dark matter has never been directly detected. Current models suggest cold dark matter moves at non-relativistic speeds, but this remains theoretical.',
      final_answer: 'Dark matter\'s exact speed cannot be definitively stated because dark matter has never been directly detected. Current models suggest cold dark matter moves at non-relativistic speeds, but this remains theoretical.',
      confidenceScore: 52,
      confidence_score: 52,
      confidenceLevel: 'low',
      confidence_level: 'low',
      status: 'low_confidence',
      conflictDetected: true,
      conflict_detected: true,
      sources: ['arXiv Physics', 'NASA', 'CERN'],
      verificationSummary: { aiAgreement: true, evidenceFound: true, conflictDetected: true },
      verification_results: { aiAgreement: true, evidenceFound: true, conflictDetected: true },
      verifierDetails,
      verifier_details: verifierDetails,
      created_at: new Date(now.getTime() - 72 * 3600 * 1000),
    },
  ];

  await Verification.insertMany(demos);
}

if (require.main === module) {
  connectDb().then(() => runMigration()).then(() => process.exit(0));
}

module.exports = { runMigration };
