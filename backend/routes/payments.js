const express = require('express');
const router = express.Router();
require('dotenv').config();
const auth = require('../middleware/auth');

router.post('/create-order', auth, async (req, res) => {
    try {
        res.status(503).json({ 
            message: 'Payment service is not available at the moment. Please try again later.',
            unavailable: true 
        });
    } catch (error) {
        console.error('[Payment] Service unavailable:', error);
        res.status(500).json({ message: 'Payment service error' });
    }
});

module.exports = router;