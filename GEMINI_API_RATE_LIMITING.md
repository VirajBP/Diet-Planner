# Gemini API Rate Limiting Solution

## Problem
The Gemini API has rate limits on the free tier:
- **15 requests per minute**
- **1,500 requests per day**
- **Model**: `gemini-1.5-pro` (updated from `gemini-pro`)

## Solution Implemented

### 1. Model Update
- Updated from `gemini-pro` to `gemini-1.5-pro` (current model name)
- Updated Google Generative AI library to v0.22.0

### 2. Advanced Rate Limiting Handling
- **Request Queue**: Prevents multiple simultaneous requests
- **Exponential Backoff**: Retries with increasing delays (1s, 2s, 4s)
- **Minimum Delay**: 1 second between requests
- **Max Retries**: 3 attempts before giving up
- **Quota Buffer**: Stops at 90% of daily limit (1,350 requests)
- **Hourly Limits**: Maximum 60 requests per hour

### 3. Smart Quota Management
- **Daily Tracking**: Automatically resets daily counters
- **Hourly Tracking**: Prevents rapid consumption
- **Conservative Mode**: Stops before hitting limits
- **Immediate Fallback**: Uses fallback when quota exceeded

### 4. Fallback System
- **Consecutive Failures**: After 3 failures, uses fallback responses
- **Smart Responses**: Context-aware fallback based on user query
- **User Notification**: Informs users when using fallback
- **Quota Exceeded**: Immediate fallback when daily limit reached

### 5. Configuration & Monitoring
- Centralized settings in `backend/config/gemini.js`
- Quota status endpoint: `GET /api/chatbot/quota`
- Real-time monitoring of usage
- Easy to adjust limits and messages

## Usage

### For Developers
1. **Monitor Quota**: Use `GET /api/chatbot/quota` endpoint
2. **Adjust Limits**: Modify `backend/config/gemini.js` if needed
3. **Test Fallback**: Run `node test-quota.js` to test the system
4. **Upgrade Plan**: Consider paid tier for higher limits

### For Users
- **Wait Between Requests**: Allow 1-2 seconds between messages
- **Retry Later**: If rate limited, wait a few minutes
- **Fallback Mode**: App continues working with basic responses
- **Daily Reset**: Quota resets at midnight local time

## Configuration Options

```javascript
// backend/config/gemini.js
{
  rateLimit: {
    requestsPerMinute: 15,    // Free tier limit
    requestsPerDay: 1500,     // Free tier limit
    minDelayBetweenRequests: 1000, // 1 second
    maxRetries: 3,
    retryDelayMultiplier: 2,  // Exponential backoff
  },
  quota: {
    bufferPercentage: 0.1,    // Stop at 90% of daily limit
    conservativeMode: true,   // Enable conservative mode
    maxRequestsPerHour: 60,   // Limit requests per hour
  }
}
```

## Monitoring

### Quota Status Endpoint
```bash
GET /api/chatbot/quota
```

Response:
```json
{
  "success": true,
  "quota": {
    "dailyRequests": 45,
    "dailyLimit": 1500,
    "dailyBufferLimit": 1350,
    "hourlyRequests": 12,
    "hourlyLimit": 60,
    "quotaExceeded": false,
    "remainingDailyRequests": 1305,
    "remainingHourlyRequests": 48
  }
}
```

### Log Messages to Watch
- `Daily quota reset`
- `Hourly quota reset`
- `Approaching daily limit: X/Y (buffer: Z)`
- `Hourly limit reached: X/Y`
- `Rate limited. Retrying in Xms (attempt Y/Z)`
- `Using fallback response due to API issues`

## Testing

Run the quota test:
```bash
cd backend
node test-quota.js
```

## Recommendations

1. **Production**: Consider upgrading to paid tier
2. **Caching**: Implement response caching for common queries
3. **User Education**: Inform users about rate limits
4. **Alternative APIs**: Consider backup AI services
5. **Monitoring**: Set up alerts for quota usage
6. **Load Balancing**: Distribute requests across multiple API keys

## Files Modified
- `backend/services/geminiService.js` - Main service with quota management
- `backend/config/gemini.js` - Configuration file
- `backend/routes/chatbot.js` - Added quota status endpoint
- `backend/package.json` - Updated library version
- `backend/test-quota.js` - Test script for quota system 