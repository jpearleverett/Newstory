#!/usr/bin/env python3
"""
Map the branching paths and verify condition swaps are correctly implemented.
"""
import docx
import re
from pathlib import Path

def read_docx(filepath):
    """Read text from a docx file."""
    try:
        doc = docx.Document(filepath)
        text = '\n'.join([para.text for para in doc.paragraphs])
        return text
    except Exception as e:
        return f'Error reading {filepath}: {str(e)}'

def extract_path_transitions(text):
    """Extract references to which paths lead where."""
    transitions = []
    
    # Look for "VIA PATH" patterns
    via_pattern = r'VIA\s+PATH\s+([A-Z0-9\-]+)'
    matches = re.findall(via_pattern, text, re.IGNORECASE)
    transitions.extend(matches)
    
    # Look for "VIA SCENARIO" patterns
    scenario_pattern = r'VIA\s+SCENARIO\s+([A-Z0-9\-]+)'
    matches = re.findall(scenario_pattern, text, re.IGNORECASE)
    transitions.extend(matches)
    
    # Look for explicit path references
    path_ref_pattern = r'(?:path|Path|PATH)\s*([A-Z0-9\-]+)'
    matches = re.findall(path_ref_pattern, text)
    transitions.extend(matches)
    
    return list(set(transitions))

def extract_conditions(text):
    """Extract all condition flags mentioned."""
    conditions = []
    
    # Look for condition flags in ALL_CAPS
    flag_pattern = r'\b([A-Z_]+):'
    matches = re.findall(flag_pattern, text)
    conditions.extend(matches)
    
    # Look for condition flags with underscores
    underscore_pattern = r'\b([A-Z][A-Z0-9_]+)\b'
    matches = re.findall(underscore_pattern, text)
    # Filter to likely condition flags
    conditions.extend([m for m in matches if '_' in m and len(m) > 3])
    
    return list(set(conditions))

def get_last_paragraphs(text, n=10):
    """Get last n paragraphs of text."""
    paras = [p.strip() for p in text.split('\n') if p.strip()]
    return '\n'.join(paras[-n:])

def get_first_paragraphs(text, n=10):
    """Get first n paragraphs of text."""
    paras = [p.strip() for p in text.split('\n') if p.strip()]
    return '\n'.join(paras[:n])

# Read all chapters
story_dir = Path('/workspace/story-revised')

print("=== CHAPTER 5 TO CHAPTER 6 MAPPING ===\n")

# Read chapter 5 endings to see which paths they mention
ch5_files = sorted([f for f in story_dir.glob('CoG - Chapter 5 Path *.docx')])
for ch5_file in ch5_files:
    text = read_docx(ch5_file)
    last_part = get_last_paragraphs(text, 15)
    transitions = extract_path_transitions(last_part)
    conditions = extract_conditions(last_part)
    
    print(f"{ch5_file.name}:")
    if transitions:
        print(f"  Path references: {', '.join(transitions)}")
    if conditions:
        print(f"  Conditions: {', '.join(conditions)}")
    print()

print("\n=== CHAPTER 6 SCENARIOS - PATH REFERENCES ===\n")

# Read chapter 6 scenarios to see which chapter 5 paths they reference
ch6_files = sorted([f for f in story_dir.glob('CoG - Chapter 6 Scenario *.docx')])
for ch6_file in ch6_files:
    text = read_docx(ch6_file)
    first_part = get_first_paragraphs(text, 20)
    transitions = extract_path_transitions(text)
    conditions = extract_conditions(text)
    
    print(f"{ch6_file.name}:")
    print(f"  References chapter 5 paths: {', '.join([t for t in transitions if 'P' in t or any(x in t for x in ['1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B'])])}")
    print(f"  Condition flags used: {', '.join(sorted(set(conditions)))}")
    print()

print("\n=== CHAPTER 6 TO CHAPTER 7 MAPPING ===\n")

# Read chapter 6 endings
for ch6_file in ch6_files:
    text = read_docx(ch6_file)
    last_part = get_last_paragraphs(text, 15)
    transitions = extract_path_transitions(last_part)
    
    print(f"{ch6_file.name} ending references:")
    if transitions:
        print(f"  {', '.join(transitions)}")
    print()

print("\n=== CHAPTER 7 STATES - SCENARIO REFERENCES ===\n")

# Read chapter 7 states
ch7_files = sorted([f for f in story_dir.glob('CoG - Chapter 7 State *.docx')])
for ch7_file in ch7_files:
    text = read_docx(ch7_file)
    transitions = extract_path_transitions(text)
    conditions = extract_conditions(text)
    
    print(f"{ch7_file.name}:")
    print(f"  References chapter 6 scenarios: {', '.join([t for t in transitions if any(x in t for x in ['A', 'B', 'C', 'D', 'SCENARIO'])])}")
    print(f"  Condition flags used: {', '.join(sorted(set(conditions)))}")
    print()

print("\n=== CHAPTER 9 TO CHAPTER 10 MAPPING ===\n")

# Read chapter 9 paths
ch9_files = sorted([f for f in story_dir.glob('CoG - Chapter 9 Path *.docx')])
for ch9_file in ch9_files:
    text = read_docx(ch9_file)
    last_part = get_last_paragraphs(text, 15)
    transitions = extract_path_transitions(last_part)
    conditions = extract_conditions(text)
    
    print(f"{ch9_file.name}:")
    if transitions:
        print(f"  Path references: {', '.join(transitions)}")
    print(f"  Condition flags: {', '.join(sorted(set(conditions)))}")
    print()

print("\n=== CHAPTER 10 PATHS - PATH REFERENCES ===\n")

# Read chapter 10 paths
ch10_files = sorted([f for f in story_dir.glob('CoG - Chapter 10 Path *.docx')])
for ch10_file in ch10_files:
    text = read_docx(ch10_file)
    transitions = extract_path_transitions(text)
    conditions = extract_conditions(text)
    
    print(f"{ch10_file.name}:")
    print(f"  References chapter 9 paths: {', '.join([t for t in transitions if any(x in t for x in ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'])])}")
    print(f"  Condition flags used: {', '.join(sorted(set(conditions)))}")
    print()
