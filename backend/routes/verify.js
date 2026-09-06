const express = require('express');
const router = express.Router();
const { handleVerify, getVerifications, getVerificationById, deleteVerification, clearAllVerifications } = require('../controllers/verifyController');

router.post('/', handleVerify);
router.get('/', getVerifications);
router.delete('/', clearAllVerifications);
router.post('/clear', clearAllVerifications);
router.get('/:id', getVerificationById);
router.delete('/:id', deleteVerification);

module.exports = router;
