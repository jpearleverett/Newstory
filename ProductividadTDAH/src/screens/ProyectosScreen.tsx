import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import { Card, Button, Input, ProgressBar, CheckBox } from '../components';
import { useData, Project } from '../context/DataContext';

interface ProyectosScreenProps {
  navigation: any;
}

export const ProyectosScreen: React.FC<ProyectosScreenProps> = ({ navigation }) => {
  const { data, addProject, updateProject, deleteProject } = useData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectTasks, setProjectTasks] = useState(['', '', '']);

  const handleAddProject = async () => {
    if (!projectName.trim()) return;

    await addProject({
      name: projectName,
      description: projectDescription,
      tasks: projectTasks
        .filter(t => t.trim() !== '')
        .map((text, i) => ({ id: `task-${Date.now()}-${i}`, text, completed: false })),
      timeBlocks: [],
      status: 'not-started',
    });

    setProjectName('');
    setProjectDescription('');
    setProjectTasks(['', '', '']);
    setShowAddModal(false);
  };

  const toggleProjectTask = async (project: Project, taskId: string) => {
    const updatedTasks = project.tasks.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    const completedCount = updatedTasks.filter(t => t.completed).length;
    const allCompleted = completedCount === updatedTasks.length && updatedTasks.length > 0;

    await updateProject(project.id, {
      tasks: updatedTasks,
      status: allCompleted ? 'completed' : completedCount > 0 ? 'in-progress' : 'not-started',
    });
  };

  const getProjectProgress = (project: Project) => {
    if (project.tasks.length === 0) return 0;
    const completed = project.tasks.filter(t => t.completed).length;
    return Math.round((completed / project.tasks.length) * 100);
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'completed': return colors.olive;
      case 'in-progress': return colors.orange;
      default: return colors.textLight;
    }
  };

  const getStatusText = (status: Project['status']) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'in-progress': return 'En progreso';
      default: return 'Sin empezar';
    }
  };

  const renderProjectCard = (project: Project) => (
    <Card
      key={project.id}
      variant="elevated"
      style={styles.projectCard}
      onPress={() => setSelectedProject(project)}
    >
      <View style={styles.projectHeader}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(project.status) + '20' }]}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(project.status) }]} />
          <Text style={[styles.statusText, { color: getStatusColor(project.status) }]}>
            {getStatusText(project.status)}
          </Text>
        </View>
        <TouchableOpacity onPress={() => deleteProject(project.id)}>
          <Ionicons name="trash-outline" size={20} color={colors.textLight} />
        </TouchableOpacity>
      </View>

      <Text style={styles.projectName}>{project.name}</Text>
      {project.description && (
        <Text style={styles.projectDescription} numberOfLines={2}>
          {project.description}
        </Text>
      )}

      <ProgressBar
        progress={getProjectProgress(project)}
        color={getStatusColor(project.status)}
        showLabel
        label="Progreso"
      />

      <View style={styles.projectMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="checkbox-outline" size={16} color={colors.textLight} />
          <Text style={styles.metaText}>
            {project.tasks.filter(t => t.completed).length}/{project.tasks.length} tareas
          </Text>
        </View>
        {project.deadline && (
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={16} color={colors.textLight} />
            <Text style={styles.metaText}>
              {new Date(project.deadline).toLocaleDateString('es-ES')}
            </Text>
          </View>
        )}
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Proyectos</Text>
            <Text style={styles.subtitle}>Gestiona tus proyectos</Text>
          </View>
          <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton}>
            <Ionicons name="add-circle" size={32} color={colors.proyectos} />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{data.projects.length}</Text>
            <Text style={styles.statLabel}>Proyectos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {data.projects.filter(p => p.status === 'in-progress').length}
            </Text>
            <Text style={styles.statLabel}>En progreso</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {data.projects.filter(p => p.status === 'completed').length}
            </Text>
            <Text style={styles.statLabel}>Completados</Text>
          </View>
        </View>

        {/* Time Blocking Tip */}
        <Card style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <Ionicons name="time-outline" size={24} color={colors.proyectos} />
            <Text style={styles.tipTitle}>Time Blocking</Text>
          </View>
          <Text style={styles.tipDescription}>
            Divide tu proyecto en bloques de tiempo de 25-50 minutos con descansos.
            Esto ayuda a mantener el enfoque con TDAH.
          </Text>
        </Card>

        {/* Projects List */}
        {data.projects.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="folder-open-outline" size={48} color={colors.textLight} />
            <Text style={styles.emptyTitle}>No tienes proyectos</Text>
            <Text style={styles.emptyText}>
              Crea un proyecto para organizar tareas relacionadas y dar seguimiento a tu progreso.
            </Text>
            <Button
              title="Crear primer proyecto"
              onPress={() => setShowAddModal(true)}
              variant="primary"
              color={colors.proyectos}
            />
          </Card>
        ) : (
          <View style={styles.projectsContainer}>
            {data.projects.map(renderProjectCard)}
          </View>
        )}

        {/* Tips */}
        <Card style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb" size={20} color={colors.orange} />
            <Text style={styles.tipsTitle}>Tips para TDAH</Text>
          </View>
          <Text style={styles.tipsText}>
            • Divide proyectos grandes en tareas pequeñas{'\n'}
            • Establece fechas límite realistas{'\n'}
            • Celebra cada tarea completada{'\n'}
            • Si te sientes abrumado/a, enfócate solo en la siguiente tarea
          </Text>
        </Card>
      </ScrollView>

      {/* Add Project Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nuevo Proyecto</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Input
                label="Nombre del proyecto"
                placeholder="Ej: Rediseño del sitio web"
                value={projectName}
                onChangeText={setProjectName}
              />

              <Input
                label="Descripción"
                placeholder="¿De qué trata este proyecto?"
                value={projectDescription}
                onChangeText={setProjectDescription}
                multiline
              />

              <Text style={styles.inputLabel}>Tareas del proyecto</Text>
              {projectTasks.map((task, index) => (
                <Input
                  key={index}
                  placeholder={`Tarea ${index + 1}`}
                  value={task}
                  onChangeText={(value) => {
                    const newTasks = [...projectTasks];
                    newTasks[index] = value;
                    setProjectTasks(newTasks);
                  }}
                />
              ))}
              <TouchableOpacity
                style={styles.addTaskButton}
                onPress={() => setProjectTasks([...projectTasks, ''])}
              >
                <Ionicons name="add" size={20} color={colors.proyectos} />
                <Text style={styles.addTaskText}>Agregar tarea</Text>
              </TouchableOpacity>

              <Button
                title="Crear Proyecto"
                onPress={handleAddProject}
                variant="primary"
                color={colors.proyectos}
                style={styles.createButton}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Project Detail Modal */}
      <Modal visible={!!selectedProject} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedProject && (
              <>
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalTitle}>{selectedProject.name}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedProject.status) + '20' }]}>
                      <View style={[styles.statusDot, { backgroundColor: getStatusColor(selectedProject.status) }]} />
                      <Text style={[styles.statusText, { color: getStatusColor(selectedProject.status) }]}>
                        {getStatusText(selectedProject.status)}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedProject(null)}>
                    <Ionicons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>

                {selectedProject.description && (
                  <Text style={styles.detailDescription}>{selectedProject.description}</Text>
                )}

                <ProgressBar
                  progress={getProjectProgress(selectedProject)}
                  color={getStatusColor(selectedProject.status)}
                  showLabel
                  label="Progreso total"
                  height={12}
                />

                <Text style={styles.tasksTitle}>Tareas</Text>
                <ScrollView style={styles.tasksList}>
                  {selectedProject.tasks.map((task) => (
                    <CheckBox
                      key={task.id}
                      checked={task.completed}
                      onToggle={() => toggleProjectTask(selectedProject, task.id)}
                      label={task.text}
                      color={colors.proyectos}
                    />
                  ))}
                </ScrollView>

                <Button
                  title="Cerrar"
                  onPress={() => setSelectedProject(null)}
                  variant="outline"
                  color={colors.proyectos}
                  style={styles.closeButton}
                />
              </>
            )}
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
    borderBottomColor: colors.proyectos,
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
    color: colors.proyectos,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    marginTop: 2,
  },
  tipCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.proyectos + '15',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  tipTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.proyectos,
    marginLeft: spacing.sm,
  },
  tipDescription: {
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
  projectsContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  projectCard: {
    marginBottom: spacing.md,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.round,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  projectName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textDark,
    marginBottom: spacing.xs,
  },
  projectDescription: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    marginBottom: spacing.md,
  },
  projectMeta: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    marginLeft: spacing.xs,
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
  inputLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  addTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  addTaskText: {
    fontSize: fontSize.sm,
    color: colors.proyectos,
    marginLeft: spacing.xs,
  },
  createButton: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  detailDescription: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    marginBottom: spacing.md,
  },
  tasksTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textDark,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  tasksList: {
    maxHeight: 250,
  },
  closeButton: {
    marginTop: spacing.lg,
  },
});
