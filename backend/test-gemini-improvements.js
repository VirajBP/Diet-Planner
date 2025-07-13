const geminiService = require('./services/geminiService');

async function testGeminiImprovements() {
  console.log('🧪 Testing Gemini Service Improvements\n');
  
  // Test 1: Initial quota status
  console.log('📊 Test 1: Initial Quota Status');
  const initialQuota = geminiService.getQuotaStatus();
  console.log(JSON.stringify(initialQuota, null, 2));
  console.log('\n');
  
  // Test 2: Test fallback responses
  console.log('🔄 Test 2: Fallback Response Testing');
  const testQueries = [
    "Hello there!",
    "I need meal planning help",
    "What about nutrition?",
    "How to lose weight?",
    "Random question about fitness"
  ];
  
  for (const query of testQueries) {
    const fallback = geminiService.getFallbackResponse(query);
    console.log(`Query: "${query}"`);
    console.log(`Fallback: "${fallback.substring(0, 80)}..."`);
    console.log('---');
  }
  console.log('\n');
  
  // Test 3: Test queue management
  console.log('📋 Test 3: Queue Management');
  console.log(`Current queue size: ${geminiService.requestQueue.length}`);
  console.log(`Can make request: ${geminiService.canMakeRequest()}`);
  console.log('\n');
  
  // Test 4: Test quota tracking
  console.log('📈 Test 4: Quota Tracking');
  console.log(`Daily requests: ${geminiService.dailyRequests}`);
  console.log(`Hourly requests: ${geminiService.hourlyRequests}`);
  console.log(`Total requests: ${geminiService.totalRequests}`);
  console.log(`Consecutive failures: ${geminiService.consecutiveFailures}`);
  console.log('\n');
  
  // Test 5: Test next reset time
  console.log('⏰ Test 5: Reset Times');
  const resetTimes = geminiService.getNextResetTime();
  console.log(`Next daily reset: ${resetTimes.daily}`);
  console.log(`Next hourly reset: ${resetTimes.hourly}`);
  console.log('\n');
  
  // Test 6: Simulate a request (will use fallback if quota exceeded)
  console.log('🚀 Test 6: Simulate Request');
  try {
    const response = await geminiService.getResponse("Test message for quota checking");
    console.log('Response received:');
    console.log(`Success: ${response.success}`);
    console.log(`Fallback: ${response.fallback || false}`);
    console.log(`Message: ${response.message.substring(0, 100)}...`);
    if (response.quotaStatus) {
      console.log(`Quota remaining - Daily: ${response.quotaStatus.remainingDailyRequests}, Hourly: ${response.quotaStatus.remainingHourlyRequests}`);
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
  console.log('\n');
  
  // Test 7: Final quota status
  console.log('📊 Test 7: Final Quota Status');
  const finalQuota = geminiService.getQuotaStatus();
  console.log(JSON.stringify(finalQuota, null, 2));
  console.log('\n');
  
  console.log('✅ All tests completed!');
}

// Run the tests
testGeminiImprovements().catch(console.error); 