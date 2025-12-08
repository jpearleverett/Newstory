#!/usr/bin/env python3
"""
Comprehensive check of branching story for:
1. Complete path mappings (all 16 ch5 paths → 4 ch6 scenarios, etc.)
2. Condition swap consistency
3. Word counts per subchapter
4. Missing references
"""
import docx
import re
from pathlib import Path
from collections import defaultdict

def read_docx(filepath):
    """Read text from a docx file."""
    try:
        doc = docx.Document(filepath)
        text = '\n'.join([para.text for para in doc.paragraphs])
        return text
    except Exception as e:
        return None

def extract_via_paths(text):
    """Extract all VIA PATH references."""
    patterns = [
        r'VIA\s+PATH\s+([A-Z0-9\-]+[^:\.]*?)(?::|\.|$)',
        r'VIA\s+PATH\s+([A-Z0-9\-]+)',
    ]
    paths = []
    for pattern in patterns:
        matches = re.findall(pattern, text, re.IGNORECASE | re.MULTILINE)
        paths.extend(matches)
    return list(set([p.strip() for p in paths if p.strip()]))

def extract_condition_flags(text):
    """Extract condition flags like HAS_LEDGER, BETRAYED_MILLER, etc."""
    # Look for ALL_CAPS flags followed by colon
    flags = re.findall(r'\b([A-Z][A-Z0-9_]+):', text)
    # Also look for flags in condition statements
    flag_pattern = r'\b([A-Z][A-Z0-9_]+)\b'
    all_caps = re.findall(flag_pattern, text)
    # Filter to likely condition flags (have underscores or are common flags)
    condition_flags = ['HAS_LEDGER', 'BETRAYED_MILLER', 'SOLD_SOUL_TO_ELARA', 'INNOCENT_BLOOD',
                       'MILLER_ALLY', 'DELANEY_ALIVE', 'DELANEY_DEAD', 'HAS_USB', 'NO_LEDGER',
                       'HAS_PARTIAL_LEDGER', 'HAS_FULL_LEDGER', 'WOUNDED', 'CLEAN_HANDS',
                       'TOOL_OF_OTHERS', 'ELARA_ALLY', 'WHISPER_ALLY', 'THORNE_ALLY',
                       'DA_ALLY', 'NO_ALLIES', 'LIMITED_RESOURCES', 'FAMOUS', 'SEEKING_REDEMPTION',
                       'CRANE_ALIVE', 'CRANE_DEAD', 'CRANE_ALIVE_COOPERATING', 'VICTOR_IN_CUSTODY',
                       'VICTOR_FREE', 'LILA_RESCUED', 'WHISPER_DEAD', 'WHISPER_AT_LARGE',
                       'HALLOWAY_ACTIVE', 'HALLOWAY_CAPTURED', 'HALLOWAY_DEAD']
    
    found_flags = []
    for flag in condition_flags:
        if flag in text:
            found_flags.append(flag)
    
    # Also add any flags found with colons
    found_flags.extend([f for f in flags if f not in found_flags])
    
    return list(set(found_flags))

def count_words_in_sections(text):
    """Count words in each subchapter section."""
    # Look for section markers (subchapter numbers, etc.)
    sections = []
    # Split by common section markers
    section_pattern = r'(?:Subchapter|Section|Part|Chapter)\s+(\d+[A-Z]?)'
    matches = list(re.finditer(section_pattern, text, re.IGNORECASE))
    
    if not matches:
        # If no explicit sections, try to find decision points or major breaks
        # For now, return total word count
        words = re.findall(r'\b\w+\b', text)
        return [('Full Chapter', len(words))]
    
    # Extract sections
    for i, match in enumerate(matches):
        start = match.start()
        end = matches[i+1].start() if i+1 < len(matches) else len(text)
        section_text = text[start:end]
        words = re.findall(r'\b\w+\b', section_text)
        sections.append((match.group(0), len(words)))
    
    return sections

# Expected path mappings
CH5_PATHS = [f'{x}{y}-{z}' for x in [1,2,3,4] for y in ['A','B'] for z in [1,2]]
CH6_SCENARIOS = ['A', 'B', 'C', 'D']
CH7_STATES = ['X', 'Y']
CH8_PATHS = ['Alpha', 'Beta', 'Delta', 'Gamma']
CH9_PATHS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']
CH10_PATHS = ['A', 'B', 'C', 'D']

story_dir = Path('/workspace/story-revised')

print("=== COMPREHENSIVE BRANCHING STORY ANALYSIS ===\n")

# 1. Check Chapter 5 to Chapter 6 mapping
print("1. CHAPTER 5 → CHAPTER 6 MAPPING")
print("=" * 50)

ch5_to_ch6 = defaultdict(list)
ch6_path_refs = defaultdict(set)

# Read all chapter 6 scenarios and see which ch5 paths they reference
for scenario in CH6_SCENARIOS:
    filepath = story_dir / f'CoG - Chapter 6 Scenario {scenario}.docx'
    if filepath.exists():
        text = read_docx(filepath)
        if text:
            paths = extract_via_paths(text)
            ch6_path_refs[scenario] = set(paths)
            # Map path codes to chapter 5 paths
            for path_code in paths:
                # Extract path number (e.g., P1A1 -> 1A-1)
                match = re.search(r'P(\d)([AB])(\d)', path_code)
                if match:
                    num, letter, sub = match.groups()
                    ch5_path = f'{num}{letter}-{sub}'
                    ch5_to_ch6[ch5_path].append(scenario)

# Check which chapter 5 paths are missing
print("\nChapter 5 paths mapped to Chapter 6:")
for ch5_path in sorted(CH5_PATHS):
    scenarios = ch5_to_ch6.get(ch5_path, [])
    if scenarios:
        print(f"  {ch5_path} → {', '.join(scenarios)}")
    else:
        print(f"  ⚠ {ch5_path} → NOT FOUND IN CHAPTER 6")

# Check for paths referenced in chapter 6 that don't match chapter 5 format
print("\nAll path references in Chapter 6 scenarios:")
for scenario in CH6_SCENARIOS:
    refs = ch6_path_refs.get(scenario, set())
    print(f"  Scenario {scenario}: {', '.join(sorted(refs))}")

# 2. Check Chapter 6 to Chapter 7 mapping
print("\n\n2. CHAPTER 6 → CHAPTER 7 MAPPING")
print("=" * 50)

ch6_to_ch7 = defaultdict(list)
ch7_scenario_refs = defaultdict(set)

for state in CH7_STATES:
    filepath = story_dir / f'CoG - Chapter 7 State {state}.docx'
    if filepath.exists():
        text = read_docx(filepath)
        if text:
            # Look for scenario references
            scenario_pattern = r'SCENARIO\s+([A-D])|VIA\s+SCENARIO\s+([A-D])'
            matches = re.findall(scenario_pattern, text, re.IGNORECASE)
            scenarios = [m[0] or m[1] for m in matches if m[0] or m[1]]
            ch7_scenario_refs[state] = set(scenarios)
            for scenario in scenarios:
                ch6_to_ch7[scenario].append(state)

print("\nChapter 6 scenarios mapped to Chapter 7:")
for scenario in CH6_SCENARIOS:
    states = ch6_to_ch7.get(scenario, [])
    if states:
        print(f"  Scenario {scenario} → {', '.join(states)}")
    else:
        print(f"  ⚠ Scenario {scenario} → NOT FOUND IN CHAPTER 7")

# 3. Check Chapter 9 to Chapter 10 mapping
print("\n\n3. CHAPTER 9 → CHAPTER 10 MAPPING")
print("=" * 50)

ch9_to_ch10 = defaultdict(list)
ch10_path_refs = defaultdict(set)

for path in CH10_PATHS:
    filepath = story_dir / f'CoG - Chapter 10 Path {path}.docx'
    if filepath.exists():
        text = read_docx(filepath)
        if text:
            # Look for chapter 9 path references (I, II, III, etc.)
            path_pattern = r'(?:VIA\s+)?PATH\s+([IVX]+(?:-[AB])?)'
            matches = re.findall(path_pattern, text, re.IGNORECASE)
            # Also look for roman numerals
            roman_pattern = r'\b([IVX]+)\b'
            roman_matches = re.findall(roman_pattern, text)
            # Filter to valid chapter 9 paths
            valid_paths = [p for p in roman_matches if p in CH9_PATHS]
            valid_paths.extend([m for m in matches if any(r in m for r in CH9_PATHS)])
            ch10_path_refs[path] = set(valid_paths)
            for ch9_path in valid_paths:
                ch9_to_ch10[ch9_path].append(path)

print("\nChapter 9 paths mapped to Chapter 10:")
for ch9_path in CH9_PATHS:
    ch10_paths = ch9_to_ch10.get(ch9_path, [])
    if ch10_paths:
        print(f"  Path {ch9_path} → {', '.join(ch10_paths)}")
    else:
        print(f"  ⚠ Path {ch9_path} → NOT FOUND IN CHAPTER 10")

# 4. Check condition flags consistency
print("\n\n4. CONDITION FLAGS CHECK")
print("=" * 50)

all_conditions = defaultdict(set)

# Check chapters 6, 7, 9, 10 for condition flags
convergence_chapters = (
    [f'CoG - Chapter 6 Scenario {s}.docx' for s in CH6_SCENARIOS] +
    [f'CoG - Chapter 7 State {s}.docx' for s in CH7_STATES] +
    [f'CoG - Chapter 9 Path {p}.docx' for p in CH9_PATHS] +
    [f'CoG - Chapter 10 Path {p}.docx' for p in CH10_PATHS]
)

for filename in convergence_chapters:
    filepath = story_dir / filename
    if filepath.exists():
        text = read_docx(filepath)
        if text:
            flags = extract_condition_flags(text)
            all_conditions[filename] = set(flags)

print("\nCondition flags found in convergence chapters:")
for filename in sorted(convergence_chapters):
    flags = all_conditions.get(filename, set())
    if flags:
        print(f"\n{filename}:")
        print(f"  {', '.join(sorted(flags))}")

# 5. Word count check for subchapters
print("\n\n5. WORD COUNT CHECK (per subchapter)")
print("=" * 50)

issues = []
for filename in sorted(story_dir.glob('*.docx')):
    text = read_docx(filename)
    if text:
        sections = count_words_in_sections(text)
        for section_name, word_count in sections:
            if word_count < 500 and 'Chapter' in str(filename):
                issues.append(f"{filename} ({section_name}): {word_count} words")

if issues:
    print("\n⚠ Word count issues found:")
    for issue in issues:
        print(f"  - {issue}")
else:
    print("\n✓ All sections meet 500+ word requirement")

print("\n\n=== ANALYSIS COMPLETE ===")
