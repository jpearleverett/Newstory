import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import { useData, Goal } from '../context/DataContext';
import { ProgressBar, CheckBox } from '../components';
import haptic from '../utils/haptics';

// ADHD-Friendly: Reduced from 8 categories to 4 (research: fewer choices = easier decisions)
const goalCategories = [
  { id: 'esencial', name: 'Esencial', icon: 'star-outline', color: colors.primary, description: 'Lo más importante' },
  { id: 'crecimiento', name: 'Crecer', icon: 'trending-up-outline', color: colors.orange, description: 'Desarrollo personal' },
  { id: 'diversion', name: 'Disfrutar', icon: 'heart-outline', color: colors.pink, description: 'Pasatiempos y alegría' },
  { id: 'otro', name: 'Otro', icon: 'ellipsis-horizontal-outline', color: colors.textLight, description: 'Todo lo demás' },
];

interface MetasScreenProps {
  navigation: any;
}

export const MetasScreen: React.FC<MetasScreenProps> = ({ navigation }) => {
  const { data, addGoal, updateGoal, deleteGoal } = useData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(goalCategories[0]);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalSteps, setGoalSteps] = useState(['', '', '']);

  const handleAddGoal = async () => {
    if (!goalTitle.trim()) return;
    haptic.medium();

    await addGoal({
      category: selectedCategory.id,
      title: goalTitle,
      description: '',
      progress: 0,
      steps: goalSteps
        .filter(s => s.trim() !== '')
        .map((text, i) => ({ id: `step-${i}`, text, completed: false })),
    });

    // Reset form
    setGoalTitle('');
    setGoalSteps(['', '', '']);
    setShowAddModal(false);
  };

  const toggleStep = async (goal: Goal, stepId: string) => {
    haptic.light();
    const updatedSteps = goal.steps.map(s =>
      s.id === stepId ? { ...s, completed: !s.completed } : s
    );
    const completedCount = updatedSteps.filter(s => s.completed).length;
    const progress = updatedSteps.length > 0
      ? Math.round((completedCount / updatedSteps.length) * 100)
      : 0;

    await updateGoal(goal.id, { steps: updatedSteps, progress });
  };

  const getCategoryInfo = (categoryId: string) => {
    return goalCategories.find(c => c.id === categoryId) || goalCategories[3];
  };

  const completedGoals = data.goals.filter(g => g.progress === 100).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Mis Metas</Text>
            <Text style={styles.subtitle}>
              {data.goals.length === 0
                ? 'Empieza con una meta pequeña'
                : `${completedGoals} de ${data.goals.length} completadas`}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton}>
            <Ionicons name="add-circle" size={32} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Goals List */}
        {data.goals.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="flag-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Sin metas aún</Text>
            <Text style={styles.emptyText}>
              Una meta pequeña es mejor que ninguna meta.
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setShowAddModal(true)}
            >
              <Text style={styles.emptyButtonText}>Crear mi primera meta</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.goalsContainer}>
            {data.goals.map((goal) => {
              const category = getCategoryInfo(goal.category);
              return (
                <View key={goal.id} style={styles.goalCard}>
                  <View style={styles.goalHeader}>
                    <View style={[styles.categoryBadge, { backgroundColor: category.color + '20' }]}>
                      <Ionicons name={category.icon as any} size={16} color={category.color} />
                      <Text style={[styles.categoryText, { color: category.color }]}>
                        {category.name}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => deleteGoal(goal.id)}>
                      <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.goalTitle}>{goal.title}</Text>

                  <ProgressBar
                    progress={goal.progress}
                    color={category.color}
                    showLabel
                    label={`${goal.progress}%`}
                  />

                  {goal.steps.length > 0 && (
                    <View style={styles.stepsContainer}>
                      {goal.steps.map(step => (
                        <CheckBox
                          key={step.id}
                          checked={step.completed}
                          onToggle={() => toggleStep(goal, step.id)}
                          label={step.text}
                          color={category.color}
                        />
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Tip */}
        <View style={styles.tipCard}>
          <Ionicons name="leaf" size={18} color={colors.primary} />
          <Text style={styles.tipText}>
            Tip: Las metas pequeñas y específicas se logran más fácil. "Caminar 10 minutos" es mejor que "hacer ejercicio".
          </Text>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Add Goal Modal - Simplified */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nueva Meta</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Category Selection - 4 options, displayed as simple chips */}
            <Text style={styles.inputLabel}>Tipo de meta</Text>
            <View style={styles.categoriesRow}>
              {goalCategories.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    selectedCategory.id === cat.id && { backgroundColor: cat.color },
                  ]}
                  onPress={() => {
                    haptic.selection();
                    setSelectedCategory(cat);
                  }}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={16}
                    color={selectedCategory.id === cat.id ? colors.white : cat.color}
                  />
                  <Text style={[
                    styles.categoryChipText,
                    selectedCategory.id === cat.id && { color: colors.white },
                  ]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Goal Title */}
            <Text style={styles.inputLabel}>¿Cuál es tu meta?</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ej: Caminar 15 minutos al día"
              placeholderTextColor={colors.textMuted}
              value={goalTitle}
              onChangeText={setGoalTitle}
            />

            {/* Simple Steps - 3 max */}
            <Text style={styles.inputLabel}>Pasos pequeños (opcional)</Text>
            {goalSteps.map((step, index) => (
              <TextInput
                key={index}
                style={styles.stepInput}
                placeholder={`Paso ${index + 1}`}
                placeholderTextColor={colors.textMuted}
                value={step}
                onChangeText={(value) => {
                  const newSteps = [...goalSteps];
                  newSteps[index] = value;
                  setGoalSteps(newSteps);
                }}
              />
            ))}

            <TouchableOpacity
              style={[styles.createButton, !goalTitle.trim() && styles.createButtonDisabled]}
              onPress={handleAddGoal}
              disabled={!goalTitle.trim()}
            >
              <Text style={styles.createButtonText}>Crear Meta</Text>
            </TouchableOpacity>
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
  addButton: {
    padding: spacing.xs,
  },
  goalsContainer: {
    paddingHorizontal: spacing.lg,
  },
  goalCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
    gap: spacing.xs,
  },
  categoryText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  goalTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textDark,
    marginBottom: spacing.md,
  },
  stepsContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.backgroundDark,
  },
  emptyCard: {
    backgroundColor: colors.white,
    margin: spacing.lg,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    ...shadows.sm,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textDark,
    marginTop: spacing.md,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  emptyButtonText: {
    color: colors.white,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.md,
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
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textDark,
  },
  inputLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    backgroundColor: colors.backgroundDark,
    gap: spacing.xs,
  },
  categoryChipText: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  textInput: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.backgroundDark,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    color: colors.text,
  },
  stepInput: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.backgroundDark,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  createButtonDisabled: {
    backgroundColor: colors.textMuted,
  },
  createButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
});
