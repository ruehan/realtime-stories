const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('Testing API endpoint...');
    const response = await fetch('http://localhost:2567/api/posts?status=published');
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Response data:', JSON.stringify(data, null, 2));
    } else {
      console.error('Error response:', await response.text());
    }
  } catch (error) {
    console.error('Failed to fetch:', error);
  }
}

testAPI();