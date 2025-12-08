#!/usr/bin/env python3
"""
Final comprehensive analysis of branching story.
Generates a detailed report of all issues found.
"""
import docx
import re
from pathlib import Path
from collections import defaultdict

def read_docx(filepath):
    doc = docx.Document(filepath)
    return '\n'.join([para.text for para in doc.paragraphs])

def count_words(text):
    return len(re.findall(r'\b\w+\b', text))

story_dir = Path('/workspace/story-revised')
issues = []
warnings = []

print("="*80)
print("COMPREHENSIVE BRANCHING STORY ANALYSIS REPORT")
print("="*80)

# 1. WORD COUNT VERIFICATION
print("\n1. WORD COUNT VERIFICATION")
print("-"*80)
word_count_issues = []
for filepath in sorted(story_dir.glob('*.docx')):
    text = read_docx(filepath)
    if text:
        wc = count_words(text)
        if wc < 500:
            word_count_issues.append((filepath.name, wc))
        print(f"  {filepath.name}: {wc} words {'✓' if wc >= 500 else '✗'}")

if word_count_issues:
    issues.append(f"Word count issues: {len(word_count_issues)} chapters below 500 words")
    for filename, wc in word_count_issues:
        issues.append(f"  - {filename}: {wc} words")
else:
    print("  ✓ All chapters meet 500+ word requirement")

# 2. CHAPTER 5 TO CHAPTER 6 MAPPING
print("\n2. CHAPTER 5 → CHAPTER 6 PATH MAPPING")
print("-"*80)

# Read all chapter 6 scenarios and extract path references
ch6_path_refs = defaultdict(set)
ch6_files = {
    'A': read_docx(story_dir / 'CoG - Chapter 6 Scenario A.docx'),
    'B': read_docx(story_dir / 'CoG - Chapter 6 Scenario B.docx'),
    'C': read_docx(story_dir / 'CoG - Chapter 6 Scenario C.docx'),
    'D': read_docx(story_dir / 'CoG - Chapter 6 Scenario D.docx'),
}

for scenario, text in ch6_files.items():
    # Find all path references (P1A1, P1A1-A, P1A2-B, etc.)
    # Pattern: P followed by digit, letter, digit, optional -A or -B
    path_pattern = r'P(\d)([AB])(\d)(?:-([AB]))?'
    matches = re.findall(path_pattern, text)
    for match in matches:
        num, letter, sub, opt = match
        if opt:
            path_key = f'{num}{letter}-{sub}-{opt}'
        else:
            # Base path without option - might need both A and B
            path_key = f'{num}{letter}-{sub}'
        ch6_path_refs[scenario].add(path_key)
    
    print(f"  Scenario {scenario}: {len(matches)} path references found")

# Check chapter 5 files to see what should flow where
ch5_expected_flows = {}
ch5_paths = [f'{x}{y}-{z}' for x in [1,2,3,4] for y in ['A','B'] for z in [1,2]]

for path in ch5_paths:
    filepath = story_dir / f'CoG - Chapter 5 Path {path}.docx'
    if filepath.exists():
        text = read_docx(filepath)
        # Find OPTION lines and their FLOWS TO
        # Look for pattern: OPTION P... → FLOWS TO: Chapter 6, Scenario X
        option_flows = re.findall(r'OPTION\s+(P\d+[AB]?-[AB]):[^→]*→\s+FLOWS TO:\s+Chapter\s+6[,\s]+Scenario\s+([A-D])', text, re.IGNORECASE | re.DOTALL)
        for option, scenario in option_flows:
            # Convert P1A1-A to 1A-1-A
            opt_match = re.match(r'P(\d)([AB])(\d)-([AB])', option)
            if opt_match:
                num, letter, sub, choice = opt_match.groups()
                path_key = f'{num}{letter}-{sub}-{choice}'
                ch5_expected_flows[path_key] = scenario

print(f"\n  Chapter 5 flows mapped: {len(ch5_expected_flows)}")

# Check for missing references in chapter 6
missing_ch5_refs = []
for path_key, expected_scenario in ch5_expected_flows.items():
    # Check if this path is referenced in the expected scenario
    found = False
    # Check various formats
    formats_to_check = [
        path_key,  # 1A-1-A
        f'P{path_key.replace("-", "")}',  # P1A1A
        f'P{path_key[:5].replace("-", "")}-{path_key[-1]}',  # P1A1-A
    ]
    
    scenario_text = ch6_files.get(expected_scenario, '')
    for fmt in formats_to_check:
        if fmt in scenario_text:
            found = True
            break
    
    if not found:
        missing_ch5_refs.append((path_key, expected_scenario))

if missing_ch5_refs:
    issues.append(f"Missing Chapter 5 path references in Chapter 6: {len(missing_ch5_refs)}")
    for path_key, scenario in missing_ch5_refs[:10]:  # Show first 10
        issues.append(f"  - {path_key} should be in Scenario {scenario}")
else:
    print("  ✓ All Chapter 5 paths are referenced in Chapter 6")

# 3. CHAPTER 6 TO CHAPTER 7 MAPPING
print("\n3. CHAPTER 6 → CHAPTER 7 MAPPING")
print("-"*80)

ch7_files = {
    'X': read_docx(story_dir / 'CoG - Chapter 7 State X.docx'),
    'Y': read_docx(story_dir / 'CoG - Chapter 7 State Y.docx'),
}

for state, text in ch7_files.items():
    # Find scenario references
    scenario_refs = re.findall(r'SCENARIO\s+([A-D])|VIA\s+SCENARIO\s+([A-D])', text, re.IGNORECASE)
    scenarios = set([m[0] or m[1] for m in scenario_refs if m[0] or m[1]])
    print(f"  State {state}: References scenarios {sorted(scenarios)}")

# 4. CHAPTER 9 TO CHAPTER 10 MAPPING  
print("\n4. CHAPTER 9 → CHAPTER 10 MAPPING")
print("-"*80)

ch9_paths = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']
ch10_files = {
    'A': read_docx(story_dir / 'CoG - Chapter 10 Path A.docx'),
    'B': read_docx(story_dir / 'CoG - Chapter 10 Path B.docx'),
    'C': read_docx(story_dir / 'CoG - Chapter 10 Path C.docx'),
    'D': read_docx(story_dir / 'CoG - Chapter 10 Path D.docx'),
}

ch10_path_refs = defaultdict(set)
for path, text in ch10_files.items():
    # Find chapter 9 path references (roman numerals)
    roman_refs = re.findall(r'\b([IVX]+)(?:-[AB])?\b', text)
    # Filter to valid chapter 9 paths
    valid_refs = [r for r in roman_refs if r in ch9_paths]
    ch10_path_refs[path] = set(valid_refs)
    print(f"  Path {path}: References {sorted(valid_refs)}")

# Check if all chapter 9 paths are referenced
missing_ch9_refs = []
for ch9_path in ch9_paths:
    found = False
    for ch10_path, refs in ch10_path_refs.items():
        if ch9_path in refs:
            found = True
            break
    if not found:
        missing_ch9_refs.append(ch9_path)

if missing_ch9_refs:
    warnings.append(f"Chapter 9 paths not referenced in Chapter 10: {missing_ch9_refs}")
else:
    print("  ✓ All Chapter 9 paths are referenced in Chapter 10")

# 5. CONDITION FLAGS CONSISTENCY
print("\n5. CONDITION FLAGS CHECK")
print("-"*80)

# Common condition flags
common_flags = [
    'HAS_LEDGER', 'BETRAYED_MILLER', 'SOLD_SOUL_TO_ELARA', 'INNOCENT_BLOOD',
    'MILLER_ALLY', 'DELANEY_ALIVE', 'DELANEY_DEAD', 'HAS_USB', 'NO_LEDGER',
    'HAS_PARTIAL_LEDGER', 'HAS_FULL_LEDGER', 'WOUNDED', 'CLEAN_HANDS',
    'TOOL_OF_OTHERS', 'ELARA_ALLY', 'WHISPER_ALLY', 'THORNE_ALLY',
    'CRANE_ALIVE', 'CRANE_DEAD', 'VICTOR_IN_CUSTODY', 'VICTOR_FREE',
    'LILA_RESCUED', 'WHISPER_DEAD', 'WHISPER_AT_LARGE',
]

all_files = list(ch6_files.values()) + list(ch7_files.values()) + list(ch10_files.values())
all_text = ' '.join(all_files)

flags_found = [flag for flag in common_flags if flag in all_text]
print(f"  Condition flags found: {len(flags_found)}/{len(common_flags)}")
print(f"  Flags: {', '.join(sorted(flags_found))}")

# FINAL REPORT
print("\n" + "="*80)
print("FINAL REPORT")
print("="*80)

if issues:
    print(f"\n❌ ISSUES FOUND: {len(issues)}")
    for issue in issues:
        print(f"  {issue}")
else:
    print("\n✓ No critical issues found")

if warnings:
    print(f"\n⚠ WARNINGS: {len(warnings)}")
    for warning in warnings:
        print(f"  {warning}")

if not issues and not warnings:
    print("\n✓ All checks passed! Story structure is consistent.")

print("\n" + "="*80)
