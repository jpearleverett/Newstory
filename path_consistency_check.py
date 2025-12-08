#!/usr/bin/env python3
"""
Check consistency across two complete paths
"""
import docx
import re

def read_docx(filepath):
    try:
        doc = docx.Document(filepath)
        return '\n'.join([para.text for para in doc.paragraphs])
    except Exception as e:
        return f"Error: {e}"

def extract_key_info(text, chapter_name):
    """Extract key information about character states and evidence"""
    info = {
        'chapter': chapter_name,
        'delaney_state': None,
        'ledger_state': None,
        'miller_state': None,
        'lila_state': None,
        'victor_state': None,
        'whisper_state': None,
    }
    
    # Check Delaney
    if 'Delaney' in text:
        if re.search(r'Delaney.*?(?:died|killed|dead|murdered)', text, re.IGNORECASE):
            info['delaney_state'] = 'DEAD'
        elif re.search(r'Delaney.*?(?:alive|survived|living|protected)', text, re.IGNORECASE):
            info['delaney_state'] = 'ALIVE'
        elif re.search(r'Delaney.*?(?:captured|arrested|custody)', text, re.IGNORECASE):
            info['delaney_state'] = 'CAPTURED'
    
    # Check Ledger
    if 'Ledger' in text or 'ledger' in text:
        if re.search(r'(?:has|carries|secured|obtained|retrieved).*?[Ll]edger', text, re.IGNORECASE):
            info['ledger_state'] = 'HAS'
        elif re.search(r'[Ll]edger.*?(?:lost|destroyed|missing|stolen)', text, re.IGNORECASE):
            info['ledger_state'] = 'LOST'
    
    # Check Miller
    if 'Miller' in text:
        if re.search(r'Miller.*?(?:died|killed|dead)', text, re.IGNORECASE):
            info['miller_state'] = 'DEAD'
        elif re.search(r'Miller.*?(?:arrested|captured|custody)', text, re.IGNORECASE):
            info['miller_state'] = 'CAPTURED'
        elif re.search(r'Miller.*?(?:ally|partner|working with)', text, re.IGNORECASE):
            info['miller_state'] = 'ALLY'
    
    # Check Lila
    if 'Lila' in text:
        if re.search(r'Lila.*?(?:rescued|saved|safe)', text, re.IGNORECASE):
            info['lila_state'] = 'RESCUED'
        elif re.search(r'Lila.*?(?:dead|killed|died)', text, re.IGNORECASE):
            info['lila_state'] = 'DEAD'
        elif re.search(r'Lila.*?(?:captured|held|hostage)', text, re.IGNORECASE):
            info['lila_state'] = 'CAPTURED'
    
    return info

# PATH 1: 2A → 3 Path 1 → 4 Path 2A → 5 Path 2A-1 (Option A) → 6 Scenario A → 7 State X → 8 Alpha → 9 I → 10 A
print("="*80)
print("PATH 1 CONSISTENCY CHECK")
print("="*80)

path1 = [
    ('Chapter 1', 'story-revised/CoG - Chapter 1.docx'),
    ('Chapter 2A', 'story-revised/CoG - Chapter 2A.docx'),
    ('Chapter 3 Path 1', 'story-revised/CoG - Chapter 3 Path 1.docx'),
    ('Chapter 4 Path 2A', 'story-revised/CoG - Chapter 4 Path 2A.docx'),
    ('Chapter 5 Path 2A-1', 'story-revised/CoG - Chapter 5 Path 2A-1.docx'),
    ('Chapter 6 Scenario A', 'story-revised/CoG - Chapter 6 Scenario A.docx'),
    ('Chapter 7 State X', 'story-revised/CoG - Chapter 7 State X.docx'),
    ('Chapter 8 Path Alpha', 'story-revised/CoG - Chapter 8 Path Alpha.docx'),
    ('Chapter 9 Path I', 'story-revised/CoG - Chapter 9 Path I.docx'),
    ('Chapter 10 Path A', 'story-revised/CoG - Chapter 10 Path A.docx'),
]

path1_info = []
for name, filepath in path1:
    text = read_docx(filepath)
    info = extract_key_info(text, name)
    path1_info.append(info)
    print(f"\n{name}:")
    for key, value in info.items():
        if key != 'chapter' and value:
            print(f"  {key}: {value}")

# Check for inconsistencies
print("\n" + "="*80)
print("PATH 1: INCONSISTENCY CHECK")
print("="*80)

issues = []
prev_delaney = None
prev_ledger = None
prev_miller = None
prev_lila = None

for info in path1_info:
    chapter = info['chapter']
    
    # Check Delaney state changes
    if info['delaney_state']:
        if prev_delaney and prev_delaney != info['delaney_state']:
            # This might be okay if it's a condition swap, but flag it
            if 'Scenario' in chapter or 'State' in chapter:
                # Condition swaps are expected here
                pass
            else:
                issues.append(f"{chapter}: Delaney state changed from {prev_delaney} to {info['delaney_state']}")
        prev_delaney = info['delaney_state']
    
    # Check Ledger state changes
    if info['ledger_state']:
        if prev_ledger and prev_ledger != info['ledger_state']:
            if 'Scenario' in chapter or 'State' in chapter:
                pass
            else:
                issues.append(f"{chapter}: Ledger state changed from {prev_ledger} to {info['ledger_state']}")
        prev_ledger = info['ledger_state']

if issues:
    print("ISSUES FOUND:")
    for issue in issues:
        print(f"  - {issue}")
else:
    print("No obvious inconsistencies found in state tracking")

# Now check PATH 2
print("\n" + "="*80)
print("PATH 2 CONSISTENCY CHECK")
print("="*80)

path2 = [
    ('Chapter 1', 'story-revised/CoG - Chapter 1.docx'),
    ('Chapter 2B', 'story-revised/CoG - Chapter 2B.docx'),
    ('Chapter 3 Path 4', 'story-revised/CoG - Chapter 3 Path 4.docx'),
    ('Chapter 4 Path 4B', 'story-revised/CoG - Chapter 4 Path 4B.docx'),
    ('Chapter 5 Path 4B-2', 'story-revised/CoG - Chapter 5 Path 4B-2.docx'),
    ('Chapter 6 Scenario C', 'story-revised/CoG - Chapter 6 Scenario C.docx'),
    ('Chapter 7 State Y', 'story-revised/CoG - Chapter 7 State Y.docx'),
    ('Chapter 8 Path Gamma', 'story-revised/CoG - Chapter 8 Path Gamma.docx'),
    ('Chapter 9 Path VIII', 'story-revised/CoG - Chapter 9 Path VIII.docx'),
    ('Chapter 10 Path D', 'story-revised/CoG - Chapter 10 Path D.docx'),
]

path2_info = []
for name, filepath in path2:
    text = read_docx(filepath)
    info = extract_key_info(text, name)
    path2_info.append(info)
    print(f"\n{name}:")
    for key, value in info.items():
        if key != 'chapter' and value:
            print(f"  {key}: {value}")

print("\n" + "="*80)
print("PATH 2: INCONSISTENCY CHECK")
print("="*80)

issues2 = []
prev_delaney = None
prev_ledger = None

for info in path2_info:
    chapter = info['chapter']
    
    if info['delaney_state']:
        if prev_delaney and prev_delaney != info['delaney_state']:
            if 'Scenario' in chapter or 'State' in chapter:
                pass
            else:
                issues2.append(f"{chapter}: Delaney state changed from {prev_delaney} to {info['delaney_state']}")
        prev_delaney = info['delaney_state']
    
    if info['ledger_state']:
        if prev_ledger and prev_ledger != info['ledger_state']:
            if 'Scenario' in chapter or 'State' in chapter:
                pass
            else:
                issues2.append(f"{chapter}: Ledger state changed from {prev_ledger} to {info['ledger_state']}")
        prev_ledger = info['ledger_state']

if issues2:
    print("ISSUES FOUND:")
    for issue in issues2:
        print(f"  - {issue}")
else:
    print("No obvious inconsistencies found in state tracking")

print("\n" + "="*80)
print("SUMMARY")
print("="*80)
print(f"Path 1 issues: {len(issues)}")
print(f"Path 2 issues: {len(issues2)}")
