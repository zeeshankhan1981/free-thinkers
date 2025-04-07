# Model-Specific Prompt Templates

This guide adapts the Claude Sonnet 3.7 prompting techniques to each of your Ollama models, considering their unique characteristics and capabilities.

## llava-phi3 (Multimodal)

### Expert Visual Analysis
```
You are a computer vision expert with decades of experience in image analysis. Analyze this image with the depth and precision of a specialist.

Important considerations:
- Identify all key visual elements and their relationships
- Note any unusual or unexpected features
- Assess the quality and composition
- Consider the context and purpose of the image

Format your response with clear section headings and concise insights.
```

### Structured Visual Output
```
Analyze this image and provide a comprehensive breakdown.

Structure your response as follows:
1. Overview (3 bullet points describing the main elements)
2. Detailed Elements (list each significant object/person/text with brief description)
3. Composition Analysis (lighting, framing, focal points)
4. Context Interpretation (likely purpose, setting, significance)
5. Technical Assessment (image quality, modifications, anomalies)

Keep responses concise yet complete.
```

### Visual Reasoning Task
```
Examine this image carefully. I need you to:
1. Identify all text visible in the image
2. Describe the spatial relationship between objects
3. Analyze any charts, graphs, or diagrams present
4. Identify any inconsistencies or unusual elements
5. Suggest what might be outside the frame based on context clues

Think methodically and describe what you see step by step.
```

## llama3.1:8b and llama3.2 (Larger Models)

### Expert Analysis
```
You are a leading expert in [domain] with comprehensive knowledge. Analyze [topic] with depth and precision.

Consider:
- Core principles and emerging trends
- Common misconceptions
- Practical applications
- Future implications

Provide a well-structured analysis with clear sections and evidence-based insights.
```

### Creative Generation
```
Generate [content type] about [topic] in the style of [reference].

Guidelines:
- Capture the distinctive voice and structure of the reference style
- Include creative elements like [specific elements]
- Balance creativity with coherence
- Length: approximately [word count] words

Themes to include: [theme 1], [theme 2], [theme 3]
```

### Complex Reasoning
```
I need a solution to this problem: [detailed problem description]

Follow these steps:
1. Identify key components
2. Consider multiple approaches
3. Evaluate each approach
4. Select and justify the best solution
5. Outline implementation steps

Think step-by-step and explain your reasoning clearly.
```

## mistral-7b (Strong Reasoning)

### Academic Analysis
```
As a research scholar in [field], provide a rigorous analysis of [topic].

Your analysis should:
- Apply established theoretical frameworks
- Evaluate existing research
- Identify gaps in current understanding
- Propose new perspectives

Structure your response with clear sections, precise terminology, and logical flow.
```

### Decision Framework
```
Help me evaluate this decision: [decision context]

Approach using this framework:
1. Define objectives and constraints
2. Identify available options
3. Analyze each option (pros/cons)
4. Consider potential outcomes and probabilities
5. Recommend optimal approach with justification

Maintain logical consistency and consider both quantitative and qualitative factors.
```

### Critical Evaluation
```
Critically evaluate the following [statement/argument/theory]:

[content to evaluate]

Structure your evaluation:
1. Summary of main claims (1 paragraph)
2. Strength analysis (3 key strengths with examples)
3. Weakness analysis (3 key weaknesses with examples)
4. Alternative perspectives (2-3 counterarguments)
5. Balanced conclusion

Apply rigorous analytical standards and avoid bias.
```

## phi3:3.8b (Coding & Logical Reasoning)

### Code Generation
```
Write a [language] function that [function purpose].

Requirements:
- Handle these edge cases: [list cases]
- Follow these design patterns: [patterns]
- Optimize for [performance/readability/etc.]
- Include error handling

First outline your approach, then implement the solution step by step.
```

### Technical Explanation
```
Explain [technical concept] clearly and accurately.

Your explanation should:
- Start with a simple definition
- Explain core mechanisms
- Provide a practical example
- Compare with related concepts
- Address common misconceptions

Use precise terminology but maintain accessibility.
```

### Algorithm Design
```
Design an algorithm to solve this problem: [problem description]

Your response should include:
1. Problem breakdown
2. Algorithm approach and justification
3. Pseudocode implementation
4. Time and space complexity analysis
5. Potential optimizations

Focus on efficiency, correctness, and readability.
```

## gemma3:4b and gemma-2b-it (Balanced & Instruction-tuned)

### Balanced Analysis
```
Provide a balanced analysis of [topic/issue].

Structure your response:
1. Overview (neutral description)
2. Perspective A (key arguments and evidence)
3. Perspective B (key arguments and evidence)
4. Common ground and nuances
5. Synthesis of key insights

Present multiple viewpoints fairly and avoid bias.
```

### Instructional Guide
```
Create a step-by-step guide for [task].

Your guide should:
- Begin with necessary prerequisites
- Break the process into clear, logical steps
- Include helpful tips at key decision points
- Address common mistakes or challenges
- End with verification steps to ensure success

Make instructions specific and actionable.
```

### Information Synthesis
```
Synthesize the key information about [topic].

Format your response as:
1. Core definition (1-2 sentences)
2. Key components (bulleted list)
3. Important relationships and patterns
4. Practical applications
5. Essential takeaways

Focus on accuracy and clarity.
```

## gemma3:1b and Small Models

### Concise Query
```
[Single specific question about topic]

Provide a direct, accurate response in 3 sentences or less.
```

### Simple Task
```
Help me with this specific task: [clear task description]

Provide a straightforward solution focusing only on essential information.
```

### Focused Explanation
```
Explain [narrow specific concept].

Keep your explanation under 100 words while covering the essential points.
```

## llama2-uncensored:7b

### Creative Fiction
```
Write a [genre] story involving [elements].

Guidelines:
- Include complex characters with flawed motivations
- Explore mature themes realistically
- Create an engaging narrative arc
- Don't shy away from controversial elements when relevant to the story

Approximate length: [word count] words.
```

### Debate Preparation
```
Help me prepare arguments for a debate on [controversial topic].

For each position:
1. Strongest supporting arguments with evidence
2. Anticipated counterarguments and rebuttals
3. Historical context and precedents
4. Ethical considerations
5. Practical implications

Present all perspectives thoroughly without filtering.
```

### Philosophical Inquiry
```
Explore this philosophical question without limitations: [philosophical question]

Approach from these angles:
- Classical philosophical frameworks
- Modern interpretations
- Controversial perspectives
- Logical extrapolations
- Personal reflection framework

Aim for intellectual depth rather than conventional wisdom.
```

## zephyr (Instruction-following)

### Multi-step Task
```
Complete this multi-step task:

1. [First subtask with specific instructions]
2. Using the result from step 1, [second subtask]
3. [Third subtask] and explain your reasoning
4. Finalize by [final task]

Follow each step precisely and maintain consistency throughout.
```

### Format Transformation
```
Transform the following [input format] into [output format]:

[content to transform]

Follow these formatting requirements:
- [specific requirement 1]
- [specific requirement 2]
- [specific requirement 3]

Ensure complete accuracy in the transformation.
```

### Guided Reasoning
```
Help me think through this problem: [problem description]

Follow this reasoning process:
1. Identify key variables and constraints
2. Generate initial hypotheses
3. Test each hypothesis against available evidence
4. Refine understanding based on logical inconsistencies
5. Draw conclusions and identify remaining uncertainties

Explain your thinking at each step.
```

## Prompt Adaptation Strategies

### For Multimodal Models (llava-phi3)
1. **Specify visual elements**: Be explicit about what aspects of the image to analyze
2. **Request granular descriptions**: Ask for details about specific regions or elements
3. **Combine text and visual tasks**: Integrate visual analysis with textual reasoning
4. **Limit output length**: Request concise responses to manage generation quality

### For Larger Models (llama3.1:8b, llama3.2, mistral-7b)
1. **Leverage context window**: Provide comprehensive background information
2. **Use detailed instructions**: Break complex tasks into clear steps
3. **Request self-assessment**: Ask the model to evaluate its own reasoning
4. **Implement chain-of-thought**: Guide through explicit reasoning steps

### For Smaller Models (gemma3:1b, phi3:3.8b)
1. **Simplify tasks**: Break complex requests into smaller, manageable subtasks
2. **Reduce output expectations**: Request shorter, more focused responses
3. **Provide clear examples**: Include sample outputs directly in the prompt
4. **Use direct questioning**: Formulate specific queries rather than open-ended requests

### For Instruction-tuned Models (zephyr, gemma-2b-it)
1. **Format as clear instructions**: Use imperative language and explicit directives
2. **Specify output structure**: Provide clear templates for responses
3. **Layer instructions**: Start with basic tasks before adding complexity
4. **Include evaluation criteria**: Specify how to assess the quality of responses

## Evaluation Checklist

When evaluating prompt effectiveness across models:

1. **Instruction Clarity**: Is the task clearly defined for the specific model?
2. **Response Relevance**: Does the output directly address the prompt's requirements?
3. **Completion Quality**: Is the response complete, coherent, and accurate?
4. **Format Adherence**: Does the output follow the requested structure?
5. **Model-Specific Optimization**: Does the prompt leverage the model's unique strengths?

Regularly review and refine your prompts based on the actual outputs received from each model.