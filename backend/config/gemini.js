module.exports = {
  // Gemini API Configuration
  model: "gemini-1.5-pro",
  
  // Rate limiting settings
  rateLimit: {
    requestsPerMinute: 15, // Free tier limit
    requestsPerDay: 1500,  // Free tier limit
    minDelayBetweenRequests: 1000, // 1 second minimum between requests
    maxRetries: 3,
    retryDelayMultiplier: 2, // Exponential backoff multiplier
  },
  
  // Fallback settings
  fallback: {
    enableAfterFailures: 3, // Enable fallback after 3 consecutive failures
    useFallbackResponses: true,
  },
  
  // Queue settings
  queue: {
    maxQueueSize: 10, // Maximum number of queued requests
    processInterval: 1000, // Process queue every 1 second
  },
  
  // Error messages
  messages: {
    rateLimited: "I'm experiencing high traffic right now. Please try again in a few minutes.",
    quotaExceeded: "I've reached my daily limit. Please try again tomorrow.",
    connectionError: "I'm having trouble connecting right now. Please try again in a moment.",
    fallbackNote: "(Note: Using fallback response due to API issues)"
  }
}; 