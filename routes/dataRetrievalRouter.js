const express = require('express');
const {getHighestVolume, getAverageClose, getAverageVWAP} = require('../controllers/dataRetrievalController');

const router = express.Router();

router.get('/highest_volume', getHighestVolume);
router.get('/average_close', getAverageClose);
router.get('/average_vwap', getAverageVWAP);

module.exports = router;