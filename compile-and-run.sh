#!/bin/bash

echo "🔧 Compiling server TypeScript..."
cd server
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Server compiled successfully!"
    echo "🚀 Starting server..."
    npm start
else
    echo "❌ Server compilation failed!"
    exit 1
fi