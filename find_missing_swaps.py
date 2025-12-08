#!/usr/bin/env python3
"""
Find all missing condition swaps in convergence chapters.
"""
import docx
import re
from pathlib import Path
from collections import defaultdict

def read_docx(filepath):
    doc = docx.Document(filepath)
    return '\n'.join([para.text for para in doc.paragraphs])

# Get all chapter 5 path options
ch5_paths = [f'{x}{y}-{z}' for x in [1,2,3,4] for y in ['A','B'] for z in [1,2]]
all_ch5_options = [f'{path}-{opt}' for path in ch5_paths for opt in ['A', 'B']]

# Read chapter 5 files to see where each option should flow
ch5_flows = {}
story_dir = Path('/workspace/story-revised')

print("=== READING CHAPTER 5 FLOW STATEMENTS ===\n")
for path in ch5_paths:
    filepath = story_dir / f'CoG - Chapter 5 Path {path}.docx'
    if filepath.exists():
        text = read_docx(filepath)
        # Find options and their flows
        options = re.findall(r'OPTION\s+(P\d+[AB]?-[AB]):([^→]+)→\s+FLOWS TO:\s+Chapter\s+6[,\s]+Scenario\s+([A-D])', text, re.IGNORECASE | re.DOTALL)
        for opt, desc, scenario in options:
            # Convert P1A1-A to 1A-1-A format
            match = re.match(r'P(\d)([AB])(\d)-([AB])', opt)
            if match:
                num, letter, sub, choice = match.groups()
                path_key = f'{num}{letter}-{sub}-{choice}'
                ch5_flows[path_key] = scenario
                print(f"{path_key} → Scenario {scenario}")

print(f"\nTotal flows mapped: {len(ch5_flows)}")

# Now check chapter 6 scenarios
print("\n=== CHECKING CHAPTER 6 SCENARIOS ===\n")
missing_in_ch6 = defaultdict(list)

for scenario in ['A', 'B', 'C', 'D']:
    filepath = story_dir / f'CoG - Chapter 6 Scenario {scenario}.docx'
    if filepath.exists():
        text = read_docx(filepath)
        
        # Find all path references
        path_refs = set()
        # Pattern: P followed by digits, letters, optional -A or -B
        patterns = [
            r'P(\d)([AB])(\d)(?:-([AB]))?',
            r'VIA\s+PATH\s+(P\d+[AB]?-[AB]?)',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                if isinstance(match, tuple):
                    if len(match) == 4:
                        num, letter, sub, opt = match
                        if opt:
                            path_refs.add(f'{num}{letter}-{sub}-{opt}')
                        else:
                            # If no option, check if both A and B should be handled
                            path_refs.add(f'{num}{letter}-{sub}-A')
                            path_refs.add(f'{num}{letter}-{sub}-B')
                    else:
                        path_refs.add(match[0] if match[0] else match[1])
                else:
                    path_refs.add(match)
        
        # Check which paths should flow to this scenario
        expected_paths = [path for path, sc in ch5_flows.items() if sc == scenario]
        
        # Find missing paths
        for expected_path in expected_paths:
            # Convert to format used in chapter 6 (P1A1-A format)
            match = re.match(r'(\d)([AB])(\d)-([AB])', expected_path)
            if match:
                num, letter, sub, choice = match.groups()
                ch6_format = f'P{num}{letter}{sub}-{choice}'
                ch6_format_alt = f'P{num}{letter}{sub}'
                
                # Check if referenced
                found = False
                if ch6_format in text or expected_path in text or f'{num}{letter}-{sub}-{choice}' in text:
                    found = True
                # Also check if the base path is mentioned (might need condition swap)
                if ch6_format_alt in text and f'{num}{letter}-{sub}' in text:
                    # Check if there's a condition swap for the specific option
                    # Look for context around the path reference
                    if f'{choice}' in text[max(0, text.find(ch6_format_alt)-100):text.find(ch6_format_alt)+100]:
                        found = True
                
                if not found:
                    missing_in_ch6[scenario].append(expected_path)

print("\nMissing condition swaps in Chapter 6:")
for scenario, missing in missing_in_ch6.items():
    if missing:
        print(f"\nScenario {scenario}:")
        for path in sorted(missing):
            expected_scenario = ch5_flows.get(path, '?')
            print(f"  - {path} (should flow to Scenario {expected_scenario})")
    else:
        print(f"\nScenario {scenario}: ✓ All paths accounted for")

# Summary
total_missing = sum(len(m) for m in missing_in_ch6.values())
print(f"\n=== SUMMARY ===")
print(f"Total missing condition swaps in Chapter 6: {total_missing}")
print(f"Total expected paths: {len(all_ch5_options)}")
print(f"Paths with condition swaps: {len(all_ch5_options) - total_missing}")
