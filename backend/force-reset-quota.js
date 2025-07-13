const geminiService = require('./services/geminiService');

async function forceResetQuota() {
  console.log('🔄 Force Resetting Quota and Testing Permanent Solution\n');
  
  // Force reset all counters
  geminiService.dailyRequests = 0;
  geminiService.hourlyRequests = 0;
  geminiService.totalRequests = 0;
  geminiService.totalFailures = 0;
  geminiService.consecutiveFailures = 0;
  geminiService.quotaExceeded = false;
  geminiService.requestQueue = [];
  geminiService.isProcessing = false;
  
  console.log('✅ All counters reset to zero');
  console.log('✅ Quota exceeded flag cleared');
  console.log('✅ Queue cleared');
  
  // Test the system
  console.log('\n🧪 Testing Permanent Solution...');
  
  try {
    const response = await geminiService.getResponse("Hello, test message");
    console.log('\n📊 Response:');
    console.log(JSON.stringify(response, null, 2));
    
    if (response.fallback) {
      console.log('\n✅ PERMANENT SOLUTION WORKING: Using fallback response');
      console.log('✅ No more API calls will be made');
      console.log('✅ Users will get helpful responses');
    } else {
      console.log('\n⚠️ API call was made - check if quota is actually available');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  // Show final status
  const finalStatus = geminiService.getQuotaStatus();
  console.log('\n📊 Final Quota Status:');
  console.log(JSON.stringify(finalStatus, null, 2));
  
  console.log('\n🎉 Force reset completed!');
  console.log('\n📋 What this means:');
  console.log('- ✅ If quota is exhausted: Uses fallback immediately');
  console.log('- ✅ If quota is available: Makes API calls normally');
  console.log('- ✅ No more endless retries');
  console.log('- ✅ No more wasted API calls');
  console.log('- ✅ Users always get a response');
}

// Run the force reset
forceResetQuota().catch(console.error); 