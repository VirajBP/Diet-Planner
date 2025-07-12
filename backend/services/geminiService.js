const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Remove SYSTEM_PROMPT and its use

class GeminiService {
  constructor() {
    this.model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    this.chat = null;
  }

  // Initialize or reset chat
  initializeChat() {
    this.chat = this.model.startChat({
      history: [
        // No system prompt, just a blank chat
      ],
    });
  }

  // Get response from Gemini
  async getResponse(userQuery) {
    try {
      // Initialize chat if not already done
      if (!this.chat) {
        this.initializeChat();
      }

      // Get response from Gemini
      const result = await this.chat.sendMessage(userQuery);
      const response = await result.response;
      const text = response.text();

      return {
        success: true,
        message: text
      };

    } catch (error) {
      console.error('Gemini API Error:', error);
      return {
        success: false,
        message: "I'm having trouble connecting right now. Please try again in a moment."
      };
    }
  }

  // Reset chat history
  resetChat() {
    this.chat = null;
  }
}

module.exports = new GeminiService(); 