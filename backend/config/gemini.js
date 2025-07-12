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
  
  // Quota management
  quota: {
    bufferPercentage: 0.1, // Stop at 90% of daily limit (1350 requests)
    conservativeMode: true, // Enable conservative mode
    maxRequestsPerHour: 60, // Limit requests per hour
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
    fallbackNote: "(Note: Using fallback response due to API issues)",
    approachingLimit: "I'm approaching my daily limit. Using basic responses for now."
  }
}; 