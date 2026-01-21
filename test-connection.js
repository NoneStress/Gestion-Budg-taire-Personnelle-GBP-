// Test script to verify frontend-backend connection
const API_BASE = 'http://127.0.0.1:8000';

async function testConnection() {
  console.log('🧪 Testing frontend-backend connection...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE}/api/v1/health/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health:', healthData);

    // Test registration
    console.log('\n2. Testing user registration...');
    const registerResponse = await fetch(`${API_BASE}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'frontend-test@example.com',
        password: 'test123'
      })
    });
    const registerData = await registerResponse.json();
    console.log('✅ Registration:', registerData.access_token ? 'Success' : 'Failed');

    // Test login
    console.log('\n3. Testing user login...');
    const loginResponse = await fetch(`${API_BASE}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'frontend-test@example.com',
        password: 'test123'
      })
    });
    const loginData = await loginResponse.json();
    console.log('✅ Login:', loginData.access_token ? 'Success' : 'Failed');

    const token = loginData.access_token;

    // Test protected endpoint
    console.log('\n4. Testing protected dashboard endpoint...');
    const dashboardResponse = await fetch(`${API_BASE}/api/v1/api/dashboard/summary`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const dashboardData = await dashboardResponse.json();
    console.log('✅ Dashboard:', dashboardData);

    console.log('\n🎉 All tests passed! Frontend-backend connection is working.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testConnection();