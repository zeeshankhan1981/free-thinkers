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

# Function to check if a command exists
command_exists() {
    command -v "$1" &> /dev/null
}

# Function to start servers
start_servers() {
    # Check if Ollama is installed
    if ! command_exists ollama; then
        echo -e "${RED}Error: Ollama is not installed or not in PATH.${NC}"
        echo -e "${YELLOW}Please install Ollama from https://ollama.ai${NC}"
        return 1
    fi
    
    # Start Ollama in background with GPU acceleration enabled
    echo -e "${YELLOW}Starting Ollama server with GPU acceleration...${NC}"
    
    # Enable Metal GPU acceleration for Apple Silicon
    export OLLAMA_USE_METAL=true
    export OLLAMA_METAL=true
    
    # Allocate more RAM to improve performance 
    export OLLAMA_RAM=8G
    
    # Check if port is already in use
    if is_port_in_use 11434; then
        echo -e "${YELLOW}Port 11434 is already in use. Checking if it's Ollama...${NC}"
        # Check if Ollama is already running
        if curl -s http://127.0.0.1:11434/api/tags &> /dev/null; then
            echo -e "${GREEN}✓ Ollama server is already running${NC}"
            OLLAMA_RUNNING=true
        else
            echo -e "${RED}Error: Port 11434 is in use but not by Ollama.${NC}"
            echo -e "${YELLOW}Please run ./stop_servers.sh first to free up the port.${NC}"
            return 1
        fi
    else
        # Start Ollama with optimized settings
        echo -e "${YELLOW}Starting Ollama server...${NC}"
        ollama serve &> ollama.log &
        OLLAMA_PID=$!
        
        # Wait for Ollama to start
        echo -e "${YELLOW}Waiting for Ollama server to initialize...${NC}"
        for i in {1..15}; do
            sleep 1
            if curl -s http://127.0.0.1:11434/api/tags &> /dev/null; then
                echo -e "${GREEN}✓ Ollama server started successfully${NC}"
                OLLAMA_RUNNING=true
                break
            fi
            if [ $i -eq 15 ]; then
                echo -e "${RED}✗ Failed to start Ollama server within timeout period${NC}"
                echo -e "${YELLOW}Check ollama.log for details${NC}"
                return 1
            fi
            echo -n "."
        done
        echo ""
    fi

    # Verify Ollama is running by listing models
    echo -e "${YELLOW}Checking available models...${NC}"
    MODELS=$(curl -s http://127.0.0.1:11434/api/tags 2>/dev/null)
    if [ $? -ne 0 ]; then
        echo -e "${RED}✗ Failed to connect to Ollama API${NC}"
        return 1
    fi
    
    echo -e "${GREEN}Available models:${NC}"
    echo $MODELS | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if 'models' in data and len(data['models']) > 0:
        for model in data['models']:
            print(f\"  - {model['name']}\" + (f\" ({model['details'].get('parameter_size', 'unknown')} parameters)\" if 'details' in model else ''))
    else:
        print('  No models found. You may need to pull a model using \"ollama pull mistral-7b\" or another model.')
except Exception as e:
    print(f'  Error parsing model data: {e}')
    print('  Raw output:', sys.stdin.read())
" || echo -e "${RED}  Error listing models${NC}"

    # Start Flask app in background
    echo -e "\n${YELLOW}Starting Flask server...${NC}"
    
    # Check if port is already in use
    if is_port_in_use 5000; then
        echo -e "${RED}Error: Port 5000 is already in use. Cannot start Flask server.${NC}"
        echo -e "${YELLOW}Please run ./stop_servers.sh first to free up the port.${NC}"
        return 1
    fi
    
    # Initialize the database if it doesn't exist
    if [ ! -f "freethinkers.db" ]; then
        echo -e "${YELLOW}Initializing database...${NC}"
        source venv/bin/activate && python3 setup_db.py
        if [ $? -ne 0 ]; then
            echo -e "${RED}✗ Failed to initialize database${NC}"
            return 1
        fi
        echo -e "${GREEN}✓ Database initialized${NC}"
    fi
    
    # Start Flask app with virtual environment
    if [ -d "venv" ]; then
        source venv/bin/activate && python app.py &> flask.log &
    else
        python app.py &> flask.log &
    fi
    FLASK_PID=$!
    
    # Wait for Flask to start
    echo -e "${YELLOW}Waiting for Flask server to initialize...${NC}"
    for i in {1..15}; do
        sleep 1
        if curl -s http://127.0.0.1:5000 &> /dev/null; then
            echo -e "${GREEN}✓ Flask server started successfully${NC}"
            FLASK_RUNNING=true
            break
        fi
        if [ $i -eq 15 ]; then
            echo -e "${RED}✗ Failed to start Flask server within timeout period${NC}"
            echo -e "${YELLOW}Check flask.log for details${NC}"
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
    if curl -s http://127.0.0.1:5000 &> /dev/null; then
        echo -e "${GREEN}✓ Flask server is running${NC}"
        FLASK_RUNNING=true
    else
        echo -e "${RED}✗ Flask server is not running${NC}"
        FLASK_RUNNING=false
    fi
    
    # Final status
    if $OLLAMA_RUNNING && $FLASK_RUNNING; then
        echo -e "\n${GREEN}${BOLD}✓ All servers are running successfully${NC}"
        echo -e "${BLUE}Open your browser and navigate to:${NC}"
        echo -e "${BLUE}- Main App: ${BOLD}http://127.0.0.1:5000${NC}"
        echo -e "${BLUE}- Login Page: ${BOLD}http://127.0.0.1:5000/login${NC}"
        echo -e "${BLUE}- Register Page: ${BOLD}http://127.0.0.1:5000/register${NC}"
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
