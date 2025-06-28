const axios = require('axios');

async function testBackendConnection() {
  const apiUrl = 'https://nutripulse-aotv.onrender.com/api';
  
  console.log('Testing /api/auth/login endpoint...');
  console.log('URL:', apiUrl + '/auth/login');
  
  try {
    // Test the login endpoint with dummy credentials
    const response = await axios.post(`${apiUrl}/auth/login`, {
      email: 'dummy@example.com',
      password: 'invalidpassword'
    }, { timeout: 10000 });
    console.log('✅ Login endpoint is accessible!');
    console.log('Status:', response.status);
    console.log('Response:', response.data);
  } catch (error) {
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
      if (error.response.status === 401 || error.response.status === 400) {
        console.log('✅ Login endpoint exists and is working (expected error for invalid credentials)');
      } else {
        console.log('❌ Unexpected error from login endpoint');
      }
    } else if (error.request) {
      console.log('No response received - server might still be starting up');
    } else {
      console.log('Error:', error.message);
    }
  }
}

testBackendConnection(); 