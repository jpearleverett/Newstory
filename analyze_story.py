#!/usr/bin/env python3
"""
Script to analyze branching story structure, check for inconsistencies,
verify condition swaps, and count words in each subchapter.
"""
import docx
import re
import os
from collections import defaultdict
from pathlib import Path

def read_docx(filepath):
    """Read text from a docx file."""
    try:
        doc = docx.Document(filepath)
        text = '\n'.join([para.text for para in doc.paragraphs])
        return text
    except Exception as e:
        return f'Error reading {filepath}: {str(e)}'

def count_words(text):
    """Count words in text."""
    if not text or text.startswith('Error'):
        return 0
    words = re.findall(r'\b\w+\b', text)
    return len(words)

def extract_conditions(text):
    """Extract condition swaps and references from text."""
    # Look for patterns like [IF condition], {condition}, *condition*, etc.
    conditions = []
    
    # Pattern for [IF ...] or [if ...]
    if_pattern = r'\[IF\s+([^\]]+)\]|\[if\s+([^\]]+)\]'
    conditions.extend(re.findall(if_pattern, text, re.IGNORECASE))
    
    # Pattern for {condition}
    brace_pattern = r'\{([^}]+)\}'
    conditions.extend(re.findall(brace_pattern, text))
    
    # Pattern for *condition* or **condition**
    star_pattern = r'\*+([^*]+)\*+'
    conditions.extend(re.findall(star_pattern, text))
    
    # Pattern for explicit condition swaps
    swap_pattern = r'(?:condition|swap|if|when).*?(?:path|choice|decision|option)'
    conditions.extend(re.findall(swap_pattern, text, re.IGNORECASE))
    
    return [c for c in conditions if c]

def analyze_chapters():
    """Analyze all chapter files."""
    story_dir = Path('/workspace/story-revised')
    results = {
        'chapters': {},
        'word_counts': {},
        'conditions': {},
        'issues': []
    }
    
    # Read all chapter files
    for filepath in sorted(story_dir.glob('*.docx')):
        filename = filepath.name
        text = read_docx(filepath)
        word_count = count_words(text)
        conditions = extract_conditions(text)
        
        results['chapters'][filename] = text
        results['word_counts'][filename] = word_count
        results['conditions'][filename] = conditions
        
        # Check for minimum word count (500+)
        if word_count < 500 and 'Chapter' in filename:
            results['issues'].append(f"{filename}: Only {word_count} words (minimum 500 required)")
    
    return results

if __name__ == '__main__':
    results = analyze_chapters()
    
    print("=== WORD COUNTS ===")
    for filename, count in sorted(results['word_counts'].items()):
        status = "✓" if count >= 500 else "✗"
        print(f"{status} {filename}: {count} words")
    
    print("\n=== ISSUES FOUND ===")
    for issue in results['issues']:
        print(f"  - {issue}")
    
    print(f"\n=== TOTAL CHAPTERS ANALYZED: {len(results['chapters'])} ===")
