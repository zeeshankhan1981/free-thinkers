# Prompt Engineering Roadmap

## Introduction
This guide provides a structured approach to prompt engineering across different Ollama models. It covers basic to advanced techniques, model-specific strategies, and evaluation methods.

## Available Models Analysis

| Model | Size | Type | Specialty | Best For |
|-------|------|------|-----------|----------|
| llava-phi3 | 2.9 GB | Multimodal | Vision + Language | Visual analysis, image description, visual reasoning |
| gemma3:4b | 3.3 GB | Text | Balanced | General knowledge, coherent text, balanced responses |
| llama3.1:8b | 4.9 GB | Text | General purpose | Creative writing, longer contexts, nuanced responses |
| llama2-uncensored:7b | 3.8 GB | Text | Uncensored | Raw outputs without guardrails |
| phi3:3.8b | 2.2 GB | Text | Compact & efficient | Coding, logical reasoning, efficient inference |
| zephyr | 4.1 GB | Text | Instruction-tuned | Following complex instructions, helpful responses |
| gemma3:1b | 815 MB | Text | Small & fast | Quick responses, basic tasks, edge devices |
| llama3.2 | 2.0 GB | Text | Latest tech | Latest capabilities, modern reasoning |
| mistral-7b | 4.4 GB | Text | Strong reasoning | Complex problem-solving, nuanced understanding |
| gemma-2b-it | 10 GB | Text | Instruction-tuned | Following detailed instructions, helpful assistant |

## Core Prompt Engineering Techniques

### 1. Basic Techniques
- **Zero-shot prompting**: Direct instructions without examples
- **Few-shot prompting**: Including examples in the prompt
- **Chain-of-thought**: Breaking down reasoning steps
- **Self-consistency**: Generating multiple reasoning paths
- **Prompt chaining**: (Feature removed; see single-model prompt engineering section)

### 2. Intermediate Techniques
- **Role prompting**: Assigning specific roles to the model
- **Format control**: Specifying output structure
- **Template creation**: Building reusable prompt templates
- **Constraint-based prompting**: Setting boundaries and limitations

### 3. Advanced Techniques
- **ReAct**: Reasoning + Action patterns
- **Tree of Thoughts**: Exploring multiple reasoning branches
- **Single-model prompt engineering**: Optimizing prompts for individual models
- **Retrieval-augmented prompting**: Incorporating external knowledge

## Model-Specific Strategies

### llava-phi3 (Multimodal)
- **Image analysis prompts**: "Analyze this image and describe all visible elements."
- **Visual reasoning prompts**: "What inconsistencies do you notice in this image?"
- **Image + text integration**: "Based on this image and the context I'll provide..."
- **Specific detail extraction**: "Focus only on the text visible in this image."

### Language Models (llama3.1, llama3.2, mistral-7b)
- **Detailed context setting**: Provide comprehensive background
- **Persona definition**: Clear role assignment
- **Output format specification**: Exact template definition
- **Step-by-step reasoning**: Breaking down complex problems

### Smaller Models (gemma3:1b, phi3:3.8b)
- **Concise instructions**: Short, clear prompts
- **Task simplification**: Breaking into smaller subtasks
- **Reduced context**: Focusing on essential information
- **Direct questioning**: Specific, focused queries

## Evaluation Framework

### 1. Objective Metrics
- Output relevance to prompt
- Adherence to instructions
- Factual accuracy
- Coherence and consistency

### 2. Subjective Assessment
- Creativity and originality
- Nuance and insight
- Communication effectiveness
- Overall usefulness

### 3. Task-Specific Evaluation
- Development of custom rubrics for specialized tasks
- Comparative analysis across models
- Performance tracking across prompt variations

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- Document baseline performance of each model
- Establish prompt templates for common tasks
- Develop initial evaluation metrics

### Phase 2: Optimization (Week 3-4)
- Fine-tune prompts for each model type
- Implement advanced techniques
- Build prompt library for reuse

### Phase 3: Specialization (Week 5-6)
- Develop domain-specific prompt strategies
- Create advanced multimodal workflows
- Establish complex reasoning frameworks

### Phase 4: Integration (Week 7-8)
- Automate prompt generation
- Implement hybrid model approaches
- Optimize single-model prompts

## Specialized Use Cases

### 1. Code Generation
- **Target models**: phi3:3.8b, llama3.1:8b
- **Techniques**: Step-by-step code breakdown, pattern-based prompting
- **Example**: "Write a Python function that [function purpose]. Include error handling and follow these patterns: [examples]."

### 2. Creative Writing
- **Target models**: llama3.1:8b, llama3.2
- **Techniques**: Character definitions, scene setting, style guidance
- **Example**: "Write in the style of [author]. Set the scene with [elements]. Include dialogue between [characters]."

### 3. Visual Analysis
- **Target models**: llava-phi3
- **Techniques**: Directed attention, comparative analysis
- **Example**: "Compare the visual elements in this image to standard [domain] conventions. Identify anomalies."

### 4. Knowledge Extraction
- **Target models**: mistral-7b, llama3.1:8b
- **Techniques**: Structured queries, format specification
- **Example**: "Extract all [entities] from the following text and organize them into a table with columns: [columns]."

## Appendix: Prompt Templates Library

### General Templates
```
[Role/Context Setting]

[Background Information]

[Specific Task]

[Output Format Requirements]

[Additional Constraints]
```

### Model-Specific Templates
```
# For llama3.1:8b
System: You are a [role] specialized in [domain]. Follow these guidelines: [guidelines].
User: [task description]
```

```
# For llava-phi3
Analyze this image focusing on [specific elements].
Provide your analysis in the following format:
1. [section]
2. [section]
...
```

```
# For smaller models (gemma3:1b)
[Concise task description]
Output format: [format]
```

## Claude Sonnet 3.7 Prompt Engineering

Claude Sonnet 3.7 is Anthropic's powerful model with strong reasoning, instruction-following, and context handling capabilities. The following prompts target Claude's strengths:

### System Prompts for Different Tasks

#### Expert Analysis
```
You are a world-class expert in [domain] with decades of experience. Analyze the following [topic/problem] with the depth, nuance, and precision of a leading specialist in the field.

Important considerations:
- Apply cutting-edge frameworks from [domain]
- Identify non-obvious implications
- Consider contrarian viewpoints
- Highlight uncertainties where relevant

Format your response with clear section headings, concise insights, and actionable takeaways.
```

#### Structured Output Generation
```
Provide a detailed, comprehensive analysis of [topic]. 

Structure your response in the following format:
1. Summary (3 bullet points)
2. Background Context (2-3 paragraphs)
3. Key Factors (numbered list with 1-2 sentence explanations)
4. Evidence-Based Analysis (3-4 paragraphs)
5. Actionable Recommendations (5 specific items)
6. Potential Challenges (3 items with mitigation strategies)

Maintain accuracy, analytical depth, and professional tone throughout.
```

#### Creative Generation 
```
I need you to generate [content type] about [topic] in the style of [reference]. 

Guidelines:
- Capture the distinctive voice, vocabulary, and sentence structure of the reference style
- Incorporate [specific elements] that are characteristic of the style
- Balance authenticity with readability
- Length: approximately [word count] words

Include the following themes: [theme 1], [theme 2], [theme 3].
```

#### Complex Reasoning
```
I need you to solve the following complex problem: [detailed problem description]

Approach this problem using these steps:
1. Identify the core components and variables
2. Frame the problem using appropriate mental models
3. Generate multiple solution approaches (at least 3)
4. Evaluate each approach with pros/cons
5. Select the optimal solution and explain your reasoning
6. Outline implementation steps

Think step-by-step, making your reasoning explicit at each stage. Consider edge cases and potential failure modes.
```

#### Concise Expert
```
You are the world's foremost expert in [domain]. You communicate with exceptional clarity and precision.

Explain [complex topic] in the most accurate yet accessible way possible. Your explanation should:
- Focus on the most fundamental concepts
- Use precise terminology where necessary (with brief definitions)
- Eliminate unnecessary complexity
- Use analogies where they clarify (not oversimplify)

Your response must be under [word limit] words while maintaining complete accuracy.
```

### Effective Techniques for Claude

1. **Detailed Instructions**: Claude responds well to comprehensive, detailed instructions rather than vague requests.

2. **Multi-step Reasoning**: For complex tasks, guide Claude through a specific reasoning process:
   ```
   Solve this problem using the following steps:
   1. Identify the key variables
   2. Apply relevant formulas
   3. Calculate intermediate results
   4. Synthesize final answer
   ```

3. **Role Definition**: Claude performs better when given a specific expert role:
   ```
   You are a distinguished professor of [subject] with 30 years of research experience in [specific area].
   ```

4. **Output Format Control**: Specify exactly how you want information structured:
   ```
   Format your response as a markdown table with these columns: [column1], [column2], [column3]
   ```

5. **Few-shot Examples**: Provide 2-3 high-quality examples of desired outputs:
   ```
   Here are examples of the analysis I'm looking for:
   
   Example 1:
   [detailed example]
   
   Example 2:
   [detailed example]
   ```

6. **Persona Consistency**: Maintain a consistent persona throughout multi-turn conversations:
   ```
   Continue acting as the financial analyst from our previous exchange. Remember to apply the same analytical framework and terminology.
   ```

7. **Knowledge Access**: For domain-specific tasks, provide key references:
   ```
   When analyzing this problem, incorporate these key principles from [domain]:
   - [principle 1]
   - [principle 2]
   - [principle 3]
   ```

8. **Boundary Setting**: Set clear constraints for the response:
   ```
   Important constraints:
   - Stay within [specific scope]
   - Do not discuss [excluded topics]
   - Focus primarily on [priority areas]
   - Limit your response to [word count] words
   ```

## Resources and References

- [LLM Prompt Engineering Guide](https://www.promptingguide.ai/)
- [Anthropic's Constitutional AI](https://www.anthropic.com/research/constitutional-ai)
- [Prompt Engineering Patterns](https://promptingguide.ai/techniques/prompt-patterns)
- [OpenAI Cookbook](https://cookbook.openai.com/)
- [Anthropic's Claude Documentation](https://docs.anthropic.com/claude/docs/introduction-to-prompting)