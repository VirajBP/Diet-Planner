const express = require('express');
const router = express.Router();
const geminiService = require('../services/geminiService');
const auth = require('../middleware/auth');

// POST /api/chatbot/chat - Send a message to the chatbot
router.post('/chat', auth, async (req, res) => {
  try {
    const { message } = req.body;
    // Log user and token info for debugging
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('[CHATBOT] User ID:', req.user?.id, '| Token (masked):', token ? token.slice(0, 8) + '...' : 'none');
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        success: false, 
        message: 'Message is required and must be a string' 
      });
    }

    // Get response from Gemini
    const response = await geminiService.getResponse(message);
    console.log('Gemini API response:', response);
    
    res.json(response);

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// GET /api/chatbot/quota - Get quota status
router.get('/quota', auth, async (req, res) => {
  try {
    const quotaStatus = geminiService.getQuotaStatus();
    res.json({
      success: true,
      quota: quotaStatus
    });
  } catch (error) {
    console.error('Quota status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// POST /api/chatbot/reset - Reset chat history
router.post('/reset', auth, async (req, res) => {
  try {
    geminiService.resetChat();
    res.json({ 
      success: true, 
      message: 'Chat history reset successfully' 
    });
  } catch (error) {
    console.error('Reset chat error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

module.exports = router; 