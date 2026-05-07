const express = require('express');
const router = express.Router();
const { resetAnnualBalances, adjustBalance } = require('../controllers/balanceController');

// POST /api/balances/reset - HR Admin phase (Manual Reset)
router.post('/balances/reset', resetAnnualBalances);

// POST /api/balances/adjust - HR Admin phase (Manual Adjustment/Carryover)
router.post('/balances/adjust', adjustBalance);

module.exports = router;
