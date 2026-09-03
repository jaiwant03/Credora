/**
 * VerifyAI Backend Automated Test Suite
 * Tests all REST API endpoints, scoring engine, sources CRUD, settings, and health check.
 */

const axios = require('axios');
const assert = require('assert');

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting VerifyAI Backend API Test Suite...\n');
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      process.stdout.write(`  • ${name}... `);
      await fn();
      console.log('✓ PASSED');
      passed++;
    } catch (err) {
      console.log(`✗ FAILED: ${err.message}`);
      if (err.response?.data) {
        console.log('    Response error data:', JSON.stringify(err.response.data));
      }
      failed++;
    }
  }

  // 1. Health Check
  await test('GET /api/health returns 200 and valid status', async () => {
    const res = await axios.get(`${BASE_URL}/health`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.status, 'ok');
    assert.strictEqual(res.data.services.database, 'connected');
    assert.ok(typeof res.data.services.demoMode === 'boolean');
  });

  // 2. Verification Submission
  let createdVerifId = null;
  await test('POST /api/verify returns verified answer & confidence score', async () => {
    const res = await axios.post(`${BASE_URL}/verify`, {
      question: 'What is the largest desert on Earth?',
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.finalAnswer || res.data.answer);
    assert.ok(typeof res.data.confidence === 'number' || typeof res.data.confidenceScore === 'number');
    assert.ok(res.data.verifierDetails?.length > 0);
    assert.ok(res.data.steps?.length > 0);
    createdVerifId = res.data.id || res.data._id;
    assert.ok(createdVerifId);
  });

  // 3. Verification Validation
  await test('POST /api/verify rejects short invalid question with 400', async () => {
    try {
      await axios.post(`${BASE_URL}/verify`, { question: 'ab' });
      assert.fail('Expected 400 Bad Request');
    } catch (err) {
      assert.strictEqual(err.response.status, 400);
      assert.strictEqual(err.response.data.error, true);
    }
  });

  // 4. Verifications List & Query
  await test('GET /api/verifications returns paginated list', async () => {
    const res = await axios.get(`${BASE_URL}/verifications?limit=10`);
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.data.verifications));
    assert.ok(res.data.total >= 1);
  });

  // 5. Verification By ID
  await test('GET /api/verifications/:id retrieves single verification', async () => {
    assert.ok(createdVerifId, 'No verification ID available');
    const res = await axios.get(`${BASE_URL}/verifications/${createdVerifId}`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.id || res.data._id, createdVerifId);
    assert.ok(res.data.question);
  });

  // 6. Analytics
  await test('GET /api/analytics returns summaries and distributions', async () => {
    const res = await axios.get(`${BASE_URL}/analytics`);
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.summary);
    assert.ok(typeof res.data.summary.total === 'number');
    assert.ok(typeof res.data.summary.successRate === 'number');
    assert.ok(res.data.confidenceDistribution);
  });

  // 7. Sources CRUD
  let customSourceId = null;
  await test('GET /api/sources lists default sources', async () => {
    const res = await axios.get(`${BASE_URL}/sources`);
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.data.sources));
    assert.ok(res.data.sources.length >= 1);
  });

  await test('POST /api/sources creates a new source', async () => {
    const newSource = {
      name: `Test Source ${Date.now()}`,
      title: 'Automated Test Repository',
      url: 'https://test-source.verifyai.internal',
      type: 'academic',
      reliability: 'high',
    };
    const res = await axios.post(`${BASE_URL}/sources`, newSource);
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.name, newSource.name);
    customSourceId = res.data.id || res.data._id;
    assert.ok(customSourceId);
  });

  await test('PUT /api/sources/:id updates the source', async () => {
    assert.ok(customSourceId, 'No custom source ID available');
    const res = await axios.put(`${BASE_URL}/sources/${customSourceId}`, {
      reliability: 'medium',
      title: 'Updated Test Repository',
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.reliability, 'medium');
  });

  await test('DELETE /api/sources/:id deletes the source', async () => {
    assert.ok(customSourceId, 'No custom source ID available');
    const res = await axios.delete(`${BASE_URL}/sources/${customSourceId}`);
    assert.strictEqual(res.status, 200);
  });

  // 8. Settings API
  await test('GET /api/settings returns providers and weights', async () => {
    const res = await axios.get(`${BASE_URL}/settings`);
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.providers);
    assert.ok(res.data.verification);
    assert.ok(res.data.scoring);
  });

  await test('PUT /api/settings updates verification configuration', async () => {
    const res = await axios.put(`${BASE_URL}/settings`, {
      verification: { minConfidenceThreshold: 65 },
      scoring: { aiAgreementWeight: 35 },
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.verification.minConfidenceThreshold, 65);
    assert.strictEqual(res.data.scoring.aiAgreementWeight, 35);
  });

  await test('GET /api/settings/agents lists agents', async () => {
    const res = await axios.get(`${BASE_URL}/settings/agents`);
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.data.agents));
  });

  await test('PUT /api/settings/agents/:provider toggles agent state', async () => {
    const res = await axios.put(`${BASE_URL}/settings/agents/groq`, { enabled: true });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.enabled, true);
  });

  console.log(`\n========================================`);
  console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
