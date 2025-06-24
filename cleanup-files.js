const fs = require('fs');
const path = require('path');

const filesToDelete = [
  '/Users/hangyu/realtime-stories/src/components/SimplePostCard.tsx',
  '/Users/hangyu/realtime-stories/src/pages/PostDetailSimple.tsx',
  '/Users/hangyu/realtime-stories/debug-current-state.js',
  '/Users/hangyu/realtime-stories/build-server.js',
  '/Users/hangyu/realtime-stories/compile-and-run.sh',
  '/Users/hangyu/realtime-stories/test-server-api.html'
];

filesToDelete.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`✅ Deleted: ${path.basename(file)}`);
    } else {
      console.log(`⏭️  Not found: ${path.basename(file)}`);
    }
  } catch (error) {
    console.log(`❌ Error deleting ${path.basename(file)}:`, error.message);
  }
});

console.log('🧹 Cleanup complete!');