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
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows, animation } from '../styles/theme';
import { useData, DailyEntry } from '../context/DataContext';
import { useLanguage } from '../i18n/LanguageContext';
import haptic from '../utils/haptics';
import { MorningRitualModal, BrainDumpModal, Card } from '../components';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

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
  const [showBrainDumpModal, setShowBrainDumpModal] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

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
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 20,
        stiffness: 90,
        useNativeDriver: true,
      }),
    ]).start();
  }, [language]); 

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
      if (dumpItems.length > 0) {
          await addBrainDump(dumpItems);
      }
      
      const updatedDump = [...(entry.dump || []), ...dumpItems];
      const updatedPlanned = [...(entry.planned || []), ...plannedTasks].slice(0, 3);
      
      await saveEntry({
          dump: updatedDump,
          planned: updatedPlanned
      });
      
      haptic.success();
  };

  const handleBrainDumpSubmit = async (items: string[]) => {
    if (items.length > 0) {
      await addBrainDump(items);
      const updatedDump = [...(entry.dump || []), ...items];
      await saveEntry({ dump: updatedDump });
      haptic.success();
    }
  };

  const handleMoodSelect = (value: number) => {
    haptic.selection();
    saveEntry({ mood: value });
  };

  const handleEnergySelect = (value: number) => {
    haptic.selection();
    saveEntry({ energyLevel: value });
    setTimeout(() => {
        Animated.timing(slideAnim, { // Subtle nudge effect
            toValue: -10,
            duration: 200,
            useNativeDriver: true
        }).start(() => {
             setShowCheckin(false);
             Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true }).start();
        });
    }, 400);
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    if ((entry.planned?.length || 0) >= 3) return;
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
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.dateContainer}>
              <Text style={styles.dayName}>
                {dayName.charAt(0).toUpperCase() + dayName.slice(1)}
              </Text>
              <Text style={styles.dateString}>{dateString}</Text>
            </View>
            {totalCount > 0 && (
                <View style={styles.progressRingContainer}>
                   {/* Simplified Progress Badge */}
                   <View style={styles.progressBadge}>
                     <Text style={styles.progressText}>
                        {Math.round((completedCount / totalCount) * 100)}%
                     </Text>
                   </View>
                </View>
            )}
          </View>

          {/* Morning Ritual CTA */}
          {totalCount === 0 && (
            <Card 
                onPress={() => setShowMorningModal(true)}
                variant="gradient"
                gradientColors={colors.gradients.rose}
                style={styles.ritualCard}
            >
                <View style={styles.ritualContent}>
                    <View style={styles.ritualIconContainer}>
                        <Ionicons name="sparkles" size={24} color={colors.white} />
                    </View>
                    <View style={styles.ritualTextContainer}>
                        <Text style={styles.ritualTitleLight}>{t('start_ritual_title')}</Text>
                        <Text style={styles.ritualSubtitleLight}>{t('start_ritual_subtitle')}</Text>
                    </View>
                    <Ionicons name="arrow-forward" size={24} color={colors.white} style={{opacity: 0.8}} />
                </View>
            </Card>
          )}

          {/* Check-in Card */}
          {showCheckin && (
            <Card variant="elevated" style={styles.checkinCard}>
              <View style={styles.checkinHeader}>
                <Text style={styles.checkinTitle}>{t('checkin_title')}</Text>
                {hasCheckedIn && (
                  <TouchableOpacity onPress={() => setShowCheckin(false)}>
                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                  </TouchableOpacity>
                )}
              </View>

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
                            shadowColor: level.color,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 8,
                            elevation: 4,
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
            </Card>
          )}

          {!showCheckin && hasCheckedIn && (
            <TouchableOpacity
              style={styles.checkinMiniButton}
              onPress={() => setShowCheckin(true)}
            >
              <Text style={styles.checkinMiniEmoji}>
                {moods.find(m => m.value === entry.mood)?.emoji || '😊'}
              </Text>
              <Text style={styles.checkinMiniText}>
                {t('checkin_title')} • {energyLevels.find(e => e.value === entry.energyLevel)?.label || 'Normal'}
              </Text>
              <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          )}

          {/* MAIN FOCUS CARD */}
          <Card 
            variant="gradient" 
            gradientColors={colors.gradients.primary}
            style={styles.focusCard}
            hapticFeedback={false} // Handle internal interactions
          >
            <View style={styles.focusHeader}>
              <View style={styles.focusTitleRow}>
                <Ionicons name="sunny" size={24} color={colors.white} />
                <Text style={styles.focusTitleLight}>{t('focus_title')}</Text>
              </View>
              <View style={styles.focusCountBadge}>
                 <Text style={styles.focusCountText}>{totalCount}/3</Text>
              </View>
            </View>

            <Text style={styles.focusSubtitleLight}>
              {totalCount === 0
                ? t('focus_subtitle_empty')
                : totalCount < 3
                ? t('focus_subtitle_slots', { count: 3 - totalCount })
                : t('focus_subtitle_full')}
            </Text>

            {/* Tasks List */}
            {totalCount > 0 && (
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
                            <Ionicons name="checkmark" size={18} color={colors.primary} />
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

            {/* Input Row - Inside the card for seamless look */}
            {totalCount < 3 && (
              <View style={[styles.inputRow, totalCount > 0 && { marginTop: spacing.md }]}>
                <TextInput
                  style={styles.taskInput}
                  placeholder={t('add_task_placeholder')}
                  placeholderTextColor={'rgba(255,255,255, 0.7)'}
                  value={newTask}
                  onChangeText={setNewTask}
                  onSubmitEditing={addTask}
                  returnKeyType="done"
                  selectionColor={colors.white}
                />
                <TouchableOpacity
                  style={[
                    styles.addButton,
                    !newTask.trim() && styles.addButtonDisabled,
                  ]}
                  onPress={addTask}
                  disabled={!newTask.trim()}
                >
                  <Ionicons name="arrow-up" size={24} color={colors.primary} />
                </TouchableOpacity>
              </View>
            )}

            {totalCount === 0 && (
                 <View style={{ alignItems: 'center', opacity: 0.8, marginTop: spacing.lg }}>
                    <Ionicons name="list-outline" size={40} color={colors.white} />
                    <Text style={{ color: colors.white, marginTop: 8, fontSize: fontSize.sm }}>{t('empty_focus_hint')}</Text>
                 </View>
            )}
          </Card>

          {/* Celebration Card */}
          {totalCount > 0 && completedCount === totalCount && (
            <Card 
                variant="elevated"
                color={colors.highlight}
                style={styles.successCard}
            >
              <Text style={styles.successEmoji}>🎉</Text>
              <Text style={styles.successTitle}>{t('success_title')}</Text>
              <Text style={styles.successText}>
                {t('success_text')}
              </Text>
            </Card>
          )}

          {/* Navigation Links */}
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => navigation.navigate('Diario')}
          >
            <View style={styles.expandContent}>
              <View style={[styles.iconBox, { backgroundColor: colors.infoLight }]}>
                 <Ionicons name="calendar" size={22} color={colors.info} />
              </View>
              <Text style={styles.expandText}>{t('view_full_planner')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

        </Animated.View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setShowBrainDumpModal(true)}
        activeOpacity={0.8}
      >
        <LinearGradient
            colors={colors.gradients.sunset}
            style={styles.fabGradient}
        >
            <Ionicons name="bulb" size={28} color={colors.white} />
        </LinearGradient>
      </TouchableOpacity>

      <MorningRitualModal 
        visible={showMorningModal}
        onClose={() => setShowMorningModal(false)}
        onComplete={handleMorningComplete}
      />
      
      <BrainDumpModal
        visible={showBrainDumpModal}
        onClose={() => setShowBrainDumpModal(false)}
        onSubmit={handleBrainDumpSubmit}
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
    paddingBottom: spacing.xxl + 80,
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  dateContainer: {
    flex: 1,
  },
  dayName: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.bold,
    color: colors.textDark,
    letterSpacing: -1,
    lineHeight: 48,
  },
  dateString: {
    fontSize: fontSize.lg,
    color: colors.textLight,
    marginTop: 0,
    fontWeight: fontWeight.medium,
  },
  progressRingContainer: {
      justifyContent: 'center',
      alignItems: 'center',
  },
  progressBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
  },
  progressText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  ritualCard: {
      marginBottom: spacing.lg,
      borderLeftWidth: 0, // Override default
  },
  ritualContent: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  ritualIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
  },
  ritualTextContainer: {
      flex: 1,
  },
  ritualTitleLight: {
      fontSize: fontSize.md,
      fontWeight: fontWeight.bold,
      color: colors.white,
  },
  ritualSubtitleLight: {
      fontSize: fontSize.sm,
      color: 'rgba(255,255,255,0.9)',
  },
  checkinCard: {
    marginBottom: spacing.lg,
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
    marginVertical: spacing.sm,
  },
  moodButton: {
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    minWidth: 80,
    backgroundColor: colors.background,
  },
  moodButtonSelected: {
    backgroundColor: colors.primaryMuted,
    transform: [{ scale: 1.05 }],
  },
  moodEmoji: {
    fontSize: 32,
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
    gap: spacing.md,
  },
  energyButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  energyText: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  energyTextSelected: {
    color: colors.white,
    fontWeight: fontWeight.bold,
  },
  checkinMiniButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    ...shadows.sm,
  },
  checkinMiniEmoji: {
    fontSize: 20,
  },
  checkinMiniText: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    fontWeight: fontWeight.medium,
  },
  focusCard: {
    marginBottom: spacing.lg,
    minHeight: 200,
    justifyContent: 'space-between',
  },
  focusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  focusTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  focusTitleLight: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  focusCountBadge: {
      backgroundColor: 'rgba(255,255,255,0.2)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
  },
  focusCountText: {
      color: colors.white,
      fontSize: 12,
      fontWeight: 'bold',
  },
  focusSubtitleLight: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: spacing.lg,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: fontSize.md,
    color: colors.white,
    marginRight: spacing.sm,
  },
  addButton: {
    backgroundColor: colors.white,
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  addButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    elevation: 0,
  },
  tasksList: {
    marginTop: spacing.xs,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    ...shadows.xs,
  },
  taskItemCompleted: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    opacity: 0.9,
  },
  taskCheckbox: {
    marginRight: spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
  },
  checkboxChecked: {
    backgroundColor: colors.white,
    borderColor: colors.white,
  },
  taskText: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  removeButton: {
    padding: spacing.xs,
  },
  successCard: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    backgroundColor: colors.white, 
  },
  successEmoji: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  successTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textDark,
  },
  successText: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    ...shadows.sm,
    marginBottom: spacing.xl,
  },
  expandContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconBox: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
  },
  expandText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    ...shadows.lg,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
