require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { connectDb, isDbConnected } = require('./config/database');
const { runMigration } = require('./config/migrate');

const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');

const verifyRoutes = require('./routes/verify');
const analyticsRoutes = require('./routes/analytics');
const sourcesRoutes = require('./routes/sources');
const settingsRoutes = require('./routes/settings');
const newsRoutes = require('./routes/news');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS — allow frontend dev and prod
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 2000,
  message: { error: true, message: 'Too many requests, please try again later.' },
});

const verifyLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 20 : 500,
  message: { error: true, message: 'Too many verification requests, please wait a moment.' },
});

app.use(limiter);
app.use(requestLogger);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/verify', verifyLimiter, verifyRoutes);
app.use('/api/verifications', verifyRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/sources', sourcesRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/news', newsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  const dbOk = isDbConnected();

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      database: dbOk ? 'connected' : 'error',
      gemini: !!process.env.GEMINI_API_KEY ? 'configured' : 'not_configured',
      groq: !!process.env.GROQ_API_KEY ? 'configured' : 'not_configured',
      huggingface: !!process.env.HUGGINGFACE_API_KEY ? 'configured' : 'not_configured',
      ollama: !!process.env.OLLAMA_URL ? 'configured' : 'not_configured',
      n8n: !!process.env.N8N_WEBHOOK_URL ? 'configured' : 'not_configured',
      demoMode: !process.env.GEMINI_API_KEY && !process.env.GROQ_API_KEY && !process.env.HUGGINGFACE_API_KEY && !process.env.OLLAMA_URL,
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: true, message: `Route not found: ${req.method} ${req.path}` });
});

// Global error handler
app.use(errorHandler);

// Start server after connecting to MongoDB
async function startServer() {
  try {
    await connectDb();
    console.log('✓ Database connected');
    
    // Seed/migrate MongoDB on startup
    await runMigration();
    
    app.listen(PORT, () => {
      console.log(`\n✓ VerifyAI Backend running on http://localhost:${PORT}`);
      console.log(`✓ Health: http://localhost:${PORT}/api/health`);
      const demoMode = !process.env.GEMINI_API_KEY && !process.env.GROQ_API_KEY;
      if (demoMode) {
        console.log('⚡ Running in DEMO MODE (no API keys configured)');
      }
      console.log('');
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();

module.exports = app;
