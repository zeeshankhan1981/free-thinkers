"""
Smart Context Management for Free Thinkers
Optimizes conversation history to maximize effective context window usage
"""

import json
import os
from pathlib import Path
import nltk
import re
from datetime import datetime
import hashlib

# Initialize NLTK for text processing (download if not already present)
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt', quiet=True)

# Constants
MAX_CONTEXT_WINDOW = 4096  # Maximum context window size in tokens
TOKENS_PER_MESSAGE = 4  # Overhead tokens per message for role, formatting, etc.
APPROX_CHARS_PER_TOKEN = 4  # Approximate number of characters per token
AGGRESSIVE_SUMMARIZATION_THRESHOLD = 0.85  # When to use aggressive summarization (% of context window)

# Directory for storing summaries
SUMMARIES_DIR = Path(os.path.expanduser("~/.freethinkers/summaries/"))

class ContextManager:
    """
    Manages conversation context to optimize for token usage and context relevance
    """
    
    def __init__(self, model_name=None):
        """Initialize the context manager."""
        self.model_name = model_name
        self.context_window = MAX_CONTEXT_WINDOW
        self.summaries = {}
        self.load_summaries()
        
        # Ensure summaries directory exists
        SUMMARIES_DIR.mkdir(parents=True, exist_ok=True)
    
    def load_summaries(self):
        """Load existing summaries from disk."""
        try:
            if not SUMMARIES_DIR.exists():
                return
                
            for file in SUMMARIES_DIR.glob("*.json"):
                try:
                    with open(file, 'r') as f:
                        summary_data = json.load(f)
                        thread_id = file.stem
                        self.summaries[thread_id] = summary_data
                except Exception as e:
                    print(f"Error loading summary file {file}: {e}")
        except Exception as e:
            print(f"Error loading summaries: {e}")
    
    def save_summary(self, thread_id, summary_data):
        """Save a conversation summary to disk."""
        try:
            summary_file = SUMMARIES_DIR / f"{thread_id}.json"
            with open(summary_file, 'w') as f:
                json.dump(summary_data, f, indent=2)
        except Exception as e:
            print(f"Error saving summary: {e}")
    
    def optimize_context(self, messages, context_window=None, thread_id=None):
        """
        Optimize a conversation context to fit within the context window
        
        Args:
            messages: List of message objects with 'role' and 'content' keys
            context_window: Maximum context window size in tokens
            thread_id: Optional thread ID for persistent summaries
        
        Returns:
            Optimized list of messages
        """
        if not messages:
            return []
            
        # Use provided context window or default
        self.context_window = context_window or self.context_window
        
        # Count estimated tokens in conversation
        total_tokens = self.estimate_token_count(messages)
        
        # If within limits, return as is
        if total_tokens <= self.context_window:
            return messages
            
        # Load existing summary if available
        summary = None
        if thread_id and thread_id in self.summaries:
            summary = self.summaries[thread_id]
        
        # Determine optimization strategy based on token count
        if total_tokens <= self.context_window * 1.2:
            # Light optimization - trim early messages
            return self.light_optimization(messages)
        elif total_tokens <= self.context_window * AGGRESSIVE_SUMMARIZATION_THRESHOLD:
            # Medium optimization - summarize older parts
            return self.medium_optimization(messages, summary, thread_id)
        else:
            # Heavy optimization - extract key information
            return self.heavy_optimization(messages, summary, thread_id)
    
    def light_optimization(self, messages):
        """Light optimization - trim early messages but keep recent ones intact."""
        if len(messages) <= 4:
            return messages
            
        # Keep the essential context
        # Always keep system messages if present
        system_messages = [msg for msg in messages if msg.get('role') == 'system']
        
        # Always keep the most recent messages
        recent_count = min(len(messages), 6)  # Keep at least last 6 messages
        recent_messages = messages[-recent_count:]
        
        # Estimate tokens in kept messages
        kept_tokens = self.estimate_token_count(system_messages + recent_messages)
        remaining_tokens = self.context_window - kept_tokens
        
        # If we have room for more messages, add more in reverse order
        additional_messages = []
        for msg in reversed(messages[:-recent_count]):
            msg_tokens = self.estimate_token_count([msg])
            if msg_tokens <= remaining_tokens:
                additional_messages.insert(0, msg)
                remaining_tokens -= msg_tokens
            else:
                break
        
        return system_messages + additional_messages + recent_messages
    
    def medium_optimization(self, messages, existing_summary=None, thread_id=None):
        """Medium optimization - summarize older messages, keep recent ones intact."""
        if len(messages) <= 6:
            return messages
            
        # Determine split point - keep last 8 messages intact
        split_point = max(0, len(messages) - 8)
        
        # Keep system messages if present
        system_messages = [msg for msg in messages if msg.get('role') == 'system']
        
        # Messages to summarize and recent messages to keep
        to_summarize = messages[:split_point]
        to_keep = messages[split_point:]
        
        # If we already have a summary and are just adding messages, use it
        if existing_summary and len(existing_summary.get('summarized_messages', [])) < len(to_summarize):
            # Get estimated token count for summary message + recent messages
            summary_message = {
                'role': 'system',
                'content': existing_summary.get('summary_text', 'Previous conversation context')
            }
            
            kept_tokens = self.estimate_token_count(system_messages + [summary_message] + to_keep)
            
            # If it fits, use it
            if kept_tokens <= self.context_window:
                return system_messages + [summary_message] + to_keep
        
        # Generate a new summary
        summary_text = self.summarize_messages(to_summarize)
        
        # Create a summary message
        summary_message = {
            'role': 'system',
            'content': f"Previous conversation summary: {summary_text}"
        }
        
        # Save the summary if thread_id is provided
        if thread_id:
            self.summaries[thread_id] = {
                'summary_text': summary_text,
                'summarized_messages': to_summarize,
                'timestamp': datetime.now().isoformat(),
                'message_count': len(to_summarize)
            }
            self.save_summary(thread_id, self.summaries[thread_id])
        
        return system_messages + [summary_message] + to_keep
    
    def heavy_optimization(self, messages, existing_summary=None, thread_id=None):
        """Heavy optimization - aggressive summarization and key information extraction."""
        # Keep system messages if present
        system_messages = [msg for msg in messages if msg.get('role') == 'system']
        
        # Always keep the very last 4 exchanges (user + assistant pairs)
        to_keep = messages[-min(8, len(messages)):]
        
        # Messages to summarize (everything else)
        to_summarize = messages[:-len(to_keep)] if len(messages) > len(to_keep) else []
        
        # Generate a condensed summary focusing on key information
        summary_text = self.summarize_messages(to_summarize, is_heavy=True)
        
        # Create a summary message with clear indication of heavy summarization
        summary_message = {
            'role': 'system',
            'content': f"IMPORTANT CONTEXT SUMMARY: Due to conversation length, earlier messages have been condensed. Key points: {summary_text}"
        }
        
        # Ensure we're within token limits
        optimized_messages = system_messages + [summary_message] + to_keep
        
        # If still over limit, further reduce keep count and summarize more
        while self.estimate_token_count(optimized_messages) > self.context_window and len(to_keep) > 2:
            # Remove oldest messages from to_keep
            to_summarize.append(to_keep.pop(0))
            
            # Re-summarize
            summary_text = self.summarize_messages(to_summarize, is_heavy=True)
            summary_message['content'] = f"IMPORTANT CONTEXT SUMMARY: Due to conversation length, earlier messages have been condensed. Key points: {summary_text}"
            
            # Update optimized messages
            optimized_messages = system_messages + [summary_message] + to_keep
        
        # Save the summary if thread_id is provided
        if thread_id:
            self.summaries[thread_id] = {
                'summary_text': summary_text,
                'summarized_messages': to_summarize,
                'timestamp': datetime.now().isoformat(),
                'message_count': len(to_summarize),
                'is_heavy': True
            }
            self.save_summary(thread_id, self.summaries[thread_id])
        
        return optimized_messages
    
    def summarize_messages(self, messages, is_heavy=False):
        """
        Summarize a list of messages into a concise summary.
        
        This is a rule-based extractive summarization approach to avoid loading an additional ML model.
        For production use, consider using a dedicated summarization model or service.
        """
        if not messages:
            return "No previous conversation."
            
        # Extract all message content
        all_text = "\n".join([msg.get('content', '') for msg in messages])
        
        # Tokenize into sentences
        sentences = nltk.sent_tokenize(all_text)
        
        if not sentences:
            return "No meaningful content to summarize."
            
        if is_heavy:
            # For heavy summarization, extract only the most important information
            return self.extract_key_information(messages)
        
        # Simple extractive summarization
        # Calculate sentence importance scores (simple heuristic based on length and position)
        scores = {}
        for i, sentence in enumerate(sentences):
            # Score based on sentence length (longer sentences may contain more information)
            length_score = min(len(sentence.split()) / 20, 1.0)
            
            # Score based on position (earlier and later sentences tend to be more important)
            position = i / len(sentences)
            position_score = 1.0 - abs(position - 0.5) * 2
            
            # Check for question marks (questions are usually important context)
            question_score = 1.5 if '?' in sentence else 1.0
            
            # Check for quotes (quoted text is usually important)
            quote_score = 1.2 if ('"' in sentence or "'" in sentence) else 1.0
            
            # Check for numbers (factual information)
            number_score = 1.2 if re.search(r'\d', sentence) else 1.0
            
            # Calculate final score
            final_score = length_score * position_score * question_score * quote_score * number_score
            scores[i] = final_score
        
        # Sort sentences by score
        ranked_sentences = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        
        # Select top 30% of sentences
        summary_count = max(3, int(len(sentences) * 0.3))
        selected_indices = [idx for idx, _ in ranked_sentences[:summary_count]]
        selected_indices.sort()  # Sort to maintain original order
        
        # Build summary from selected sentences
        summary_sentences = [sentences[idx] for idx in selected_indices]
        summary = " ".join(summary_sentences)
        
        # If summary is too long, further reduce
        if len(summary) > 1000:
            summary = summary[:997] + "..."
            
        return summary
    
    def extract_key_information(self, messages):
        """Extract only the most critical information from messages."""
        # Extract key patterns that often represent important information
        key_info = []
        
        # Regular expressions for important information
        patterns = [
            # Questions
            r'(?:^|\.\s|\n)([^.!?]*\?)',
            # Information containing numbers or dates
            r'(?:^|\.\s|\n)([^.!?]*(?:\d+(?:st|nd|rd|th)?|January|February|March|April|May|June|July|August|September|October|November|December)[^.!?]*[.!?])',
            # Statements with keywords suggesting importance
            r'(?:^|\.\s|\n)([^.!?]*(?:important|critical|essential|key|main|significant|must|should)[^.!?]*[.!?])',
            # Quoted information
            r'(?:\'|")([^\'"]+)(?:\'|")',
            # Lists (often contain key points)
            r'(?:^|\n)\s*[•\-\*\d+\.\s]+([^\n]+)'
        ]
        
        # Extract text that matches any pattern
        for msg in messages:
            content = msg.get('content', '')
            for pattern in patterns:
                matches = re.findall(pattern, content, re.IGNORECASE)
                for match in matches:
                    key_info.append(match.strip())
        
        # Remove duplicates while preserving order
        seen = set()
        unique_info = [info for info in key_info if not (info in seen or seen.add(info))]
        
        # If we have too many items, prioritize
        if len(unique_info) > 10:
            # Keep the first and last few items (usually most important)
            unique_info = unique_info[:4] + unique_info[-4:]
        
        # Combine into a concise summary
        if unique_info:
            summary = " ".join(unique_info)
            if len(summary) > 800:
                summary = summary[:797] + "..."
            return summary
        
        # Fallback if no key information found
        return "Previous messages contained conversation history that has been condensed for context management."
    
    def estimate_token_count(self, messages):
        """Estimate token count for a list of messages using character-based approximation."""
        if not messages:
            return 0
            
        total_chars = sum(len(msg.get('content', '')) for msg in messages)
        message_overhead = len(messages) * TOKENS_PER_MESSAGE
        
        # Estimate tokens based on characters
        content_tokens = total_chars // APPROX_CHARS_PER_TOKEN
        
        return content_tokens + message_overhead
    
    def get_thread_cache_key(self, thread_id, messages):
        """Generate a cache key for a thread to avoid redundant summarization."""
        if not thread_id or not messages:
            return None
            
        # Hash the message contents
        message_hash = hashlib.md5()
        for msg in messages:
            content = msg.get('content', '')
            role = msg.get('role', '')
            message_hash.update(f"{role}:{content}".encode('utf-8'))
            
        return f"{thread_id}_{message_hash.hexdigest()}"
    
    def get_messages_token_usage(self, messages):
        """Get token usage information for the current messages."""
        total_tokens = self.estimate_token_count(messages)
        
        return {
            "total_tokens": total_tokens,
            "context_window": self.context_window,
            "usage_percentage": (total_tokens / self.context_window) * 100,
            "is_optimized": total_tokens > self.context_window,
            "optimization_level": self.get_optimization_level(total_tokens)
        }
    
    def get_optimization_level(self, total_tokens):
        """Get the optimization level for the current token count."""
        if total_tokens <= self.context_window:
            return "none"
        elif total_tokens <= self.context_window * 1.2:
            return "light"
        elif total_tokens <= self.context_window * AGGRESSIVE_SUMMARIZATION_THRESHOLD:
            return "medium"
        else:
            return "heavy"