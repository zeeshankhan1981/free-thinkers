#!/bin/bash

# Set text colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting Free Thinkers servers...${NC}"

# Stop any existing servers first
if [ -f "./stop_servers.sh" ]; then
    echo -e "${YELLOW}Stopping any running servers...${NC}"
    ./stop_servers.sh
fi

# Start Ollama server
echo -e "${YELLOW}Starting Ollama server...${NC}"
ollama serve > ollama.log 2>&1 &

# Wait for Ollama to be ready
echo -e "${YELLOW}Waiting for Ollama to initialize...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:11434/api/tags >/dev/null; then
        echo -e "${GREEN}✓ Ollama server ready${NC}"
        break
    fi
    sleep 1
    echo -n "."
done

# Start Flask server
echo -e "${YELLOW}Starting Flask server...${NC}"
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating new virtual environment...${NC}"
    python3 -m venv venv
fi
source venv/bin/activate
python app.py --debug > flask.log 2>&1 &

# Wait for Flask to be ready
echo -e "${YELLOW}Waiting for Flask server to initialize...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:5000/api/health >/dev/null; then
        echo -e "${GREEN}✓ Flask server ready${NC}"
        break
    fi
    sleep 1
    echo -n "."
done

# Final status
echo -e "\n${GREEN}Servers started successfully${NC}"
echo -e "Ollama: http://localhost:11434"
echo -e "Flask:  http://localhost:5000"
