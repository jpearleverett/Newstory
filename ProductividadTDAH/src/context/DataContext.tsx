import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types for all the data structures
export interface Goal {
  id: string;
  category: string;
  title: string;
  description: string;
  deadline?: string;
  progress: number;
  steps: { id: string; text: string; completed: boolean }[];
  createdAt: string;
}

export interface DailyEntry {
  id: string;
  date: string;
  gratitude: string[];
  mood: number;
  energyLevel: number;
  dump: string[];
  organized: string[];
  planned: string[];
  acted: string[];
  notes: string;
}

export interface HabitTracker {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  completedDates: string[];
  color: string;
}

export interface EisenhowerTask {
  id: string;
  text: string;
  quadrant: 'urgent-important' | 'not-urgent-important' | 'urgent-not-important' | 'not-urgent-not-important';
  completed: boolean;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  deadline?: string;
  tasks: { id: string; text: string; completed: boolean; dueDate?: string }[];
  timeBlocks: { id: string; task: string; duration: number; completed: boolean }[];
  status: 'not-started' | 'in-progress' | 'completed';
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  isNeed: boolean;
  isImpulse: boolean;
}

export interface SelfCareEntry {
  id: string;
  date: string;
  water: number;
  sleep: number;
  exercise: { type: string; duration: number } | null;
  meals: { breakfast: string; lunch: string; dinner: string; snacks: string[] };
  meditation: number;
  gratitude: string[];
  wins: string[];
}

export interface HomeTask {
  id: string;
  room: string;
  task: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  completedDates: string[];
}

export interface YearlyIntention {
  year: number;
  word: string;
  intentions: string[];
  celebrations: string[];
}

export interface Reflection {
  id: string;
  date: string;
  type: 'strength' | 'weakness' | 'growth' | 'values' | 'general';
  prompt: string;
  response: string;
}

// User session and energy state tracking
export interface UserSession {
  lastOpenedAt: string;  // ISO timestamp
  currentEnergyLevel: number; // 0-100 scale
  hasCompletedEnergyCheck: boolean;
  streakDays: number;
  backlogTasks: string[]; // Tasks swept during Sunrise Reset
}

// Manifestation 369 entries
export interface ManifestationEntry {
  id: string;
  date: string;
  intention: string;
  morningCount: number;
  afternoonCount: number;
  eveningCount: number;
}

// Vision Board items
export interface VisionItem {
  id: string;
  imageUri?: string;
  text: string;
  feeling?: string;
}

export interface VisionBoard {
  tenYear: VisionItem[];
  oneYear: VisionItem[];
}

// 30-Day Simplifier Challenge
export interface SimplifierChallenge {
  startDate: string;
  completedDays: number[];
}

// Impulse Pause reminders
export interface ImpulseReminder {
  id: string;
  item: string;
  scheduledFor: string; // ISO timestamp
  isNeed: boolean;
  dismissed: boolean;
}

interface AppData {
  goals: Goal[];
  dailyEntries: DailyEntry[];
  habits: HabitTracker[];
  eisenhowerTasks: EisenhowerTask[];
  projects: Project[];
  expenses: Expense[];
  selfCare: SelfCareEntry[];
  homeTasks: HomeTask[];
  yearlyIntentions: YearlyIntention[];
  reflections: Reflection[];
  brainDumps: { id: string; date: string; items: string[] }[];
  userSession: UserSession;
  manifestations: ManifestationEntry[];
  visionBoard: VisionBoard;
  simplifierChallenge: SimplifierChallenge;
  impulseReminders: ImpulseReminder[];
}

interface DataContextType {
  data: AppData;
  loading: boolean;
  // Goals
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  // Daily Entries
  addDailyEntry: (entry: Omit<DailyEntry, 'id'>) => Promise<void>;
  updateDailyEntry: (id: string, updates: Partial<DailyEntry>) => Promise<void>;
  getDailyEntry: (date: string) => DailyEntry | undefined;
  // Habits
  addHabit: (habit: Omit<HabitTracker, 'id' | 'completedDates'>) => Promise<void>;
  toggleHabitDay: (habitId: string, date: string) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  // Eisenhower Tasks
  addEisenhowerTask: (task: Omit<EisenhowerTask, 'id' | 'createdAt'>) => Promise<void>;
  updateEisenhowerTask: (id: string, updates: Partial<EisenhowerTask>) => Promise<void>;
  deleteEisenhowerTask: (id: string) => Promise<void>;
  // Projects
  addProject: (project: Omit<Project, 'id'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  // Expenses
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  // Self Care
  addSelfCareEntry: (entry: Omit<SelfCareEntry, 'id'>) => Promise<void>;
  updateSelfCareEntry: (id: string, updates: Partial<SelfCareEntry>) => Promise<void>;
  getSelfCareEntry: (date: string) => SelfCareEntry | undefined;
  // Home Tasks
  addHomeTask: (task: Omit<HomeTask, 'id' | 'completedDates'>) => Promise<void>;
  toggleHomeTaskDay: (taskId: string, date: string) => Promise<void>;
  deleteHomeTask: (id: string) => Promise<void>;
  // Yearly Intentions
  setYearlyIntention: (intention: YearlyIntention) => Promise<void>;
  // Reflections
  addReflection: (reflection: Omit<Reflection, 'id'>) => Promise<void>;
  // Brain Dumps
  addBrainDump: (items: string[]) => Promise<void>;
  // User Session & Energy
  updateUserSession: (updates: Partial<UserSession>) => Promise<void>;
  setEnergyLevel: (level: number) => Promise<void>;
  completeEnergyCheck: () => Promise<void>;
  checkNeedsSunriseReset: () => boolean;
  performSunriseReset: () => Promise<void>;
  getHoursSinceLastOpen: () => number;
  // Manifestations
  addManifestation: (intention: string) => Promise<void>;
  updateManifestation: (id: string, period: 'morning' | 'afternoon' | 'evening') => Promise<void>;
  getTodayManifestation: () => ManifestationEntry | undefined;
  // Vision Board
  updateVisionBoard: (timeframe: '10year' | '1year', items: VisionItem[]) => Promise<void>;
  getVisionBoard: () => VisionBoard;
  // Simplifier Challenge
  startSimplifierChallenge: () => Promise<void>;
  completeSimplifierDay: (day: number) => Promise<void>;
  getSimplifierProgress: () => { currentDay: number; completedDays: number[] };
  // Impulse Reminders
  addImpulseReminder: (item: string) => Promise<void>;
  dismissImpulseReminder: (id: string) => Promise<void>;
  getPendingReminders: () => ImpulseReminder[];
}

const defaultUserSession: UserSession = {
  lastOpenedAt: new Date().toISOString(),
  currentEnergyLevel: 50,
  hasCompletedEnergyCheck: false,
  streakDays: 0,
  backlogTasks: [],
};

const defaultData: AppData = {
  goals: [],
  dailyEntries: [],
  habits: [],
  eisenhowerTasks: [],
  projects: [],
  expenses: [],
  selfCare: [],
  homeTasks: [],
  yearlyIntentions: [],
  reflections: [],
  brainDumps: [],
  userSession: defaultUserSession,
  manifestations: [],
  visionBoard: { tenYear: [], oneYear: [] },
  simplifierChallenge: { startDate: '', completedDays: [] },
  impulseReminders: [],
};

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEY = '@productividad_tdah_data';

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData>(defaultData);
  const [loading, setLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setData(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveData = async (newData: AppData) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      setData(newData);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

  // Goals
  const addGoal = async (goal: Omit<Goal, 'id' | 'createdAt'>) => {
    const newGoal: Goal = { ...goal, id: generateId(), createdAt: new Date().toISOString() };
    await saveData({ ...data, goals: [...data.goals, newGoal] });
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    const goals = data.goals.map(g => g.id === id ? { ...g, ...updates } : g);
    await saveData({ ...data, goals });
  };

  const deleteGoal = async (id: string) => {
    await saveData({ ...data, goals: data.goals.filter(g => g.id !== id) });
  };

  // Daily Entries
  const addDailyEntry = async (entry: Omit<DailyEntry, 'id'>) => {
    const existing = data.dailyEntries.find(e => e.date === entry.date);
    if (existing) {
      await updateDailyEntry(existing.id, entry);
    } else {
      const newEntry: DailyEntry = { ...entry, id: generateId() };
      await saveData({ ...data, dailyEntries: [...data.dailyEntries, newEntry] });
    }
  };

  const updateDailyEntry = async (id: string, updates: Partial<DailyEntry>) => {
    const entries = data.dailyEntries.map(e => e.id === id ? { ...e, ...updates } : e);
    await saveData({ ...data, dailyEntries: entries });
  };

  const getDailyEntry = (date: string) => data.dailyEntries.find(e => e.date === date);

  // Habits
  const addHabit = async (habit: Omit<HabitTracker, 'id' | 'completedDates'>) => {
    const newHabit: HabitTracker = { ...habit, id: generateId(), completedDates: [] };
    await saveData({ ...data, habits: [...data.habits, newHabit] });
  };

  const toggleHabitDay = async (habitId: string, date: string) => {
    const habits = data.habits.map(h => {
      if (h.id === habitId) {
        const hasDate = h.completedDates.includes(date);
        return {
          ...h,
          completedDates: hasDate
            ? h.completedDates.filter(d => d !== date)
            : [...h.completedDates, date],
        };
      }
      return h;
    });
    await saveData({ ...data, habits });
  };

  const deleteHabit = async (id: string) => {
    await saveData({ ...data, habits: data.habits.filter(h => h.id !== id) });
  };

  // Eisenhower Tasks
  const addEisenhowerTask = async (task: Omit<EisenhowerTask, 'id' | 'createdAt'>) => {
    const newTask: EisenhowerTask = { ...task, id: generateId(), createdAt: new Date().toISOString() };
    await saveData({ ...data, eisenhowerTasks: [...data.eisenhowerTasks, newTask] });
  };

  const updateEisenhowerTask = async (id: string, updates: Partial<EisenhowerTask>) => {
    const tasks = data.eisenhowerTasks.map(t => t.id === id ? { ...t, ...updates } : t);
    await saveData({ ...data, eisenhowerTasks: tasks });
  };

  const deleteEisenhowerTask = async (id: string) => {
    await saveData({ ...data, eisenhowerTasks: data.eisenhowerTasks.filter(t => t.id !== id) });
  };

  // Projects
  const addProject = async (project: Omit<Project, 'id'>) => {
    const newProject: Project = { ...project, id: generateId() };
    await saveData({ ...data, projects: [...data.projects, newProject] });
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    const projects = data.projects.map(p => p.id === id ? { ...p, ...updates } : p);
    await saveData({ ...data, projects });
  };

  const deleteProject = async (id: string) => {
    await saveData({ ...data, projects: data.projects.filter(p => p.id !== id) });
  };

  // Expenses
  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = { ...expense, id: generateId() };
    await saveData({ ...data, expenses: [...data.expenses, newExpense] });
  };

  const deleteExpense = async (id: string) => {
    await saveData({ ...data, expenses: data.expenses.filter(e => e.id !== id) });
  };

  // Self Care
  const addSelfCareEntry = async (entry: Omit<SelfCareEntry, 'id'>) => {
    const existing = data.selfCare.find(e => e.date === entry.date);
    if (existing) {
      await updateSelfCareEntry(existing.id, entry);
    } else {
      const newEntry: SelfCareEntry = { ...entry, id: generateId() };
      await saveData({ ...data, selfCare: [...data.selfCare, newEntry] });
    }
  };

  const updateSelfCareEntry = async (id: string, updates: Partial<SelfCareEntry>) => {
    const entries = data.selfCare.map(e => e.id === id ? { ...e, ...updates } : e);
    await saveData({ ...data, selfCare: entries });
  };

  const getSelfCareEntry = (date: string) => data.selfCare.find(e => e.date === date);

  // Home Tasks
  const addHomeTask = async (task: Omit<HomeTask, 'id' | 'completedDates'>) => {
    const newTask: HomeTask = { ...task, id: generateId(), completedDates: [] };
    await saveData({ ...data, homeTasks: [...data.homeTasks, newTask] });
  };

  const toggleHomeTaskDay = async (taskId: string, date: string) => {
    const tasks = data.homeTasks.map(t => {
      if (t.id === taskId) {
        const hasDate = t.completedDates.includes(date);
        return {
          ...t,
          completedDates: hasDate
            ? t.completedDates.filter(d => d !== date)
            : [...t.completedDates, date],
        };
      }
      return t;
    });
    await saveData({ ...data, homeTasks: tasks });
  };

  const deleteHomeTask = async (id: string) => {
    await saveData({ ...data, homeTasks: data.homeTasks.filter(t => t.id !== id) });
  };

  // Yearly Intentions
  const setYearlyIntention = async (intention: YearlyIntention) => {
    const existing = data.yearlyIntentions.findIndex(y => y.year === intention.year);
    let intentions = [...data.yearlyIntentions];
    if (existing >= 0) {
      intentions[existing] = intention;
    } else {
      intentions.push(intention);
    }
    await saveData({ ...data, yearlyIntentions: intentions });
  };

  // Reflections
  const addReflection = async (reflection: Omit<Reflection, 'id'>) => {
    const newReflection: Reflection = { ...reflection, id: generateId() };
    await saveData({ ...data, reflections: [...data.reflections, newReflection] });
  };

  // Brain Dumps
  const addBrainDump = async (items: string[]) => {
    const newDump = { id: generateId(), date: new Date().toISOString(), items };
    await saveData({ ...data, brainDumps: [...data.brainDumps, newDump] });
  };

  // User Session & Energy Management
  const updateUserSession = async (updates: Partial<UserSession>) => {
    const currentSession = data.userSession || defaultUserSession;
    const updatedSession = { ...currentSession, ...updates };
    await saveData({ ...data, userSession: updatedSession });
  };

  const setEnergyLevel = async (level: number) => {
    await updateUserSession({
      currentEnergyLevel: Math.max(0, Math.min(100, level)),
      lastOpenedAt: new Date().toISOString()
    });
  };

  const completeEnergyCheck = async () => {
    await updateUserSession({
      hasCompletedEnergyCheck: true,
      lastOpenedAt: new Date().toISOString()
    });
  };

  const getHoursSinceLastOpen = (): number => {
    const session = data.userSession || defaultUserSession;
    const lastOpened = new Date(session.lastOpenedAt);
    const now = new Date();
    return (now.getTime() - lastOpened.getTime()) / (1000 * 60 * 60);
  };

  const checkNeedsSunriseReset = (): boolean => {
    const hoursSinceOpen = getHoursSinceLastOpen();
    return hoursSinceOpen >= 48;
  };

  const performSunriseReset = async () => {
    // Get today's date
    const today = new Date().toISOString().split('T')[0];

    // Find overdue tasks from daily entries (not today)
    const todayEntry = data.dailyEntries.find(e => e.date === today);
    const overdueTasks: string[] = [];

    // Collect incomplete planned tasks from previous days
    data.dailyEntries.forEach(entry => {
      if (entry.date !== today && entry.planned) {
        const incomplete = entry.planned.filter(task =>
          !entry.acted?.includes(task)
        );
        overdueTasks.push(...incomplete);
      }
    });

    // Also collect incomplete Eisenhower tasks from urgent-important quadrant
    const urgentTasks = data.eisenhowerTasks
      .filter(t => t.quadrant === 'urgent-important' && !t.completed)
      .map(t => t.text);

    const allBacklog = [...overdueTasks, ...urgentTasks];

    // Update session with backlog and reset energy check
    await updateUserSession({
      backlogTasks: allBacklog,
      hasCompletedEnergyCheck: false,
      lastOpenedAt: new Date().toISOString(),
    });
  };

  // Manifestation 369 Methods
  const addManifestation = async (intention: string) => {
    const today = new Date().toISOString().split('T')[0];
    const existing = data.manifestations.find(m => m.date === today);

    if (existing) {
      // Update existing with new intention
      const updated = data.manifestations.map(m =>
        m.date === today ? { ...m, intention } : m
      );
      await saveData({ ...data, manifestations: updated });
    } else {
      const newManifestation: ManifestationEntry = {
        id: generateId(),
        date: today,
        intention,
        morningCount: 0,
        afternoonCount: 0,
        eveningCount: 0,
      };
      await saveData({
        ...data,
        manifestations: [...data.manifestations, newManifestation]
      });
    }
  };

  const updateManifestation = async (
    id: string,
    period: 'morning' | 'afternoon' | 'evening'
  ) => {
    const countKey = `${period}Count` as 'morningCount' | 'afternoonCount' | 'eveningCount';
    const updated = data.manifestations.map(m => {
      if (m.id === id) {
        const currentCount = m[countKey];
        const maxCount = period === 'morning' ? 3 : period === 'afternoon' ? 6 : 9;
        return {
          ...m,
          [countKey]: Math.min(currentCount + 1, maxCount)
        };
      }
      return m;
    });
    await saveData({ ...data, manifestations: updated });
  };

  const getTodayManifestation = (): ManifestationEntry | undefined => {
    const today = new Date().toISOString().split('T')[0];
    return data.manifestations.find(m => m.date === today);
  };

  // Vision Board Methods
  const updateVisionBoard = async (timeframe: '10year' | '1year', items: VisionItem[]) => {
    const visionBoard = data.visionBoard || { tenYear: [], oneYear: [] };
    const updated = {
      ...visionBoard,
      [timeframe === '10year' ? 'tenYear' : 'oneYear']: items,
    };
    await saveData({ ...data, visionBoard: updated });
  };

  const getVisionBoard = (): VisionBoard => {
    return data.visionBoard || { tenYear: [], oneYear: [] };
  };

  // Simplifier Challenge Methods
  const startSimplifierChallenge = async () => {
    const challenge: SimplifierChallenge = {
      startDate: new Date().toISOString().split('T')[0],
      completedDays: [],
    };
    await saveData({ ...data, simplifierChallenge: challenge });
  };

  const completeSimplifierDay = async (day: number) => {
    const challenge = data.simplifierChallenge || { startDate: '', completedDays: [] };
    if (!challenge.completedDays.includes(day)) {
      const updated = {
        ...challenge,
        completedDays: [...challenge.completedDays, day].sort((a, b) => a - b),
      };
      await saveData({ ...data, simplifierChallenge: updated });
    }
  };

  const getSimplifierProgress = (): { currentDay: number; completedDays: number[] } => {
    const challenge = data.simplifierChallenge || { startDate: '', completedDays: [] };
    if (!challenge.startDate) {
      return { currentDay: 1, completedDays: [] };
    }

    const startDate = new Date(challenge.startDate);
    const today = new Date();
    const diffTime = today.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const currentDay = Math.min(Math.max(1, diffDays), 30);

    return {
      currentDay,
      completedDays: challenge.completedDays,
    };
  };

  // Impulse Reminder Methods
  const addImpulseReminder = async (item: string) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0); // 10 AM tomorrow

    const reminder: ImpulseReminder = {
      id: generateId(),
      item,
      scheduledFor: tomorrow.toISOString(),
      isNeed: false,
      dismissed: false,
    };

    const reminders = [...(data.impulseReminders || []), reminder];
    await saveData({ ...data, impulseReminders: reminders });
  };

  const dismissImpulseReminder = async (id: string) => {
    const reminders = (data.impulseReminders || []).map(r =>
      r.id === id ? { ...r, dismissed: true } : r
    );
    await saveData({ ...data, impulseReminders: reminders });
  };

  const getPendingReminders = (): ImpulseReminder[] => {
    const now = new Date().toISOString();
    return (data.impulseReminders || []).filter(
      r => !r.dismissed && r.scheduledFor <= now
    );
  };

  return (
    <DataContext.Provider
      value={{
        data,
        loading,
        addGoal,
        updateGoal,
        deleteGoal,
        addDailyEntry,
        updateDailyEntry,
        getDailyEntry,
        addHabit,
        toggleHabitDay,
        deleteHabit,
        addEisenhowerTask,
        updateEisenhowerTask,
        deleteEisenhowerTask,
        addProject,
        updateProject,
        deleteProject,
        addExpense,
        deleteExpense,
        addSelfCareEntry,
        updateSelfCareEntry,
        getSelfCareEntry,
        addHomeTask,
        toggleHomeTaskDay,
        deleteHomeTask,
        setYearlyIntention,
        addReflection,
        addBrainDump,
        // User Session & Energy
        updateUserSession,
        setEnergyLevel,
        completeEnergyCheck,
        checkNeedsSunriseReset,
        performSunriseReset,
        getHoursSinceLastOpen,
        // Manifestations
        addManifestation,
        updateManifestation,
        getTodayManifestation,
        // Vision Board
        updateVisionBoard,
        getVisionBoard,
        // Simplifier Challenge
        startSimplifierChallenge,
        completeSimplifierDay,
        getSimplifierProgress,
        // Impulse Reminders
        addImpulseReminder,
        dismissImpulseReminder,
        getPendingReminders,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
