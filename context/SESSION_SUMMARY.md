# Totally TDAH - Compassionate Computing Implementation

## Project Vision

Transform a standard ADHD productivity app into a **"responsive nervous system"** - an app that feels less like a tool and more like a gentle, intuitive companion that adapts to the user's emotional and energetic state.

### Core Philosophy: Compassionate Computing

The app is designed for people with ADHD who experience:
- Executive function challenges
- Emotional dysregulation
- Decision fatigue
- Shame spirals from "failed" productivity attempts
- Impulse control difficulties

**Key Principle**: The app should never judge, never shame, and always meet the user where they are.

---

## Technical Stack

| Technology | Version/Details |
|------------|-----------------|
| **Framework** | React Native with Expo SDK 54 |
| **Language** | TypeScript |
| **State Management** | React Context API (DataContext) |
| **Persistence** | AsyncStorage |
| **Styling** | StyleSheet + expo-linear-gradient |
| **Haptics** | expo-haptics |
| **Animations** | React Native Animated API |
| **i18n** | Custom translation system (ES/EN) |
| **Navigation** | React Navigation (Tab + Stack) |

### Project Structure

```
ProductividadTDAH/
├── src/
│   ├── components/          # Reusable UI components & modals
│   │   ├── index.ts         # Component exports
│   │   ├── MorningPulseModal.tsx
│   │   ├── ManifestationModal.tsx
│   │   ├── SunriseResetModal.tsx
│   │   ├── VoiceBrainDumpModal.tsx
│   │   ├── VisionBoardModal.tsx
│   │   ├── ImpulsePauseModal.tsx
│   │   ├── SimplifierChallengeModal.tsx
│   │   └── ... (other components)
│   ├── screens/             # Main app screens
│   │   ├── HomeScreen.tsx   # Central hub with energy theming
│   │   ├── CasaScreen.tsx   # Home organization
│   │   ├── DineroScreen.tsx # Financial tracking
│   │   ├── MetasScreen.tsx  # Goals management
│   │   └── ... (other screens)
│   ├── context/
│   │   └── DataContext.tsx  # Global state & persistence
│   ├── i18n/
│   │   └── translations.ts  # ES/EN translation strings
│   └── navigation/
│       └── AppNavigator.tsx # Navigation configuration
├── App.tsx
└── package.json
```

---

## Implemented Features

### 1. DOPA Interface - Voice-First Capture

**File**: `src/components/VoiceBrainDumpModal.tsx`

A voice-based brain dump system that uses AI to sort thoughts into categories:
- **Tasks** → Tareas screen
- **Events** → Calendar
- **Ideas** → Notes
- **Feelings** → Mood tracker

**Key Features**:
- Speech-to-text transcription
- Simulated AI categorization (ready for real AI integration)
- Gentle, non-judgmental interface
- Spanish/English support

**Integration**: Accessible via FAB button on HomeScreen

---

### 2. Visceral Timer

**File**: `src/components/VisceralTimer.tsx`

An embodied timer that makes time feel physical:
- **Haptic heartbeat** that accelerates as time runs low
- **Color transitions** from calm to urgent
- **Breathing rhythm** synced with visual pulses
- **Gentle nudges** instead of harsh alarms

---

### 3. No-Shame Architecture - Sunrise Reset

**File**: `src/components/SunriseResetModal.tsx`

When the user hasn't completed tasks or opened the app:
- **No guilt trips** or "you failed" messages
- **Sunrise animation** representing a fresh start
- **Encouraging message**: "Each day is a new beginning"
- **One-tap reset** to start fresh

**Philosophy**: Yesterday's incomplete tasks don't define today.

---

### 4. Body Doubling - Ghost Mode

**File**: `src/components/GhostModeModal.tsx`

Virtual body doubling for focus sessions:
- **Ambient presence** of a "ghost companion"
- **Subtle animations** showing someone working alongside
- **Optional sounds** (typing, page turns, coffee sips)
- **No pressure** - just gentle company

---

### 5. Context-Aware Rituals

**File**: `src/components/RitualSuggestionCard.tsx`

Smart ritual suggestions based on:
- **Time of day** (morning/afternoon/evening)
- **Current energy level**
- **Day of week**
- **Recent patterns**

Examples:
- Low energy morning → "Start with just one small win"
- High energy afternoon → "Great time to tackle that big task"

---

### 6. Morning Pulse - Energy Check

**File**: `src/components/MorningPulseModal.tsx`

Daily energy check-in with:
- **Visual slider** (not numbers) for energy level
- **Emoji-based feedback**
- **Adaptive task suggestions** based on energy
- **No judgment** for low-energy days

**Energy Levels**:
- 🔋 Low (1-3): Minimal expectations, self-care focus
- ⚡ Medium (4-6): Balanced approach
- 🚀 High (7-10): Ambitious task suggestions

---

### 7. 369 Manifestation Widget

**File**: `src/components/ManifestationModal.tsx`

Based on the 369 manifestation method:
- **Morning** (6am-12pm): Write intention 3 times
- **Afternoon** (12pm-6pm): Write intention 6 times
- **Evening** (6pm-11pm): Write intention 9 times

**Features**:
- Auto-triggers at appropriate times
- Tracks completion across periods
- Gentle reminders, not pushy notifications
- Beautiful gradient backgrounds

**HomeScreen Integration**: Auto-checks time and prompts when appropriate

---

### 8. Vision Board

**File**: `src/components/VisionBoardModal.tsx`

Digital vision board with:
- **Two timeframes**: 10-year dreams & 1-year goals
- **Image upload** via expo-image-picker (optional dependency)
- **Shimmer animation** for "gyroscope effect"
- **"Why" prompt**: "Imagine you already have this. How does it feel?"

**Key Features**:
- Text-only mode if image picker unavailable
- Persistent storage via DataContext
- Emotional connection through feeling prompts
- Visual inspiration with animated shimmer overlay

---

### 9. Deseo vs Necesidad - Impulse Pause Wizard

**File**: `src/components/ImpulsePauseModal.tsx`

3-step impulse purchase intervention:

**Step 1**: What do you want to buy?
- Text input for the item

**Step 2**: How are you feeling right now?
- Emoji grid: 😐 Bored, 😢 Sad, 😰 Stressed, 😊 Happy, 😴 Tired, 🤩 Excited
- Detects emotional spending patterns

**Step 3**: Can this wait 24 hours?
- If YES → Sets reminder, celebrates patience
- If NO → Gentle questions about necessity vs desire

**Smart Detection**:
- Warns about emotional spending (bored/sad/stressed + can't wait)
- Tracks patterns over time
- No shame, just awareness

---

### 10. 30-Day Simplifier Challenge

**File**: `src/components/SimplifierChallengeModal.tsx`

Home decluttering in micro-missions:

**30 Daily Challenges**:
```
Day 1: Clear one kitchen drawer
Day 2: Organize bathroom counter
Day 3: Sort through 10 items of clothing
Day 4: Clean out wallet/purse
Day 5: Organize one shelf
... (through Day 30)
```

**Features**:
- Custom confetti animation on completion
- Progress tracking (X/30 days)
- "Start Challenge" / "Continue Challenge" states
- Encouraging messages for each completion
- Persistent progress via DataContext

---

### 11. Dynamic Energy Theming

**File**: `src/screens/HomeScreen.tsx`

UI colors adapt to current energy level:

| Energy | Background | Primary | Text |
|--------|------------|---------|------|
| Low | Soft lavender (#E8E0F0) | Muted purple (#9B8AA8) | Gentle gray (#6B5B7A) |
| Medium | Warm cream (#FFF8E7) | Balanced amber (#D4A574) | Warm brown (#8B7355) |
| High | Bright mint (#E0F5E8) | Vibrant green (#5BA37A) | Deep teal (#2D5A45) |

**Implementation**:
```typescript
const getEnergyTheme = (level: number) => {
  if (level <= 3) return lowEnergyTheme;
  if (level <= 6) return mediumEnergyTheme;
  return highEnergyTheme;
};
```

---

## DataContext State Management

**File**: `src/context/DataContext.tsx`

### Key Types

```typescript
interface VisionItem {
  id: string;
  text: string;
  imageUri?: string;
  feeling?: string;  // "Why" response
  createdAt: string;
}

interface VisionBoard {
  tenYear: VisionItem[];
  oneYear: VisionItem[];
}

interface SimplifierChallenge {
  startDate: string;
  completedDays: number[];  // Array of completed day numbers
}

interface ImpulseReminder {
  id: string;
  item: string;
  feeling: string;
  createdAt: string;
  remindAt: string;  // 24 hours later
  dismissed: boolean;
}

interface EnergyLog {
  date: string;
  level: number;  // 1-10
  notes?: string;
}

interface ManifestationEntry {
  date: string;
  intention: string;
  morningCount: number;
  afternoonCount: number;
  eveningCount: number;
}
```

### Key Methods

```typescript
// Vision Board
updateVisionBoard(board: VisionBoard): Promise<void>
getVisionBoard(): VisionBoard

// Simplifier Challenge
startSimplifierChallenge(): Promise<void>
completeSimplifierDay(day: number): Promise<void>
getSimplifierProgress(): SimplifierChallenge | null

// Impulse Control
addImpulseReminder(item: string, feeling: string): Promise<void>
dismissImpulseReminder(id: string): Promise<void>
getPendingReminders(): ImpulseReminder[]

// Energy
setEnergyLevel(level: number): Promise<void>
getEnergyLevel(): number

// Manifestation
updateManifestation(entry: ManifestationEntry): Promise<void>
getTodayManifestation(): ManifestationEntry | null
```

---

## Translations

**File**: `src/i18n/translations.ts`

All features are fully translated in Spanish (primary) and English.

### Translation Key Patterns

```typescript
// Vision Board
vision_board_title, vision_ten_year, vision_one_year
vision_add_item, vision_why_prompt, vision_feeling_placeholder

// Impulse Pause
impulse_title, impulse_step1_title, impulse_what_buy
impulse_feeling_bored, impulse_feeling_sad, etc.
impulse_can_wait, impulse_reminder_set

// Simplifier
simplifier_title, simplifier_start, simplifier_day_x
simplifier_task_1 through simplifier_task_30
simplifier_congrats, simplifier_progress
```

---

## Integration Points

### HomeScreen Hub

The HomeScreen serves as the central hub, integrating:

1. **Morning Pulse** - Shown on first open of the day
2. **369 Manifestation** - Auto-triggered at morning/noon/night
3. **Voice Brain Dump** - FAB button access
4. **Energy Theming** - Dynamic colors based on energy level
5. **Sunrise Reset** - Shown when returning after absence

### Screen-Specific Modals

| Screen | Modal | Purpose |
|--------|-------|---------|
| HomeScreen | MorningPulseModal | Daily energy check |
| HomeScreen | ManifestationModal | 369 method |
| HomeScreen | VoiceBrainDumpModal | Voice capture |
| CasaScreen | SimplifierChallengeModal | 30-day declutter |
| DineroScreen | ImpulsePauseModal | Impulse control |
| MetasScreen | VisionBoardModal | Vision/goals |

---

## Future Enhancement Opportunities

### Not Yet Implemented

1. **Real AI Integration** for VoiceBrainDumpModal
   - Currently uses simulated categorization
   - Ready for OpenAI/Claude API integration

2. **Actual Gyroscope Effect** for VisionBoardModal
   - Currently uses shimmer animation
   - Could use expo-sensors for real device tilt

3. **Push Notifications** for reminders
   - 24-hour impulse reminders
   - 369 manifestation prompts
   - Simplifier daily nudges

4. **Haptic Patterns** throughout app
   - Currently used in VisceralTimer
   - Could extend to celebrations, confirmations

5. **Sound Design**
   - Ambient sounds for Ghost Mode
   - Celebration sounds for completions
   - Gentle notification tones

### Integration Ideas

1. Connect SimplifierChallengeModal to CasaScreen tasks
2. Link VisionBoardModal goals to MetasScreen
3. Use ImpulsePauseModal data in DineroScreen spending analysis
4. Feed VoiceBrainDumpModal output to respective screens

---

## Design Principles to Maintain

### 1. Never Shame
- No "you failed" messages
- No guilt about incomplete tasks
- Fresh starts always available

### 2. Meet Users Where They Are
- Adapt to energy levels
- Reduce expectations on hard days
- Celebrate small wins equally

### 3. Make It Feel Human
- Warm, encouraging language
- Emoji and visual softness
- Conversational tone

### 4. Reduce Cognitive Load
- One thing at a time
- Clear visual hierarchy
- Obvious next actions

### 5. Support Impulsivity Awareness
- Pause mechanisms, not blocks
- Reflection prompts, not lectures
- Pattern awareness, not judgment

---

## Git History

```
692e784 feat: Complete remaining compassionate computing features
3452125 feat: Add Voice-First Capture with AI sorting for brain dumps
d7b5126 fix: Remove unused LottieView import from SunriseResetModal
23663a8 chore: Add .gitignore for node_modules and build artifacts
3d8e415 feat: Add Compassionate Computing features for ADHD-friendly experience
```

**Branch**: `claude/enhance-productivity-app-D0kzy`

---

## Quick Start for AI Agents

### To Continue Development:

1. **Read DataContext.tsx** first - it's the source of truth for state
2. **Check translations.ts** - all user-facing text lives here
3. **Review HomeScreen.tsx** - the main integration point
4. **Follow existing patterns** - modals use consistent structure

### Common Tasks:

**Adding a new feature**:
1. Create component in `src/components/`
2. Add types to `DataContext.tsx`
3. Add translations to `translations.ts`
4. Export from `components/index.ts`
5. Integrate into relevant screen

**Modifying existing feature**:
1. Find the component file
2. Update translations if changing text
3. Update DataContext if changing state shape
4. Test with both ES and EN languages

---

## Contact & Resources

- **App Name**: Totally TDAH (Productividad TDAH)
- **Primary Language**: Spanish (with English support)
- **Target Users**: Adults with ADHD seeking gentle productivity support
- **Design Philosophy**: Compassionate Computing for Neurodivergent Minds
