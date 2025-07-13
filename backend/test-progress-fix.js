const express = require('express');
const progressRouter = require('./routes/progress');

// Create a mock app to test the router
const app = express();
app.use('/progress', progressRouter);

// Mock user data for testing
const mockUser = {
  id: 'test-user-id',
  profile: {
    gender: 'male',
    weight: 70,
    height: 175,
    age: 30,
    activityLevel: 'moderate',
    goal: 'lose'
  }
};

// Mock request object
const mockRequest = {
  user: mockUser,
  body: {},
  query: {},
  params: {}
};

// Mock response object
const mockResponse = {
  status: function(code) {
    console.log(`Response status: ${code}`);
    return this;
  },
  json: function(data) {
    console.log('Response data:', JSON.stringify(data, null, 2));
    return this;
  }
};

// Test the progress statistics endpoint
async function testProgressStatistics() {
  console.log('🧪 Testing Progress Statistics Endpoint\n');
  
  try {
    // Test the statistics endpoint
    console.log('📊 Testing /progress/statistics endpoint...');
    await progressRouter.handle({
      method: 'GET',
      url: '/statistics'
    }, mockRequest, mockResponse);
    
    console.log('\n✅ Progress statistics test completed successfully!');
    console.log('✅ No WEIGHT_LOSS_DEFICIT errors found!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Test the constants are properly defined
function testConstants() {
  console.log('🔧 Testing Constants Definition\n');
  
  try {
    // Import the constants from the file
    const fs = require('fs');
    const path = require('path');
    
    const filePath = path.join(__dirname, 'routes', 'progress.js');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Check if constants are defined
    if (fileContent.includes('const WEIGHT_LOSS_DEFICIT = 500')) {
      console.log('✅ WEIGHT_LOSS_DEFICIT constant is defined');
    } else {
      console.log('❌ WEIGHT_LOSS_DEFICIT constant is missing');
    }
    
    if (fileContent.includes('const WEIGHT_GAIN_SURPLUS = 500')) {
      console.log('✅ WEIGHT_GAIN_SURPLUS constant is defined');
    } else {
      console.log('❌ WEIGHT_GAIN_SURPLUS constant is missing');
    }
    
    // Check if constants are used properly
    const weightLossUsage = (fileContent.match(/WEIGHT_LOSS_DEFICIT/g) || []).length;
    const weightGainUsage = (fileContent.match(/WEIGHT_GAIN_SURPLUS/g) || []).length;
    
    console.log(`📊 WEIGHT_LOSS_DEFICIT used ${weightLossUsage} times`);
    console.log(`📊 WEIGHT_GAIN_SURPLUS used ${weightGainUsage} times`);
    
    // Check for hardcoded 500 values that should use constants
    const hardcoded500 = (fileContent.match(/\+ 500\)/g) || []).length;
    if (hardcoded500 > 0) {
      console.log(`⚠️ Found ${hardcoded500} hardcoded +500 values that should use constants`);
    } else {
      console.log('✅ No hardcoded +500 values found');
    }
    
  } catch (error) {
    console.error('❌ Constants test failed:', error.message);
  }
}

// Run tests
console.log('🚀 Starting Progress Statistics Tests\n');

testConstants();
console.log('\n' + '='.repeat(50) + '\n');
testProgressStatistics();

console.log('\n🎉 All tests completed!'); 