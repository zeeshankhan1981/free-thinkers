# Prompt Templates System Implementation

## Overview

The Prompt Templates System is a comprehensive enhancement to Free Thinkers that provides model-specific, optimized prompt templates based on established prompting techniques. This implementation gives users access to a rich library of pre-defined prompt structures that are tailored to each model's unique capabilities, enabling more effective interactions with different LLMs.

## Implementation Architecture

The system consists of three main components:

1. **Backend Template Library** (`app/prompt_templates.py`)
   - Core library that defines all prompt templates
   - Organizes templates by model type and capability
   - Provides template selection and rendering functionality

2. **API Endpoints** (`app/templates_api.py`) 
   - Flask Blueprint with REST endpoints
   - Lists available templates for specific models
   - Generates filled templates with user-provided values

3. **Frontend UI Component** (`app/static/js/templates.js`)
   - JavaScript class that renders the template selector interface
   - Manages template selection and placeholder input
   - Handles template application to the chat input

## Template Categories

The implementation includes specialized templates organized by model category:

### General Templates (All Models)
- Expert Analysis
- Structured Output
- Creative Generation
- Complex Reasoning
- Concise Expert Explanation

### Multimodal Templates (llava-phi3)
- Expert Visual Analysis
- Structured Visual Output
- Visual Reasoning Task

### Large Model Templates (llama3.1:8b, llama3.2, mistral-7b)
- Expert Domain Analysis
- Creative Content Generation
- Step-by-Step Problem Solving

### Mistral-Specific Templates
- Academic Analysis
- Decision Framework
- Critical Evaluation

### Phi3-Specific Templates (coding-focused)
- Code Generation
- Technical Explanation
- Algorithm Design

### Gemma Templates (balanced approach)
- Balanced Analysis
- Instructional Guide
- Information Synthesis

### Small Model Templates (gemma3:1b)
- Direct Question
- Simple Task
- Micro Explanation

### Uncensored Model Templates (llama2-uncensored:7b)
- Creative Fiction
- Debate Preparation
- Deep Philosophical Inquiry

### Instruction-Following Templates (zephyr, gemma-2b-it)
- Multi-Step Task
- Format Transformation
- Guided Reasoning

## Technical Implementation

### Template Structure

Each template is defined with the following structure:

```python
{
    "name": "Template Name",
    "description": "Description of the template's purpose",
    "use_cases": ["list", "of", "use cases"],
    "template": """The actual template text with {placeholders}""",
    "placeholders": ["list", "of", "placeholders"],
    "example_filled": {
        "placeholder1": "example value 1",
        "placeholder2": "example value 2"
    }
}
```

### Model-Template Mapping

Templates are mapped to specific models using a dictionary structure that considers each model's architecture and strengths:

```python
MODEL_TEMPLATE_MAPPING = {
    "model_name": {**TEMPLATE_SET_1, **TEMPLATE_SET_2}
}
```

This approach allows multiple template sets to be combined for a specific model and ensures appropriate template availability.

### API Endpoints

The system exposes two main endpoints:

- `GET /templates/list/<model_name>` - Returns available templates for a specific model
- `POST /templates/generate` - Generates a filled template with user-provided values

### Frontend Integration

The template selector is integrated into the main chat interface and provides:

1. A dropdown to select template types
2. Dynamic form inputs for template placeholders
3. Automatic application to the message input field

## How to Use

### As a User

1. Open the Free Thinkers application
2. Select a model from the model dropdown
3. Locate the template selector section
4. Choose a template from the dropdown
5. Fill in the placeholder fields that appear
6. Click "Apply Template" to populate the message input
7. Send the message as usual

### As a Developer

#### Adding New Templates

1. Open `app/prompt_templates.py`
2. Add your template definition to the appropriate template collection
3. Update the `MODEL_TEMPLATE_MAPPING` if needed to associate with specific models

```python
NEW_TEMPLATE = {
    "template_id": {
        "name": "Template Name",
        "description": "Template description",
        "template": """Template text with {placeholders}""",
        "placeholders": ["placeholder1", "placeholder2"],
        "example_filled": {"placeholder1": "example", "placeholder2": "example"}
    }
}

# Add to existing collection
SOME_TEMPLATES_COLLECTION.update(NEW_TEMPLATE)

# Or create a new collection and update mapping
NEW_COLLECTION = {**NEW_TEMPLATE}
MODEL_TEMPLATE_MAPPING["some_model"] = {**MODEL_TEMPLATE_MAPPING["some_model"], **NEW_COLLECTION}
```

## Design Considerations

### Template Optimization

Templates are optimized for each model size and architecture:

- **Large models** receive more detailed instructions and can handle complex prompts
- **Medium models** have slightly simplified versions with balanced complexity
- **Small models** receive highly focused, concise templates to maximize performance
- **Specialized models** (like phi3 for coding) have domain-specific templates

### User Experience

The UI design follows these principles:

1. Non-intrusive integration with the existing interface
2. Clear labeling and descriptions for each template
3. Example values to guide user input
4. Straightforward application process
5. Responsive and adaptable to different screen sizes

## Future Improvements

Potential enhancements for the template system include:

1. **User-Defined Templates**: Allow users to create and save their own templates
2. **Template Rating System**: Enable community feedback on template effectiveness
3. **Dynamic Template Optimization**: Use feedback to automatically refine templates
4. **Template Categories**: Add organization by use case, complexity, etc.
5. **Visual Template Builder**: Provide a graphical interface for template creation
6. **Template Export/Import**: Allow sharing of custom templates between users
7. **Contextual Suggestions**: Suggest templates based on conversation context

## Resources

The implementation draws on the following resources:

- Prompt Engineering guides from the project documentation
- The `MODEL_SPECIFIC_PROMPTS.md` document with tailored prompting strategies
- The `PROMPT_ENGINEERING_ROADMAP.md` with advanced prompting techniques
- Anthropic's Claude Sonnet 3.7 prompt patterns and best practices

## Conclusion

The Prompt Templates System enhances Free Thinkers with a powerful, flexible approach to structured prompting across different models. By providing optimized templates for each model type, it bridges the gap between advanced prompt engineering techniques and everyday usage, making sophisticated prompting accessible to all users.
