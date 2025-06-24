const fetch = require('node-fetch');

async function debugCurrentState() {
  console.log('🔍 Debugging current state...\n');
  
  // 1. Check server health
  try {
    console.log('1. Testing server health...');
    const healthResponse = await fetch('http://localhost:2567/health');
    const healthData = await healthResponse.json();
    console.log('✅ Server is running:', healthData);
  } catch (error) {
    console.log('❌ Server is not responding:', error.message);
    return;
  }
  
  // 2. Check posts API
  try {
    console.log('\n2. Testing posts API...');
    const postsResponse = await fetch('http://localhost:2567/api/posts?status=published&limit=5');
    const postsData = await postsResponse.json();
    console.log('📊 Posts API response:');
    console.log('- Total posts:', postsData.total);
    console.log('- Posts returned:', postsData.posts?.length || 0);
    
    if (postsData.posts && postsData.posts.length > 0) {
      console.log('- Sample post titles:');
      postsData.posts.slice(0, 3).forEach((post, i) => {
        console.log(`  ${i + 1}. ${post.metadata.title} (status: ${post.status})`);
      });
    } else {
      console.log('⚠️  No posts returned from API');
    }
  } catch (error) {
    console.log('❌ Posts API error:', error.message);
  }
  
  // 3. Check room stats API
  try {
    console.log('\n3. Testing room stats API...');
    const statsResponse = await fetch('http://localhost:2567/api/room-stats');
    const statsData = await statsResponse.json();
    console.log('📈 Room stats:', Object.keys(statsData));
  } catch (error) {
    console.log('❌ Room stats API error:', error.message);
  }
  
  console.log('\n🔍 Debug complete!');
}

debugCurrentState().catch(console.error);