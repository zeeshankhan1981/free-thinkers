"""
Prompt Templates Library for Free Thinkers
Contains a collection of structured templates optimized for different models and tasks
"""

# Base template structure with placeholders
TEMPLATE_PLACEHOLDERS = {
    "domain": "[domain]",
    "role": "[role]",
    "topic": "[topic]",
    "issue": "[issue]",
    "problem": "[problem]",
    "complex_topic": "[complex topic]",
    "word_limit": "[word limit]",
    "content_type": "[content type]",
    "reference": "[reference]",
    "specific_elements": "[specific elements]",
    "word_count": "[word count]",
    "theme_1": "[theme 1]",
    "theme_2": "[theme 2]",
    "theme_3": "[theme 3]",
    "detailed_problem": "[detailed problem description]",
    "task": "[task]",
    "language": "[language]",
    "function_purpose": "[function purpose]",
    "technical_concept": "[technical concept]",
    "decision_context": "[decision context]",
    "field": "[field]",
    "statement": "[statement/argument/theory]",
    "content_to_evaluate": "[content to evaluate]",
    "genre": "[genre]",
    "elements": "[elements]",
    "controversial_topic": "[controversial topic]",
    "philosophical_question": "[philosophical question]",
    "first_subtask": "[First subtask with specific instructions]",
    "second_subtask": "[second subtask]",
    "third_subtask": "[Third subtask]",
    "final_task": "[final task]",
    "input_format": "[input format]",
    "output_format": "[output format]",
    "content_to_transform": "[content to transform]",
    "requirement_1": "[specific requirement 1]",
    "requirement_2": "[specific requirement 2]",
    "requirement_3": "[specific requirement 3]",
}

# Claude-inspired templates collection (general templates from the roadmap)
CLAUDE_TEMPLATES = {
    "expert_analysis": {
        "name": "Expert Analysis",
        "description": "In-depth analysis with nuance and precision on a specialized topic",
        "use_cases": ["research", "complex problem-solving", "domain-specific analysis"],
        "template": """You are a world-class expert in {domain} with decades of experience. Analyze the following {topic} with the depth, nuance, and precision of a leading specialist in the field.

Important considerations:
- Apply cutting-edge frameworks from {domain}
- Identify non-obvious implications
- Consider contrarian viewpoints
- Highlight uncertainties where relevant

Format your response with clear section headings, concise insights, and actionable takeaways.""",
        "placeholders": ["domain", "topic"],
        "example_filled": {
            "domain": "climate science",
            "topic": "impact of urban heat islands on local weather patterns"
        }
    },
    "structured_output": {
        "name": "Structured Analysis",
        "description": "Comprehensive analysis with clear sections and structure",
        "use_cases": ["reports", "analysis documents", "research summaries"],
        "template": """Provide a detailed, comprehensive analysis of {topic}. 

Structure your response in the following format:
1. Summary (3 bullet points)
2. Background Context (2-3 paragraphs)
3. Key Factors (numbered list with 1-2 sentence explanations)
4. Evidence-Based Analysis (3-4 paragraphs)
5. Actionable Recommendations (5 specific items)
6. Potential Challenges (3 items with mitigation strategies)

Maintain accuracy, analytical depth, and professional tone throughout.""",
        "placeholders": ["topic"],
        "example_filled": {
            "topic": "renewable energy transition in developing economies"
        }
    },
    "creative_generation": {
        "name": "Creative Content",
        "description": "Generate creative content in a specific style",
        "use_cases": ["writing", "content creation", "storytelling"],
        "template": """I need you to generate {content_type} about {topic} in the style of {reference}. 

Guidelines:
- Capture the distinctive voice, vocabulary, and sentence structure of the reference style
- Incorporate {specific_elements} that are characteristic of the style
- Balance authenticity with readability
- Length: approximately {word_count} words

Include the following themes: {theme_1}, {theme_2}, {theme_3}.""",
        "placeholders": ["content_type", "topic", "reference", "specific_elements", "word_count", "theme_1", "theme_2", "theme_3"],
        "example_filled": {
            "content_type": "a short story",
            "topic": "an unexpected friendship",
            "reference": "Ernest Hemingway",
            "specific_elements": "short sentences, sparse dialogue, and implied emotions",
            "word_count": "500",
            "theme_1": "courage",
            "theme_2": "isolation",
            "theme_3": "resilience"
        }
    },
    "complex_reasoning": {
        "name": "Complex Problem Solver",
        "description": "Solve complex problems with structured step-by-step reasoning",
        "use_cases": ["problem-solving", "decision making", "strategic planning"],
        "template": """I need you to solve the following complex problem: {detailed_problem}

Approach this problem using these steps:
1. Identify the core components and variables
2. Frame the problem using appropriate mental models
3. Generate multiple solution approaches (at least 3)
4. Evaluate each approach with pros/cons
5. Select the optimal solution and explain your reasoning
6. Outline implementation steps

Think step-by-step, making your reasoning explicit at each stage. Consider edge cases and potential failure modes.""",
        "placeholders": ["detailed_problem"],
        "example_filled": {
            "detailed_problem": "A small tech company needs to decide whether to focus on improving their existing product for current customers or pivot to develop a new product for an emerging market."
        }
    },
    "concise_expert": {
        "name": "Concise Expert Explanation",
        "description": "Clear, precise explanations of complex topics",
        "use_cases": ["education", "explanations", "simplified complexity"],
        "template": """You are the world's foremost expert in {domain}. You communicate with exceptional clarity and precision.

Explain {complex_topic} in the most accurate yet accessible way possible. Your explanation should:
- Focus on the most fundamental concepts
- Use precise terminology where necessary (with brief definitions)
- Eliminate unnecessary complexity
- Use analogies where they clarify (not oversimplify)

Your response must be under {word_limit} words while maintaining complete accuracy.""",
        "placeholders": ["domain", "complex_topic", "word_limit"],
        "example_filled": {
            "domain": "quantum physics",
            "complex_topic": "quantum entanglement and its implications for information theory",
            "word_limit": "300"
        }
    }
}

# Model-specific templates from MODEL_SPECIFIC_PROMPTS.md

# Multimodal templates for llava-phi3
MULTIMODAL_TEMPLATES = {
    "expert_visual_analysis": {
        "name": "Expert Visual Analysis",
        "description": "In-depth analysis of image content by a computer vision expert",
        "use_cases": ["detailed image analysis", "technical visual assessment", "professional image evaluation"],
        "template": """You are a computer vision expert with decades of experience in image analysis. Analyze this image with the depth and precision of a specialist.

Important considerations:
- Identify all key visual elements and their relationships
- Note any unusual or unexpected features
- Assess the quality and composition
- Consider the context and purpose of the image

Format your response with clear section headings and concise insights.""",
        "placeholders": [],
        "example_filled": {}
    },
    "structured_visual_output": {
        "name": "Structured Visual Analysis",
        "description": "Comprehensive, organized breakdown of image content",
        "use_cases": ["detailed image documentation", "visual content cataloging", "image assessment"],
        "template": """Analyze this image and provide a comprehensive breakdown.

Structure your response as follows:
1. Overview (3 bullet points describing the main elements)
2. Detailed Elements (list each significant object/person/text with brief description)
3. Composition Analysis (lighting, framing, focal points)
4. Context Interpretation (likely purpose, setting, significance)
5. Technical Assessment (image quality, modifications, anomalies)

Keep responses concise yet complete.""",
        "placeholders": [],
        "example_filled": {}
    },
    "visual_reasoning_task": {
        "name": "Visual Reasoning Task",
        "description": "Detailed step-by-step reasoning about visual content",
        "use_cases": ["visual problem solving", "document analysis", "scene interpretation"],
        "template": """Examine this image carefully. I need you to:
1. Identify all text visible in the image
2. Describe the spatial relationship between objects
3. Analyze any charts, graphs, or diagrams present
4. Identify any inconsistencies or unusual elements
5. Suggest what might be outside the frame based on context clues

Think methodically and describe what you see step by step.""",
        "placeholders": [],
        "example_filled": {}
    }
}

# Templates for larger models (llama3.1:8b, llama3.2)
LARGE_MODEL_TEMPLATES = {
    "expert_analysis_large": {
        "name": "Expert Domain Analysis",
        "description": "Deep analysis of a topic by a domain expert",
        "use_cases": ["research", "trend analysis", "academic exploration"],
        "template": """You are a leading expert in {domain} with comprehensive knowledge. Analyze {topic} with depth and precision.

Consider:
- Core principles and emerging trends
- Common misconceptions
- Practical applications
- Future implications

Provide a well-structured analysis with clear sections and evidence-based insights.""",
        "placeholders": ["domain", "topic"],
        "example_filled": {
            "domain": "artificial intelligence ethics",
            "topic": "the societal impact of generative AI"
        }
    },
    "creative_generation_large": {
        "name": "Creative Content Generation",
        "description": "Generate creative content with specific stylistic elements",
        "use_cases": ["fiction writing", "content creation", "creative exercises"],
        "template": """Generate {content_type} about {topic} in the style of {reference}.

Guidelines:
- Capture the distinctive voice and structure of the reference style
- Include creative elements like {specific_elements}
- Balance creativity with coherence
- Length: approximately {word_count} words

Themes to include: {theme_1}, {theme_2}, {theme_3}""",
        "placeholders": ["content_type", "topic", "reference", "specific_elements", "word_count", "theme_1", "theme_2", "theme_3"],
        "example_filled": {
            "content_type": "a short story",
            "topic": "a chance encounter that changes someone's life",
            "reference": "Gabriel García Márquez",
            "specific_elements": "magical realism, rich imagery, and intergenerational themes",
            "word_count": "800",
            "theme_1": "fate",
            "theme_2": "transformation",
            "theme_3": "memory"
        }
    },
    "complex_reasoning_large": {
        "name": "Step-by-Step Problem Solving",
        "description": "Methodical approach to solving complex problems",
        "use_cases": ["problem analysis", "decision making", "solution development"],
        "template": """I need a solution to this problem: {detailed_problem}

Follow these steps:
1. Identify key components
2. Consider multiple approaches
3. Evaluate each approach
4. Select and justify the best solution
5. Outline implementation steps

Think step-by-step and explain your reasoning clearly.""",
        "placeholders": ["detailed_problem"],
        "example_filled": {
            "detailed_problem": "Our software company needs to decide whether to refactor our existing codebase which has significant technical debt or rewrite it from scratch with modern architecture."
        }
    }
}

# Templates for mistral-7b (reasoning focus)
MISTRAL_TEMPLATES = {
    "academic_analysis": {
        "name": "Academic Analysis",
        "description": "Rigorous, scholarly examination of a topic",
        "use_cases": ["research papers", "academic reports", "scholarly review"],
        "template": """As a research scholar in {field}, provide a rigorous analysis of {topic}.

Your analysis should:
- Apply established theoretical frameworks
- Evaluate existing research
- Identify gaps in current understanding
- Propose new perspectives

Structure your response with clear sections, precise terminology, and logical flow.""",
        "placeholders": ["field", "topic"],
        "example_filled": {
            "field": "cognitive psychology",
            "topic": "the impact of digital media on attention spans and deep thinking"
        }
    },
    "decision_framework": {
        "name": "Decision Evaluation Framework",
        "description": "Structured approach to evaluating complex decisions",
        "use_cases": ["decision making", "option analysis", "strategic planning"],
        "template": """Help me evaluate this decision: {decision_context}

Approach using this framework:
1. Define objectives and constraints
2. Identify available options
3. Analyze each option (pros/cons)
4. Consider potential outcomes and probabilities
5. Recommend optimal approach with justification

Maintain logical consistency and consider both quantitative and qualitative factors.""",
        "placeholders": ["decision_context"],
        "example_filled": {
            "decision_context": "whether to expand our business into international markets or focus on deepening market share in our existing region"
        }
    },
    "critical_evaluation": {
        "name": "Critical Statement Evaluation",
        "description": "Balanced, thorough critique of a statement or argument",
        "use_cases": ["argument analysis", "claim verification", "theory testing"],
        "template": """Critically evaluate the following {statement}:

{content_to_evaluate}

Structure your evaluation:
1. Summary of main claims (1 paragraph)
2. Strength analysis (3 key strengths with examples)
3. Weakness analysis (3 key weaknesses with examples)
4. Alternative perspectives (2-3 counterarguments)
5. Balanced conclusion

Apply rigorous analytical standards and avoid bias.""",
        "placeholders": ["statement", "content_to_evaluate"],
        "example_filled": {
            "statement": "theory",
            "content_to_evaluate": "The primary driver of historical change is technological innovation rather than social or political movements."
        }
    }
}

# Templates for phi3:3.8b (coding focus)
PHI3_TEMPLATES = {
    "code_generation": {
        "name": "Code Generation",
        "description": "Generate well-structured, optimized code for specific purposes",
        "use_cases": ["software development", "algorithm implementation", "utility functions"],
        "template": """Write a {language} function that {function_purpose}.

Requirements:
- Handle these edge cases: [list cases]
- Follow these design patterns: [patterns]
- Optimize for [performance/readability/etc.]
- Include error handling

First outline your approach, then implement the solution step by step.""",
        "placeholders": ["language", "function_purpose"],
        "example_filled": {
            "language": "Python",
            "function_purpose": "efficiently finds all palindromic substrings in a given string"
        }
    },
    "technical_explanation": {
        "name": "Technical Concept Explanation",
        "description": "Clear, accurate explanation of technical concepts",
        "use_cases": ["technical documentation", "education", "knowledge sharing"],
        "template": """Explain {technical_concept} clearly and accurately.

Your explanation should:
- Start with a simple definition
- Explain core mechanisms
- Provide a practical example
- Compare with related concepts
- Address common misconceptions

Use precise terminology but maintain accessibility.""",
        "placeholders": ["technical_concept"],
        "example_filled": {
            "technical_concept": "how database indexing improves query performance"
        }
    },
    "algorithm_design": {
        "name": "Algorithm Design",
        "description": "Design efficient algorithms for specific problems",
        "use_cases": ["programming challenges", "optimization problems", "computation tasks"],
        "template": """Design an algorithm to solve this problem: {detailed_problem}

Your response should include:
1. Problem breakdown
2. Algorithm approach and justification
3. Pseudocode implementation
4. Time and space complexity analysis
5. Potential optimizations

Focus on efficiency, correctness, and readability.""",
        "placeholders": ["detailed_problem"],
        "example_filled": {
            "detailed_problem": "find the most efficient route that visits all nodes in a graph exactly once and returns to the starting point, considering edge weights"
        }
    }
}

# Templates for gemma models (balanced approach)
GEMMA_TEMPLATES = {
    "balanced_analysis": {
        "name": "Balanced Analysis",
        "description": "Fair, multi-perspective analysis of an issue or topic",
        "use_cases": ["controversial topics", "policy analysis", "debate preparation"],
        "template": """Provide a balanced analysis of {topic}.

Structure your response:
1. Overview (neutral description)
2. Perspective A (key arguments and evidence)
3. Perspective B (key arguments and evidence)
4. Common ground and nuances
5. Synthesis of key insights

Present multiple viewpoints fairly and avoid bias.""",
        "placeholders": ["topic"],
        "example_filled": {
            "topic": "the environmental impact versus economic benefits of cryptocurrency mining"
        }
    },
    "instructional_guide": {
        "name": "Step-by-Step Guide",
        "description": "Clear instructions for completing a specific task",
        "use_cases": ["tutorials", "how-to guides", "process documentation"],
        "template": """Create a step-by-step guide for {task}.

Your guide should:
- Begin with necessary prerequisites
- Break the process into clear, logical steps
- Include helpful tips at key decision points
- Address common mistakes or challenges
- End with verification steps to ensure success

Make instructions specific and actionable.""",
        "placeholders": ["task"],
        "example_filled": {
            "task": "setting up a secure home network with proper segmentation and guest access"
        }
    },
    "information_synthesis": {
        "name": "Information Synthesis",
        "description": "Concise summary of key information on a topic",
        "use_cases": ["briefings", "quick references", "knowledge consolidation"],
        "template": """Synthesize the key information about {topic}.

Format your response as:
1. Core definition (1-2 sentences)
2. Key components (bulleted list)
3. Important relationships and patterns
4. Practical applications
5. Essential takeaways

Focus on accuracy and clarity.""",
        "placeholders": ["topic"],
        "example_filled": {
            "topic": "how machine learning algorithms detect anomalies in security systems"
        }
    }
}

# Templates for small models
SMALL_MODEL_TEMPLATES = {
    "concise_query": {
        "name": "Direct Question",
        "description": "Short, focused answer to a specific question",
        "use_cases": ["quick information", "fact checking", "simple explanations"],
        "template": """{topic}

Provide a direct, accurate response in 3 sentences or less.""",
        "placeholders": ["topic"],
        "example_filled": {
            "topic": "How do vaccines create immunity without causing disease?"
        }
    },
    "simple_task": {
        "name": "Simple Task",
        "description": "Straightforward solution to a well-defined task",
        "use_cases": ["basic calculations", "simple conversions", "clear procedures"],
        "template": """Help me with this specific task: {task}

Provide a straightforward solution focusing only on essential information.""",
        "placeholders": ["task"],
        "example_filled": {
            "task": "convert 15 celsius to fahrenheit"
        }
    },
    "focused_explanation": {
        "name": "Micro Explanation",
        "description": "Brief explanation of a narrow concept",
        "use_cases": ["term definitions", "concept clarification", "quick learning"],
        "template": """Explain {complex_topic}.

Keep your explanation under 100 words while covering the essential points.""",
        "placeholders": ["complex_topic"],
        "example_filled": {
            "complex_topic": "how DNS resolves domain names to IP addresses"
        }
    }
}

# Templates for uncensored models
UNCENSORED_TEMPLATES = {
    "creative_fiction": {
        "name": "Creative Fiction",
        "description": "Fiction writing with mature themes and complex elements",
        "use_cases": ["fiction writing", "storytelling", "creative exploration"],
        "template": """Write a {genre} story involving {elements}.

Guidelines:
- Include complex characters with flawed motivations
- Explore mature themes realistically
- Create an engaging narrative arc
- Don't shy away from controversial elements when relevant to the story

Approximate length: {word_count} words.""",
        "placeholders": ["genre", "elements", "word_count"],
        "example_filled": {
            "genre": "psychological thriller",
            "elements": "an unreliable narrator, a morally ambiguous protagonist, and themes of paranoia",
            "word_count": "800"
        }
    },
    "debate_preparation": {
        "name": "Debate Preparation",
        "description": "Thorough preparation for debates on controversial topics",
        "use_cases": ["debate preparation", "argument development", "position analysis"],
        "template": """Help me prepare arguments for a debate on {controversial_topic}.

For each position:
1. Strongest supporting arguments with evidence
2. Anticipated counterarguments and rebuttals
3. Historical context and precedents
4. Ethical considerations
5. Practical implications

Present all perspectives thoroughly without filtering.""",
        "placeholders": ["controversial_topic"],
        "example_filled": {
            "controversial_topic": "the ethics of genetic enhancement in humans"
        }
    },
    "philosophical_inquiry": {
        "name": "Deep Philosophical Inquiry",
        "description": "Exploration of philosophical questions without conventional constraints",
        "use_cases": ["philosophy discussions", "thought experiments", "conceptual exploration"],
        "template": """Explore this philosophical question without limitations: {philosophical_question}

Approach from these angles:
- Classical philosophical frameworks
- Modern interpretations
- Controversial perspectives
- Logical extrapolations
- Personal reflection framework

Aim for intellectual depth rather than conventional wisdom.""",
        "placeholders": ["philosophical_question"],
        "example_filled": {
            "philosophical_question": "Is consciousness fundamental to reality or merely an emergent phenomenon of physical processes?"
        }
    }
}

# Templates for instruction-following models
INSTRUCTION_TEMPLATES = {
    "multi_step_task": {
        "name": "Multi-Step Task",
        "description": "Complete a sequence of related tasks in order",
        "use_cases": ["complex instructions", "sequential tasks", "guided processes"],
        "template": """Complete this multi-step task:

1. {first_subtask}
2. Using the result from step 1, {second_subtask}
3. {third_subtask} and explain your reasoning
4. Finalize by {final_task}

Follow each step precisely and maintain consistency throughout.""",
        "placeholders": ["first_subtask", "second_subtask", "third_subtask", "final_task"],
        "example_filled": {
            "first_subtask": "Analyze the given text for its main argument and supporting points",
            "second_subtask": "evaluate the strength of each supporting point",
            "third_subtask": "Identify logical fallacies or weaknesses in the argument",
            "final_task": "suggesting how the argument could be strengthened"
        }
    },
    "format_transformation": {
        "name": "Format Transformation",
        "description": "Convert content from one format to another",
        "use_cases": ["data conversion", "reformatting", "structure changes"],
        "template": """Transform the following {input_format} into {output_format}:

{content_to_transform}

Follow these formatting requirements:
- {requirement_1}
- {requirement_2}
- {requirement_3}

Ensure complete accuracy in the transformation.""",
        "placeholders": ["input_format", "output_format", "content_to_transform", "requirement_1", "requirement_2", "requirement_3"],
        "example_filled": {
            "input_format": "unstructured text description",
            "output_format": "JSON object",
            "content_to_transform": "Product: Ergonomic Office Chair. Features: adjustable height, lumbar support, breathable mesh back, 360-degree swivel. Price: $249.99. Colors available: black, gray, blue. Weight capacity: 275 lbs.",
            "requirement_1": "Use camelCase for property names",
            "requirement_2": "Convert numeric values to appropriate data types",
            "requirement_3": "Organize features as an array of strings"
        }
    },
    "guided_reasoning": {
        "name": "Guided Reasoning",
        "description": "Structured thinking process for solving problems",
        "use_cases": ["problem analysis", "decision making", "critical thinking"],
        "template": """Help me think through this problem: {detailed_problem}

Follow this reasoning process:
1. Identify key variables and constraints
2. Generate initial hypotheses
3. Test each hypothesis against available evidence
4. Refine understanding based on logical inconsistencies
5. Draw conclusions and identify remaining uncertainties

Explain your thinking at each step.""",
        "placeholders": ["detailed_problem"],
        "example_filled": {
            "detailed_problem": "A software project keeps missing deadlines despite the team working overtime and adding more developers. What might be causing this and how can it be resolved?"
        }
    }
}

# Map model names to their appropriate template sets
MODEL_TEMPLATE_MAPPING = {
    # Large models
    "llama3.1:8b": {**CLAUDE_TEMPLATES, **LARGE_MODEL_TEMPLATES},
    "llama3.2": {**CLAUDE_TEMPLATES, **LARGE_MODEL_TEMPLATES},
    "mistral-7b": {**CLAUDE_TEMPLATES, **MISTRAL_TEMPLATES, **LARGE_MODEL_TEMPLATES},
    "llama2-uncensored:7b": {**CLAUDE_TEMPLATES, **UNCENSORED_TEMPLATES, **LARGE_MODEL_TEMPLATES},
    
    # Medium models
    "gemma3:4b": {**CLAUDE_TEMPLATES, **GEMMA_TEMPLATES},
    "phi3:3.8b": {**CLAUDE_TEMPLATES, **PHI3_TEMPLATES},
    "zephyr": {**CLAUDE_TEMPLATES, **INSTRUCTION_TEMPLATES},
    # gemma-2b-it removed from template mapping
    
    # Small models
    "gemma3:1b": {**SMALL_MODEL_TEMPLATES},
    
    # Multimodal models
    "llava-phi3": {**CLAUDE_TEMPLATES, **MULTIMODAL_TEMPLATES},
}

# Default for unknown models
DEFAULT_TEMPLATES = CLAUDE_TEMPLATES

def get_templates_for_model(model_name):
    """Return the appropriate template set for a specific model."""
    # Find the closest match if exact model not found
    for model_pattern, templates in MODEL_TEMPLATE_MAPPING.items():
        if model_pattern in model_name:
            return templates
    return DEFAULT_TEMPLATES

def fill_template(template_name, model_name, **kwargs):
    """Fill a template with provided values."""
    templates = get_templates_for_model(model_name)
    
    if template_name not in templates:
        raise ValueError(f"Template '{template_name}' not found for model '{model_name}'")
    
    template_data = templates[template_name]
    template_text = template_data["template"]
    
    # Replace placeholders with provided values
    for key, value in kwargs.items():
        placeholder = "{" + key + "}"
        template_text = template_text.replace(placeholder, value)
    
    return template_text

def list_templates_for_model(model_name):
    """Return the list of available templates for a model."""
    templates = get_templates_for_model(model_name)
    
    result = []
    for key, template in templates.items():
        result.append({
            "id": key,
            "name": template["name"],
            "description": template["description"],
            "placeholders": template["placeholders"],
            "use_cases": template.get("use_cases", []),
            "example_filled": template.get("example_filled", {})
        })
    
    return result
