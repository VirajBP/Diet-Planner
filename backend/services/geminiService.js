const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/gemini');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Fallback responses for when API is unavailable
const FALLBACK_RESPONSES = {
  greeting: "Hello! I'm your diet assistant. I can help you with meal planning, nutrition advice, and healthy eating tips. What would you like to know?",
  meal_planning: "For meal planning, I recommend focusing on balanced meals with protein, healthy carbs, and vegetables. Would you like specific meal suggestions?",
  nutrition: "Good nutrition includes a variety of whole foods, plenty of vegetables, lean proteins, and healthy fats. What specific nutrition questions do you have?",
  weight_loss: "Sustainable weight loss involves creating a calorie deficit through diet and exercise. Focus on whole foods and regular physical activity.",
  general: "I'm here to help with your diet and nutrition goals. Please try asking about meal planning, nutrition advice, or healthy eating tips."
};

class GeminiService {
  constructor() {
    this.model = genAI.getGenerativeModel({ model: config.model });
    this.chat = null;
    this.requestCount = 0;
    this.lastRequestTime = 0;
    this.requestQueue = [];
    this.isProcessing = false;
    this.consecutiveFailures = 0;
  }

  // Initialize or reset chat
  initializeChat() {
    this.chat = this.model.startChat({
      history: [
        // No system prompt, just a blank chat
      ],
    });
  }

  // Sleep function for delays
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get fallback response based on user query
  getFallbackResponse(userQuery) {
    const query = userQuery.toLowerCase();
    
    if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
      return FALLBACK_RESPONSES.greeting;
    } else if (query.includes('meal') || query.includes('food') || query.includes('eat')) {
      return FALLBACK_RESPONSES.meal_planning;
    } else if (query.includes('nutrition') || query.includes('nutrient') || query.includes('vitamin')) {
      return FALLBACK_RESPONSES.nutrition;
    } else if (query.includes('weight') || query.includes('lose') || query.includes('diet')) {
      return FALLBACK_RESPONSES.weight_loss;
    } else {
      return FALLBACK_RESPONSES.general;
    }
  }

  // Process queue
  async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    
    while (this.requestQueue.length > 0) {
      const { userQuery, resolve, reject } = this.requestQueue.shift();
      
      try {
        const result = await this.makeRequest(userQuery);
        resolve(result);
      } catch (error) {
        reject(error);
      }
      
      // Wait between requests to respect rate limits
      if (this.requestQueue.length > 0) {
        await this.sleep(config.rateLimit.minDelayBetweenRequests);
      }
    }
    
    this.isProcessing = false;
  }

  // Make actual API request
  async makeRequest(userQuery, retryCount = 0) {
    try {
      // Initialize chat if not already done
      if (!this.chat) {
        this.initializeChat();
      }

      // Get response from Gemini
      const result = await this.chat.sendMessage(userQuery);
      const response = await result.response;
      const text = response.text();

      // Reset failure count on success
      this.consecutiveFailures = 0;

      return {
        success: true,
        message: text
      };

    } catch (error) {
      console.error('Gemini API Error:', error);
      this.consecutiveFailures++;
      
      // Handle rate limiting/quota exceeded
      if (error.status === 429 || error.message.includes('quota') || error.message.includes('Too Many Requests')) {
        if (retryCount < config.rateLimit.maxRetries) {
          // Exponential backoff: wait 2^retryCount seconds
          const delay = Math.pow(config.rateLimit.retryDelayMultiplier, retryCount) * 1000;
          console.log(`Rate limited. Retrying in ${delay}ms (attempt ${retryCount + 1}/${config.rateLimit.maxRetries})`);
          await this.sleep(delay);
          return this.makeRequest(userQuery, retryCount + 1);
        } else {
          return {
            success: false,
            message: config.messages.rateLimited
          };
        }
      }
      
      // If too many consecutive failures, use fallback
      if (this.consecutiveFailures >= config.fallback.enableAfterFailures) {
        const fallbackMessage = this.getFallbackResponse(userQuery);
        return {
          success: true,
          message: fallbackMessage + "\n\n" + config.messages.fallbackNote
        };
      }
      
      // Handle other errors
      return {
        success: false,
        message: config.messages.connectionError
      };
    }
  }

  // Get response from Gemini with queue management
  async getResponse(userQuery) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ userQuery, resolve, reject });
      this.processQueue();
    });
  }

  // Reset chat history
  resetChat() {
    this.chat = null;
    this.consecutiveFailures = 0;
  }
}

module.exports = new GeminiService(); 