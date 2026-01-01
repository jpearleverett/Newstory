import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import { Card, Button, Input, CheckBox } from '../components';
import { useData, HomeTask } from '../context/DataContext';
import { useLanguage } from '../i18n/LanguageContext';

const roomIds = [
  { id: 'cocina', nameKey: 'room_kitchen', icon: 'restaurant-outline' },
  { id: 'sala', nameKey: 'room_living', icon: 'tv-outline' },
  { id: 'dormitorio', nameKey: 'room_bedroom', icon: 'bed-outline' },
  { id: 'bano', nameKey: 'room_bathroom', icon: 'water-outline' },
  { id: 'oficina', nameKey: 'room_office', icon: 'desktop-outline' },
  { id: 'general', nameKey: 'room_general', icon: 'home-outline' },
] as const;

const defaultTaskKeys = {
  cocina: ['task_wash_dishes', 'task_clean_counters', 'task_sweep_mop', 'task_take_trash'],
  sala: ['task_arrange_pillows', 'task_dust_furniture', 'task_vacuum_sweep', 'task_organize_remote'],
  dormitorio: ['task_make_bed', 'task_pick_clothes', 'task_organize_nightstand', 'task_ventilate_room'],
  bano: ['task_clean_mirror', 'task_clean_sink', 'task_clean_toilet', 'task_wash_towels'],
  oficina: ['task_organize_desk', 'task_organize_cables', 'task_clean_screen', 'task_file_papers'],
  general: ['task_water_plants', 'task_check_mail', 'task_walk_pets', 'task_empty_bins'],
} as const;

interface CasaScreenProps {
  navigation: any;
}

export const CasaScreen: React.FC<CasaScreenProps> = ({ navigation }) => {
  const { data, addHomeTask, toggleHomeTaskDay, deleteHomeTask } = useData();
  const { t, language } = useLanguage();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(roomIds[0]);
  const [newTaskName, setNewTaskName] = useState('');
  const [taskFrequency, setTaskFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [simplificationDay, setSimplificationDay] = useState(1);

  const today = format(new Date(), 'yyyy-MM-dd');
  const dateLocale = language === 'es' ? es : enUS;

  // Helper to get room with translated name
  const getRoomWithTranslation = (room: typeof roomIds[number]) => ({
    ...room,
    name: t(room.nameKey as any),
  });

  // Get all rooms with translated names
  const rooms = roomIds.map(getRoomWithTranslation);

  const handleAddTask = async () => {
    if (!newTaskName.trim()) return;

    await addHomeTask({
      room: selectedRoom.id,
      task: newTaskName,
      frequency: taskFrequency,
    });

    setNewTaskName('');
    setShowAddModal(false);
  };

  const getTasksForRoom = (roomId: string) => {
    return data.homeTasks.filter(t => t.room === roomId);
  };

  const isTaskCompletedToday = (task: HomeTask) => {
    return task.completedDates.includes(today);
  };

  const getTodayProgress = () => {
    const dailyTasks = data.homeTasks.filter(t => t.frequency === 'daily');
    if (dailyTasks.length === 0) return 0;
    const completed = dailyTasks.filter(t => isTaskCompletedToday(t)).length;
    return Math.round((completed / dailyTasks.length) * 100);
  };

  // Get the challenge text for the current day
  const getChallenge = (day: number) => {
    const key = `challenge_${day}` as any;
    return t(key);
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
            <Text style={styles.title}>{t('casa_title')}</Text>
            <Text style={styles.subtitle}>{t('casa_subtitle')}</Text>
          </View>
          <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton}>
            <Ionicons name="add-circle" size={32} color={colors.casa} />
          </TouchableOpacity>
        </View>

        {/* Today's Progress */}
        <Card variant="elevated" style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.progressTitle}>{t('casa_today_progress')}</Text>
              <Text style={styles.progressDate}>{format(new Date(), language === 'es' ? "EEEE, d 'de' MMMM" : "EEEE, MMMM d", { locale: dateLocale })}</Text>
            </View>
            <View style={styles.progressCircle}>
              <Text style={styles.progressPercent}>{getTodayProgress()}%</Text>
            </View>
          </View>
        </Card>

        {/* 30-Day Simplification Challenge */}
        <Card style={styles.challengeCard}>
          <View style={styles.challengeHeader}>
            <Ionicons name="sparkles" size={24} color={colors.white} />
            <Text style={styles.challengeTitle}>{t('casa_challenge_title')}</Text>
          </View>
          <Text style={styles.challengeSubtitle}>{t('casa_challenge_subtitle')}</Text>

          <View style={styles.daySelector}>
            <TouchableOpacity
              onPress={() => setSimplificationDay(Math.max(1, simplificationDay - 1))}
              style={styles.dayButton}
            >
              <Ionicons name="chevron-back" size={24} color={colors.white} />
            </TouchableOpacity>
            <View style={styles.dayDisplay}>
              <Text style={styles.dayNumber}>{t('casa_day', { number: simplificationDay })}</Text>
              <Text style={styles.dayOf}>/30</Text>
            </View>
            <TouchableOpacity
              onPress={() => setSimplificationDay(Math.min(30, simplificationDay + 1))}
              style={styles.dayButton}
            >
              <Ionicons name="chevron-forward" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>

          <Text style={styles.challengeTask}>
            {getChallenge(simplificationDay)}
          </Text>
        </Card>

        {/* Rooms */}
        <Text style={styles.sectionTitle}>{t('casa_rooms')}</Text>
        {rooms.map((room) => {
          const roomTasks = getTasksForRoom(room.id);
          const completedCount = roomTasks.filter(task => isTaskCompletedToday(task)).length;

          return (
            <Card key={room.id} variant="elevated" style={styles.roomCard}>
              <View style={styles.roomHeader}>
                <View style={[styles.roomIcon, { backgroundColor: colors.casa + '20' }]}>
                  <Ionicons name={room.icon as any} size={24} color={colors.casa} />
                </View>
                <View style={styles.roomInfo}>
                  <Text style={styles.roomName}>{room.name}</Text>
                  <Text style={styles.roomProgress}>
                    {t('casa_tasks_today', { completed: completedCount, total: roomTasks.length })}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.addRoomTask}
                  onPress={() => {
                    const roomId = roomIds.find(r => r.id === room.id);
                    if (roomId) setSelectedRoom(roomId);
                    setShowAddModal(true);
                  }}
                >
                  <Ionicons name="add" size={24} color={colors.casa} />
                </TouchableOpacity>
              </View>

              {roomTasks.length > 0 ? (
                <View style={styles.tasksList}>
                  {roomTasks.map((task) => (
                    <View key={task.id} style={styles.taskRow}>
                      <CheckBox
                        checked={isTaskCompletedToday(task)}
                        onToggle={() => toggleHomeTaskDay(task.id, today)}
                        label={task.task}
                        color={colors.casa}
                      />
                      <View style={styles.frequencyBadge}>
                        <Text style={styles.frequencyText}>
                          {task.frequency === 'daily' ? 'D' : task.frequency === 'weekly' ? 'W' : 'M'}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.noTasksText}>
                  {t('casa_no_tasks')}
                </Text>
              )}
            </Card>
          );
        })}

        {/* Quick Add Default Tasks */}
        <Card style={styles.quickAddCard}>
          <Text style={styles.quickAddTitle}>{t('casa_need_ideas')}</Text>
          <Text style={styles.quickAddDescription}>
            {t('casa_ideas_desc')}
          </Text>
          <View style={styles.suggestedTasks}>
            {Object.entries(defaultTaskKeys).slice(0, 3).map(([room, taskKeys]) => (
              <View key={room} style={styles.suggestedRoom}>
                <Text style={styles.suggestedRoomName}>
                  {rooms.find(r => r.id === room)?.name}:
                </Text>
                <Text style={styles.suggestedTasksList}>
                  {taskKeys.slice(0, 2).map(key => t(key as any)).join(', ')}...
                </Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Tips */}
        <Card style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb" size={20} color={colors.orange} />
            <Text style={styles.tipsTitle}>{t('casa_adhd_tips')}</Text>
          </View>
          <Text style={styles.tipsText}>
            {t('casa_adhd_tips_content')}
          </Text>
        </Card>
      </ScrollView>

      {/* Add Task Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{t('casa_new_task')}</Text>
                <Text style={styles.modalSubtitle}>{t(selectedRoom.nameKey as any)}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Room Selector */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roomsScroll}>
              {roomIds.map((room) => (
                <TouchableOpacity
                  key={room.id}
                  style={[
                    styles.roomChip,
                    selectedRoom.id === room.id && { backgroundColor: colors.casa },
                  ]}
                  onPress={() => setSelectedRoom(room)}
                >
                  <Ionicons
                    name={room.icon as any}
                    size={16}
                    color={selectedRoom.id === room.id ? colors.white : colors.casa}
                  />
                  <Text style={[
                    styles.roomChipText,
                    selectedRoom.id === room.id && { color: colors.white },
                  ]}>
                    {t(room.nameKey as any)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Input
              label={t('casa_task_label')}
              placeholder={t('casa_task_placeholder')}
              value={newTaskName}
              onChangeText={setNewTaskName}
            />

            <Text style={styles.frequencyLabel}>{t('casa_frequency')}</Text>
            <View style={styles.frequencyOptions}>
              {[
                { value: 'daily', labelKey: 'casa_daily' },
                { value: 'weekly', labelKey: 'casa_weekly' },
                { value: 'monthly', labelKey: 'casa_monthly' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.frequencyOption,
                    taskFrequency === option.value && { backgroundColor: colors.casa },
                  ]}
                  onPress={() => setTaskFrequency(option.value as any)}
                >
                  <Text style={[
                    styles.frequencyOptionText,
                    taskFrequency === option.value && { color: colors.white },
                  ]}>
                    {t(option.labelKey as any)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Suggested Tasks */}
            <Text style={styles.suggestedLabel}>{t('casa_suggestions_for', { room: t(selectedRoom.nameKey as any) })}</Text>
            <View style={styles.suggestedButtons}>
              {(defaultTaskKeys[selectedRoom.id as keyof typeof defaultTaskKeys] || []).map((taskKey, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestedButton}
                  onPress={() => setNewTaskName(t(taskKey as any))}
                >
                  <Text style={styles.suggestedButtonText}>{t(taskKey as any)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button
              title={t('casa_add_task')}
              onPress={handleAddTask}
              variant="primary"
              color={colors.casa}
              style={styles.addTaskButton}
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
    borderBottomColor: colors.casa,
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
  progressCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textDark,
  },
  progressDate: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    textTransform: 'capitalize',
  },
  progressCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.casa,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercent: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  challengeCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: colors.casa,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  challengeTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginLeft: spacing.sm,
  },
  challengeSubtitle: {
    fontSize: fontSize.sm,
    color: colors.white,
    opacity: 0.8,
  },
  daySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  dayButton: {
    padding: spacing.sm,
  },
  dayDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginHorizontal: spacing.lg,
  },
  dayNumber: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  dayOf: {
    fontSize: fontSize.md,
    color: colors.white,
    opacity: 0.7,
  },
  challengeTask: {
    fontSize: fontSize.md,
    color: colors.white,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textDark,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  roomCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  roomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roomIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  roomName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textDark,
  },
  roomProgress: {
    fontSize: fontSize.sm,
    color: colors.textLight,
  },
  addRoomTask: {
    padding: spacing.sm,
  },
  tasksList: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.backgroundDark,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  frequencyBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frequencyText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textLight,
  },
  noTasksText: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    fontStyle: 'italic',
    marginTop: spacing.md,
    textAlign: 'center',
  },
  quickAddCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: colors.backgroundLight,
  },
  quickAddTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textDark,
  },
  quickAddDescription: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  suggestedTasks: {
    marginTop: spacing.md,
  },
  suggestedRoom: {
    marginBottom: spacing.xs,
  },
  suggestedRoomName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  suggestedTasksList: {
    fontSize: fontSize.sm,
    color: colors.textLight,
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
  modalSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textLight,
  },
  roomsScroll: {
    marginBottom: spacing.md,
  },
  roomChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    marginRight: spacing.sm,
    backgroundColor: colors.backgroundDark,
  },
  roomChipText: {
    fontSize: fontSize.sm,
    marginLeft: spacing.xs,
    color: colors.text,
  },
  frequencyLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  frequencyOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  frequencyOption: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundDark,
    alignItems: 'center',
  },
  frequencyOptionText: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  suggestedLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  suggestedButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  suggestedButton: {
    backgroundColor: colors.casa + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
  },
  suggestedButtonText: {
    fontSize: fontSize.sm,
    color: colors.casa,
  },
  addTaskButton: {
    marginTop: spacing.lg,
  },
});
