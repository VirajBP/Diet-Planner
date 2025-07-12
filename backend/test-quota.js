const geminiService = require('./services/geminiService');

async function testQuota() {
  console.log('=== Gemini API Quota Test ===\n');
  
  // Check initial quota status
  const quotaStatus = geminiService.getQuotaStatus();
  console.log('Current Quota Status:');
  console.log(JSON.stringify(quotaStatus, null, 2));
  console.log('\n');
  
  // Test fallback response
  console.log('Testing fallback response:');
  const fallbackResponse = await geminiService.getResponse("Hello, how are you?");
  console.log('Response:', JSON.stringify(fallbackResponse, null, 2));
  console.log('\n');
  
  // Check quota status after request
  const updatedQuota = geminiService.getQuotaStatus();
  console.log('Updated Quota Status:');
  console.log(JSON.stringify(updatedQuota, null, 2));
}

// Run the test
testQuota().catch(console.error); 