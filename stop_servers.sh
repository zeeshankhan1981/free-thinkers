#!/bin/bash

# Set text colors for better readability
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Stopping Free Thinkers servers...${NC}"

# Function to check if a process is running
is_process_running() {
    pgrep -f "$1" > /dev/null
    return $?
}

# Function to kill a process with increasing force
kill_process() {
    local process_pattern="$1"
    local process_name="$2"
    
    if is_process_running "$process_pattern"; then
        echo -e "Stopping ${process_name}..."
        
        # First try gentle termination
        pkill -f "$process_pattern"
        sleep 1
        
        # If still running, try SIGTERM
        if is_process_running "$process_pattern"; then
            echo -e "Process still running, trying SIGTERM..."
            pkill -TERM -f "$process_pattern"
            sleep 2
        fi
        
        # If still running, force kill with SIGKILL
        if is_process_running "$process_pattern"; then
            echo -e "Process still running, forcing termination with SIGKILL..."
            pkill -9 -f "$process_pattern"
            sleep 1
        fi
        
        # Check if process was successfully killed
        if ! is_process_running "$process_pattern"; then
            echo -e "${GREEN}✓ ${process_name} stopped successfully${NC}"
            return 0
        else
            echo -e "${RED}✗ Failed to stop ${process_name}${NC}"
            return 1
        fi
    else
        echo -e "${GREEN}✓ ${process_name} is not running${NC}"
        return 0
    fi
}

# Kill Flask server
kill_process "python.*app\.py" "Flask server"
FLASK_STOPPED=$?

# Kill Ollama server
kill_process "ollama serve" "Ollama server"
OLLAMA_STOPPED=$?

# Check if ports are still in use
PORT_5001_FREE=1
PORT_11434_FREE=1

# Check if port 5001 is free
if ! lsof -i:5001 &> /dev/null; then
    PORT_5001_FREE=0
    echo -e "${GREEN}✓ Port 5001 is free${NC}"
else
    echo -e "${RED}✗ Port 5001 is still in use${NC}"
    echo "Attempting to free port 5001..."
    lsof -ti:5001 | xargs kill -9 &> /dev/null
    sleep 1
    
    if ! lsof -i:5001 &> /dev/null; then
        PORT_5001_FREE=0
        echo -e "${GREEN}✓ Port 5001 is now free${NC}"
    else
        echo -e "${RED}✗ Failed to free port 5001${NC}"
    fi
fi

# Check if port 11434 is free
if ! lsof -i:11434 &> /dev/null; then
    PORT_11434_FREE=0
    echo -e "${GREEN}✓ Port 11434 is free${NC}"
else
    echo -e "${RED}✗ Port 11434 is still in use${NC}"
    echo "Attempting to free port 11434..."
    lsof -ti:11434 | xargs kill -9 &> /dev/null
    sleep 1
    
    if ! lsof -i:11434 &> /dev/null; then
        PORT_11434_FREE=0
        echo -e "${GREEN}✓ Port 11434 is now free${NC}"
    else
        echo -e "${RED}✗ Failed to free port 11434${NC}"
    fi
fi

# Final status
if [ $FLASK_STOPPED -eq 0 ] && [ $OLLAMA_STOPPED -eq 0 ] && [ $PORT_5001_FREE -eq 0 ] && [ $PORT_11434_FREE -eq 0 ]; then
    echo -e "${GREEN}✓ All servers stopped successfully${NC}"
    exit 0
else
    echo -e "${RED}✗ Some servers may still be running${NC}"
    echo -e "${YELLOW}You may need to manually kill processes or restart your system${NC}"
    exit 1
fi
