import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import { useData, DailyEntry } from '../context/DataContext';
import haptic from '../utils/haptics';

interface DiarioScreenProps {
  navigation: any;
}

// ADHD-Friendly: Simplified Diario - complementary to the main "Hoy" screen
// This is for deeper reflection, not for daily task management

export const DiarioScreen: React.FC<DiarioScreenProps> = ({ navigation }) => {
  const { getDailyEntry, addDailyEntry } = useData();
  const today = format(new Date(), 'yyyy-MM-dd');

  const [entry, setEntry] = useState<Partial<DailyEntry>>({
    date: today,
    gratitude: ['', '', ''],
    dump: [],
    notes: '',
    mood: 1,
    energyLevel: 1,
    planned: [],
    acted: [],
    organized: [],
  });

  const [newDumpItem, setNewDumpItem] = useState('');
  const [expandedSection, setExpandedSection] = useState<string | null>('dump');

  useEffect(() => {
    const existingEntry = getDailyEntry(today);
    if (existingEntry) {
      setEntry(existingEntry);
    }
  }, []);

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

  const addToDump = () => {
    if (!newDumpItem.trim()) return;
    haptic.light();
    const dump = [...(entry.dump || []), newDumpItem.trim()];
    saveEntry({ dump });
    setNewDumpItem('');
  };

  const removeDumpItem = (index: number) => {
    haptic.light();
    const dump = [...(entry.dump || [])];
    dump.splice(index, 1);
    saveEntry({ dump });
  };

  const updateGratitude = (index: number, value: string) => {
    const gratitude = [...(entry.gratitude || ['', '', ''])];
    gratitude[index] = value;
    saveEntry({ gratitude });
  };

  const toggleSection = (section: string) => {
    haptic.selection();
    setExpandedSection(expandedSection === section ? null : section);
  };

  const tasksCompleted = entry.acted?.length || 0;
  const tasksTotal = entry.planned?.length || 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Mi Diario</Text>
            <Text style={styles.subtitle}>
              {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
            </Text>
          </View>
        </View>

        {/* Today's Progress Summary */}
        {tasksTotal > 0 && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
              <Text style={styles.summaryText}>
                {tasksCompleted} de {tasksTotal} tareas completadas hoy
              </Text>
            </View>
          </View>
        )}

        {/* Brain Dump Section */}
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection('dump')}
          activeOpacity={0.7}
        >
          <View style={styles.sectionTitleRow}>
            <View style={[styles.sectionIcon, { backgroundColor: colors.pink + '20' }]}>
              <Ionicons name="cloud-outline" size={20} color={colors.pink} />
            </View>
            <View>
              <Text style={styles.sectionTitle}>Vaciar la Mente</Text>
              <Text style={styles.sectionSubtitle}>
                Saca todo lo que te preocupa
              </Text>
            </View>
          </View>
          <Ionicons
            name={expandedSection === 'dump' ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.textMuted}
          />
        </TouchableOpacity>

        {expandedSection === 'dump' && (
          <View style={styles.sectionContent}>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.textInput}
                placeholder="¿Qué está en tu cabeza?"
                placeholderTextColor={colors.textMuted}
                value={newDumpItem}
                onChangeText={setNewDumpItem}
                onSubmitEditing={addToDump}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={[styles.addButton, !newDumpItem.trim() && styles.addButtonDisabled]}
                onPress={addToDump}
                disabled={!newDumpItem.trim()}
              >
                <Ionicons name="add" size={24} color={colors.white} />
              </TouchableOpacity>
            </View>

            {(entry.dump || []).length === 0 ? (
              <Text style={styles.emptyText}>
                Escribe lo que sea. Sin filtros, sin juicios.
              </Text>
            ) : (
              <View style={styles.itemsList}>
                {(entry.dump || []).map((item, index) => (
                  <View key={index} style={styles.dumpItem}>
                    <Text style={styles.dumpItemText}>{item}</Text>
                    <TouchableOpacity onPress={() => removeDumpItem(index)}>
                      <Ionicons name="close" size={18} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Gratitude Section */}
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection('gratitude')}
          activeOpacity={0.7}
        >
          <View style={styles.sectionTitleRow}>
            <View style={[styles.sectionIcon, { backgroundColor: colors.orange + '20' }]}>
              <Ionicons name="heart-outline" size={20} color={colors.orange} />
            </View>
            <View>
              <Text style={styles.sectionTitle}>Gratitud</Text>
              <Text style={styles.sectionSubtitle}>
                3 cosas buenas de hoy
              </Text>
            </View>
          </View>
          <Ionicons
            name={expandedSection === 'gratitude' ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.textMuted}
          />
        </TouchableOpacity>

        {expandedSection === 'gratitude' && (
          <View style={styles.sectionContent}>
            {[0, 1, 2].map((index) => (
              <View key={index} style={styles.gratitudeRow}>
                <Text style={styles.gratitudeNumber}>{index + 1}</Text>
                <TextInput
                  style={styles.gratitudeInput}
                  placeholder="Estoy agradecido/a por..."
                  placeholderTextColor={colors.textMuted}
                  value={(entry.gratitude || [])[index] || ''}
                  onChangeText={(value) => updateGratitude(index, value)}
                />
              </View>
            ))}
          </View>
        )}

        {/* Notes Section */}
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection('notes')}
          activeOpacity={0.7}
        >
          <View style={styles.sectionTitleRow}>
            <View style={[styles.sectionIcon, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="document-text-outline" size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.sectionTitle}>Notas</Text>
              <Text style={styles.sectionSubtitle}>
                Reflexiones del día
              </Text>
            </View>
          </View>
          <Ionicons
            name={expandedSection === 'notes' ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.textMuted}
          />
        </TouchableOpacity>

        {expandedSection === 'notes' && (
          <View style={styles.sectionContent}>
            <TextInput
              style={styles.notesInput}
              placeholder="¿Qué aprendiste hoy? ¿Cómo te sientes?"
              placeholderTextColor={colors.textMuted}
              value={entry.notes || ''}
              onChangeText={(value) => saveEntry({ notes: value })}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        )}

        {/* Tip */}
        <View style={styles.tipCard}>
          <Ionicons name="leaf" size={18} color={colors.primary} />
          <Text style={styles.tipText}>
            Este es tu espacio seguro. No hay forma correcta o incorrecta de usarlo.
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
    textTransform: 'capitalize',
    marginTop: 2,
  },
  summaryCard: {
    backgroundColor: colors.successLight,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  summaryText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xs,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.xs,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textDark,
  },
  sectionSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    marginTop: 2,
  },
  sectionContent: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.xs,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  textInput: {
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
    backgroundColor: colors.pink,
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: colors.textMuted,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  itemsList: {
    gap: spacing.sm,
  },
  dumpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  dumpItemText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  gratitudeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  gratitudeNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.orange,
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
    lineHeight: 28,
    marginRight: spacing.sm,
  },
  gratitudeInput: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.backgroundDark,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    color: colors.text,
  },
  notesInput: {
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.backgroundDark,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    color: colors.text,
    minHeight: 120,
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
