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
    
    // Daily quota tracking
    this.dailyRequests = 0;
    this.lastResetDate = new Date().toDateString();
    this.quotaExceeded = false;
    
    // Hourly rate limiting
    this.hourlyRequests = 0;
    this.lastHourReset = new Date().getHours();
    
    // Enhanced tracking
    this.totalRequests = 0;
    this.totalFailures = 0;
    this.lastQuotaCheck = Date.now();
    
    // Reset quota daily
    this.resetQuotaDaily();
  }

  // Reset quota counter daily
  resetQuotaDaily() {
    const today = new Date().toDateString();
    if (today !== this.lastResetDate) {
      this.dailyRequests = 0;
      this.lastResetDate = today;
      this.quotaExceeded = false;
      this.consecutiveFailures = 0;
      console.log('🔄 Daily quota reset - New day started');
    }
    
    // Reset hourly counter
    const currentHour = new Date().getHours();
    if (currentHour !== this.lastHourReset) {
      this.hourlyRequests = 0;
      this.lastHourReset = currentHour;
      console.log('🔄 Hourly quota reset - New hour started');
    }
  }

  // Enhanced quota logging
  logQuotaStatus(reason = '') {
    const status = this.getQuotaStatus();
    const logMessage = `📊 Quota Status${reason ? ` (${reason})` : ''}: Daily ${status.dailyRequests}/${status.dailyLimit} (${status.remainingDailyRequests} remaining), Hourly ${status.hourlyRequests}/${status.hourlyLimit} (${status.remainingHourlyRequests} remaining)`;
    console.log(logMessage);
    return status;
  }

  // Check if we can make a request
  canMakeRequest() {
    this.resetQuotaDaily();
    
    // If quota exceeded, don't make requests
    if (this.quotaExceeded) {
      this.logQuotaStatus('QUOTA_EXCEEDED');
      return false;
    }
    
    // Check queue size limit
    if (this.requestQueue.length >= config.queue.maxQueueSize) {
      console.log(`⚠️ Queue full: ${this.requestQueue.length}/${config.queue.maxQueueSize} requests queued`);
      return false;
    }
    
    // Check hourly limit
    if (this.hourlyRequests >= config.quota.maxRequestsPerHour) {
      this.logQuotaStatus('HOURLY_LIMIT_REACHED');
      return false;
    }
    
    // If approaching daily limit, be more conservative
    const bufferLimit = Math.floor(config.rateLimit.requestsPerDay * (1 - config.quota.bufferPercentage));
    if (this.dailyRequests >= bufferLimit) {
      this.logQuotaStatus('DAILY_BUFFER_REACHED');
      return false;
    }
    
    return true;
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

  // Enhanced fallback response with more context
  getFallbackResponse(userQuery) {
    const query = userQuery.toLowerCase();
    
    // More sophisticated keyword matching
    if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
      return FALLBACK_RESPONSES.greeting;
    } else if (query.includes('meal') || query.includes('food') || query.includes('eat') || query.includes('breakfast') || query.includes('lunch') || query.includes('dinner')) {
      return FALLBACK_RESPONSES.meal_planning;
    } else if (query.includes('nutrition') || query.includes('nutrient') || query.includes('vitamin') || query.includes('protein') || query.includes('carb') || query.includes('fat')) {
      return FALLBACK_RESPONSES.nutrition;
    } else if (query.includes('weight') || query.includes('lose') || query.includes('diet') || query.includes('calorie') || query.includes('burn')) {
      return FALLBACK_RESPONSES.weight_loss;
    } else {
      return FALLBACK_RESPONSES.general;
    }
  }

  // Process queue with enhanced error handling
  async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    console.log(`🔄 Processing queue: ${this.requestQueue.length} requests pending`);
    
    while (this.requestQueue.length > 0) {
      const { userQuery, resolve, reject } = this.requestQueue.shift();
      
      try {
        const result = await this.makeRequest(userQuery);
        resolve(result);
      } catch (error) {
        console.error('❌ Queue processing error:', error);
        reject(error);
      }
      
      // Wait between requests to respect rate limits
      if (this.requestQueue.length > 0) {
        await this.sleep(config.rateLimit.minDelayBetweenRequests);
      }
    }
    
    this.isProcessing = false;
    console.log('✅ Queue processing completed');
  }

  // Enhanced API request with better error handling
  async makeRequest(userQuery, retryCount = 0) {
    // Check if we can make a request
    if (!this.canMakeRequest()) {
      const fallbackMessage = this.getFallbackResponse(userQuery);
      const quotaStatus = this.getQuotaStatus();
      
      // Determine the specific reason for fallback
      let fallbackReason = config.messages.quotaExceeded;
      if (quotaStatus.quotaExceeded) {
        fallbackReason = config.messages.quotaExceeded;
      } else if (quotaStatus.remainingDailyRequests <= 0) {
        fallbackReason = config.messages.approachingLimit;
      } else if (quotaStatus.remainingHourlyRequests <= 0) {
        fallbackReason = "Hourly limit reached. Please try again in a few minutes.";
      }
      
      return {
        success: true,
        message: fallbackMessage + "\n\n" + fallbackReason,
        fallback: true,
        quotaStatus
      };
    }

    try {
      // Increment request counters
      this.dailyRequests++;
      this.hourlyRequests++;
      this.totalRequests++;
      
      // Log request attempt
      console.log(`📤 Making API request #${this.totalRequests} (Daily: ${this.dailyRequests}, Hourly: ${this.hourlyRequests})`);
      
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
      console.log(`✅ API request successful (Daily: ${this.dailyRequests}, Hourly: ${this.hourlyRequests})`);

      return {
        success: true,
        message: text,
        quotaStatus: this.getQuotaStatus()
      };

    } catch (error) {
      console.error('❌ Gemini API Error:', error);
      this.consecutiveFailures++;
      this.totalFailures++;
      
      // Enhanced rate limiting handling with detailed logging
      if (error.status === 429 || error.message.includes('quota') || error.message.includes('Too Many Requests')) {
        // Mark quota as exceeded to prevent further requests
        this.quotaExceeded = true;
        
        // Log detailed quota information
        const quotaStatus = this.logQuotaStatus('RATE_LIMITED');
        console.log(`🚫 Rate limited! Retry ${retryCount + 1}/${config.rateLimit.maxRetries}`);
        console.log(`📊 Remaining daily: ${quotaStatus.remainingDailyRequests}, hourly: ${quotaStatus.remainingHourlyRequests}`);
        
        if (retryCount < config.rateLimit.maxRetries) {
          // Exponential backoff: wait 2^retryCount seconds
          const delay = Math.pow(config.rateLimit.retryDelayMultiplier, retryCount) * 1000;
          console.log(`⏳ Retrying in ${delay}ms (attempt ${retryCount + 1}/${config.rateLimit.maxRetries})`);
          await this.sleep(delay);
          return this.makeRequest(userQuery, retryCount + 1);
        } else {
          console.log(`❌ Max retries reached. Using fallback response.`);
          return {
            success: false,
            message: config.messages.rateLimited,
            quotaStatus: this.getQuotaStatus()
          };
        }
      }
      
      // Enhanced consecutive failures handling
      if (this.consecutiveFailures >= config.fallback.enableAfterFailures) {
        console.log(`🔄 Using fallback after ${this.consecutiveFailures} consecutive failures`);
        const fallbackMessage = this.getFallbackResponse(userQuery);
        return {
          success: true,
          message: fallbackMessage + "\n\n" + config.messages.fallbackNote,
          fallback: true,
          quotaStatus: this.getQuotaStatus()
        };
      }
      
      // Handle other errors
      console.log(`❌ Connection error. Consecutive failures: ${this.consecutiveFailures}`);
      return {
        success: false,
        message: config.messages.connectionError,
        quotaStatus: this.getQuotaStatus()
      };
    }
  }

  // Get response from Gemini with enhanced queue management
  async getResponse(userQuery) {
    return new Promise((resolve, reject) => {
      // Check queue size before adding
      if (this.requestQueue.length >= config.queue.maxQueueSize) {
        console.log(`⚠️ Queue full, using immediate fallback`);
        const fallbackMessage = this.getFallbackResponse(userQuery);
        resolve({
          success: true,
          message: fallbackMessage + "\n\n" + "Queue is full. Please try again in a moment.",
          fallback: true,
          quotaStatus: this.getQuotaStatus()
        });
        return;
      }
      
      this.requestQueue.push({ userQuery, resolve, reject });
      this.processQueue();
    });
  }

  // Reset chat history
  resetChat() {
    this.chat = null;
    this.consecutiveFailures = 0;
    console.log('🔄 Chat history reset');
  }

  // Enhanced quota status with more details
  getQuotaStatus() {
    this.resetQuotaDaily();
    const bufferLimit = Math.floor(config.rateLimit.requestsPerDay * (1 - config.quota.bufferPercentage));
    const now = Date.now();
    
    return {
      dailyRequests: this.dailyRequests,
      dailyLimit: config.rateLimit.requestsPerDay,
      dailyBufferLimit: bufferLimit,
      hourlyRequests: this.hourlyRequests,
      hourlyLimit: config.quota.maxRequestsPerHour,
      quotaExceeded: this.quotaExceeded,
      remainingDailyRequests: Math.max(0, bufferLimit - this.dailyRequests),
      remainingHourlyRequests: Math.max(0, config.quota.maxRequestsPerHour - this.hourlyRequests),
      queueSize: this.requestQueue.length,
      maxQueueSize: config.queue.maxQueueSize,
      consecutiveFailures: this.consecutiveFailures,
      totalRequests: this.totalRequests,
      totalFailures: this.totalFailures,
      lastResetDate: this.lastResetDate,
      nextResetTime: this.getNextResetTime(),
      successRate: this.totalRequests > 0 ? Math.round(((this.totalRequests - this.totalFailures) / this.totalRequests) * 100) : 100
    };
  }

  // Get next reset time
  getNextResetTime() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const nextHour = new Date(now);
    nextHour.setHours(nextHour.getHours() + 1);
    nextHour.setMinutes(0, 0, 0);
    
    return {
      daily: tomorrow.toISOString(),
      hourly: nextHour.toISOString()
    };
  }
}

module.exports = new GeminiService(); 