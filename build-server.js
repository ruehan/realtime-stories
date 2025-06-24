const { execSync } = require('child_process');
const path = require('path');

console.log('🔧 Building server...');

try {
  // Change to server directory and build
  process.chdir(path.join(__dirname, 'server'));
  console.log('📁 Changed to server directory');
  
  console.log('🚀 Running npm run build...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('✅ Server build completed successfully!');
  console.log('');
  console.log('Now you can start the server with:');
  console.log('cd server && npm start');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}