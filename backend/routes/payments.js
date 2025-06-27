const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
require('dotenv').config();
const auth = require('../middleware/auth');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post('/create-order', auth, async (req, res) => {
    try{
        const {amount} = req.body;
        if(!amount){
            return res.status(400).json({message: 'Amount is required'});
        }
        const options = {
            amount: amount * 100, // Razorpay expects amount in paise
            currency: 'INR',
            receipt: `receipt_order_${Date.now()}`,
          };
          const order = await razorpay.orders.create(options);
          res.json(order);
        } catch (error) {
          console.error('[Razorpay] Create order error:', error);
          res.status(500).json({ message: error.message });
        }
    });

module.exports = router;