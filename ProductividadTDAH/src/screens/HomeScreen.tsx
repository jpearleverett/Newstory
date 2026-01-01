import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import { useData, DailyEntry } from '../context/DataContext';
import { useLanguage } from '../i18n/LanguageContext';
import haptic from '../utils/haptics';
import { MorningRitualModal } from '../components';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { getDailyEntry, addDailyEntry, addBrainDump } = useData();
  const { t, language } = useLanguage();
  
  const today = format(new Date(), 'yyyy-MM-dd');
  const dateLocale = language === 'es' ? es : enUS;
  const dayName = format(new Date(), "EEEE", { locale: dateLocale });
  const dateString = format(new Date(), language === 'es' ? "d 'de' MMMM" : "MMMM d", { locale: dateLocale });

  const [entry, setEntry] = useState<Partial<DailyEntry>>({
    date: today,
    mood: -1,
    energyLevel: -1,
    planned: [],
    acted: [],
    dump: [],
    organized: [],
    gratitude: [],
    notes: '',
  });

  const [newTask, setNewTask] = useState('');
  const [showCheckin, setShowCheckin] = useState(true);
  const [showMorningModal, setShowMorningModal] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // ADHD-Friendly: Only 3 mood options
  const moods = [
    { emoji: '😔', label: t('mood_difficult'), value: 0 },
    { emoji: '😐', label: t('mood_normal'), value: 1 },
    { emoji: '😊', label: t('mood_good'), value: 2 },
  ];

  // ADHD-Friendly: Only 3 energy options
  const energyLevels = [
    { label: t('energy_low'), value: 0, color: colors.pink },
    { label: t('energy_normal'), value: 1, color: colors.orange },
    { label: t('energy_high'), value: 2, color: colors.primary },
  ];

  useEffect(() => {
    const existingEntry = getDailyEntry(today);
    if (existingEntry) {
      setEntry(existingEntry);
      // If already checked in, hide the checkin section
      if (existingEntry.mood !== undefined && existingEntry.mood >= 0) {
        setShowCheckin(false);
      }
    }

    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [language]); // Re-run when language changes to update labels

  const saveEntry = async (updates: Partial<DailyEntry>) => {
    const updatedEntry = { ...entry, ...updates };
    setEntry(updatedEntry);
    await addDailyEntry({
      date: today,
      mood: updatedEntry.mood ?? 1,
      energyLevel: updatedEntry.energyLevel ?? 1,
      planned: updatedEntry.planned || [],
      acted: updatedEntry.acted || [],
      dump: updatedEntry.dump || [],
      organized: updatedEntry.organized || [],
      gratitude: updatedEntry.gratitude || [],
      notes: updatedEntry.notes || '',
    });
  };

  const handleMorningComplete = async (plannedTasks: string[], dumpItems: string[]) => {
      // Save dump to Brain Dump
      if (dumpItems.length > 0) {
          await addBrainDump(dumpItems);
      }
      
      // Save to daily entry
      const updatedDump = [...(entry.dump || []), ...dumpItems];
      const updatedPlanned = [...(entry.planned || []), ...plannedTasks].slice(0, 3); // Enforce max 3
      
      await saveEntry({
          dump: updatedDump,
          planned: updatedPlanned
      });
      
      haptic.success();
  };

  const handleMoodSelect = (value: number) => {
    haptic.selection();
    saveEntry({ mood: value });
  };

  const handleEnergySelect = (value: number) => {
    haptic.selection();
    saveEntry({ energyLevel: value });
    // After selecting energy, hide checkin after a brief moment
    setTimeout(() => setShowCheckin(false), 300);
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    if ((entry.planned?.length || 0) >= 3) {
      // ADHD-Friendly: Max 3 tasks. Research says more leads to paralysis.
      return;
    }
    haptic.light();
    const planned = [...(entry.planned || []), newTask.trim()];
    saveEntry({ planned });
    setNewTask('');
    Keyboard.dismiss();
  };

  const toggleTask = (task: string) => {
    haptic.medium();
    const acted = entry.acted || [];
    if (acted.includes(task)) {
      saveEntry({ acted: acted.filter(t => t !== task) });
    } else {
      saveEntry({ acted: [...acted, task] });
    }
  };

  const removeTask = (task: string) => {
    haptic.light();
    const planned = (entry.planned || []).filter(t => t !== task);
    const acted = (entry.acted || []).filter(t => t !== task);
    saveEntry({ planned, acted });
  };

  const completedCount = entry.acted?.length || 0;
  const totalCount = entry.planned?.length || 0;
  const hasCheckedIn = entry.mood !== undefined && entry.mood >= 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Header - Simple, focused on TODAY */}
          <View style={styles.header}>
            <View style={styles.dateContainer}>
              <Text style={styles.dayName}>
                {dayName.charAt(0).toUpperCase() + dayName.slice(1)}
              </Text>
              <Text style={styles.dateString}>{dateString}</Text>
            </View>
            {totalCount > 0 && (
              <View style={styles.progressBadge}>
                <Text style={styles.progressText}>
                  {completedCount}/{totalCount}
                </Text>
              </View>
            )}
          </View>

            {/* Morning Ritual Call to Action - Only if no tasks planned yet */}
            {totalCount === 0 && (
            <TouchableOpacity 
                style={styles.ritualCard}
                onPress={() => setShowMorningModal(true)}
            >
                <View style={styles.ritualContent}>
                    <View style={styles.ritualIcon}>
                        <Ionicons name="sparkles" size={24} color={colors.white} />
                    </View>
                    <View style={styles.ritualTextContainer}>
                        <Text style={styles.ritualTitle}>{t('start_ritual_title')}</Text>
                        <Text style={styles.ritualSubtitle}>{t('start_ritual_subtitle')}</Text>
                    </View>
                    <Ionicons name="arrow-forward" size={24} color={colors.primary} />
                </View>
            </TouchableOpacity>
            )}

          {/* Quick Check-in - Collapsible, simple */}
          {showCheckin && (
            <View style={styles.checkinCard}>
              <View style={styles.checkinHeader}>
                <Text style={styles.checkinTitle}>{t('checkin_title')}</Text>
                {hasCheckedIn && (
                  <TouchableOpacity onPress={() => setShowCheckin(false)}>
                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Mood - 3 options only */}
              <View style={styles.moodContainer}>
                {moods.map((mood) => (
                  <TouchableOpacity
                    key={mood.value}
                    style={[
                      styles.moodButton,
                      entry.mood === mood.value && styles.moodButtonSelected,
                    ]}
                    onPress={() => handleMoodSelect(mood.value)}
                  >
                    <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                    <Text style={[
                      styles.moodLabel,
                      entry.mood === mood.value && styles.moodLabelSelected,
                    ]}>
                      {mood.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Energy - Show only after mood is selected */}
              {entry.mood !== undefined && entry.mood >= 0 && (
                <View style={styles.energySection}>
                  <Text style={styles.energyLabel}>{t('energy_label')}</Text>
                  <View style={styles.energyContainer}>
                    {energyLevels.map((level) => (
                      <TouchableOpacity
                        key={level.value}
                        style={[
                          styles.energyButton,
                          entry.energyLevel === level.value && {
                            backgroundColor: level.color,
                          },
                        ]}
                        onPress={() => handleEnergySelect(level.value)}
                      >
                        <Text style={[
                          styles.energyText,
                          entry.energyLevel === level.value && styles.energyTextSelected,
                        ]}>
                          {level.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Show checkin again button if hidden */}
          {!showCheckin && hasCheckedIn && (
            <TouchableOpacity
              style={styles.checkinMiniButton}
              onPress={() => setShowCheckin(true)}
            >
              <Text style={styles.checkinMiniEmoji}>
                {moods.find(m => m.value === entry.mood)?.emoji || '😊'}
              </Text>
              <Text style={styles.checkinMiniText}>
                {energyLevels.find(e => e.value === entry.energyLevel)?.label || 'Normal'} {t('energy_label').replace(':', '')}
              </Text>
              <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          )}

          {/* Main Focus Card - THE core feature */}
          <View style={styles.focusCard}>
            <View style={styles.focusHeader}>
              <Ionicons name="sunny" size={24} color={colors.primary} />
              <Text style={styles.focusTitle}>{t('focus_title')}</Text>
            </View>

            <Text style={styles.focusSubtitle}>
              {totalCount === 0
                ? t('focus_subtitle_empty')
                : totalCount < 3
                ? t('focus_subtitle_slots', { count: 3 - totalCount })
                : t('focus_subtitle_full')}
            </Text>

            {/* Task Input - Only show if less than 3 tasks */}
            {totalCount < 3 && (
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.taskInput}
                  placeholder={t('add_task_placeholder')}
                  placeholderTextColor={colors.textMuted}
                  value={newTask}
                  onChangeText={setNewTask}
                  onSubmitEditing={addTask}
                  returnKeyType="done"
                />
                <TouchableOpacity
                  style={[
                    styles.addButton,
                    !newTask.trim() && styles.addButtonDisabled,
                  ]}
                  onPress={addTask}
                  disabled={!newTask.trim()}
                >
                  <Ionicons name="add" size={24} color={colors.white} />
                </TouchableOpacity>
              </View>
            )}

            {/* Tasks List */}
            {totalCount === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="sparkles-outline" size={48} color={colors.textMuted} />
                <Text style={styles.emptyText}>
                  {t('empty_focus_text')}
                </Text>
                <Text style={styles.emptyHint}>
                  {t('empty_focus_hint')}
                </Text>
              </View>
            ) : (
              <View style={styles.tasksList}>
                {entry.planned?.map((task, index) => {
                  const isCompleted = entry.acted?.includes(task);
                  return (
                    <View
                      key={index}
                      style={[
                        styles.taskItem,
                        isCompleted && styles.taskItemCompleted,
                      ]}
                    >
                      <TouchableOpacity
                        style={styles.taskCheckbox}
                        onPress={() => toggleTask(task)}
                      >
                        <View style={[
                          styles.checkbox,
                          isCompleted && styles.checkboxChecked,
                        ]}>
                          {isCompleted && (
                            <Ionicons name="checkmark" size={16} color={colors.white} />
                          )}
                        </View>
                      </TouchableOpacity>
                      <Text style={[
                        styles.taskText,
                        isCompleted && styles.taskTextCompleted,
                      ]}>
                        {task}
                      </Text>
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeTask(task)}
                      >
                        <Ionicons name="close" size={18} color={colors.textMuted} />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* Success Message - When all tasks done */}
          {totalCount > 0 && completedCount === totalCount && (
            <View style={styles.successCard}>
              <Text style={styles.successEmoji}>🎉</Text>
              <Text style={styles.successTitle}>{t('success_title')}</Text>
              <Text style={styles.successText}>
                {t('success_text')}
              </Text>
            </View>
          )}

          {/* Gentle Tip */}
          <View style={styles.tipCard}>
            <Ionicons name="leaf" size={18} color={colors.primary} />
            <Text style={styles.tipText}>
              {totalCount === 0
                ? t('tip_start')
                : completedCount === totalCount
                ? t('tip_celebrate')
                : t('tip_break_down')}
            </Text>
          </View>

          {/* Quick Access to Full Planner */}
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => navigation.navigate('Diario')}
          >
            <View style={styles.expandContent}>
              <Ionicons name="calendar-outline" size={20} color={colors.textLight} />
              <Text style={styles.expandText}>{t('view_full_planner')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      <MorningRitualModal 
        visible={showMorningModal}
        onClose={() => setShowMorningModal(false)}
        onComplete={handleMorningComplete}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl + 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  dateContainer: {
    flex: 1,
  },
  dayName: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textDark,
    letterSpacing: -0.5,
  },
  dateString: {
    fontSize: fontSize.md,
    color: colors.textLight,
    marginTop: 2,
  },
  progressBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
  },
  progressText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  ritualCard: {
      backgroundColor: colors.white,
      marginHorizontal: spacing.lg,
      marginBottom: spacing.md,
      padding: spacing.md,
      borderRadius: borderRadius.lg,
      ...shadows.md,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
  },
  ritualContent: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  ritualIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
  },
  ritualTextContainer: {
      flex: 1,
  },
  ritualTitle: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.bold,
      color: colors.textDark,
  },
  ritualSubtitle: {
      fontSize: fontSize.sm,
      color: colors.textLight,
  },
  checkinCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    ...shadows.sm,
  },
  checkinHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  checkinTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textDark,
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  moodButton: {
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    minWidth: 80,
  },
  moodButtonSelected: {
    backgroundColor: colors.primaryMuted,
  },
  moodEmoji: {
    fontSize: 36,
    marginBottom: spacing.xs,
  },
  moodLabel: {
    fontSize: fontSize.sm,
    color: colors.textLight,
  },
  moodLabelSelected: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  energySection: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.backgroundDark,
  },
  energyLabel: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    marginBottom: spacing.sm,
  },
  energyContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  energyButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundDark,
    alignItems: 'center',
  },
  energyText: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  energyTextSelected: {
    color: colors.white,
    fontWeight: fontWeight.semibold,
  },
  checkinMiniButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    ...shadows.xs,
  },
  checkinMiniEmoji: {
    fontSize: 20,
  },
  checkinMiniText: {
    fontSize: fontSize.sm,
    color: colors.textLight,
  },
  focusCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    ...shadows.md,
  },
  focusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  focusTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textDark,
    marginLeft: spacing.sm,
  },
  focusSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    marginBottom: spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  taskInput: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.backgroundDark,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    color: colors.text,
    marginRight: spacing.sm,
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: colors.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textLight,
    marginTop: spacing.md,
  },
  emptyHint: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  tasksList: {
    marginTop: spacing.sm,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  taskItemCompleted: {
    backgroundColor: colors.successLight,
  },
  taskCheckbox: {
    marginRight: spacing.md,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  taskText: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textLight,
  },
  removeButton: {
    padding: spacing.xs,
  },
  successCard: {
    backgroundColor: colors.successLight,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
  },
  successEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  successTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  successText: {
    fontSize: fontSize.sm,
    color: colors.text,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primaryMuted,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  tipText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.primary,
    lineHeight: 20,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.xs,
  },
  expandContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  expandText: {
    fontSize: fontSize.sm,
    color: colors.textLight,
  },
});
