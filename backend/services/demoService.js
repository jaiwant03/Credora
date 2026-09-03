/**
 * VerifyAI Demo Service
 * Provides rich, realistic, multi-agent simulated verification results
 * across a wide range of knowledge domains, with intelligent dynamic generation
 * for custom queries when API keys are not configured.
 */

const DEMO_RESPONSES = {
  telephone: {
    keywords: ['telephone', 'phone', 'bell', 'meucci'],
    classification: 'historical',
    initialAnswer: 'Alexander Graham Bell is credited with inventing the telephone and received the first patent in 1876.',
    finalAnswer: 'Alexander Graham Bell is widely credited with inventing the telephone and received the key U.S. patent in 1876. However, historical records also show that Italian inventor Antonio Meucci filed a caveat for a voice communication device in 1871, and Elisha Gray submitted a patent caveat on the same day as Bell. The U.S. Congress formally recognized Meucci\'s contributions in 2002, making this a historically nuanced attribution.',
    confidence: 78,
    confidenceLevel: 'high',
    status: 'conflict_resolved',
    conflictDetected: true,
    sources: ['Wikipedia', 'U.S. Congress Records', 'Smithsonian', 'Patent Office Archives', 'History Channel', 'Britannica'],
    aiAgreement: true,
    evidenceFound: true,
    verifiers: [
      { provider: 'Gemini', role: 'Fact Checker', agreement: true, confidence: 0.82, reason: 'Bell patent confirmed, Meucci caveat and Gray dispute noted', sourcesFound: true },
      { provider: 'Groq', role: 'Critical Reviewer', agreement: true, confidence: 0.78, reason: 'Historical dispute acknowledged across official records', sourcesFound: true },
      { provider: 'Hugging Face', role: 'Evidence Reviewer', agreement: false, confidence: 0.65, reason: 'Some historical sources dispute primary attribution exclusivity', disputedClaim: 'Sole invention claim', sourcesFound: false },
    ],
    steps: [
      { step: 'classification', label: 'Question Classification', status: 'done', detail: 'Historical fact & patent query' },
      { step: 'primary_answer', label: 'Primary AI Answer', status: 'done', detail: 'Initial attribution generated' },
      { step: 'verification', label: 'AI Verification', status: 'done', detail: '3 agents queried in parallel' },
      { step: 'conflict_detection', label: 'Conflict Detection', status: 'conflict', detail: 'Dispute identified regarding Antonio Meucci & Elisha Gray' },
      { step: 'additional_verification', label: 'Additional Verification', status: 'done', detail: 'Congressional records and patent archive consulted' },
      { step: 'confidence', label: 'Confidence Calculation', status: 'done', detail: 'Score: 78% — High' },
      { step: 'final_answer', label: 'Final Answer Generated', status: 'done', detail: 'Nuanced verified synthesis delivered' },
    ],
  },
  gravity: {
    keywords: ['gravity', 'gravitation', 'newton', 'apple'],
    classification: 'scientific',
    initialAnswer: 'Sir Isaac Newton formulated the law of universal gravitation after observing an apple fall from a tree in 1666.',
    finalAnswer: 'Sir Isaac Newton is widely credited with discovering and mathematically formulating the law of universal gravitation, published in his landmark work Principia Mathematica in 1687. The famous apple story, documented by William Stukeley, represents his insight that the same force causing objects to fall on Earth also governs celestial orbits. Later, Albert Einstein expanded our understanding with General Relativity (1915), describing gravity as spacetime curvature.',
    confidence: 96,
    confidenceLevel: 'very_high',
    status: 'verified',
    conflictDetected: false,
    sources: ['Principia Mathematica', 'Wikipedia', 'Britannica', 'Royal Society Archives', 'NASA Astrophysics'],
    aiAgreement: true,
    evidenceFound: true,
    verifiers: [
      { provider: 'Gemini', role: 'Fact Checker', agreement: true, confidence: 0.98, reason: 'Strong scientific and historical consensus confirmed across all primary sources', sourcesFound: true },
      { provider: 'Groq', role: 'Critical Reviewer', agreement: true, confidence: 0.95, reason: 'Newton\'s Principia and historical records verified with no conflicts', sourcesFound: true },
      { provider: 'Hugging Face', role: 'Evidence Reviewer', agreement: true, confidence: 0.94, reason: 'Mathematical formulation and historical timeline validated', sourcesFound: true },
    ],
    steps: [
      { step: 'classification', label: 'Question Classification', status: 'done', detail: 'Scientific history query' },
      { step: 'primary_answer', label: 'Primary AI Answer', status: 'done', detail: 'Initial formulation answer generated' },
      { step: 'verification', label: 'AI Verification', status: 'done', detail: '3 agents queried in parallel' },
      { step: 'conflict_detection', label: 'Conflict Detection', status: 'done', detail: 'Full multi-agent consensus achieved' },
      { step: 'confidence', label: 'Confidence Calculation', status: 'done', detail: 'Score: 96% — Very High' },
      { step: 'final_answer', label: 'Final Answer Generated', status: 'done', detail: 'Comprehensive verified answer delivered' },
    ],
  },
  penicillin: {
    keywords: ['penicillin', 'fleming', 'antibiotic', 'florey', 'chain'],
    classification: 'historical',
    initialAnswer: 'Alexander Fleming discovered penicillin in 1928 at St. Mary\'s Hospital in London.',
    finalAnswer: 'Alexander Fleming discovered penicillin in 1928 when he noticed that Penicillium notatum mold contaminated a Staphylococcus culture and inhibited bacterial growth. However, it was Howard Florey and Ernst Boris Chain at Oxford University who purified and mass-produced penicillin into a lifesaving medicine in the early 1940s. Fleming, Florey, and Chain jointly received the 1945 Nobel Prize in Physiology or Medicine.',
    confidence: 95,
    confidenceLevel: 'very_high',
    status: 'verified',
    conflictDetected: false,
    sources: ['Nobel Prize Foundation', 'British Medical Journal', 'Wikipedia', 'Science History Institute'],
    aiAgreement: true,
    evidenceFound: true,
    verifiers: [
      { provider: 'Gemini', role: 'Fact Checker', agreement: true, confidence: 0.96, reason: 'Nobel Prize records confirm, clear distinction between discovery and clinical purification', sourcesFound: true },
      { provider: 'Groq', role: 'Critical Reviewer', agreement: true, confidence: 0.94, reason: 'Fleming, Florey, and Chain contributions accurately attributed', sourcesFound: true },
      { provider: 'Hugging Face', role: 'Evidence Reviewer', agreement: true, confidence: 0.93, reason: 'Peer-reviewed medical history consistency verified', sourcesFound: true },
    ],
    steps: [
      { step: 'classification', label: 'Question Classification', status: 'done', detail: 'Medical history query' },
      { step: 'primary_answer', label: 'Primary AI Answer', status: 'done', detail: 'Initial discovery answer generated' },
      { step: 'verification', label: 'AI Verification', status: 'done', detail: '3 agents queried in parallel' },
      { step: 'conflict_detection', label: 'Conflict Detection', status: 'done', detail: 'No contradictions found' },
      { step: 'confidence', label: 'Confidence Calculation', status: 'done', detail: 'Score: 95% — Very High' },
      { step: 'final_answer', label: 'Final Answer Generated', status: 'done', detail: 'Thoroughly verified medical summary delivered' },
    ],
  },
  moon: {
    keywords: ['moon', 'armstrong', 'apollo 11', 'first person on the moon', 'lunar'],
    classification: 'historical',
    initialAnswer: 'Neil Armstrong was the first person to walk on the Moon on July 20, 1969.',
    finalAnswer: 'American astronaut Neil Armstrong became the first human to step onto the lunar surface on July 20, 1969 (20:17 UTC landing, 02:56 UTC walk on July 21) during NASA\'s Apollo 11 mission. He was joined approximately 19 minutes later by Lunar Module Pilot Buzz Aldrin, while Command Module Pilot Michael Collins remained in lunar orbit. The mission returned over 21 kg of lunar material.',
    confidence: 98,
    confidenceLevel: 'very_high',
    status: 'verified',
    conflictDetected: false,
    sources: ['NASA Apollo 11 Mission Log', 'Smithsonian National Air and Space Museum', 'Wikipedia', 'Britannica'],
    aiAgreement: true,
    evidenceFound: true,
    verifiers: [
      { provider: 'Gemini', role: 'Fact Checker', agreement: true, confidence: 0.99, reason: 'Primary NASA flight logs and photographic evidence confirm', sourcesFound: true },
      { provider: 'Groq', role: 'Critical Reviewer', agreement: true, confidence: 0.98, reason: 'Complete historical and astronomical agreement verified', sourcesFound: true },
      { provider: 'Hugging Face', role: 'Evidence Reviewer', agreement: true, confidence: 0.97, reason: 'Universal consensus in space history records', sourcesFound: true },
    ],
    steps: [
      { step: 'classification', label: 'Question Classification', status: 'done', detail: 'Space exploration history query' },
      { step: 'primary_answer', label: 'Primary AI Answer', status: 'done', detail: 'Initial mission summary generated' },
      { step: 'verification', label: 'AI Verification', status: 'done', detail: '3 agents queried in parallel' },
      { step: 'conflict_detection', label: 'Conflict Detection', status: 'done', detail: 'No conflicts detected' },
      { step: 'confidence', label: 'Confidence Calculation', status: 'done', detail: 'Score: 98% — Very High' },
      { step: 'final_answer', label: 'Final Answer Generated', status: 'done', detail: 'Authoritative verified answer delivered' },
    ],
  },
  quantum: {
    keywords: ['quantum', 'qubit', 'superposition', 'entanglement'],
    classification: 'conceptual',
    initialAnswer: 'Quantum computing uses quantum mechanics like superposition and entanglement to process information.',
    finalAnswer: 'Quantum computing leverages fundamental principles of quantum mechanics — primarily superposition, entanglement, and quantum interference — to perform computations exponentially faster than classical computers for specific problem classes. While classical computers rely on binary bits (0 or 1), quantum computers utilize qubits that can exist in linear combinations of states. Key target applications include molecular simulation, cryptographic analysis, logistics optimization, and materials discovery. The industry currently operates in the Noisy Intermediate-Scale Quantum (NISQ) era with ongoing efforts toward fault-tolerant logical qubits.',
    confidence: 92,
    confidenceLevel: 'very_high',
    status: 'verified',
    conflictDetected: false,
    sources: ['Nature Physics', 'IBM Quantum Research', 'arXiv Quantum', 'IEEE Computer Society', 'Wikipedia'],
    aiAgreement: true,
    evidenceFound: true,
    verifiers: [
      { provider: 'Gemini', role: 'Fact Checker', agreement: true, confidence: 0.94, reason: 'Technical concepts align with peer-reviewed physics literature', sourcesFound: true },
      { provider: 'Groq', role: 'Critical Reviewer', agreement: true, confidence: 0.91, reason: 'Accurately distinguishes theoretical advantages from current NISQ hardware limitations', sourcesFound: true },
      { provider: 'Hugging Face', role: 'Evidence Reviewer', agreement: true, confidence: 0.90, reason: 'Consistency confirmed across leading academic and industry publications', sourcesFound: true },
    ],
    steps: [
      { step: 'classification', label: 'Question Classification', status: 'done', detail: 'Advanced physics & computation query' },
      { step: 'primary_answer', label: 'Primary AI Answer', status: 'done', detail: 'Theoretical principles formulated' },
      { step: 'verification', label: 'AI Verification', status: 'done', detail: '3 agents queried in parallel' },
      { step: 'conflict_detection', label: 'Conflict Detection', status: 'done', detail: 'No conceptual contradictions' },
      { step: 'confidence', label: 'Confidence Calculation', status: 'done', detail: 'Score: 92% — Very High' },
      { step: 'final_answer', label: 'Final Answer Generated', status: 'done', detail: 'Verified scientific summary delivered' },
    ],
  },
  crispr: {
    keywords: ['crispr', 'cas9', 'gene editing', 'doudna', 'charpentier'],
    classification: 'scientific',
    initialAnswer: 'CRISPR-Cas9 is a gene-editing technology adapted from a bacterial immune system.',
    finalAnswer: 'CRISPR-Cas9 (Clustered Regularly Interspaced Short Palindromic Repeats) is a molecular gene-editing system adapted from the adaptive immune mechanism of bacteria against bacteriophages. Jennifer Doudna and Emmanuelle Charpentier demonstrated in 2012 how the Cas9 endonuclease could be guided by synthetic RNA to make precise double-strand breaks in DNA, earning the 2020 Nobel Prize in Chemistry. Feng Zhang and the Broad Institute demonstrated its application in mammalian cells.',
    confidence: 94,
    confidenceLevel: 'very_high',
    status: 'verified',
    conflictDetected: false,
    sources: ['Nature Biotechnology', 'Nobel Prize in Chemistry 2020', 'Science Journal', 'NIH Genetics Home Reference'],
    aiAgreement: true,
    evidenceFound: true,
    verifiers: [
      { provider: 'Gemini', role: 'Fact Checker', agreement: true, confidence: 0.96, reason: 'Bacterial origins and Nobel recognition validated', sourcesFound: true },
      { provider: 'Groq', role: 'Critical Reviewer', agreement: true, confidence: 0.93, reason: 'Patent dispute between Berkeley and Broad Institute acknowledged in context', sourcesFound: true },
      { provider: 'Hugging Face', role: 'Evidence Reviewer', agreement: true, confidence: 0.92, reason: 'Biochemical mechanism description matches peer-reviewed records', sourcesFound: true },
    ],
    steps: [
      { step: 'classification', label: 'Question Classification', status: 'done', detail: 'Molecular biology & genetics query' },
      { step: 'primary_answer', label: 'Primary AI Answer', status: 'done', detail: 'Initial biochemical explanation generated' },
      { step: 'verification', label: 'AI Verification', status: 'done', detail: '3 agents queried in parallel' },
      { step: 'conflict_detection', label: 'Conflict Detection', status: 'done', detail: 'No factual conflicts found' },
      { step: 'confidence', label: 'Confidence Calculation', status: 'done', detail: 'Score: 94% — Very High' },
      { step: 'final_answer', label: 'Final Answer Generated', status: 'done', detail: 'Verified biomedical overview delivered' },
    ],
  },
  brain_myth: {
    keywords: ['10%', 'ten percent', 'use 10 percent of our brain', 'brain percentage'],
    classification: 'scientific',
    initialAnswer: 'The claim that humans only use 10% of their brain is a popular myth.',
    finalAnswer: 'The belief that humans only use 10% of their brains is an enduring urban legend debunked by modern neurobiology. Functional neuroimaging (fMRI, PET scans) proves that virtually all regions of the human brain have active functions throughout the day, even during sleep. Evolutionary biology also shows that the brain consumes approximately 20% of the body\'s energy despite being only 2% of body mass, making unused tissue biologically unviable.',
    confidence: 97,
    confidenceLevel: 'very_high',
    status: 'verified',
    conflictDetected: false,
    sources: ['Nature Neuroscience', 'Scientific American', 'Harvard Medical School', 'Society for Neuroscience'],
    aiAgreement: true,
    evidenceFound: true,
    verifiers: [
      { provider: 'Gemini', role: 'Fact Checker', agreement: true, confidence: 0.98, reason: 'Extensive fMRI and neuroscientific literature refutes the 10% claim', sourcesFound: true },
      { provider: 'Groq', role: 'Critical Reviewer', agreement: true, confidence: 0.96, reason: 'Consensus across neurology, metabolic studies, and evolutionary biology', sourcesFound: true },
      { provider: 'Hugging Face', role: 'Evidence Reviewer', agreement: true, confidence: 0.95, reason: 'No credible peer-reviewed support for the 10% claim', sourcesFound: true },
    ],
    steps: [
      { step: 'classification', label: 'Question Classification', status: 'done', detail: 'Myth-busting & neuroscience query' },
      { step: 'primary_answer', label: 'Primary AI Answer', status: 'done', detail: 'Initial debunking summary generated' },
      { step: 'verification', label: 'AI Verification', status: 'done', detail: '3 agents queried in parallel' },
      { step: 'conflict_detection', label: 'Conflict Detection', status: 'done', detail: 'Full agreement across verifiers' },
      { step: 'confidence', label: 'Confidence Calculation', status: 'done', detail: 'Score: 97% — Very High' },
      { step: 'final_answer', label: 'Final Answer Generated', status: 'done', detail: 'Empirically verified neurobiology answer delivered' },
    ],
  },
  great_wall: {
    keywords: ['great wall', 'visible from space', 'visible from the moon'],
    classification: 'geographical',
    initialAnswer: 'The Great Wall of China is not visible from space or the Moon with the naked eye.',
    finalAnswer: 'The claim that the Great Wall of China is visible from the Moon or even low Earth orbit with the naked eye is a misconception. NASA astronauts and international space agencies have confirmed that the Great Wall cannot be discerned without high-powered optics because its materials blend into the surrounding terrain and its width is typically only 5 to 9 meters. Under ideal lighting and atmospheric conditions with radar or telescopic lenses, it can be photographed from low orbit, but not with unaided human vision.',
    confidence: 96,
    confidenceLevel: 'very_high',
    status: 'verified',
    conflictDetected: false,
    sources: ['NASA Earth Observatory', 'Scientific American', 'European Space Agency (ESA)', 'Wikipedia'],
    aiAgreement: true,
    evidenceFound: true,
    verifiers: [
      { provider: 'Gemini', role: 'Fact Checker', agreement: true, confidence: 0.97, reason: 'NASA orbital observations and optical physics confirm lack of naked-eye visibility', sourcesFound: true },
      { provider: 'Groq', role: 'Critical Reviewer', agreement: true, confidence: 0.95, reason: 'Resolution limits of human eye at orbital altitudes mathematically prohibit visibility', sourcesFound: true },
      { provider: 'Hugging Face', role: 'Evidence Reviewer', agreement: true, confidence: 0.94, reason: 'Astronaut accounts and scientific consensus completely aligned', sourcesFound: true },
    ],
    steps: [
      { step: 'classification', label: 'Question Classification', status: 'done', detail: 'Optical physics & geography query' },
      { step: 'primary_answer', label: 'Primary AI Answer', status: 'done', detail: 'Initial myth evaluation generated' },
      { step: 'verification', label: 'AI Verification', status: 'done', detail: '3 agents queried in parallel' },
      { step: 'conflict_detection', label: 'Conflict Detection', status: 'done', detail: 'No contradictions detected' },
      { step: 'confidence', label: 'Confidence Calculation', status: 'done', detail: 'Score: 96% — Very High' },
      { step: 'final_answer', label: 'Final Answer Generated', status: 'done', detail: 'Optically verified answer delivered' },
    ],
  },
  largest_desert: {
    keywords: ['largest desert', 'biggest desert', 'antarctic desert', 'sahara desert'],
    classification: 'geographical',
    initialAnswer: 'The largest desert on Earth is Antarctica, not the Sahara.',
    finalAnswer: 'Geographically, a desert is defined by annual precipitation (less than 250 mm or 10 inches per year), not temperature. Therefore, the Antarctic Desert is Earth\'s largest desert, spanning approximately 14.2 million square kilometers (5.5 million square miles). The Arctic Desert is second (13.9 million sq km), while the Sahara is the largest subtropical (hot) desert at approximately 9.2 million square kilometers.',
    confidence: 98,
    confidenceLevel: 'very_high',
    status: 'verified',
    conflictDetected: false,
    sources: ['USGS Geological Survey', 'National Geographic', 'Encyclopaedia Britannica', 'World Meteorological Organization'],
    aiAgreement: true,
    evidenceFound: true,
    verifiers: [
      { provider: 'Gemini', role: 'Fact Checker', agreement: true, confidence: 0.99, reason: 'Standard meteorological definition of desert confirmed across all major geography databases', sourcesFound: true },
      { provider: 'Groq', role: 'Critical Reviewer', agreement: true, confidence: 0.97, reason: 'Distinction between polar and subtropical deserts clearly verified', sourcesFound: true },
      { provider: 'Hugging Face', role: 'Evidence Reviewer', agreement: true, confidence: 0.96, reason: 'Area measurements match official geographic registries', sourcesFound: true },
    ],
    steps: [
      { step: 'classification', label: 'Question Classification', status: 'done', detail: 'Physical geography & climate query' },
      { step: 'primary_answer', label: 'Primary AI Answer', status: 'done', detail: 'Initial geographic definition generated' },
      { step: 'verification', label: 'AI Verification', status: 'done', detail: '3 agents queried in parallel' },
      { step: 'conflict_detection', label: 'Conflict Detection', status: 'done', detail: 'Full agreement across definitions' },
      { step: 'confidence', label: 'Confidence Calculation', status: 'done', detail: 'Score: 98% — Very High' },
      { step: 'final_answer', label: 'Final Answer Generated', status: 'done', detail: 'Geographically accurate answer delivered' },
    ],
  },
  mona_lisa: {
    keywords: ['mona lisa', 'da vinci', 'leonardo', 'painted the mona lisa', 'louvre'],
    classification: 'historical',
    initialAnswer: 'Leonardo da Vinci painted the Mona Lisa in the early 16th century.',
    finalAnswer: 'The Mona Lisa (La Gioconda) was painted by Italian Renaissance master Leonardo da Vinci, likely begun around 1503 in Florence and worked on until his death in 1519. The subject is widely identified as Lisa Gherardini, the wife of Florentine silk merchant Francesco del Giocondo. It is housed in the Musée du Louvre in Paris and is celebrated for its sfumato painting technique and enigmatic expression.',
    confidence: 97,
    confidenceLevel: 'very_high',
    status: 'verified',
    conflictDetected: false,
    sources: ['Musée du Louvre Records', 'Oxford Art Online', 'Encyclopaedia Britannica', 'Art History Institute'],
    aiAgreement: true,
    evidenceFound: true,
    verifiers: [
      { provider: 'Gemini', role: 'Fact Checker', agreement: true, confidence: 0.98, reason: 'Louvre official provenance and historical consensus confirmed', sourcesFound: true },
      { provider: 'Groq', role: 'Critical Reviewer', agreement: true, confidence: 0.96, reason: 'Art historical documentation and Vasari biography alignment verified', sourcesFound: true },
      { provider: 'Hugging Face', role: 'Evidence Reviewer', agreement: true, confidence: 0.95, reason: 'Historical attribution universally accepted', sourcesFound: true },
    ],
    steps: [
      { step: 'classification', label: 'Question Classification', status: 'done', detail: 'Art history & provenance query' },
      { step: 'primary_answer', label: 'Primary AI Answer', status: 'done', detail: 'Initial artistic attribution generated' },
      { step: 'verification', label: 'AI Verification', status: 'done', detail: '3 agents queried in parallel' },
      { step: 'conflict_detection', label: 'Conflict Detection', status: 'done', detail: 'No attribution disputes found' },
      { step: 'confidence', label: 'Confidence Calculation', status: 'done', detail: 'Score: 97% — Very High' },
      { step: 'final_answer', label: 'Final Answer Generated', status: 'done', detail: 'Verified art history overview delivered' },
    ],
  },
  india: {
    keywords: ['india', 'population of india', 'indian population', 'most populous'],
    classification: 'numerical',
    initialAnswer: 'India is the most populous country in the world with over 1.44 billion people.',
    finalAnswer: 'As of 2024, India has surpassed China to become the world\'s most populous country with approximately 1.44 billion people. This milestone was confirmed by the United Nations Department of Economic and Social Affairs (DESA) and the World Bank. While India\'s fertility rate has declined to near replacement level (approx 2.0 births per woman), demographic momentum continues to drive growth.',
    confidence: 89,
    confidenceLevel: 'high',
    status: 'verified',
    conflictDetected: false,
    sources: ['UN Population Division', 'World Bank Data', 'Worldometer', 'Census India Projections', 'Reuters'],
    aiAgreement: true,
    evidenceFound: true,
    verifiers: [
      { provider: 'Gemini', role: 'Fact Checker', agreement: true, confidence: 0.91, reason: 'UN DESA and World Bank population data match', sourcesFound: true },
      { provider: 'Groq', role: 'Critical Reviewer', agreement: true, confidence: 0.88, reason: 'Surpassing of China milestone verified with official demographic releases', sourcesFound: true },
      { provider: 'Hugging Face', role: 'Evidence Reviewer', agreement: true, confidence: 0.86, reason: 'Consistent with current global demographic statistical models', sourcesFound: true },
    ],
    steps: [
      { step: 'classification', label: 'Question Classification', status: 'done', detail: 'Demographic & numerical statistics query' },
      { step: 'primary_answer', label: 'Primary AI Answer', status: 'done', detail: 'Initial demographic figure generated' },
      { step: 'verification', label: 'AI Verification', status: 'done', detail: '3 agents queried in parallel' },
      { step: 'conflict_detection', label: 'Conflict Detection', status: 'done', detail: 'Minor variance in real-time estimates, core fact agreed' },
      { step: 'confidence', label: 'Confidence Calculation', status: 'done', detail: 'Score: 89% — High' },
      { step: 'final_answer', label: 'Final Answer Generated', status: 'done', detail: 'Demographically verified answer delivered' },
    ],
  },
};

/**
 * Intelligent dynamic fallback generator for questions not matched in curated set.
 */
function generateDynamicDemoResult(question, groundingData = null) {
  const cleanQ = question.replace(/^(is it true that|who is|what is|tell me about|verify|fact check)\s+/i, '').trim();
  const lowerQ = cleanQ.toLowerCase();

  // Classify based on question patterns
  let classification = 'general';
  if (lowerQ.match(/\b(who|when|history|war|ancient|century|discovered|invented|president|king|queen|year)\b/)) {
    classification = 'historical';
  } else if (lowerQ.match(/\b(how|why|physics|chemistry|biology|science|atom|cell|quantum|gravity|planet|star|galaxy|dna)\b/)) {
    classification = 'scientific';
  } else if (lowerQ.match(/\b(how much|how many|population|distance|speed|size|height|weight|number|cost|percentage)\b/)) {
    classification = 'numerical';
  } else if (lowerQ.match(/\b(where|country|capital|mountain|ocean|river|continent|city|island|desert)\b/)) {
    classification = 'geographical';
  } else if (lowerQ.match(/\b(what is|define|concept|meaning|theory|philosophy|difference between)\b/)) {
    classification = 'conceptual';
  }

  const topicName = cleanQ.length > 60 ? `"${cleanQ.slice(0, 60)}..."` : `"${cleanQ}"`;

  let initialAnswer = `Based on initial knowledge synthesis: ${cleanQ}. Primary claims have been extracted for multi-source verification.`;
  let finalAnswer = `Regarding "${cleanQ}": Comprehensive multi-source verification confirms that current academic, scientific, and reference consensus strongly supports key facts regarding ${topicName}. The underlying claims have been evaluated for consistency, cross-referenced with encyclopedic databases, and checked for common misconceptions or outdated data.`;

  const sources = [
    'Wikipedia (The Free Encyclopedia)',
    'Google News Wire',
    'Encyclopaedia Britannica',
    'Global News & Fact Registry',
  ];

  // If live Wikipedia or News grounding is present, use the real extracts!
  if (groundingData && groundingData.hasGrounding) {
    if (groundingData.wikipediaExtracts && groundingData.wikipediaExtracts.length > 0) {
      const topWiki = groundingData.wikipediaExtracts[0];
      if (topWiki.extract) {
        initialAnswer = `${topWiki.extract}`;
        finalAnswer = `${topWiki.extract}\n\nLive verification across Wikipedia, Google News, and AI consensus confirms the accuracy of this information with supporting documentation.`;
      }
      sources.unshift(`Wikipedia: ${topWiki.title}`);
    }

    if (groundingData.newsArticles && groundingData.newsArticles.length > 0) {
      const topNews = groundingData.newsArticles[0];
      sources.push(`${topNews.publisher}: "${topNews.title}"`);
    }
  }

  const score = 86 + (Math.abs(hashString(cleanQ)) % 10); // 86-95
  const confLevel = score >= 90 ? 'very_high' : 'high';

  return {
    classification,
    initialAnswer,
    finalAnswer,
    confidence: score,
    confidenceLevel: confLevel,
    status: 'verified',
    conflictDetected: false,
    sources: Array.from(new Set(sources)),
    aiAgreement: true,
    evidenceFound: true,
    verifiers: [
      {
        provider: 'Gemini',
        role: 'Fact Checker',
        agreement: true,
        confidence: Number(((score + 2) / 100).toFixed(2)),
        reason: `Factual premises regarding ${topicName} align with live Wikipedia and search baseline`,
        sourcesFound: true,
      },
      {
        provider: 'Groq',
        role: 'Critical Reviewer',
        agreement: true,
        confidence: Number(((score - 1) / 100).toFixed(2)),
        reason: `Logical consistency and claim attribution verified across real-time news sources`,
        sourcesFound: true,
      },
      {
        provider: 'Hugging Face',
        role: 'Evidence Reviewer',
        agreement: true,
        confidence: Number(((score - 3) / 100).toFixed(2)),
        reason: `Corroborating documentation confirmed with no contradicting records found`,
        sourcesFound: true,
      },
    ],
    steps: [
      { step: 'classification', label: 'Question Classification', status: 'done', detail: `${classification.charAt(0).toUpperCase() + classification.slice(1)} query identified` },
      { step: 'grounding', label: 'Live Google & Wikipedia Search', status: 'done', detail: 'Real-time facts & news articles retrieved' },
      { step: 'primary_answer', label: 'Primary AI Answer', status: 'done', detail: 'Grounded candidate answer formulated' },
      { step: 'verification', label: 'AI Multi-Agent Verification', status: 'done', detail: '3 agents queried in parallel (Gemini, Groq, Hugging Face)' },
      { step: 'conflict_detection', label: 'Conflict Detection', status: 'done', detail: 'No contradictions detected across models and news data' },
      { step: 'confidence', label: 'Confidence Calculation', status: 'done', detail: `Score: ${score}% — ${confLevel === 'very_high' ? 'Very High' : 'High'}` },
      { step: 'final_answer', label: 'Final Answer Generated', status: 'done', detail: 'Consensus verified answer delivered with citations' },
    ],
  };
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

async function runDemoVerification(question, requestId, groundingData = null) {
  const id = requestId || `verif-${Math.random().toString(36).substring(2, 10)}`;

  // Realistic simulated delay
  await sleep(1200);

  const q = question.toLowerCase();
  let matched = null;

  for (const [, data] of Object.entries(DEMO_RESPONSES)) {
    if (data.keywords.some(kw => q.includes(kw))) {
      matched = data;
      break;
    }
  }

  const demoData = matched || generateDynamicDemoResult(question, groundingData);

  const confidenceLabels = {
    very_high: 'Very High',
    high: 'High',
    moderate: 'Moderate',
    low: 'Low',
    unable: 'Unable to Verify',
  };

  return {
    id,
    _id: id,
    question,
    classification: demoData.classification,
    initialAnswer: demoData.initialAnswer,
    initial_answer: demoData.initialAnswer,
    answer: demoData.finalAnswer,
    finalAnswer: demoData.finalAnswer,
    final_answer: demoData.finalAnswer,
    confidence: demoData.confidence,
    confidenceScore: demoData.confidence,
    confidence_score: demoData.confidence,
    confidenceLevel: demoData.confidenceLevel,
    confidence_level: demoData.confidenceLevel,
    confidenceLevelLabel: confidenceLabels[demoData.confidenceLevel] || 'High',
    status: demoData.status,
    sources: demoData.sources,
    verificationSummary: {
      aiAgreement: demoData.aiAgreement,
      evidenceFound: demoData.evidenceFound,
      conflictDetected: demoData.conflictDetected,
      conflictResolved: demoData.conflictDetected,
    },
    verificationResults: {
      aiAgreement: demoData.aiAgreement,
      evidenceFound: demoData.evidenceFound,
      conflictDetected: demoData.conflictDetected,
      conflictResolved: demoData.conflictDetected,
    },
    verifierDetails: demoData.verifiers,
    verifier_details: demoData.verifiers,
    steps: demoData.steps,
    demoMode: true,
  };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { runDemoVerification, DEMO_RESPONSES };
