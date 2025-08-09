#!/bin/bash

echo "====================================="
echo "RVISED - Starting All Services"
echo "====================================="
echo ""

# Function to kill services on exit
cleanup() {
    echo ""
    echo "Stopping all services..."
    kill $PYTHON_PID $PLAYWRIGHT_PID $NEXTJS_PID 2>/dev/null
    echo "All services stopped."
    exit 0
}

trap cleanup INT TERM

# Start Python Backend (Port 5000)
echo "[1/4] Starting Python Backend Service..."
cd python-backend
python backend.py &
PYTHON_PID=$!
cd ..
sleep 2

# Start Playwright Service (Port 8787)
echo "[2/4] Starting Playwright Transcript Service..."
cd transcript-service
npm start &
PLAYWRIGHT_PID=$!
cd ..
sleep 2

# Start Next.js Development Server (Port 3000)
echo "[3/4] Starting Next.js Development Server..."
cd rvised
npm run dev &
NEXTJS_PID=$!
cd ..
sleep 3

# Open browser (works on macOS and Linux)
echo "[4/4] Opening browser..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:3000
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open http://localhost:3000
fi

echo ""
echo "====================================="
echo "All services started successfully!"
echo "====================================="
echo ""
echo "Services running:"
echo "- Python Backend: http://localhost:5000"
echo "- Playwright Service: http://localhost:8787"
echo "- Next.js App: http://localhost:3000"
echo ""
echo "Test transcript extraction:"
echo "http://localhost:3000/api/transcript?videoUrl=YOUTUBE_URL"
echo ""
echo "Press Ctrl+C to stop all services..."

# Wait for interrupt
wait