#!/bin/bash

echo "====================================="
echo "RVISED - Starting App"
echo "====================================="
echo ""

# Function to kill services on exit
cleanup() {
    echo ""
    echo "Stopping app..."
    kill $NEXTJS_PID 2>/dev/null
    echo "App stopped."
    exit 0
}

trap cleanup INT TERM

# Start Next.js Development Server (Port 3000)
echo "[1/2] Starting Next.js Development Server..."
cd rvised
npm run dev &
NEXTJS_PID=$!
cd ..
sleep 3

# Open browser (works on macOS and Linux)
echo "[2/2] Opening browser..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:3000
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open http://localhost:3000
fi

echo ""
echo "====================================="
echo "App started successfully!"
echo "====================================="
echo ""
echo "Service running:"
echo "- Next.js App: http://localhost:3000"
echo ""
echo "Test transcript extraction:"
echo "curl -X POST http://localhost:3000/api/transcript -H 'Content-Type: application/json' -d '{"videoUrl":"https://www.youtube.com/watch?v=VIDEO_ID"}'"
echo ""
echo "Press Ctrl+C to stop the app..."

# Wait for interrupt
wait