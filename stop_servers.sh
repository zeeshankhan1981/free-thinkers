#!/bin/bash

# Set text colors for better readability
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
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

# Function to check if a port is in use
is_port_in_use() {
    lsof -i:"$1" &> /dev/null
    return $?
}

# Function to stop Ollama service properly
stop_ollama() {
    # Check if Ollama is running using the API first
    if curl -s http://localhost:11434/api/tags &> /dev/null; then
        echo -e "Ollama API is responding, attempting graceful shutdown..."
        
        # Try to stop any running model inferences first if possible
        local running_models=$(ps aux | grep -E 'ollama run|ollama pull' | grep -v grep)
        if [ ! -z "$running_models" ]; then
            echo -e "Stopping running Ollama model processes..."
            pkill -f "ollama run" || true
            pkill -f "ollama pull" || true
            sleep 2
        fi
        
        # Then proceed with stopping the main server
        kill_process "ollama serve" "Ollama server"
        return $?
    else
        # If API not responding, just try to kill the process
        kill_process "ollama serve" "Ollama server"
        return $?
    fi
}

# Kill Flask server
kill_process "python.*app\.py" "Flask server"
FLASK_STOPPED=$?

# Kill any Python processes related to our app that might be running
if pgrep -f "flask run" > /dev/null; then
    echo -e "Found Flask development server, stopping..."
    pkill -f "flask run"
    sleep 1
fi

# Kill Ollama server
stop_ollama
OLLAMA_STOPPED=$?

# Also try to kill any Ollama CLI processes that might be hanging
if pgrep -f "ollama " > /dev/null; then
    echo -e "Stopping additional Ollama processes..."
    pkill -f "ollama " || true
    sleep 1
fi

# Check if ports are still in use
PORT_5000_FREE=1
PORT_11434_FREE=1

# Check if port 5000 is free
if ! is_port_in_use 5000; then
    PORT_5000_FREE=0
    echo -e "${GREEN}✓ Port 5000 is free${NC}"
else
    echo -e "${RED}✗ Port 5000 is still in use${NC}"
    echo "Attempting to free port 5000..."
    lsof -ti:5000 | xargs kill -9 &> /dev/null
    sleep 1
    
    if ! is_port_in_use 5000; then
        PORT_5000_FREE=0
        echo -e "${GREEN}✓ Port 5000 is now free${NC}"
    else
        echo -e "${RED}✗ Failed to free port 5000${NC}"
    fi
fi

# Check if port 11434 is free
if ! is_port_in_use 11434; then
    PORT_11434_FREE=0
    echo -e "${GREEN}✓ Port 11434 is free${NC}"
else
    echo -e "${RED}✗ Port 11434 is still in use${NC}"
    echo "Attempting to free port 11434..."
    lsof -ti:11434 | xargs kill -9 &> /dev/null
    sleep 1
    
    if ! is_port_in_use 11434; then
        PORT_11434_FREE=0
        echo -e "${GREEN}✓ Port 11434 is now free${NC}"
    else
        echo -e "${RED}✗ Failed to free port 11434${NC}"
    fi
fi

# Clean up log files
if [ -f "flask.log" ]; then
    echo -e "Cleaning up Flask log file..."
    rm flask.log
fi

if [ -f "ollama.log" ]; then
    echo -e "Cleaning up Ollama log file..."
    rm ollama.log
fi

# Final status
if [ $FLASK_STOPPED -eq 0 ] && [ $OLLAMA_STOPPED -eq 0 ] && [ $PORT_5000_FREE -eq 0 ] && [ $PORT_11434_FREE -eq 0 ]; then
    echo -e "${GREEN}${BOLD}✓ All servers stopped successfully${NC}"
    exit 0
else
    echo -e "${RED}${BOLD}✗ Some servers may still be running${NC}"
    echo -e "${YELLOW}You may need to manually kill processes or restart your system${NC}"
    echo -e "Try the following commands if needed:"
    echo -e "${BLUE}  pkill -9 -f 'python'${NC}"
    echo -e "${BLUE}  pkill -9 -f 'ollama'${NC}"
    exit 1
fi
