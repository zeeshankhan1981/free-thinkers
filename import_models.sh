#!/bin/bash

# Enable GPU acceleration for Apple Silicon
echo "Enabling GPU acceleration for Apple Silicon M4..."
export OLLAMA_USE_METAL=true
export OLLAMA_METAL=true
export OLLAMA_RAM=8G

# Array of model names
models=(
    "Meta-Llama-3-8B-Instruct-f16-q8_0"
    "Meta-Llama-3-8B-Instruct-f16"
    "gemma-2b-it"
    "mistral-7b-instruct-v0.2.Q4_K_M"
)

# Create each model using the Modelfile
for model in "${models[@]}"; do
    echo "Creating model: $model"
    cp Modelfile Modelfile.tmp
    sed -i '' "s/%%MODEL_NAME%%/$model/g" Modelfile.tmp
    ollama create "$model" --file Modelfile.tmp
    rm Modelfile.tmp
    echo "Created $model with GPU acceleration enabled"
done
