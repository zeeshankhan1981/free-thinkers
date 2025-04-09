"""
Parameter Profiles for Free Thinkers
Contains predefined and customizable parameter profiles for different use cases
"""

import json
import os
from pathlib import Path

# Define the directory for storing parameter profiles
PROFILES_DIR = Path(os.path.expanduser("~/.freethinkers/parameter_profiles/"))

# Initialize with default parameter profiles
DEFAULT_PARAMETER_PROFILES = {
    "general": [
        {
            "name": "Balanced",
            "description": "General-purpose settings with balanced creativity and reliability",
            "parameters": {
                "temperature": 0.7,
                "top_p": 0.95,
                "top_k": 40,
                "repetition_penalty": 1.1,
                "context_window": 2048
            }
        },
        {
            "name": "Creative",
            "description": "Optimized for creative and diverse outputs",
            "parameters": {
                "temperature": 0.85,
                "top_p": 0.92,
                "top_k": 50,
                "repetition_penalty": 1.05,
                "context_window": 2048
            }
        },
        {
            "name": "Precise",
            "description": "Optimized for factual accuracy and consistent outputs",
            "parameters": {
                "temperature": 0.3,
                "top_p": 0.85,
                "top_k": 20,
                "repetition_penalty": 1.2,
                "context_window": 2048
            }
        }
    ],
    "task_specific": [
        {
            "name": "Creative Writing",
            "description": "Optimized for storytelling, fiction, and creative content",
            "parameters": {
                "temperature": 0.8,
                "top_p": 0.92,
                "top_k": 50,
                "repetition_penalty": 1.05,
                "context_window": 2048
            }
        },
        {
            "name": "Factual Q&A",
            "description": "Optimized for answering factual questions accurately",
            "parameters": {
                "temperature": 0.3,
                "top_p": 0.85,
                "top_k": 10,
                "repetition_penalty": 1.15,
                "context_window": 2048
            }
        },
        {
            "name": "Code Generation",
            "description": "Optimized for generating reliable code",
            "parameters": {
                "temperature": 0.4,
                "top_p": 0.95,
                "top_k": 30,
                "repetition_penalty": 1.1,
                "context_window": 2048
            }
        },
        {
            "name": "Brainstorming",
            "description": "Maximizes diversity and creativity for idea generation",
            "parameters": {
                "temperature": 0.9,
                "top_p": 0.98,
                "top_k": 60,
                "repetition_penalty": 1.0,
                "context_window": 2048
            }
        },
        {
            "name": "Analytical",
            "description": "Optimized for analytical reasoning and structured responses",
            "parameters": {
                "temperature": 0.5,
                "top_p": 0.9,
                "top_k": 30,
                "repetition_penalty": 1.1,
                "context_window": 2048
            }
        }
    ],
    "model_specific": {
        "mistral-7b": {
            "Balanced": {
                "temperature": 0.7,
                "top_p": 0.95,
                "top_k": 40,
                "repetition_penalty": 1.1
            },
            "Creative": {
                "temperature": 0.9,
                "top_p": 0.95,
                "top_k": 50,
                "repetition_penalty": 1.05
            },
            "Precise": {
                "temperature": 0.3,
                "top_p": 0.85,
                "top_k": 20,
                "repetition_penalty": 1.2
            },
            "Creative Writing": {
                "temperature": 0.85,
                "top_p": 0.92,
                "top_k": 50,
                "repetition_penalty": 1.05
            },
            "Factual Q&A": {
                "temperature": 0.25,
                "top_p": 0.85,
                "top_k": 10,
                "repetition_penalty": 1.15
            }
        },
        "llama3.2": {
            "Balanced": {
                "temperature": 0.65,
                "top_p": 0.9,
                "top_k": 35,
                "repetition_penalty": 1.1
            },
            "Creative": {
                "temperature": 0.8,
                "top_p": 0.92,
                "top_k": 45,
                "repetition_penalty": 1.05
            },
            "Precise": {
                "temperature": 0.25,
                "top_p": 0.8,
                "top_k": 20,
                "repetition_penalty": 1.2
            },
            "Code Generation": {
                "temperature": 0.3,
                "top_p": 0.95,
                "top_k": 25,
                "repetition_penalty": 1.1
            }
        },
        # gemma-2b-it removed from model-specific profiles
        "llava-phi3:latest": {
            "Balanced": {
                "temperature": 0.7,
                "top_p": 0.95,
                "top_k": 40,
                "repetition_penalty": 1.1
            },
            "Creative": {
                "temperature": 0.8,
                "top_p": 0.92,
                "top_k": 45,
                "repetition_penalty": 1.05
            },
            "Precise": {
                "temperature": 0.4,
                "top_p": 0.9,
                "top_k": 25,
                "repetition_penalty": 1.15
            }
        }
    },
    "custom": []
}

def initialize_profiles():
    """Initialize parameter profiles directory and create default profiles file."""
    try:
        PROFILES_DIR.mkdir(parents=True, exist_ok=True)
        profiles_file = PROFILES_DIR / "profiles.json"
        
        # Create default profiles file if it doesn't exist
        if not profiles_file.exists():
            with open(profiles_file, 'w') as f:
                json.dump(DEFAULT_PARAMETER_PROFILES, f, indent=2)
            return DEFAULT_PARAMETER_PROFILES
        else:
            # Read existing profiles
            with open(profiles_file, 'r') as f:
                return json.load(f)
    except Exception as e:
        print(f"Error initializing parameter profiles: {str(e)}")
        return DEFAULT_PARAMETER_PROFILES

def get_profiles():
    """Get all parameter profiles."""
    try:
        profiles_file = PROFILES_DIR / "profiles.json"
        if profiles_file.exists():
            with open(profiles_file, 'r') as f:
                return json.load(f)
        else:
            return initialize_profiles()
    except Exception as e:
        print(f"Error loading parameter profiles: {str(e)}")
        return DEFAULT_PARAMETER_PROFILES

def get_profiles_for_model(model_name):
    """Get parameter profiles for a specific model."""
    profiles = get_profiles()
    
    # Start with general profiles
    result = {profile["name"]: profile["parameters"] for profile in profiles["general"]}
    
    # Add task specific profiles
    for profile in profiles["task_specific"]:
        result[profile["name"]] = profile["parameters"]
    
    # Add model-specific overrides if they exist
    if model_name in profiles["model_specific"]:
        model_profiles = profiles["model_specific"][model_name]
        for profile_name, parameters in model_profiles.items():
            result[profile_name] = parameters
    
    # Add custom profiles
    for profile in profiles["custom"]:
        if "model" not in profile or profile["model"] == model_name:
            result[profile["name"]] = profile["parameters"]
    
    return result

def add_custom_profile(name, description, parameters, model=None):
    """Add a new custom parameter profile."""
    try:
        profiles = get_profiles()
        
        # Create new profile
        new_profile = {
            "name": name,
            "description": description,
            "parameters": parameters
        }
        
        # Add model specificity if provided
        if model:
            new_profile["model"] = model
        
        # Check for duplicate
        for idx, profile in enumerate(profiles["custom"]):
            if profile["name"] == name and ("model" not in profile or profile.get("model") == model):
                # Replace existing profile
                profiles["custom"][idx] = new_profile
                break
        else:
            # Add new profile
            profiles["custom"].append(new_profile)
        
        # Save profiles
        profiles_file = PROFILES_DIR / "profiles.json"
        with open(profiles_file, 'w') as f:
            json.dump(profiles, f, indent=2)
        
        return True, "Profile saved successfully"
    except Exception as e:
        return False, f"Error saving profile: {str(e)}"

def delete_custom_profile(name, model=None):
    """Delete a custom parameter profile."""
    try:
        profiles = get_profiles()
        
        # Filter out the profile to delete
        profiles["custom"] = [
            p for p in profiles["custom"] 
            if p["name"] != name or (model and p.get("model") != model)
        ]
        
        # Save profiles
        profiles_file = PROFILES_DIR / "profiles.json"
        with open(profiles_file, 'w') as f:
            json.dump(profiles, f, indent=2)
        
        return True, "Profile deleted successfully"
    except Exception as e:
        return False, f"Error deleting profile: {str(e)}"

def get_profile(name, model_name=None):
    """Get a specific parameter profile by name."""
    profiles = get_profiles()
    
    # Check model-specific profiles first
    if model_name and model_name in profiles["model_specific"]:
        model_profiles = profiles["model_specific"][model_name]
        if name in model_profiles:
            return model_profiles[name]
    
    # Check custom profiles
    for profile in profiles["custom"]:
        if profile["name"] == name and (not model_name or "model" not in profile or profile.get("model") == model_name):
            return profile["parameters"]
    
    # Check task-specific profiles
    for profile in profiles["task_specific"]:
        if profile["name"] == name:
            return profile["parameters"]
    
    # Check general profiles
    for profile in profiles["general"]:
        if profile["name"] == name:
            return profile["parameters"]
    
    # Return default parameters if profile not found
    return {
        "temperature": 0.7,
        "top_p": 0.95,
        "top_k": 40,
        "repetition_penalty": 1.1,
        "context_window": 2048
    }

# Initialize profiles on module import
initialize_profiles()