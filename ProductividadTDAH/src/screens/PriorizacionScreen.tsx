import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import { Card, Button, Input, CheckBox, BrainDumpModal } from '../components';
import { useData, EisenhowerTask } from '../context/DataContext';
import { useLanguage } from '../i18n/LanguageContext';

interface PriorizacionScreenProps {
  navigation: any;
}

export const PriorizacionScreen: React.FC<PriorizacionScreenProps> = ({ navigation }) => {
  const { data, addEisenhowerTask, updateEisenhowerTask, deleteEisenhowerTask, addBrainDump } = useData();
  const { t } = useLanguage();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBrainDumpModal, setShowBrainDumpModal] = useState(false);
  
  const quadrants = [
    {
      id: 'urgent-important',
      title: t('quadrant_do'),
      subtitle: t('quadrant_do_subtitle'),
      description: t('quadrant_do_desc'),
      color: colors.error,
      icon: 'flash-outline' as const,
    },
    {
      id: 'not-urgent-important',
      title: t('quadrant_schedule'),
      subtitle: t('quadrant_schedule_subtitle'),
      description: t('quadrant_schedule_desc'),
      color: colors.olive,
      icon: 'calendar-outline' as const,
    },
    {
      id: 'urgent-not-important',
      title: t('quadrant_delegate'),
      subtitle: t('quadrant_delegate_subtitle'),
      description: t('quadrant_delegate_desc'),
      color: colors.warning,
      icon: 'people-outline' as const,
    },
    {
      id: 'not-urgent-not-important',
      title: t('quadrant_delete'),
      subtitle: t('quadrant_delete_subtitle'),
      description: t('quadrant_delete_desc'),
      color: colors.textLight,
      icon: 'trash-outline' as const,
    },
  ];

  const [selectedQuadrant, setSelectedQuadrant] = useState(quadrants[0]);
  const [newTaskText, setNewTaskText] = useState('');

  // Wizard State
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(0); // 0: Input, 1: Urgent?, 2: Important?
  const [wizardTask, setWizardTask] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  const getTasksForQuadrant = (quadrantId: string) => {
    return data.eisenhowerTasks.filter(t => t.quadrant === quadrantId);
  };

  const handleAddTask = async () => {
    if (!newTaskText.trim()) return;

    await addEisenhowerTask({
      text: newTaskText,
      quadrant: selectedQuadrant.id as EisenhowerTask['quadrant'],
      completed: false,
    });

    setNewTaskText('');
    setShowAddModal(false);
  };

  const handleBrainDumpSubmit = async (items: string[]) => {
    if (items.length > 0) {
      await addBrainDump(items);
    }
  };

  const toggleTaskCompletion = async (task: EisenhowerTask) => {
    await updateEisenhowerTask(task.id, { completed: !task.completed });
  };

  // Wizard Logic
  const startWizard = () => {
    setWizardStep(0);
    setWizardTask('');
    setIsUrgent(false);
    setShowWizard(true);
  };

  const handleWizardNext = () => {
    if (wizardStep === 0 && !wizardTask.trim()) return;
    setWizardStep(wizardStep + 1);
  };

  const handleWizardUrgency = (urgent: boolean) => {
    setIsUrgent(urgent);
    setWizardStep(2);
  };

  const handleWizardImportance = async (important: boolean) => {
    let quadrantId = '';
    if (isUrgent && important) quadrantId = 'urgent-important';
    else if (!isUrgent && important) quadrantId = 'not-urgent-important';
    else if (isUrgent && !important) quadrantId = 'urgent-not-important';
    else quadrantId = 'not-urgent-not-important';

    await addEisenhowerTask({
        text: wizardTask,
        quadrant: quadrantId as EisenhowerTask['quadrant'],
        completed: false,
    });

    setShowWizard(false);
  };

  const renderQuadrant = (quadrant: typeof quadrants[0]) => {
    const tasks = getTasksForQuadrant(quadrant.id);
    const completedCount = tasks.filter(t => t.completed).length;

    return (
      <TouchableOpacity
        key={quadrant.id}
        style={[styles.quadrantCard, { borderColor: quadrant.color }]}
        onPress={() => {
          setSelectedQuadrant(quadrant);
          setShowAddModal(true);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.quadrantHeader}>
          <View style={[styles.quadrantIcon, { backgroundColor: quadrant.color + '20' }]}>
            <Ionicons name={quadrant.icon} size={20} color={quadrant.color} />
          </View>
          <View style={styles.quadrantTitleContainer}>
            <Text style={styles.quadrantTitle}>{quadrant.title}</Text>
            <Text style={styles.quadrantSubtitle}>{quadrant.subtitle}</Text>
          </View>
          <View style={styles.taskCount}>
            <Text style={[styles.taskCountText, { color: quadrant.color }]}>
              {completedCount}/{tasks.length}
            </Text>
          </View>
        </View>

        {tasks.length === 0 ? (
          <Text style={styles.emptyQuadrant}>{t('empty_quadrant')}</Text>
        ) : (
          <View style={styles.tasksList}>
            {tasks.slice(0, 3).map((task) => (
              <View key={task.id} style={styles.taskItem}>
                <TouchableOpacity
                  style={styles.taskCheckbox}
                  onPress={() => toggleTaskCompletion(task)}
                >
                  <View style={[
                    styles.checkbox,
                    { borderColor: quadrant.color },
                    task.completed && { backgroundColor: quadrant.color },
                  ]}>
                    {task.completed && (
                      <Ionicons name="checkmark" size={12} color={colors.white} />
                    )}
                  </View>
                </TouchableOpacity>
                <Text style={[
                  styles.taskText,
                  task.completed && styles.taskTextCompleted,
                ]} numberOfLines={1}>
                  {task.text}
                </Text>
                <TouchableOpacity onPress={() => deleteEisenhowerTask(task.id)}>
                  <Ionicons name="close" size={16} color={colors.textLight} />
                </TouchableOpacity>
              </View>
            ))}
            {tasks.length > 3 && (
              <Text style={styles.moreTasksText}>
                {t('more_tasks', { count: tasks.length - 3 })}
              </Text>
            )}
          </View>
        )}
      </TouchableOpacity>
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
            <Text style={styles.title}>{t('prioritization_title')}</Text>
            <Text style={styles.subtitle}>{t('prioritization_subtitle')}</Text>
          </View>
        </View>

        {/* Wizard Button - NEW FEATURE */}
        <TouchableOpacity
            style={styles.wizardButton}
            onPress={startWizard}
        >
            <View style={styles.wizardIconContainer}>
                <Ionicons name="magic-wand" size={24} color={colors.white} />
            </View>
            <View style={styles.wizardTextContainer}>
                <Text style={styles.wizardTitle}>{t('wizard_button_title')}</Text>
                <Text style={styles.wizardSubtitle}>{t('wizard_button_subtitle')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.primary} />
        </TouchableOpacity>

        {/* Brain Dump Quick Action */}
        <TouchableOpacity
          style={styles.brainDumpButton}
          onPress={() => setShowBrainDumpModal(true)}
        >
          <Ionicons name="cloud-outline" size={24} color={colors.white} />
          <View style={styles.brainDumpContent}>
            <Text style={styles.brainDumpTitle}>{t('brain_dump')}</Text>
            <Text style={styles.brainDumpSubtitle}>{t('brain_dump_subtitle')}</Text>
          </View>
          <Ionicons name="add-circle" size={28} color={colors.white} />
        </TouchableOpacity>

        {/* Eisenhower Matrix */}
        <View style={styles.matrixContainer}>
          <View style={styles.matrixRow}>
            {renderQuadrant(quadrants[0])}
            {renderQuadrant(quadrants[1])}
          </View>
          <View style={styles.matrixRow}>
            {renderQuadrant(quadrants[2])}
            {renderQuadrant(quadrants[3])}
          </View>
        </View>

        {/* Explanation Card */}
        <Card style={styles.explanationCard}>
            <View style={styles.explanationHeader}>
              <Ionicons name="information-circle" size={24} color={colors.priorizacion} />
              <Text style={styles.explanationTitle}>{t('how_to_use')}</Text>
            </View>
            <Text style={styles.explanationText}>
              {t('how_to_use_desc').split('\n\n').map((part, i) => (
                <Text key={i}>{part}{'\n'}</Text>
              ))}
            </Text>
        </Card>
      </ScrollView>

      {/* Wizard Modal */}
      <Modal visible={showWizard} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{t('wizard_modal_title')}</Text>
                    <TouchableOpacity onPress={() => setShowWizard(false)}>
                        <Ionicons name="close" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

                {wizardStep === 0 && (
                    <View>
                        <Text style={styles.wizardQuestion}>{t('wizard_q1')}</Text>
                        <Input
                            placeholder={t('wizard_q1_placeholder')}
                            value={wizardTask}
                            onChangeText={setWizardTask}
                            autoFocus
                        />
                        <Button
                            title={t('wizard_next')}
                            onPress={handleWizardNext}
                            disabled={!wizardTask.trim()}
                            style={{ marginTop: spacing.lg }}
                        />
                    </View>
                )}

                {wizardStep === 1 && (
                    <View>
                        <Text style={styles.wizardQuestion}>{t('wizard_q2')}</Text>
                        <View style={styles.wizardActions}>
                            <Button 
                                title={t('wizard_yes_urgent')}
                                onPress={() => handleWizardUrgency(true)} 
                                variant="outline" 
                                style={{ flex: 1 }}
                            />
                            <View style={{ width: spacing.md }} />
                            <Button 
                                title={t('wizard_no_urgent')}
                                onPress={() => handleWizardUrgency(false)} 
                                variant="outline" 
                                style={{ flex: 1 }}
                            />
                        </View>
                    </View>
                )}

                {wizardStep === 2 && (
                    <View>
                        <Text style={styles.wizardQuestion}>{t('wizard_q3')}</Text>
                        <Text style={styles.wizardSubQuestion}>{t('wizard_q3_sub')}</Text>
                        <View style={styles.wizardActions}>
                            <Button 
                                title={t('wizard_yes_important')}
                                onPress={() => handleWizardImportance(true)} 
                                variant="primary" 
                                style={{ flex: 1 }}
                            />
                            <View style={{ width: spacing.md }} />
                            <Button 
                                title={t('wizard_no_important')}
                                onPress={() => handleWizardImportance(false)} 
                                variant="secondary" 
                                style={{ flex: 1 }}
                            />
                        </View>
                    </View>
                )}
              </View>
          </View>
      </Modal>

      {/* Add Task Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{selectedQuadrant.title}</Text>
                <Text style={styles.modalSubtitle}>{selectedQuadrant.subtitle}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>{selectedQuadrant.description}</Text>

            {/* Quadrant Selector */}
            <View style={styles.quadrantSelector}>
              {quadrants.map((q) => (
                <TouchableOpacity
                  key={q.id}
                  style={[
                    styles.quadrantSelectorItem,
                    selectedQuadrant.id === q.id && { backgroundColor: q.color },
                  ]}
                  onPress={() => setSelectedQuadrant(q)}
                >
                  <Ionicons
                    name={q.icon}
                    size={16}
                    color={selectedQuadrant.id === q.id ? colors.white : q.color}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Input
              label={t('add_task_modal_title')}
              placeholder={t('add_task_modal_placeholder')}
              value={newTaskText}
              onChangeText={setNewTaskText}
            />

            {/* Tasks in this quadrant */}
            <Text style={styles.tasksListTitle}>{t('tasks_in_quadrant')}</Text>
            <ScrollView style={styles.modalTasksList}>
              {getTasksForQuadrant(selectedQuadrant.id).map((task) => (
                <CheckBox
                  key={task.id}
                  checked={task.completed}
                  onToggle={() => toggleTaskCompletion(task)}
                  label={task.text}
                  color={selectedQuadrant.color}
                />
              ))}
              {getTasksForQuadrant(selectedQuadrant.id).length === 0 && (
                <Text style={styles.noTasksText}>{t('no_tasks_in_quadrant')}</Text>
              )}
            </ScrollView>

            <Button
              title={t('add_task_button')}
              onPress={handleAddTask}
              variant="primary"
              color={selectedQuadrant.color}
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 2,
    borderBottomColor: colors.priorizacion,
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
  wizardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.primary + '40',
    ...shadows.sm,
  },
  wizardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  wizardTextContainer: {
    flex: 1,
  },
  wizardTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textDark,
  },
  wizardSubtitle: {
    fontSize: fontSize.xs,
    color: colors.textLight,
  },
  wizardQuestion: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textDark,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  wizardSubQuestion: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    marginBottom: spacing.lg,
    textAlign: 'center',
    marginTop: -spacing.sm,
  },
  wizardActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
  },
  brainDumpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.pink,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  brainDumpContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  brainDumpTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  brainDumpSubtitle: {
    fontSize: fontSize.sm,
    color: colors.white,
    opacity: 0.8,
  },
  explanationCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  explanationTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.priorizacion,
    marginLeft: spacing.xs,
  },
  explanationText: {
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 22,
  },
  matrixContainer: {
    padding: spacing.lg,
  },
  matrixRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  quadrantCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 2,
    minHeight: 150,
    ...shadows.sm,
  },
  quadrantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  quadrantIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quadrantTitleContainer: {
    flex: 1,
    marginLeft: spacing.xs,
  },
  quadrantTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.textDark,
  },
  quadrantSubtitle: {
    fontSize: 10,
    color: colors.textLight,
  },
  taskCount: {
    backgroundColor: colors.backgroundLight,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  taskCountText: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
  },
  emptyQuadrant: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: spacing.md,
  },
  tasksList: {
    marginTop: spacing.xs,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  taskCheckbox: {
    marginRight: spacing.xs,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.text,
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textLight,
  },
  moreTasksText: {
    fontSize: 10,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  recentDumpsCard: {
    marginHorizontal: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textDark,
    marginLeft: spacing.xs,
  },
  dumpItem: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundDark,
  },
  dumpDate: {
    fontSize: fontSize.xs,
    color: colors.textLight,
  },
  dumpPreview: {
    fontSize: fontSize.sm,
    color: colors.text,
    marginTop: 2,
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
    maxHeight: '80%',
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
  modalDescription: {
    fontSize: fontSize.sm,
    color: colors.text,
    marginBottom: spacing.md,
  },
  quadrantSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  quadrantSelectorItem: {
    flex: 1,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tasksListTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  modalTasksList: {
    maxHeight: 150,
  },
  noTasksText: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  modalButton: {
    marginTop: spacing.lg,
  },
});
