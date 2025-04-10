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

# Function to clean up Python processes
stop_python_processes() {
    # Kill Flask server
    kill_process "python.*app\.py" "Flask server"
    
    # Kill any Python processes related to our app
    kill_process "python.*setup_db\.py" "Database initialization"
    kill_process "python.*.*\.py" "Python processes"
    
    # Kill any Python processes in the virtual environment
    if [ -d "venv" ]; then
        kill_process "venv/bin/python.*" "Virtual environment Python"
    fi
}

# Stop servers in order
stop_python_processes
stop_ollama

# Check and clean up ports
PORTS=(5000 11434)
for port in "${PORTS[@]}"; do
    if is_port_in_use $port; then
        echo -e "${YELLOW}Port $port is still in use, cleaning up...${NC}"
        lsof -ti :$port | xargs kill -9 2>/dev/null
    fi
    if ! is_port_in_use $port; then
        echo -e "${GREEN}✓ Port $port is free${NC}"
    else
        echo -e "${RED}✗ Failed to free port $port${NC}"
    fi
    sleep 1

done

# Clean up log files
LOG_FILES=("ollama.log" "flask.log" "setup_db.log")
for log in "${LOG_FILES[@]}"; do
    if [ -f "$log" ]; then
        echo -e "${YELLOW}Cleaning up $log...${NC}"
        rm -f "$log"
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ $log cleaned up${NC}"
        else
            echo -e "${RED}✗ Failed to clean up $log${NC}"
        fi
    fi
done

echo -e "${GREEN}✓ All servers stopped successfully${NC}"
