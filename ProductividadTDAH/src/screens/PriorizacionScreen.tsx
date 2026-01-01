import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import { Card, Button, Input, CheckBox } from '../components';
import { useData, EisenhowerTask } from '../context/DataContext';

interface PriorizacionScreenProps {
  navigation: any;
}

const quadrants = [
  {
    id: 'urgent-important',
    title: 'Hacer',
    subtitle: 'Urgente e Importante',
    description: 'Tareas críticas que necesitan atención inmediata',
    color: colors.error,
    icon: 'flash-outline' as const,
  },
  {
    id: 'not-urgent-important',
    title: 'Programar',
    subtitle: 'Importante pero No Urgente',
    description: 'Metas a largo plazo y desarrollo personal',
    color: colors.olive,
    icon: 'calendar-outline' as const,
  },
  {
    id: 'urgent-not-important',
    title: 'Delegar',
    subtitle: 'Urgente pero No Importante',
    description: 'Interrupciones y tareas que otros pueden hacer',
    color: colors.warning,
    icon: 'people-outline' as const,
  },
  {
    id: 'not-urgent-not-important',
    title: 'Eliminar',
    subtitle: 'Ni Urgente Ni Importante',
    description: 'Distracciones y pérdidas de tiempo',
    color: colors.textLight,
    icon: 'trash-outline' as const,
  },
];

export const PriorizacionScreen: React.FC<PriorizacionScreenProps> = ({ navigation }) => {
  const { data, addEisenhowerTask, updateEisenhowerTask, deleteEisenhowerTask, addBrainDump } = useData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBrainDumpModal, setShowBrainDumpModal] = useState(false);
  const [selectedQuadrant, setSelectedQuadrant] = useState(quadrants[0]);
  const [newTaskText, setNewTaskText] = useState('');
  const [brainDumpText, setBrainDumpText] = useState('');

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

  const handleBrainDump = async () => {
    if (!brainDumpText.trim()) return;

    const items = brainDumpText.split('\n').filter(item => item.trim() !== '');
    await addBrainDump(items);

    setBrainDumpText('');
    setShowBrainDumpModal(false);
  };

  const toggleTaskCompletion = async (task: EisenhowerTask) => {
    await updateEisenhowerTask(task.id, { completed: !task.completed });
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
          <Text style={styles.emptyQuadrant}>Toca para agregar tareas</Text>
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
              <Text style={styles.moreTasksText}>+{tasks.length - 3} más</Text>
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
            <Text style={styles.title}>Priorización</Text>
            <Text style={styles.subtitle}>Matriz Eisenhower</Text>
          </View>
        </View>

        {/* Brain Dump Quick Action */}
        <TouchableOpacity
          style={styles.brainDumpButton}
          onPress={() => setShowBrainDumpModal(true)}
        >
          <Ionicons name="cloud-outline" size={24} color={colors.white} />
          <View style={styles.brainDumpContent}>
            <Text style={styles.brainDumpTitle}>Brain Dump</Text>
            <Text style={styles.brainDumpSubtitle}>Vacía tu mente aquí</Text>
          </View>
          <Ionicons name="add-circle" size={28} color={colors.white} />
        </TouchableOpacity>

        {/* Explanation Card */}
        <Card style={styles.explanationCard}>
          <View style={styles.explanationHeader}>
            <Ionicons name="information-circle" size={24} color={colors.priorizacion} />
            <Text style={styles.explanationTitle}>¿Cómo usar la Matriz?</Text>
          </View>
          <Text style={styles.explanationText}>
            Clasifica tus tareas según su urgencia e importancia:{'\n\n'}
            <Text style={{ fontWeight: 'bold', color: colors.error }}>Hacer:</Text> Hazlo ahora{'\n'}
            <Text style={{ fontWeight: 'bold', color: colors.olive }}>Programar:</Text> Agenda un tiempo{'\n'}
            <Text style={{ fontWeight: 'bold', color: colors.warning }}>Delegar:</Text> ¿Quién puede ayudar?{'\n'}
            <Text style={{ fontWeight: 'bold', color: colors.textLight }}>Eliminar:</Text> ¿Realmente necesitas hacerlo?
          </Text>
        </Card>

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

        {/* Recent Brain Dumps */}
        {data.brainDumps.length > 0 && (
          <Card variant="elevated" style={styles.recentDumpsCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="cloud" size={20} color={colors.pink} />
              <Text style={styles.sectionTitle}>Brain Dumps Recientes</Text>
            </View>
            {data.brainDumps.slice(-3).reverse().map((dump, index) => (
              <View key={dump.id} style={styles.dumpItem}>
                <Text style={styles.dumpDate}>
                  {new Date(dump.date).toLocaleDateString('es-ES')}
                </Text>
                <Text style={styles.dumpPreview} numberOfLines={2}>
                  {dump.items.join(' • ')}
                </Text>
              </View>
            ))}
          </Card>
        )}

        {/* Tips */}
        <Card style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb" size={20} color={colors.orange} />
            <Text style={styles.tipsTitle}>Tip para TDAH</Text>
          </View>
          <Text style={styles.tipsText}>
            Con TDAH, todo puede sentirse urgente. Tómate un momento para preguntar:
            "¿Qué pasa si no hago esto hoy?". Si la respuesta es "nada grave", probablemente
            no es urgente.
          </Text>
        </Card>
      </ScrollView>

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
              label="Nueva tarea"
              placeholder="Describe la tarea..."
              value={newTaskText}
              onChangeText={setNewTaskText}
            />

            {/* Tasks in this quadrant */}
            <Text style={styles.tasksListTitle}>Tareas en este cuadrante:</Text>
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
                <Text style={styles.noTasksText}>No hay tareas en este cuadrante</Text>
              )}
            </ScrollView>

            <Button
              title="Agregar Tarea"
              onPress={handleAddTask}
              variant="primary"
              color={selectedQuadrant.color}
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>

      {/* Brain Dump Modal */}
      <Modal visible={showBrainDumpModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Brain Dump</Text>
                <Text style={styles.modalSubtitle}>Vacía tu mente</Text>
              </View>
              <TouchableOpacity onPress={() => setShowBrainDumpModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              Escribe todo lo que está en tu cabeza, sin filtrar ni juzgar.
              Cada línea será un item separado.
            </Text>

            <Input
              placeholder="Escribe aquí todo lo que está en tu mente...&#10;Una idea por línea"
              value={brainDumpText}
              onChangeText={setBrainDumpText}
              multiline
              containerStyle={{ flex: 1 }}
            />

            <Button
              title="Guardar Brain Dump"
              onPress={handleBrainDump}
              variant="primary"
              color={colors.pink}
              style={styles.modalButton}
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
  brainDumpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.pink,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
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
