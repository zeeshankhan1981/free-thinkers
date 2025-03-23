#!/bin/bash

# Function to stop servers
stop_servers() {
    echo "Stopping existing servers..."

    # Stop Flask server
    echo "Stopping Flask server..."
    pkill -f "python app.py"
    sleep 1

    # Stop Ollama server
    echo "Stopping Ollama server..."
    pkill -f "ollama serve"
    sleep 1

    # Verify servers are stopped
    if ! curl -s http://127.0.0.1:5000 &> /dev/null && ! curl -s http://127.0.0.1:11434 &> /dev/null; then
        echo "✓ All servers stopped successfully"
    else
        echo "✗ Failed to stop some servers"
    fi
}

# Function to start servers
start_servers() {
    # Start Ollama in background with GPU acceleration enabled
    echo "Starting Ollama server with GPU acceleration..."
    
    # Enable Metal GPU acceleration for Apple Silicon
    export OLLAMA_USE_METAL=true
    export OLLAMA_METAL=true
    
    # Allocate more RAM to improve performance 
    export OLLAMA_RAM=8G
    
    # Start Ollama with optimized settings
    ollama serve &
    
    # Wait for Ollama to start
    sleep 2

    # Start Flask app in background
    echo "Starting Flask server..."
    source .venv/bin/activate && python app.py &
    
    # Wait for Flask to start
    sleep 2

    # Check if both servers are running
    echo "Checking server status..."

    # Check Ollama
    if curl -s http://127.0.0.1:11434/api/tags &> /dev/null; then
        echo "✓ Ollama server is running"
    else
        echo "✗ Ollama server failed to start"
        exit 1
    fi

    # Check Flask
    if curl -s http://127.0.0.1:5000 &> /dev/null; then
        echo "✓ Flask server is running"
    else
        echo "✗ Flask server failed to start"
        exit 1
    fi

    echo "✓ All servers are running successfully"
    echo "Open your browser and navigate to http://127.0.0.1:5000 to use the application"
}

# Main script execution

# Stop existing servers
stop_servers

# Start new servers
start_servers
