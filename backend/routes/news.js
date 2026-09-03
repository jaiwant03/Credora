const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');

// GET /api/news - List live breaking news by category
router.get('/', newsController.getLiveNews);

// GET /api/news/search - Search live news by keyword or claim
router.get('/search', newsController.searchNewsArticles);

// GET /api/news/wikipedia - Search Wikipedia articles & extracts
router.get('/wikipedia', newsController.searchWikipediaArticles);

// GET /api/news/grounding - Get live web & Wikipedia grounding evidence
router.get('/grounding', newsController.getGroundingData);

module.exports = router;
