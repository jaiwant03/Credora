const express = require('express');
const router = express.Router();
const {
  getSources,
  createSource,
  updateSource,
  deleteSource,
} = require('../controllers/sourcesController');

router.get('/', getSources);
router.post('/', createSource);
router.put('/:id', updateSource);
router.delete('/:id', deleteSource);

module.exports = router;

