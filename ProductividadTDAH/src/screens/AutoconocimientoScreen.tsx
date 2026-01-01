import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import { Card, Button, Input } from '../components';
import { useData } from '../context/DataContext';
import { useLanguage } from '../i18n/LanguageContext';

const reflectionPromptKeys = {
  strength: ['prompt_strength_1', 'prompt_strength_2', 'prompt_strength_3', 'prompt_strength_4'],
  weakness: ['prompt_weakness_1', 'prompt_weakness_2', 'prompt_weakness_3', 'prompt_weakness_4'],
  growth: ['prompt_growth_1', 'prompt_growth_2', 'prompt_growth_3', 'prompt_growth_4'],
  values: ['prompt_values_1', 'prompt_values_2', 'prompt_values_3', 'prompt_values_4'],
} as const;

const growthMindsetExerciseIds = [
  { id: 'reframe', titleKey: 'exercise_reframe_title', descKey: 'exercise_reframe_desc', icon: 'refresh-outline' },
  { id: 'celebrate', titleKey: 'exercise_celebrate_title', descKey: 'exercise_celebrate_desc', icon: 'trophy-outline' },
  { id: 'process', titleKey: 'exercise_process_title', descKey: 'exercise_process_desc', icon: 'trending-up-outline' },
  { id: 'feedback', titleKey: 'exercise_feedback_title', descKey: 'exercise_feedback_desc', icon: 'chatbubbles-outline' },
] as const;

interface AutoconocimientoScreenProps {
  navigation: any;
}

export const AutoconocimientoScreen: React.FC<AutoconocimientoScreenProps> = ({ navigation }) => {
  const { data, addReflection } = useData();
  const { t, language } = useLanguage();
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [selectedType, setSelectedType] = useState<keyof typeof reflectionPromptKeys>('strength');
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [reflectionText, setReflectionText] = useState('');

  const handleSaveReflection = async () => {
    if (!reflectionText.trim() || !selectedPrompt) return;

    await addReflection({
      date: new Date().toISOString(),
      type: selectedType,
      prompt: selectedPrompt,
      response: reflectionText,
    });

    setReflectionText('');
    setSelectedPrompt('');
    setShowReflectionModal(false);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'strength': return colors.olive;
      case 'weakness': return colors.pink;
      case 'growth': return colors.orange;
      case 'values': return colors.priorizacion;
      default: return colors.textLight;
    }
  };

  const getTypeIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'strength': return 'flash-outline';
      case 'weakness': return 'construct-outline';
      case 'growth': return 'leaf-outline';
      case 'values': return 'heart-outline';
      default: return 'document-text-outline';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'strength': return t('reflection_strengths');
      case 'weakness': return t('reflection_areas');
      case 'growth': return t('reflection_growth');
      case 'values': return t('reflection_values');
      default: return 'General';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>{t('autocon_title')}</Text>
            <Text style={styles.subtitle}>{t('autocon_subtitle')}</Text>
          </View>
        </View>

        {/* Intro Card */}
        <Card style={styles.introCard}>
          <Ionicons name="heart" size={32} color={colors.pink} />
          <Text style={styles.introTitle}>{t('autocon_intro_title')}</Text>
          <Text style={styles.introText}>
            {t('autocon_intro_text')}
          </Text>
        </Card>

        {/* Reflection Types */}
        <Text style={styles.sectionTitle}>{t('autocon_areas')}</Text>
        <View style={styles.typesContainer}>
          {(Object.keys(reflectionPromptKeys) as Array<keyof typeof reflectionPromptKeys>).map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.typeCard, { borderColor: getTypeColor(type) }]}
              onPress={() => {
                setSelectedType(type);
                setShowReflectionModal(true);
              }}
            >
              <View style={[styles.typeIcon, { backgroundColor: getTypeColor(type) + '20' }]}>
                <Ionicons name={getTypeIcon(type)} size={24} color={getTypeColor(type)} />
              </View>
              <Text style={styles.typeName}>{getTypeName(type)}</Text>
              <Text style={styles.typeCount}>
                {t('autocon_reflections_count', { count: data.reflections.filter(r => r.type === type).length })}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Growth Mindset Section */}
        <Card variant="elevated" style={styles.growthCard}>
          <View style={styles.growthHeader}>
            <Ionicons name="rocket-outline" size={24} color={colors.orange} />
            <Text style={styles.growthTitle}>{t('autocon_growth_mindset')}</Text>
          </View>
          <Text style={styles.growthDescription}>
            {t('autocon_growth_desc')}
          </Text>

          {growthMindsetExerciseIds.map((exercise) => (
            <View key={exercise.id} style={styles.exerciseItem}>
              <View style={styles.exerciseIcon}>
                <Ionicons name={exercise.icon as any} size={20} color={colors.orange} />
              </View>
              <View style={styles.exerciseContent}>
                <Text style={styles.exerciseTitle}>{t(exercise.titleKey as any)}</Text>
                <Text style={styles.exerciseDescription}>{t(exercise.descKey as any)}</Text>
              </View>
            </View>
          ))}
        </Card>

        {/* Recent Reflections */}
        {data.reflections.length > 0 && (
          <Card variant="elevated" style={styles.recentCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="time-outline" size={20} color={colors.textLight} />
              <Text style={styles.recentTitle}>{t('autocon_recent')}</Text>
            </View>

            {data.reflections.slice(-3).reverse().map((reflection) => (
              <View key={reflection.id} style={styles.reflectionItem}>
                <View style={styles.reflectionHeader}>
                  <View style={[styles.reflectionBadge, { backgroundColor: getTypeColor(reflection.type) + '20' }]}>
                    <Ionicons
                      name={getTypeIcon(reflection.type)}
                      size={14}
                      color={getTypeColor(reflection.type)}
                    />
                    <Text style={[styles.reflectionBadgeText, { color: getTypeColor(reflection.type) }]}>
                      {getTypeName(reflection.type)}
                    </Text>
                  </View>
                  <Text style={styles.reflectionDate}>
                    {new Date(reflection.date).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US')}
                  </Text>
                </View>
                <Text style={styles.reflectionPrompt}>{reflection.prompt}</Text>
                <Text style={styles.reflectionResponse} numberOfLines={3}>
                  {reflection.response}
                </Text>
              </View>
            ))}
          </Card>
        )}

        {/* Affirmations Card */}
        <Card style={styles.affirmationsCard}>
          <View style={styles.affirmationsHeader}>
            <Ionicons name="sparkles" size={24} color={colors.white} />
            <Text style={styles.affirmationsTitle}>{t('autocon_affirmation_title')}</Text>
          </View>
          <Text style={styles.affirmationText}>
            {t('autocon_affirmation_text')}
          </Text>
        </Card>

        {/* Tips */}
        <Card style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb" size={20} color={colors.orange} />
            <Text style={styles.tipsTitle}>{t('autocon_adhd_tip')}</Text>
          </View>
          <Text style={styles.tipsText}>
            {t('autocon_adhd_tip_content')}
          </Text>
        </Card>
      </ScrollView>

      {/* Reflection Modal */}
      <Modal visible={showReflectionModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{getTypeName(selectedType)}</Text>
                <Text style={styles.modalSubtitle}>{t('autocon_personal_reflection')}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowReflectionModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.promptsLabel}>{t('autocon_choose_prompt')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.promptsScroll}>
              {reflectionPromptKeys[selectedType].map((promptKey, index) => {
                const translatedPrompt = t(promptKey as any);
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.promptChip,
                      selectedPrompt === translatedPrompt && { backgroundColor: getTypeColor(selectedType) },
                    ]}
                    onPress={() => setSelectedPrompt(translatedPrompt)}
                  >
                    <Text style={[
                      styles.promptChipText,
                      selectedPrompt === translatedPrompt && { color: colors.white },
                    ]}>
                      {translatedPrompt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {selectedPrompt && (
              <>
                <Text style={styles.selectedPrompt}>{selectedPrompt}</Text>
                <Input
                  placeholder={t('autocon_reflection_placeholder')}
                  value={reflectionText}
                  onChangeText={setReflectionText}
                  multiline
                  containerStyle={{ flex: 1 }}
                />
              </>
            )}

            <Button
              title={t('autocon_save_reflection')}
              onPress={handleSaveReflection}
              variant="primary"
              color={getTypeColor(selectedType)}
              style={styles.modalButton}
              disabled={!selectedPrompt || !reflectionText.trim()}
            />
          </View>
        </View>
      </Modal>
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
    padding: spacing.lg,
    borderBottomWidth: 2,
    borderBottomColor: colors.autoconocimiento,
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
  },
  introCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    alignItems: 'center',
    backgroundColor: colors.pinkLight + '30',
  },
  introTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.pink,
    marginTop: spacing.sm,
  },
  introText: {
    fontSize: fontSize.sm,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textDark,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  typeCard: {
    width: '47%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 2,
    alignItems: 'center',
    ...shadows.sm,
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  typeName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textDark,
  },
  typeCount: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    marginTop: 2,
  },
  growthCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  growthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  growthTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.orange,
    marginLeft: spacing.sm,
  },
  growthDescription: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    marginBottom: spacing.md,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundDark,
  },
  exerciseIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.orangeLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  exerciseTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.textDark,
  },
  exerciseDescription: {
    fontSize: fontSize.sm,
    color: colors.textLight,
  },
  recentCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  recentTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textDark,
    marginLeft: spacing.xs,
  },
  reflectionItem: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundDark,
  },
  reflectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  reflectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.round,
  },
  reflectionBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    marginLeft: 4,
  },
  reflectionDate: {
    fontSize: fontSize.xs,
    color: colors.textLight,
  },
  reflectionPrompt: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  reflectionResponse: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    lineHeight: 18,
  },
  affirmationsCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    backgroundColor: colors.autoconocimiento,
  },
  affirmationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  affirmationsTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.white,
    marginLeft: spacing.xs,
  },
  affirmationText: {
    fontSize: fontSize.md,
    color: colors.white,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  tipsCard: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.lg,
    backgroundColor: colors.orangeLight + '30',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  tipsTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.orange,
    marginLeft: spacing.xs,
  },
  tipsText: {
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textDark,
  },
  modalSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textLight,
  },
  promptsLabel: {
    fontSize: fontSize.sm,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  promptsScroll: {
    marginBottom: spacing.md,
  },
  promptChip: {
    backgroundColor: colors.backgroundDark,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    marginRight: spacing.sm,
    maxWidth: 200,
  },
  promptChipText: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  selectedPrompt: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.textDark,
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.md,
  },
  modalButton: {
    marginTop: spacing.lg,
  },
});
