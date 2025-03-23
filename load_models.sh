#!/bin/bash

# Import models from downloads folder
for model_file in "$HOME/Downloads/llm-models"/*.gguf; do
    model_name=$(basename "$model_file" .gguf)
    echo "Importing $model_name..."
    ollama create "$model_name" --file "$model_file"
done
