#!/bin/bash

# Set text colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${BLUE}${BOLD}Free Thinkers Server Management${NC}"
echo -e "${YELLOW}Starting server initialization...${NC}"

# Stop existing servers using the dedicated script
echo -e "\n${YELLOW}Ensuring no servers are already running...${NC}"
./stop_servers.sh
echo -e "${YELLOW}Continuing with server startup...${NC}\n"

# Function to check if a port is in use
is_port_in_use() {
    lsof -i:"$1" &> /dev/null
    return $?
}

# Function to start servers
start_servers() {
    # Start Ollama in background with GPU acceleration enabled
    echo -e "${YELLOW}Starting Ollama server with GPU acceleration...${NC}"
    
    # Enable Metal GPU acceleration for Apple Silicon
    export OLLAMA_USE_METAL=true
    export OLLAMA_METAL=true
    
    # Allocate more RAM to improve performance 
    export OLLAMA_RAM=8G
    
    # Check if port is already in use
    if is_port_in_use 11434; then
        echo -e "${RED}Error: Port 11434 is already in use. Cannot start Ollama server.${NC}"
        echo -e "${YELLOW}Please run ./stop_servers.sh first to free up the port.${NC}"
        return 1
    fi
    
    # Start Ollama with optimized settings
    ollama serve &
    OLLAMA_PID=$!
    
    # Wait for Ollama to start
    echo -e "${YELLOW}Waiting for Ollama server to initialize...${NC}"
    for i in {1..10}; do
        sleep 1
        if curl -s http://127.0.0.1:11434/api/tags &> /dev/null; then
            echo -e "${GREEN}✓ Ollama server started successfully${NC}"
            break
        fi
        if [ $i -eq 10 ]; then
            echo -e "${RED}✗ Failed to start Ollama server within timeout period${NC}"
            return 1
        fi
        echo -n "."
    done
    echo ""

    # Start Flask app in background
    echo -e "${YELLOW}Starting Flask server...${NC}"
    
    # Check if port is already in use
    if is_port_in_use 5001; then
        echo -e "${RED}Error: Port 5001 is already in use. Cannot start Flask server.${NC}"
        echo -e "${YELLOW}Please run ./stop_servers.sh first to free up the port.${NC}"
        return 1
    fi
    
    # Activate virtual environment and install dependencies
    source venv311/bin/activate
    pip install -r requirements.txt
    
    # Start Flask app
    python app.py &
    FLASK_PID=$!
    
    # Wait for Flask to start
    echo -e "${YELLOW}Waiting for Flask server to initialize...${NC}"
    for i in {1..10}; do
        sleep 1
        if curl -s http://127.0.0.1:5001 &> /dev/null; then
            echo -e "${GREEN}✓ Flask server started successfully${NC}"
            break
        fi
        if [ $i -eq 10 ]; then
            echo -e "${RED}✗ Failed to start Flask server within timeout period${NC}"
            return 1
        fi
        echo -n "."
    done
    echo ""

    # Check if both servers are running
    echo -e "${YELLOW}Checking server status...${NC}"
    
    # Check Ollama server
    if curl -s http://127.0.0.1:11434/api/tags &> /dev/null; then
        echo -e "${GREEN}✓ Ollama server is running${NC}"
        OLLAMA_RUNNING=true
    else
        echo -e "${RED}✗ Ollama server is not running${NC}"
        OLLAMA_RUNNING=false
    fi
    
    # Check Flask server
    if curl -s http://127.0.0.1:5001 &> /dev/null; then
        echo -e "${GREEN}✓ Flask server is running${NC}"
        FLASK_RUNNING=true
    else
        echo -e "${RED}✗ Flask server is not running${NC}"
        FLASK_RUNNING=false
    fi
    
    # Final status
    if $OLLAMA_RUNNING && $FLASK_RUNNING; then
        echo -e "\n${GREEN}${BOLD}✓ All servers are running successfully${NC}"
        echo -e "${BLUE}Open your browser and navigate to ${BOLD}http://127.0.0.1:5001${NC} to use the application"
        return 0
    else
        echo -e "\n${RED}${BOLD}✗ Some servers failed to start${NC}"
        echo -e "${YELLOW}Please check the logs above for more information${NC}"
        return 1
    fi
}

# Main script execution
start_servers
exit $?
