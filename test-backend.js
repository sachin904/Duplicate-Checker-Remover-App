const axios = require('axios');

const API_BASE_URL = 'http://localhost:8080/api';

async function testBackend() {
  console.log('Testing backend API...');
  
  try {
    // Test health endpoint
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data);
    
    // Test scan endpoint
    console.log('\n2. Testing scan endpoint...');
    const scanResponse = await axios.post(`${API_BASE_URL}/scan`, {
      directory: 'C:\\Windows\\System32'
    });
    console.log('✅ Scan started:', scanResponse.data);
    
    const scanId = scanResponse.data.scanId;
    
    // Test progress endpoint
    console.log('\n3. Testing progress endpoint...');
    const progressResponse = await axios.get(`${API_BASE_URL}/scan/${scanId}/progress`);
    console.log('✅ Progress check passed:', progressResponse.data);
    
    // Test duplicate stream endpoint
    console.log('\n4. Testing duplicate stream endpoint...');
    const duplicateResponse = await axios.get(`${API_BASE_URL}/scan/${scanId}/duplicates/stream`);
    console.log('✅ Duplicate stream passed:', duplicateResponse.data);
    
    console.log('\n🎉 All backend tests passed!');
    
  } catch (error) {
    console.error('\n❌ Backend test failed:');
    if (error.code === 'ECONNREFUSED') {
      console.error('Backend server is not running. Please start it with: mvn spring-boot:run');
    } else if (error.response) {
      console.error('HTTP Error:', error.response.status, error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testBackend(); 