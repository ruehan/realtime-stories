#!/bin/bash
cd /Users/hangyu/realtime-stories/server
echo "Compiling TypeScript server..."
npx tsc
echo "Compilation complete!"
echo "Starting server..."
npm start