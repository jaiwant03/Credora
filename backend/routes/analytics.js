const express = require('express');
const router = express.Router();
const { getAnalytics, clearAnalytics } = require('../controllers/analyticsController');

router.get('/', getAnalytics);
router.post('/clear', clearAnalytics);
router.delete('/', clearAnalytics);

module.exports = router;
