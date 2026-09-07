const express = require('express');
const router = express.Router();
const { getSettingsHandler, updateSettingsHandler, getAgents, toggleAgent, testProvider } = require('../controllers/settingsController');

router.get('/', getSettingsHandler);
router.put('/', updateSettingsHandler);
router.get('/agents', getAgents);
router.put('/agents/:provider', toggleAgent);
router.post('/test/:provider', testProvider);

module.exports = router;
