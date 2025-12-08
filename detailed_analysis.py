#!/usr/bin/env python3
"""
Detailed analysis of branching story focusing on convergence points
and condition swaps in chapters 6-7 and 9-10.
"""
import docx
import re
import json
from pathlib import Path
from collections import defaultdict

def read_docx(filepath):
    """Read text from a docx file."""
    try:
        doc = docx.Document(filepath)
        text = '\n'.join([para.text for para in doc.paragraphs])
        return text
    except Exception as e:
        return f'Error reading {filepath}: {str(e)}'

def extract_condition_swaps(text):
    """Extract condition swaps, IF statements, and path-specific content."""
    conditions = []
    
    # Look for explicit condition markers
    patterns = [
        r'\[IF\s+([^\]]+)\]',  # [IF condition]
        r'\[if\s+([^\]]+)\]',  # [if condition]
        r'\{([^}]+)\}',  # {condition}
        r'\*+([^*]+)\*+',  # *condition* or **condition**
        r'IF\s+([A-Za-z0-9\s,]+?)(?:THEN|:|\.|$)',  # IF condition THEN
        r'if\s+([A-Za-z0-9\s,]+?)(?:then|:|\.|$)',  # if condition then
    ]
    
    for pattern in patterns:
        matches = re.findall(pattern, text, re.IGNORECASE | re.MULTILINE)
        conditions.extend(matches)
    
    # Look for path references
    path_refs = re.findall(r'(?:path|Path|PATH)\s*([A-Za-z0-9\-]+)', text)
    conditions.extend(path_refs)
    
    # Look for choice references
    choice_refs = re.findall(r'(?:choice|Choice|CHOICE|option|Option|OPTION)\s*([A-Za-z0-9]+)', text)
    conditions.extend(choice_refs)
    
    return list(set([c.strip() for c in conditions if c.strip()]))

def extract_character_references(text):
    """Extract references to characters, choices, and story elements."""
    # Common character names and story elements
    characters = ['Kael', 'Miller', 'Lila', 'Thorne', 'Whisper', 'Surgeon']
    refs = {}
    
    for char in characters:
        pattern = rf'\b{char}\b'
        matches = re.findall(pattern, text, re.IGNORECASE)
        refs[char] = len(matches)
    
    return refs

def analyze_convergence_chapters():
    """Analyze chapters 6-7 and 9-10 for condition swaps."""
    story_dir = Path('/workspace/story-revised')
    
    # Map chapter 5 paths to chapter 6 scenarios
    # 16 paths in chapter 5: 1A-1, 1A-2, 1B-1, 1B-2, 2A-1, 2A-2, 2B-1, 2B-2,
    #                       3A-1, 3A-2, 3B-1, 3B-2, 4A-1, 4A-2, 4B-1, 4B-2
    # Converge to 4 scenarios: A, B, C, D
    
    # Map chapter 6 scenarios to chapter 7 states
    # 4 scenarios in chapter 6: A, B, C, D
    # Converge to 2 states: X, Y
    
    # Map chapter 8 paths to chapter 9 paths
    # 4 paths in chapter 8: Alpha, Beta, Delta, Gamma
    # Branch to 8 paths in chapter 9: I, II, III, IV, V, VI, VII, VIII
    
    # Map chapter 9 paths to chapter 10 paths
    # 8 paths in chapter 9: I, II, III, IV, V, VI, VII, VIII
    # Converge to 4 paths: A, B, C, D
    
    results = {
        'chapter_5_to_6': {},
        'chapter_6_to_7': {},
        'chapter_8_to_9': {},
        'chapter_9_to_10': {},
        'conditions_found': {},
        'issues': []
    }
    
    # Read all relevant chapters
    chapters = {}
    for filepath in sorted(story_dir.glob('*.docx')):
        filename = filepath.name
        text = read_docx(filepath)
        conditions = extract_condition_swaps(text)
        char_refs = extract_character_references(text)
        
        chapters[filename] = {
            'text': text,
            'conditions': conditions,
            'char_refs': char_refs
        }
        results['conditions_found'][filename] = conditions
    
    # Analyze chapter 5 paths
    ch5_paths = [f'CoG - Chapter 5 Path {p}.docx' for p in 
                 ['1A-1', '1A-2', '1B-1', '1B-2', '2A-1', '2A-2', '2B-1', '2B-2',
                  '3A-1', '3A-2', '3B-1', '3B-2', '4A-1', '4A-2', '4B-1', '4B-2']]
    
    # Analyze chapter 6 scenarios
    ch6_scenarios = [f'CoG - Chapter 6 Scenario {s}.docx' for s in ['A', 'B', 'C', 'D']]
    
    # Analyze chapter 7 states
    ch7_states = [f'CoG - Chapter 7 State {s}.docx' for s in ['X', 'Y']]
    
    # Analyze chapter 8 paths
    ch8_paths = [f'CoG - Chapter 8 Path {p}.docx' for p in ['Alpha', 'Beta', 'Delta', 'Gamma']]
    
    # Analyze chapter 9 paths
    ch9_paths = [f'CoG - Chapter 9 Path {r}.docx' for r in ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']]
    
    # Analyze chapter 10 paths
    ch10_paths = [f'CoG - Chapter 10 Path {p}.docx' for p in ['A', 'B', 'C', 'D']]
    
    # Check which chapter 5 paths should lead to which chapter 6 scenarios
    # This requires reading the end of chapter 5 files and beginning of chapter 6 files
    print("=== ANALYZING CONVERGENCE POINTS ===\n")
    
    # Check chapter 6 scenarios for condition swaps
    print("Chapter 6 Scenarios - Condition Swaps:")
    for scenario_file in ch6_scenarios:
        if scenario_file in chapters:
            conditions = chapters[scenario_file]['conditions']
            print(f"\n{scenario_file}:")
            if conditions:
                for cond in conditions[:10]:  # Show first 10
                    print(f"  - {cond}")
            else:
                print("  (No explicit conditions found)")
    
    # Check chapter 7 states for condition swaps
    print("\n\nChapter 7 States - Condition Swaps:")
    for state_file in ch7_states:
        if state_file in chapters:
            conditions = chapters[state_file]['conditions']
            print(f"\n{state_file}:")
            if conditions:
                for cond in conditions[:10]:  # Show first 10
                    print(f"  - {cond}")
            else:
                print("  (No explicit conditions found)")
    
    # Check chapter 9 paths for condition swaps
    print("\n\nChapter 9 Paths - Condition Swaps:")
    for path_file in ch9_paths:
        if path_file in chapters:
            conditions = chapters[path_file]['conditions']
            print(f"\n{path_file}:")
            if conditions:
                for cond in conditions[:10]:  # Show first 10
                    print(f"  - {cond}")
            else:
                print("  (No explicit conditions found)")
    
    # Check chapter 10 paths for condition swaps
    print("\n\nChapter 10 Paths - Condition Swaps:")
    for path_file in ch10_paths:
        if path_file in chapters:
            conditions = chapters[path_file]['conditions']
            print(f"\n{path_file}:")
            if conditions:
                for cond in conditions[:10]:  # Show first 10
                    print(f"  - {cond}")
            else:
                print("  (No explicit conditions found)")
    
    return results, chapters

if __name__ == '__main__':
    results, chapters = analyze_convergence_chapters()
    
    # Save detailed results
    with open('/workspace/analysis_results.json', 'w') as f:
        # Convert to JSON-serializable format
        json_results = {
            'conditions_found': results['conditions_found'],
            'issues': results['issues']
        }
        json.dump(json_results, f, indent=2)
