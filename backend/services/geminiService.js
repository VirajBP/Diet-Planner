const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// System prompt to restrict the AI to nutrition topics only
const SYSTEM_PROMPT = `You are NutriPulse, a specialized nutrition and diet assistant. You can ONLY answer questions related to:

- Nutrition and diet advice
- Food and meal planning
- Health and wellness through nutrition
- Weight management
- Exercise nutrition
- Dietary restrictions and allergies
- Nutritional supplements
- Cooking and recipes
- Food safety and storage
- Nutrition for specific health conditions

IMPORTANT RULES:
1. If a question is NOT related to nutrition, diet, food, or health, respond with: "I'm sorry, but I can only help with nutrition and diet-related questions. Please ask me about food, nutrition, health, or diet topics."
2. Always provide evidence-based, safe nutrition advice
3. Never give medical diagnosis or treatment advice
4. Recommend consulting healthcare professionals for medical concerns
5. Keep responses concise, helpful, and focused on nutrition
6. Use a friendly, supportive tone

Your responses should be practical and actionable for users managing their nutrition and diet.`;

class GeminiService {
  constructor() {
    this.model = genAI.getGenerativeModel({ model: "gemini-pro" });
    this.chat = null;
  }

  // Initialize or reset chat
  initializeChat() {
    this.chat = this.model.startChat({
      history: [
        {
          role: "user",
          parts: [SYSTEM_PROMPT],
        },
        {
          role: "model",
          parts: ["I understand. I am NutriPulse, your nutrition assistant. I will only answer questions related to nutrition, diet, food, and health topics. How can I help you with your nutrition goals today?"],
        },
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