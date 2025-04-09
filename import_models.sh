#!/bin/bash

# Array of model names
models=(
    "llama3.2"
    "mistral-7b-instruct-v0.2.Q4_K_M"
)

# Create each model using the Modelfile
for model in "${models[@]}"; do
    echo "Creating model: $model"
    cp Modelfile Modelfile.tmp
    sed -i '' "s/%%MODEL_NAME%%/$model/g" Modelfile.tmp
    ollama create "$model" --file Modelfile.tmp
    rm Modelfile.tmp
    echo "Created $model"
done
