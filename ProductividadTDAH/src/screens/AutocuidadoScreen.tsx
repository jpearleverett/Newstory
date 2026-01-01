import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import { useData, SelfCareEntry } from '../context/DataContext';
import { useLanguage } from '../i18n/LanguageContext';
import haptic from '../utils/haptics';

interface AutocuidadoScreenProps {
  navigation: any;
}

// ADHD-Friendly: Reduced from 7+ trackers to just 3 essential ones
// Research says: "Complicated apps are a no-go. ADHD brains thrive on straightforward tools"

export const AutocuidadoScreen: React.FC<AutocuidadoScreenProps> = ({ navigation }) => {
  const { getSelfCareEntry, addSelfCareEntry } = useData();
  const { t } = useLanguage();
  const today = format(new Date(), 'yyyy-MM-dd');

  const [entry, setEntry] = useState<Partial<SelfCareEntry>>({
    date: today,
    water: 0,
    sleep: 7,
    exercise: null,
    meals: { breakfast: '', lunch: '', dinner: '', snacks: [] },
    meditation: 0,
    gratitude: [],
    wins: [],
  });

  const [movedToday, setMovedToday] = useState(false);

  useEffect(() => {
    const existingEntry = getSelfCareEntry(today);
    if (existingEntry) {
      setEntry(existingEntry);
      setMovedToday(existingEntry.exercise !== null);
    }
  }, []);

  const saveEntry = async (updates: Partial<SelfCareEntry>) => {
    const updatedEntry = { ...entry, ...updates };
    setEntry(updatedEntry);
    await addSelfCareEntry({
      date: today,
      water: updatedEntry.water || 0,
      sleep: updatedEntry.sleep || 7,
      exercise: updatedEntry.exercise || null,
      meals: updatedEntry.meals || { breakfast: '', lunch: '', dinner: '', snacks: [] },
      meditation: updatedEntry.meditation || 0,
      gratitude: updatedEntry.gratitude || [],
      wins: updatedEntry.wins || [],
    });
  };

  const toggleWater = (glasses: number) => {
    haptic.light();
    saveEntry({ water: glasses });
  };

  const selectSleep = (hours: number) => {
    haptic.selection();
    saveEntry({ sleep: hours });
  };

  const toggleMovement = () => {
    haptic.medium();
    const newMoved = !movedToday;
    setMovedToday(newMoved);
    saveEntry({
      exercise: newMoved ? { type: 'movimiento', duration: 1 } : null,
    });
  };

  // Simple wellness score based on 3 things
  const getWellnessScore = () => {
    let score = 0;
    if ((entry.water || 0) >= 4) score++; // Drank at least 4 glasses
    if ((entry.sleep || 0) >= 7) score++; // Slept at least 7 hours
    if (movedToday) score++; // Moved today
    return score;
  };

  const wellnessScore = getWellnessScore();
  const wellnessMessage = wellnessScore === 3
    ? t('autocuidado_excellent')
    : wellnessScore === 2
    ? t('autocuidado_good')
    : wellnessScore === 1
    ? t('autocuidado_step')
    : t('autocuidado_start');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>{t('autocuidado_title')}</Text>
            <Text style={styles.subtitle}>{t('autocuidado_subtitle')}</Text>
          </View>
        </View>

        {/* Wellness Score */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreRow}>
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                style={[
                  styles.scoreDot,
                  i < wellnessScore && styles.scoreDotFilled,
                ]}
              />
            ))}
          </View>
          <Text style={styles.scoreMessage}>{wellnessMessage}</Text>
        </View>

        {/* 1. WATER - Simplified to 4 or 8 */}
        <View style={styles.trackerCard}>
          <View style={styles.trackerHeader}>
            <View style={[styles.trackerIcon, { backgroundColor: colors.priorizacion + '20' }]}>
              <Ionicons name="water" size={24} color={colors.priorizacion} />
            </View>
            <View style={styles.trackerInfo}>
              <Text style={styles.trackerTitle}>{t('autocuidado_water')}</Text>
              <Text style={styles.trackerSubtitle}>
                {(entry.water || 0) >= 4 ? t('autocuidado_hydrated') : t('autocuidado_drink_water')}
              </Text>
            </View>
          </View>

          <View style={styles.waterRow}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((glass) => (
              <TouchableOpacity
                key={glass}
                style={[
                  styles.waterGlass,
                  (entry.water || 0) >= glass && styles.waterGlassFilled,
                ]}
                onPress={() => toggleWater(glass)}
              >
                <Ionicons
                  name="water"
                  size={20}
                  color={(entry.water || 0) >= glass ? colors.white : colors.priorizacion}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.waterCount}>{t('autocuidado_glasses', { count: entry.water || 0 })}</Text>
        </View>

        {/* 2. SLEEP - Simplified */}
        <View style={styles.trackerCard}>
          <View style={styles.trackerHeader}>
            <View style={[styles.trackerIcon, { backgroundColor: colors.proyectos + '20' }]}>
              <Ionicons name="moon" size={24} color={colors.proyectos} />
            </View>
            <View style={styles.trackerInfo}>
              <Text style={styles.trackerTitle}>{t('autocuidado_sleep')}</Text>
              <Text style={styles.trackerSubtitle}>
                {(entry.sleep || 0) >= 7 ? t('autocuidado_good_rest') : t('autocuidado_hours_slept')}
              </Text>
            </View>
          </View>

          <View style={styles.sleepRow}>
            {[5, 6, 7, 8, 9].map((hours) => (
              <TouchableOpacity
                key={hours}
                style={[
                  styles.sleepButton,
                  entry.sleep === hours && styles.sleepButtonSelected,
                ]}
                onPress={() => selectSleep(hours)}
              >
                <Text style={[
                  styles.sleepText,
                  entry.sleep === hours && styles.sleepTextSelected,
                ]}>
                  {hours}h
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 3. MOVEMENT - Simple toggle */}
        <TouchableOpacity
          style={[
            styles.trackerCard,
            styles.movementCard,
            movedToday && styles.movementCardActive,
          ]}
          onPress={toggleMovement}
          activeOpacity={0.8}
        >
          <View style={styles.trackerHeader}>
            <View style={[
              styles.trackerIcon,
              { backgroundColor: movedToday ? colors.white + '30' : colors.primary + '20' },
            ]}>
              <Ionicons
                name={movedToday ? 'checkmark' : 'fitness'}
                size={24}
                color={movedToday ? colors.white : colors.primary}
              />
            </View>
            <View style={styles.trackerInfo}>
              <Text style={[
                styles.trackerTitle,
                movedToday && styles.movementTitleActive,
              ]}>
                {t('autocuidado_movement')}
              </Text>
              <Text style={[
                styles.trackerSubtitle,
                movedToday && styles.movementSubtitleActive,
              ]}>
                {movedToday ? t('autocuidado_moved_today') : t('autocuidado_tap_moved')}
              </Text>
            </View>
            {movedToday && (
              <Ionicons name="checkmark-circle" size={32} color={colors.white} />
            )}
          </View>

          {!movedToday && (
            <Text style={styles.movementHint}>
              {t('autocuidado_movement_hint')}
            </Text>
          )}
        </TouchableOpacity>

        {/* Tip */}
        <View style={styles.tipCard}>
          <Ionicons name="leaf" size={18} color={colors.primary} />
          <Text style={styles.tipText}>
            {t('autocuidado_tip')}
          </Text>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  backButton: {
    marginRight: spacing.md,
    padding: spacing.xs,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textDark,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    marginTop: 2,
  },
  scoreCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    ...shadows.sm,
  },
  scoreRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  scoreDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.backgroundDark,
  },
  scoreDotFilled: {
    backgroundColor: colors.primary,
  },
  scoreMessage: {
    fontSize: fontSize.md,
    color: colors.textLight,
    fontWeight: fontWeight.medium,
  },
  trackerCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    ...shadows.sm,
  },
  trackerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackerIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackerInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  trackerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textDark,
  },
  trackerSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    marginTop: 2,
  },
  waterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  waterGlass: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waterGlassFilled: {
    backgroundColor: colors.priorizacion,
  },
  waterCount: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  sleepRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  sleepButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundDark,
    alignItems: 'center',
  },
  sleepButtonSelected: {
    backgroundColor: colors.proyectos,
  },
  sleepText: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  sleepTextSelected: {
    color: colors.white,
    fontWeight: fontWeight.semibold,
  },
  movementCard: {
    borderWidth: 2,
    borderColor: 'transparent',
  },
  movementCardActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  movementTitleActive: {
    color: colors.white,
  },
  movementSubtitleActive: {
    color: colors.white,
    opacity: 0.9,
  },
  movementHint: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    marginTop: spacing.md,
    fontStyle: 'italic',
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primaryMuted,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
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
  bottomSpace: {
    height: spacing.xxl,
  },
});
