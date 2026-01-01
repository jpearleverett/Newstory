import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import { Card, Button, Input, ProgressBar, CheckBox } from '../components';
import { useData, Goal } from '../context/DataContext';

const goalCategories = [
  { id: 'salud', name: 'Salud', icon: 'fitness-outline', color: colors.olive },
  { id: 'carrera', name: 'Carrera', icon: 'briefcase-outline', color: colors.priorizacion },
  { id: 'finanzas', name: 'Finanzas', icon: 'cash-outline', color: colors.dinero },
  { id: 'relaciones', name: 'Relaciones', icon: 'people-outline', color: colors.pink },
  { id: 'crecimiento', name: 'Crecimiento Personal', icon: 'trending-up-outline', color: colors.orange },
  { id: 'hogar', name: 'Hogar', icon: 'home-outline', color: colors.casa },
  { id: 'diversion', name: 'Diversión', icon: 'game-controller-outline', color: colors.proyectos },
  { id: 'otro', name: 'Otro', icon: 'ellipsis-horizontal-outline', color: colors.textLight },
];

interface MetasScreenProps {
  navigation: any;
}

export const MetasScreen: React.FC<MetasScreenProps> = ({ navigation }) => {
  const { data, addGoal, updateGoal, deleteGoal } = useData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(goalCategories[0]);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [goalSteps, setGoalSteps] = useState(['', '', '']);

  const handleAddGoal = async () => {
    if (!goalTitle.trim()) return;

    await addGoal({
      category: selectedCategory.id,
      title: goalTitle,
      description: goalDescription,
      progress: 0,
      steps: goalSteps
        .filter(s => s.trim() !== '')
        .map((text, i) => ({ id: `step-${i}`, text, completed: false })),
    });

    // Reset form
    setGoalTitle('');
    setGoalDescription('');
    setGoalSteps(['', '', '']);
    setShowAddModal(false);
  };

  const toggleStep = async (goal: Goal, stepId: string) => {
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
    return goalCategories.find(c => c.id === categoryId) || goalCategories[7];
  };

  const renderGoalCard = (goal: Goal) => {
    const category = getCategoryInfo(goal.category);

    return (
      <Card key={goal.id} variant="elevated" color={category.color} style={styles.goalCard}>
        <View style={styles.goalHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: category.color + '20' }]}>
            <Ionicons name={category.icon as any} size={16} color={category.color} />
            <Text style={[styles.categoryText, { color: category.color }]}>{category.name}</Text>
          </View>
          <TouchableOpacity onPress={() => deleteGoal(goal.id)}>
            <Ionicons name="trash-outline" size={20} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        <Text style={styles.goalTitle}>{goal.title}</Text>
        {goal.description && <Text style={styles.goalDescription}>{goal.description}</Text>}

        <ProgressBar
          progress={goal.progress}
          color={category.color}
          showLabel
          label="Progreso"
        />

        {goal.steps.length > 0 && (
          <View style={styles.stepsContainer}>
            <Text style={styles.stepsTitle}>Pasos:</Text>
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
      </Card>
    );
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
            <Text style={styles.title}>Metas</Text>
            <Text style={styles.subtitle}>Define y alcanza tus objetivos</Text>
          </View>
          <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton}>
            <Ionicons name="add-circle" size={32} color={colors.metas} />
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{data.goals.length}</Text>
            <Text style={styles.statLabel}>Metas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {data.goals.filter(g => g.progress === 100).length}
            </Text>
            <Text style={styles.statLabel}>Completadas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {data.goals.length > 0
                ? Math.round(data.goals.reduce((acc, g) => acc + g.progress, 0) / data.goals.length)
                : 0}%
            </Text>
            <Text style={styles.statLabel}>Progreso</Text>
          </View>
        </View>

        {/* Goals List */}
        {data.goals.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="flag-outline" size={48} color={colors.textLight} />
            <Text style={styles.emptyTitle}>No tienes metas aún</Text>
            <Text style={styles.emptyText}>
              Comienza agregando una meta. Recuerda empezar pequeño y ser específico.
            </Text>
            <Button
              title="Agregar mi primera meta"
              onPress={() => setShowAddModal(true)}
              variant="primary"
              color={colors.metas}
            />
          </Card>
        ) : (
          <View style={styles.goalsContainer}>
            {data.goals.map(renderGoalCard)}
          </View>
        )}

        {/* 369 Method Card */}
        <Card style={styles.methodCard}>
          <View style={styles.methodHeader}>
            <Ionicons name="sparkles" size={24} color={colors.pink} />
            <Text style={styles.methodTitle}>Método 369</Text>
          </View>
          <Text style={styles.methodDescription}>
            Escribe tu meta 3 veces en la mañana, 6 veces en la tarde, y 9 veces en la noche
            para programar tu mente hacia el éxito.
          </Text>
          <TouchableOpacity style={styles.methodButton}>
            <Text style={styles.methodButtonText}>Practicar método 369</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.pink} />
          </TouchableOpacity>
        </Card>

        {/* Tips */}
        <Card style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb" size={20} color={colors.orange} />
            <Text style={styles.tipsTitle}>Tips para TDAH</Text>
          </View>
          <Text style={styles.tipsText}>
            • Divide tus metas grandes en pasos pequeños{'\n'}
            • Celebra cada paso completado{'\n'}
            • No te compares con otros, solo contigo mismo{'\n'}
            • Está bien ajustar tus metas si es necesario
          </Text>
        </Card>
      </ScrollView>

      {/* Add Goal Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nueva Meta</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Categoría</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
                {goalCategories.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryChip,
                      selectedCategory.id === cat.id && { backgroundColor: cat.color },
                    ]}
                    onPress={() => setSelectedCategory(cat)}
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
              </ScrollView>

              <Input
                label="¿Cuál es tu meta?"
                placeholder="Ej: Hacer ejercicio 3 veces por semana"
                value={goalTitle}
                onChangeText={setGoalTitle}
              />

              <Input
                label="Descripción (opcional)"
                placeholder="Más detalles sobre tu meta..."
                value={goalDescription}
                onChangeText={setGoalDescription}
                multiline
              />

              <Text style={styles.inputLabel}>Pasos para lograrla</Text>
              {goalSteps.map((step, index) => (
                <Input
                  key={index}
                  placeholder={`Paso ${index + 1}`}
                  value={step}
                  onChangeText={(value) => {
                    const newSteps = [...goalSteps];
                    newSteps[index] = value;
                    setGoalSteps(newSteps);
                  }}
                />
              ))}
              <TouchableOpacity
                style={styles.addStepButton}
                onPress={() => setGoalSteps([...goalSteps, ''])}
              >
                <Ionicons name="add" size={20} color={colors.olive} />
                <Text style={styles.addStepText}>Agregar paso</Text>
              </TouchableOpacity>

              <Button
                title="Crear Meta"
                onPress={handleAddGoal}
                variant="primary"
                color={colors.metas}
                style={styles.createButton}
              />
            </ScrollView>
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
    borderBottomColor: colors.metas,
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
  addButton: {
    padding: spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  statNumber: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.metas,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    marginTop: 2,
  },
  goalsContainer: {
    paddingHorizontal: spacing.lg,
  },
  goalCard: {
    marginBottom: spacing.md,
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
  },
  categoryText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    marginLeft: spacing.xs,
  },
  goalTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textDark,
    marginBottom: spacing.xs,
  },
  goalDescription: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    marginBottom: spacing.md,
  },
  stepsContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.backgroundDark,
  },
  stepsTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyCard: {
    margin: spacing.lg,
    alignItems: 'center',
    padding: spacing.xl,
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
    marginVertical: spacing.md,
  },
  methodCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: colors.pinkLight + '30',
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  methodTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.pink,
    marginLeft: spacing.sm,
  },
  methodDescription: {
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
  methodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  methodButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.pink,
    marginRight: spacing.xs,
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
    lineHeight: 22,
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
    maxHeight: '90%',
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
  categoriesScroll: {
    marginBottom: spacing.md,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    marginRight: spacing.sm,
    backgroundColor: colors.backgroundDark,
  },
  categoryChipText: {
    fontSize: fontSize.sm,
    marginLeft: spacing.xs,
    color: colors.text,
  },
  addStepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  addStepText: {
    fontSize: fontSize.sm,
    color: colors.olive,
    marginLeft: spacing.xs,
  },
  createButton: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
});
