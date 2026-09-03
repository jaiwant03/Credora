const express = require('express');
const router = express.Router();
const { handleVerify, getVerifications, getVerificationById, deleteVerification } = require('../controllers/verifyController');

router.post('/', handleVerify);
router.get('/', getVerifications);
router.get('/:id', getVerificationById);
router.delete('/:id', deleteVerification);

module.exports = router;
