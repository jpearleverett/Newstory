import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import { Card, Button, Input, CheckBox } from '../components';
import { useData, DailyEntry } from '../context/DataContext';

interface DiarioScreenProps {
  navigation: any;
}

const moodEmojis = ['😫', '😔', '😐', '🙂', '😊'];
const energyLevels = ['Muy bajo', 'Bajo', 'Normal', 'Alto', 'Muy alto'];

export const DiarioScreen: React.FC<DiarioScreenProps> = ({ navigation }) => {
  const { getDailyEntry, addDailyEntry, updateDailyEntry } = useData();
  const today = format(new Date(), 'yyyy-MM-dd');

  const [selectedDate, setSelectedDate] = useState(today);
  const [entry, setEntry] = useState<Partial<DailyEntry>>({
    date: today,
    gratitude: ['', '', ''],
    mood: 2,
    energyLevel: 2,
    dump: [],
    organized: [],
    planned: [],
    acted: [],
    notes: '',
  });

  const [newDumpItem, setNewDumpItem] = useState('');
  const [newOrganizedItem, setNewOrganizedItem] = useState('');
  const [newPlannedItem, setNewPlannedItem] = useState('');

  useEffect(() => {
    const existingEntry = getDailyEntry(selectedDate);
    if (existingEntry) {
      setEntry(existingEntry);
    } else {
      setEntry({
        date: selectedDate,
        gratitude: ['', '', ''],
        mood: 2,
        energyLevel: 2,
        dump: [],
        organized: [],
        planned: [],
        acted: [],
        notes: '',
      });
    }
  }, [selectedDate]);

  const handleSave = async () => {
    await addDailyEntry({
      date: selectedDate,
      gratitude: entry.gratitude || [],
      mood: entry.mood || 2,
      energyLevel: entry.energyLevel || 2,
      dump: entry.dump || [],
      organized: entry.organized || [],
      planned: entry.planned || [],
      acted: entry.acted || [],
      notes: entry.notes || '',
    });
  };

  const addToDump = () => {
    if (newDumpItem.trim()) {
      setEntry(prev => ({
        ...prev,
        dump: [...(prev.dump || []), newDumpItem.trim()],
      }));
      setNewDumpItem('');
    }
  };

  const addToOrganized = () => {
    if (newOrganizedItem.trim()) {
      setEntry(prev => ({
        ...prev,
        organized: [...(prev.organized || []), newOrganizedItem.trim()],
      }));
      setNewOrganizedItem('');
    }
  };

  const addToPlanned = () => {
    if (newPlannedItem.trim()) {
      setEntry(prev => ({
        ...prev,
        planned: [...(prev.planned || []), newPlannedItem.trim()],
      }));
      setNewPlannedItem('');
    }
  };

  const toggleActed = (item: string) => {
    const acted = entry.acted || [];
    if (acted.includes(item)) {
      setEntry(prev => ({
        ...prev,
        acted: acted.filter(a => a !== item),
      }));
    } else {
      setEntry(prev => ({
        ...prev,
        acted: [...acted, item],
      }));
    }
  };

  const updateGratitude = (index: number, value: string) => {
    const newGratitude = [...(entry.gratitude || ['', '', ''])];
    newGratitude[index] = value;
    setEntry(prev => ({ ...prev, gratitude: newGratitude }));
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
            <Text style={styles.title}>Planificador Diario</Text>
            <Text style={styles.subtitle}>
              {format(new Date(selectedDate), "EEEE, d 'de' MMMM", { locale: es })}
            </Text>
          </View>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Ionicons name="checkmark-circle" size={32} color={colors.olive} />
          </TouchableOpacity>
        </View>

        {/* DOPA Method Explanation */}
        <Card style={styles.dopaCard}>
          <Text style={styles.dopaTitle}>Método DOPA</Text>
          <Text style={styles.dopaSubtitle}>
            Dump • Organiza • Planifica • Actúa
          </Text>
          <Text style={styles.dopaDescription}>
            Un método diseñado para cerebros con TDAH. Saca todo de tu mente, organiza por importancia, planifica tu día, y actúa.
          </Text>
        </Card>

        {/* Morning Check-in */}
        <Card variant="elevated" style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="sunny-outline" size={24} color={colors.orange} />
            <Text style={styles.sectionTitle}>Check-in Matutino</Text>
          </View>

          {/* Mood */}
          <Text style={styles.label}>¿Cómo te sientes hoy?</Text>
          <View style={styles.moodContainer}>
            {moodEmojis.map((emoji, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.moodButton,
                  entry.mood === index && styles.moodButtonSelected,
                ]}
                onPress={() => setEntry(prev => ({ ...prev, mood: index }))}
              >
                <Text style={styles.moodEmoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Energy */}
          <Text style={styles.label}>Nivel de energía</Text>
          <View style={styles.energyContainer}>
            {energyLevels.map((level, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.energyButton,
                  entry.energyLevel === index && { backgroundColor: colors.olive },
                ]}
                onPress={() => setEntry(prev => ({ ...prev, energyLevel: index }))}
              >
                <Text style={[
                  styles.energyText,
                  entry.energyLevel === index && { color: colors.white },
                ]}>
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Gratitude */}
          <Text style={styles.label}>3 cosas por las que estás agradecido/a</Text>
          {(entry.gratitude || ['', '', '']).map((item, index) => (
            <Input
              key={index}
              placeholder={`${index + 1}. Agradecimiento`}
              value={item}
              onChangeText={(value) => updateGratitude(index, value)}
            />
          ))}
        </Card>

        {/* DUMP - Brain Dump */}
        <Card variant="elevated" style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.dopaLetter}>
              <Text style={styles.dopaLetterText}>D</Text>
            </View>
            <Text style={styles.sectionTitle}>Dump (Vacía tu mente)</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Escribe todo lo que está en tu cabeza sin filtrar
          </Text>

          <View style={styles.inputRow}>
            <Input
              placeholder="Escribe algo..."
              value={newDumpItem}
              onChangeText={setNewDumpItem}
              containerStyle={styles.flexInput}
            />
            <TouchableOpacity style={styles.addItemButton} onPress={addToDump}>
              <Ionicons name="add" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>

          {(entry.dump || []).map((item, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.listItemText}>• {item}</Text>
            </View>
          ))}
        </Card>

        {/* ORGANIZA */}
        <Card variant="elevated" style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.dopaLetter, { backgroundColor: colors.pink }]}>
              <Text style={styles.dopaLetterText}>O</Text>
            </View>
            <Text style={styles.sectionTitle}>Organiza</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Elige las tareas más importantes del dump
          </Text>

          <View style={styles.inputRow}>
            <Input
              placeholder="Tarea importante..."
              value={newOrganizedItem}
              onChangeText={setNewOrganizedItem}
              containerStyle={styles.flexInput}
            />
            <TouchableOpacity style={[styles.addItemButton, { backgroundColor: colors.pink }]} onPress={addToOrganized}>
              <Ionicons name="add" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>

          {(entry.organized || []).map((item, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.listItemNumber}>{index + 1}</Text>
              <Text style={styles.listItemText}>{item}</Text>
            </View>
          ))}
        </Card>

        {/* PLANIFICA */}
        <Card variant="elevated" style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.dopaLetter, { backgroundColor: colors.priorizacion }]}>
              <Text style={styles.dopaLetterText}>P</Text>
            </View>
            <Text style={styles.sectionTitle}>Planifica</Text>
          </View>
          <Text style={styles.sectionDescription}>
            ¿Qué vas a hacer hoy? (Máximo 3 tareas principales)
          </Text>

          <View style={styles.inputRow}>
            <Input
              placeholder="Mi plan para hoy..."
              value={newPlannedItem}
              onChangeText={setNewPlannedItem}
              containerStyle={styles.flexInput}
            />
            <TouchableOpacity style={[styles.addItemButton, { backgroundColor: colors.priorizacion }]} onPress={addToPlanned}>
              <Ionicons name="add" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>

          {(entry.planned || []).map((item, index) => (
            <View key={index} style={styles.plannedItem}>
              <Text style={styles.plannedNumber}>{index + 1}</Text>
              <Text style={styles.plannedText}>{item}</Text>
            </View>
          ))}
        </Card>

        {/* ACTÚA */}
        <Card variant="elevated" style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.dopaLetter, { backgroundColor: colors.dinero }]}>
              <Text style={styles.dopaLetterText}>A</Text>
            </View>
            <Text style={styles.sectionTitle}>Actúa</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Marca las tareas que completaste
          </Text>

          {(entry.planned || []).map((item, index) => (
            <CheckBox
              key={index}
              checked={(entry.acted || []).includes(item)}
              onToggle={() => toggleActed(item)}
              label={item}
              color={colors.dinero}
            />
          ))}

          {(entry.planned || []).length === 0 && (
            <Text style={styles.emptyText}>
              Agrega tareas en "Planifica" para verlas aquí
            </Text>
          )}
        </Card>

        {/* Notes */}
        <Card variant="elevated" style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={24} color={colors.textLight} />
            <Text style={styles.sectionTitle}>Notas del día</Text>
          </View>
          <Input
            placeholder="Reflexiones, aprendizajes, pensamientos..."
            value={entry.notes}
            onChangeText={(value) => setEntry(prev => ({ ...prev, notes: value }))}
            multiline
          />
        </Card>

        {/* Tips */}
        <Card style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb" size={20} color={colors.orange} />
            <Text style={styles.tipsTitle}>Tip para TDAH</Text>
          </View>
          <Text style={styles.tipsText}>
            Si sientes que tienes demasiadas tareas, reduce tu lista a solo 1-3 cosas importantes.
            Es mejor completar pocas tareas que quedarte paralizado/a por tener demasiadas.
          </Text>
        </Card>

        {/* Save Button */}
        <View style={styles.saveButtonContainer}>
          <Button
            title="Guardar día"
            onPress={handleSave}
            variant="primary"
            color={colors.olive}
          />
        </View>
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
    padding: spacing.lg,
    borderBottomWidth: 2,
    borderBottomColor: colors.diario,
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
  },
  saveButton: {
    padding: spacing.xs,
  },
  dopaCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: colors.olive,
    alignItems: 'center',
  },
  dopaTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  dopaSubtitle: {
    fontSize: fontSize.sm,
    color: colors.white,
    opacity: 0.9,
    marginTop: spacing.xs,
  },
  dopaDescription: {
    fontSize: fontSize.sm,
    color: colors.white,
    opacity: 0.8,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  sectionCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textDark,
    marginLeft: spacing.sm,
  },
  sectionDescription: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    marginBottom: spacing.md,
  },
  dopaLetter: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    backgroundColor: colors.olive,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dopaLetterText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  moodButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  moodButtonSelected: {
    borderColor: colors.olive,
    backgroundColor: colors.oliveLight + '30',
  },
  moodEmoji: {
    fontSize: 32,
  },
  energyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  energyButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
    backgroundColor: colors.backgroundDark,
  },
  energyText: {
    fontSize: fontSize.xs,
    color: colors.text,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  flexInput: {
    flex: 1,
    marginRight: spacing.sm,
  },
  addItemButton: {
    backgroundColor: colors.olive,
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  listItemNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.backgroundDark,
    textAlign: 'center',
    lineHeight: 24,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginRight: spacing.sm,
  },
  listItemText: {
    fontSize: fontSize.md,
    color: colors.text,
    flex: 1,
  },
  plannedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  plannedNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.priorizacion,
    textAlign: 'center',
    lineHeight: 28,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginRight: spacing.sm,
  },
  plannedText: {
    fontSize: fontSize.md,
    color: colors.text,
    flex: 1,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  tipsCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
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
  saveButtonContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
});
