"""
Model Chaining for Free Thinkers
Implements sequential pipeline of specialized models for different tasks.
"""

import json
import os
import requests
import re
import asyncio
from typing import List, Dict, Any, Tuple, Optional
from pathlib import Path

# Constants
CHAIN_DIR = Path(os.path.expanduser("~/.freethinkers/chains/"))

# Ensure directory exists
CHAIN_DIR.mkdir(parents=True, exist_ok=True)

class ModelChain:
    """
    Chain multiple models together for different stages of a task
    """
    
    def __init__(self):
        """Initialize the model chain."""
        self.models = {}
        self.chains = {}
        self.current_model = None
        self.load_models()
        self.load_chains()
    
    def load_models(self):
        """Load available models from Ollama."""
        try:
            response = requests.get('http://localhost:11434/api/tags')
            if response.status_code == 200:
                models = response.json().get('models', [])
                
                for model in models:
                    model_name = model['name']
                    model_details = model.get('details', {})
                    
                    # Classify model by capabilities
                    capabilities = self._classify_model_capabilities(model_name, model_details)
                    
                    self.models[model_name] = {
                        'name': model_name,
                        'family': model_details.get('family', ''),
                        'parameter_size': model_details.get('parameter_size', ''),
                        'quantization_level': model_details.get('quantization_level', ''),
                        'capabilities': capabilities
                    }
        except Exception as e:
            print(f"Error loading models: {e}")
    
    def _classify_model_capabilities(self, model_name: str, model_details: Dict) -> List[str]:
        """
        Classify model capabilities based on name and details.
        
        This uses heuristics to determine likely capabilities without loading the model.
        """
        capabilities = []
        model_name_lower = model_name.lower()
        family = model_details.get('family', '').lower()
        
        # Check for multimodal capability
        if 'llava' in model_name_lower or 'vision' in model_name_lower:
            capabilities.append('image')
        
        # Check for code capability
        if 'code' in model_name_lower or 'phi' in model_name_lower:
            capabilities.append('code')
            
        # Check for reasoning capability
        if 'instruct' in model_name_lower or 'chat' in model_name_lower:
            capabilities.append('reasoning')
            
        # Check for specific model families known for certain strengths
        if family == 'llama' or family == 'mistral':
            capabilities.append('general')
            capabilities.append('reasoning')
        elif family == 'phi':
            capabilities.append('code')
            capabilities.append('reasoning')
        elif family == 'stable-diffusion':
            capabilities.append('image-generation')
            
        # Add size-based capabilities
        parameter_size = model_details.get('parameter_size', '')
        if parameter_size:
            size_number = float(re.search(r'(\d+\.?\d*)', parameter_size).group(1))
            if parameter_size.endswith('B'):
                # Billion parameters
                if size_number >= 7:
                    capabilities.append('large-context')
                elif size_number <= 2:
                    capabilities.append('efficient')
            
        return list(set(capabilities))  # Remove duplicates
    
    def load_chains(self):
        """Load predefined model chains from storage."""
        try:
            # Load built-in chains
            self.chains = {
                "basic": {
                    "name": "Basic Chain",
                    "description": "Simple single-model processing",
                    "steps": [
                        {
                            "name": "process",
                            "model": "auto",
                            "description": "Process the input with a single model"
                        }
                    ]
                },
                "vision_reasoning": {
                    "name": "Vision + Reasoning Chain",
                    "description": "Process images then perform reasoning",
                    "steps": [
                        {
                            "name": "analyze_image",
                            "model": "llava-phi3:latest",
                            "capability": "image",
                            "description": "Analyze the image content",
                            "prompt_template": "Describe this image briefly (100 words or less). Focus only on the main subjects and important details: {input}",
                            "parameters": {
                                "temperature": 0.5,
                                "top_p": 0.85,
                                "top_k": 20,
                                "max_tokens": 256,
                                "num_thread": 4,
                                "num_batch": 1,
                                "low_vram": True,
                                "gpu_layers": 32,
                                "mirostat": 1,
                                "mirostat_eta": 0.1,
                                "mirostat_tau": 5.0
                            }
                        },
                        {
                            "name": "reasoning",
                            "model": "mistral-7b",
                            "capability": "reasoning",
                            "description": "Perform reasoning based on the image analysis",
                            "prompt_template": "Based on this image description:\n\n{input}\n\nAnswer the user's original question concisely: {user_query}",
                            "parameters": {
                                "temperature": 0.5,
                                "top_p": 0.85,
                                "top_k": 20,
                                "max_tokens": 256,
                                "num_thread": 4,
                                "num_batch": 1
                            }
                        }
                    ]
                },
                "code_generation": {
                    "name": "Code Generation Chain",
                    "description": "Generate and explain code",
                    "steps": [
                        {
                            "name": "generate_code",
                            "model": "phi3:3.8b",
                            "capability": "code",
                            "description": "Generate code based on the requirements",
                            "prompt_template": "Write code to solve this problem concisely:\n\n{input}\n\nProvide only the code without explanation. Keep it under 100 lines if possible.",
                            "parameters": {
                                "temperature": 0.5,
                                "top_p": 0.9,
                                "top_k": 30,
                                "max_tokens": 512,
                                "num_thread": 4,
                                "num_batch": 1
                            }
                        },
                        {
                            "name": "explain_code",
                            "model": "mistral-7b",
                            "capability": "reasoning",
                            "description": "Explain the generated code",
                            "prompt_template": "Explain this code concisely, highlighting key concepts and how it works:\n\n```\n{input}\n```\nKeep your explanation brief but thorough.",
                            "parameters": {
                                "temperature": 0.5,
                                "top_p": 0.9,
                                "top_k": 30,
                                "max_tokens": 512,
                                "num_thread": 4,
                                "num_batch": 1
                            }
                        }
                    ]
                },
                "summarize_and_extract": {
                    "name": "Summarize and Extract Chain",
                    "description": "Summarize content and extract key information",
                    "steps": [
                        {
                            "name": "summarize",
                            "model": "llama3.2",  # Changed from gemma-2b-it to llama3.2 for better performance
                            "capability": "efficient",
                            "description": "Create a concise summary of the text",
                            "prompt_template": "Summarize this text very concisely in under 200 words:\n\n{input}",
                            "parameters": {
                                "temperature": 0.4,
                                "top_p": 0.85,
                                "top_k": 20,
                                "max_tokens": 256,
                                "num_thread": 4,
                                "num_batch": 1,
                                "f16_kv": True
                            }
                        },
                        {
                            "name": "extract_key_info",
                            "model": "mistral-7b",
                            "capability": "reasoning",
                            "description": "Extract key points, entities, and facts",
                            "prompt_template": "From this summary, extract and list only the 3-5 most important points, entities, and facts:\n\n{input}\n\nKeep your response brief and focused on the most essential information.",
                            "parameters": {
                                "temperature": 0.4,
                                "top_p": 0.85,
                                "top_k": 20,
                                "max_tokens": 256,
                                "num_thread": 4,
                                "num_batch": 1
                            }
                        }
                    ]
                }
            }
            
            # Load custom chains from disk
            for file in CHAIN_DIR.glob("*.json"):
                try:
                    with open(file, 'r') as f:
                        chain = json.load(f)
                        if 'name' in chain and 'steps' in chain:
                            self.chains[file.stem] = chain
                except Exception as e:
                    print(f"Error loading chain from {file}: {e}")
        except Exception as e:
            print(f"Error loading chains: {e}")
    
    def get_available_chains(self) -> Dict:
        """Get all available model chains."""
        return self.chains
    
    def get_chain(self, chain_id: str) -> Dict:
        """Get a specific chain by ID."""
        return self.chains.get(chain_id, None)
    
    def save_chain(self, chain_id: str, chain_data: Dict) -> bool:
        """Save a custom chain to disk."""
        try:
            # Validate chain data
            if 'name' not in chain_data or 'steps' not in chain_data:
                return False
                
            # Save to disk
            chain_path = CHAIN_DIR / f"{chain_id}.json"
            with open(chain_path, 'w') as f:
                json.dump(chain_data, f, indent=2)
                
            # Add to in-memory chains
            self.chains[chain_id] = chain_data
            
            return True
        except Exception as e:
            print(f"Error saving chain: {e}")
            return False
    
    def delete_chain(self, chain_id: str) -> bool:
        """Delete a custom chain from disk."""
        try:
            # Check if it's a built-in chain
            if chain_id in ['basic', 'vision_reasoning', 'code_generation', 'summarize_and_extract']:
                return False
                
            # Delete file
            chain_path = CHAIN_DIR / f"{chain_id}.json"
            if chain_path.exists():
                os.remove(chain_path)
                
            # Remove from in-memory chains
            if chain_id in self.chains:
                del self.chains[chain_id]
                
            return True
        except Exception as e:
            print(f"Error deleting chain: {e}")
            return False
    
    async def run_chain(self, chain_id: str, user_input: str, options: Dict = None) -> Dict:
        """
        Run a model chain on user input.
        
        Args:
            chain_id: ID of the chain to run
            user_input: User's input text
            options: Additional options (models to use, etc.)
            
        Returns:
            Dict with results and intermediate outputs
        """
        chain = self.chains.get(chain_id)
        if not chain:
            return {'error': f"Chain '{chain_id}' not found"}
            
        options = options or {}
        model_overrides = options.get('models', {})
        
        # Initialize result structure
        result = {
            'chain_id': chain_id,
            'input': user_input,
            'steps': [],
            'output': '',
            'status': 'pending'
        }
        
        current_input = user_input
        
        # Run each step in the chain
        for i, step in enumerate(chain['steps']):
            step_name = step.get('name', f"step_{i}")
            model_name = model_overrides.get(step_name, step.get('model', 'auto'))
            
            # Resolve "auto" model based on capability
            if model_name == 'auto':
                capability = step.get('capability')
                model_name = self._get_best_model_for_capability(capability)
                
            # Skip step if no suitable model found
            if not model_name:
                result['steps'].append({
                    'name': step_name,
                    'model': None,
                    'status': 'skipped',
                    'error': 'No suitable model found'
                })
                continue
                
            # Apply prompt template if available
            prompt_template = step.get('prompt_template')
            
            if prompt_template:
                # Replace template variables
                prompt = prompt_template.format(
                    input=current_input,
                    user_query=user_input,
                    **options.get('variables', {})
                )
            else:
                prompt = current_input
                
            # Execute model
            try:
                # Run model on input
                output = await self._run_model(model_name, prompt, options.get('parameters', {}))
                
                # Store step result
                result['steps'].append({
                    'name': step_name,
                    'model': model_name,
                    'input': prompt,
                    'output': output,
                    'status': 'completed'
                })
                
                # Update current input for next step
                current_input = output
            except Exception as e:
                # Store error in step result
                result['steps'].append({
                    'name': step_name,
                    'model': model_name,
                    'status': 'error',
                    'error': str(e)
                })
                
                # Set chain status to error
                result['status'] = 'error'
                result['error'] = f"Error in step '{step_name}': {str(e)}"
                
                # Break chain execution on error
                break
        
        # Set final output to the output of the last successful step
        for step in reversed(result['steps']):
            if step['status'] == 'completed':
                result['output'] = step['output']
                break
                
        # Set final status if not already set
        if result['status'] == 'pending':
            result['status'] = 'completed'
            
        return result
    
    def _get_best_model_for_capability(self, capability: str) -> str:
        """Find the best model for a given capability."""
        if not capability:
            return 'mistral-7b'  # Default model
            
        capability = capability.lower()
        
        # Find models with the required capability
        matching_models = {}
        
        for name, model in self.models.items():
            if capability in model.get('capabilities', []):
                # Calculate a simple score based on other capabilities
                score = 1  # Base score
                
                # Prefer larger models for complex tasks
                param_size = model.get('parameter_size', '')
                if param_size:
                    size_match = re.search(r'(\d+\.?\d*)', param_size)
                    if size_match:
                        size_value = float(size_match.group(1))
                        if 'B' in param_size:  # Billions
                            score += min(size_value / 2, 3)  # Bonus for larger models
                
                # Prefer models with more capabilities
                score += len(model.get('capabilities', [])) * 0.2
                
                matching_models[name] = score
        
        # Return the model with the highest score, or default if none found
        if matching_models:
            return max(matching_models.items(), key=lambda x: x[1])[0]
            
        # Fallback models based on capability
        fallbacks = {
            'image': 'llava-phi3:latest',
            'code': 'phi3:3.8b',
            'reasoning': 'mistral-7b',
            'general': 'llama3.2',
            'efficient': 'gemma-2b-it'
        }
        
        return fallbacks.get(capability, 'mistral-7b')
    
    async def _run_model(self, model_name: str, prompt: str, parameters: Dict = None) -> str:
        """Run a single model with the given prompt."""
        parameters = parameters or {}
        
        # Get default parameters for model with optimized defaults for performance
        default_params = {
            'temperature': 0.5,       # Lower temperature for faster, more consistent responses
            'top_p': 0.85,            # Slightly reduced for better performance
            'top_k': 20,              # Reduced from 40 to use less computation
            'max_tokens': 512,        # Shorter responses to improve speed
            'num_thread': 4,          # Limit threads to reduce CPU usage
            'num_batch': 1,           # Minimum batch size to reduce memory usage
            'f16_kv': True,           # Use half-precision for key/value cache
            'stream': False,
            'repeat_penalty': 1.1,    # Standard value to avoid repetitive outputs
            'stop': ["</s>", "User:", "Assistant:"]  # Stop tokens to avoid generating beyond needed content
        }
        
        # Apply specific model optimizations
        if "gemma" in model_name:
            default_params.update({
                'use_gpu': False,      # Use CPU only for Gemma to reduce resource usage
                'max_tokens': 256,     # Further reduce output size for Gemma
                'low_vram': True       # Enable low VRAM mode
            })
        elif "llava" in model_name:
            default_params.update({
                'gpu_layers': 32,      # Limit GPU layers for vision models
                'max_tokens': 256,     # Shorter responses for vision tasks
                'low_vram': True,      # Enable low VRAM mode
                'mirostat': 1,         # Enable mirostat sampling for resource efficiency
                'mirostat_eta': 0.1,   # Conservative mirostat parameters
                'mirostat_tau': 5.0    # Higher tau for fewer tokens
            })
            
        # Merge default and user parameters
        for key, value in parameters.items():
            default_params[key] = value
            
        # Set the model and prompt
        default_params['model'] = model_name
        default_params['prompt'] = prompt
        
        print(f"Running model {model_name} with parameters: {default_params}")
        
        try:
            # Add timeout handler with exponential backoff
            max_retries = 2
            retry_count = 0
            timeout = 60  # Initial timeout in seconds
            
            while retry_count <= max_retries:
                try:
                    # Make request to Ollama with current timeout
                    response = requests.post(
                        'http://localhost:11434/api/generate',
                        json=default_params,
                        timeout=timeout
                    )
                    
                    if response.status_code == 200:
                        result = response.json()
                        return result.get('response', '')
                    elif response.status_code == 429 or response.status_code >= 500:
                        # Server busy or error - retry with backoff
                        retry_count += 1
                        timeout *= 2  # Double timeout for next attempt
                        print(f"Server busy, retrying in {timeout} seconds (attempt {retry_count}/{max_retries})")
                        await asyncio.sleep(1)  # Small delay before retry
                    else:
                        # Other error - don't retry
                        error_message = f"Model API error: {response.status_code}"
                        try:
                            error_data = response.json()
                            if 'error' in error_data:
                                error_message = error_data['error']
                        except:
                            pass
                            
                        raise Exception(error_message)
                        
                except (requests.exceptions.Timeout, requests.exceptions.ConnectionError):
                    # Handle timeout - retry with backoff if we haven't hit max retries
                    retry_count += 1
                    if retry_count > max_retries:
                        raise Exception(f"Timed out after {max_retries} retries")
                    
                    timeout *= 2  # Double timeout for next attempt
                    print(f"Request timed out, retrying with timeout {timeout}s (attempt {retry_count}/{max_retries})")
                    await asyncio.sleep(1)  # Small delay before retry
                    continue
            
            # If we get here, we've exhausted retries
            raise Exception(f"Failed after {max_retries} retries")
            
        except Exception as e:
            raise Exception(f"Error running model {model_name}: {str(e)}")
    
    def suggest_chain(self, user_input: str) -> str:
        """Suggest a chain to use based on user input."""
        input_lower = user_input.lower()
        
        # Check for image-related queries
        if re.search(r'image|picture|photo|scene|visual|describe what|what\'s in', input_lower):
            return 'vision_reasoning'
            
        # Check for code-related queries
        if re.search(r'code|function|algorithm|program|script|generate.+code|write.+code', input_lower):
            return 'code_generation'
            
        # Check for summarization queries
        if re.search(r'summarize|summary|extract|key points|summarizing', input_lower):
            return 'summarize_and_extract'
            
        # Default to basic chain
        return 'basic'