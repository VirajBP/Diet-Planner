const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test user data
const testUser = {
  email: 'testuser@example.com',
  password: 'password123',
  profile: {
    name: 'Test User',
    age: 25,
    gender: 'male',
    height: 175,
    weight: 70,
    targetWeight: 65,
    activityLevel: 'moderate',
    goal: 'lose',
    dietaryRestrictions: []
  }
};

async function testFrontendAuth() {
  try {
    console.log('=== Testing Frontend Authentication ===\n');

    // Test registration
    console.log('1. Testing Registration...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
    console.log('Registration successful:', registerResponse.data.user.email);
    console.log('Token received:', registerResponse.data.token ? 'Yes' : 'No');

    // Test login with the same credentials
    console.log('\n2. Testing Login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('Login successful:', loginResponse.data.user.email);
    console.log('Token received:', loginResponse.data.token ? 'Yes' : 'No');

    // Test profile access with token
    console.log('\n3. Testing Profile Access...');
    const token = loginResponse.data.token;
    const profileResponse = await axios.get(`${BASE_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Profile access successful:', profileResponse.data.email);

    console.log('\n=== All Tests Passed ===');

  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testFrontendAuth(); 