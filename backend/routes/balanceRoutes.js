const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { resetAnnualBalances, adjustBalance, getMyBalance } = require('../controllers/balanceController');

router.post('/balances/reset', protect, resetAnnualBalances);
router.post('/balances/adjust', protect, adjustBalance);
router.get('/balances/my-balance', protect, getMyBalance);

module.exports = router;
