import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import { Card, Button, Input, ProgressBar } from '../components';
import { useData, SelfCareEntry } from '../context/DataContext';

const waterGlasses = [1, 2, 3, 4, 5, 6, 7, 8];
const sleepHours = [4, 5, 6, 7, 8, 9, 10];

const exerciseTypes = [
  { id: 'caminar', name: 'Caminar', icon: 'walk-outline' },
  { id: 'correr', name: 'Correr', icon: 'fitness-outline' },
  { id: 'yoga', name: 'Yoga', icon: 'body-outline' },
  { id: 'pesas', name: 'Pesas', icon: 'barbell-outline' },
  { id: 'nadar', name: 'Nadar', icon: 'water-outline' },
  { id: 'bailar', name: 'Bailar', icon: 'musical-notes-outline' },
  { id: 'estirar', name: 'Estirar', icon: 'resize-outline' },
  { id: 'otro', name: 'Otro', icon: 'ellipsis-horizontal-outline' },
];

interface AutocuidadoScreenProps {
  navigation: any;
}

export const AutocuidadoScreen: React.FC<AutocuidadoScreenProps> = ({ navigation }) => {
  const { getSelfCareEntry, addSelfCareEntry } = useData();
  const today = format(new Date(), 'yyyy-MM-dd');

  const [entry, setEntry] = useState<Partial<SelfCareEntry>>({
    date: today,
    water: 0,
    sleep: 7,
    exercise: null,
    meals: { breakfast: '', lunch: '', dinner: '', snacks: [] },
    meditation: 0,
    gratitude: ['', '', ''],
    wins: ['', '', ''],
  });

  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [exerciseDuration, setExerciseDuration] = useState('');
  const [newSnack, setNewSnack] = useState('');

  useEffect(() => {
    const existingEntry = getSelfCareEntry(today);
    if (existingEntry) {
      setEntry(existingEntry);
      if (existingEntry.exercise) {
        setSelectedExercise(existingEntry.exercise.type);
        setExerciseDuration(existingEntry.exercise.duration.toString());
      }
    }
  }, []);

  const handleSave = async () => {
    await addSelfCareEntry({
      date: today,
      water: entry.water || 0,
      sleep: entry.sleep || 7,
      exercise: selectedExercise && exerciseDuration
        ? { type: selectedExercise, duration: parseInt(exerciseDuration) }
        : null,
      meals: entry.meals || { breakfast: '', lunch: '', dinner: '', snacks: [] },
      meditation: entry.meditation || 0,
      gratitude: entry.gratitude || [],
      wins: entry.wins || [],
    });
  };

  const updateGratitude = (index: number, value: string) => {
    const newGratitude = [...(entry.gratitude || ['', '', ''])];
    newGratitude[index] = value;
    setEntry(prev => ({ ...prev, gratitude: newGratitude }));
  };

  const updateWins = (index: number, value: string) => {
    const newWins = [...(entry.wins || ['', '', ''])];
    newWins[index] = value;
    setEntry(prev => ({ ...prev, wins: newWins }));
  };

  const addSnack = () => {
    if (newSnack.trim()) {
      const currentSnacks = entry.meals?.snacks || [];
      setEntry(prev => ({
        ...prev,
        meals: { ...prev.meals!, snacks: [...currentSnacks, newSnack.trim()] },
      }));
      setNewSnack('');
    }
  };

  const getWellnessScore = () => {
    let score = 0;
    if ((entry.water || 0) >= 6) score += 20;
    else if ((entry.water || 0) >= 4) score += 10;
    if ((entry.sleep || 0) >= 7) score += 20;
    else if ((entry.sleep || 0) >= 6) score += 10;
    if (selectedExercise && exerciseDuration) score += 20;
    if (entry.meals?.breakfast) score += 10;
    if (entry.meals?.lunch) score += 10;
    if (entry.meals?.dinner) score += 10;
    if ((entry.meditation || 0) > 0) score += 10;
    return score;
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
            <Text style={styles.title}>Autocuidado</Text>
            <Text style={styles.subtitle}>Cuida tu cuerpo y mente</Text>
          </View>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Ionicons name="checkmark-circle" size={32} color={colors.autocuidado} />
          </TouchableOpacity>
        </View>

        {/* Wellness Score */}
        <Card variant="elevated" style={styles.scoreCard}>
          <View style={styles.scoreHeader}>
            <Text style={styles.scoreTitle}>Bienestar de Hoy</Text>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreNumber}>{getWellnessScore()}</Text>
              <Text style={styles.scoreMax}>/100</Text>
            </View>
          </View>
          <ProgressBar
            progress={getWellnessScore()}
            color={colors.autocuidado}
            height={10}
          />
          <Text style={styles.scoreMessage}>
            {getWellnessScore() >= 80 ? '¡Excelente día de autocuidado!' :
             getWellnessScore() >= 50 ? '¡Vas muy bien! Sigue así.' :
             'Cada pequeño paso cuenta.'}
          </Text>
        </Card>

        {/* Hydration */}
        <Card variant="elevated" style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="water" size={24} color={colors.priorizacion} />
            <Text style={styles.sectionTitle}>Hidratación</Text>
            <Text style={styles.sectionValue}>{entry.water || 0}/8 vasos</Text>
          </View>
          <View style={styles.waterContainer}>
            {waterGlasses.map((glass) => (
              <TouchableOpacity
                key={glass}
                style={[
                  styles.waterGlass,
                  (entry.water || 0) >= glass && styles.waterGlassFilled,
                ]}
                onPress={() => setEntry(prev => ({ ...prev, water: glass }))}
              >
                <Ionicons
                  name="water"
                  size={24}
                  color={(entry.water || 0) >= glass ? colors.white : colors.priorizacion}
                />
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Sleep */}
        <Card variant="elevated" style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="moon" size={24} color={colors.proyectos} />
            <Text style={styles.sectionTitle}>Sueño</Text>
            <Text style={styles.sectionValue}>{entry.sleep || 7} horas</Text>
          </View>
          <View style={styles.sleepContainer}>
            {sleepHours.map((hour) => (
              <TouchableOpacity
                key={hour}
                style={[
                  styles.sleepButton,
                  entry.sleep === hour && styles.sleepButtonSelected,
                ]}
                onPress={() => setEntry(prev => ({ ...prev, sleep: hour }))}
              >
                <Text style={[
                  styles.sleepButtonText,
                  entry.sleep === hour && styles.sleepButtonTextSelected,
                ]}>
                  {hour}h
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Exercise */}
        <Card variant="elevated" style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="fitness" size={24} color={colors.olive} />
            <Text style={styles.sectionTitle}>Ejercicio</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.exerciseScroll}>
            {exerciseTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.exerciseChip,
                  selectedExercise === type.id && { backgroundColor: colors.olive },
                ]}
                onPress={() => setSelectedExercise(
                  selectedExercise === type.id ? null : type.id
                )}
              >
                <Ionicons
                  name={type.icon as any}
                  size={20}
                  color={selectedExercise === type.id ? colors.white : colors.olive}
                />
                <Text style={[
                  styles.exerciseChipText,
                  selectedExercise === type.id && { color: colors.white },
                ]}>
                  {type.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {selectedExercise && (
            <Input
              label="Duración (minutos)"
              placeholder="30"
              value={exerciseDuration}
              onChangeText={setExerciseDuration}
              keyboardType="number-pad"
            />
          )}
        </Card>

        {/* Meals */}
        <Card variant="elevated" style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="restaurant" size={24} color={colors.orange} />
            <Text style={styles.sectionTitle}>Comidas</Text>
          </View>
          <Input
            label="Desayuno"
            placeholder="¿Qué desayunaste?"
            value={entry.meals?.breakfast || ''}
            onChangeText={(value) => setEntry(prev => ({
              ...prev,
              meals: { ...prev.meals!, breakfast: value },
            }))}
          />
          <Input
            label="Almuerzo"
            placeholder="¿Qué almorzaste?"
            value={entry.meals?.lunch || ''}
            onChangeText={(value) => setEntry(prev => ({
              ...prev,
              meals: { ...prev.meals!, lunch: value },
            }))}
          />
          <Input
            label="Cena"
            placeholder="¿Qué cenaste?"
            value={entry.meals?.dinner || ''}
            onChangeText={(value) => setEntry(prev => ({
              ...prev,
              meals: { ...prev.meals!, dinner: value },
            }))}
          />
          <View style={styles.snacksRow}>
            <Input
              label="Snacks"
              placeholder="Agregar snack"
              value={newSnack}
              onChangeText={setNewSnack}
              containerStyle={{ flex: 1, marginRight: spacing.sm }}
            />
            <TouchableOpacity style={styles.addSnackButton} onPress={addSnack}>
              <Ionicons name="add" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>
          {(entry.meals?.snacks || []).length > 0 && (
            <View style={styles.snacksList}>
              {entry.meals?.snacks.map((snack, index) => (
                <View key={index} style={styles.snackChip}>
                  <Text style={styles.snackText}>{snack}</Text>
                </View>
              ))}
            </View>
          )}
        </Card>

        {/* Meditation */}
        <Card variant="elevated" style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="leaf" size={24} color={colors.dinero} />
            <Text style={styles.sectionTitle}>Meditación/Mindfulness</Text>
          </View>
          <View style={styles.meditationContainer}>
            {[0, 5, 10, 15, 20, 30].map((minutes) => (
              <TouchableOpacity
                key={minutes}
                style={[
                  styles.meditationButton,
                  entry.meditation === minutes && { backgroundColor: colors.dinero },
                ]}
                onPress={() => setEntry(prev => ({ ...prev, meditation: minutes }))}
              >
                <Text style={[
                  styles.meditationButtonText,
                  entry.meditation === minutes && { color: colors.white },
                ]}>
                  {minutes === 0 ? 'No' : `${minutes} min`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Gratitude */}
        <Card variant="elevated" style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="heart" size={24} color={colors.pink} />
            <Text style={styles.sectionTitle}>Gratitud</Text>
          </View>
          <Text style={styles.sectionDescription}>
            3 cosas por las que estás agradecido/a hoy
          </Text>
          {(entry.gratitude || ['', '', '']).map((item, index) => (
            <Input
              key={index}
              placeholder={`${index + 1}. Estoy agradecido/a por...`}
              value={item}
              onChangeText={(value) => updateGratitude(index, value)}
            />
          ))}
        </Card>

        {/* Daily Wins */}
        <Card variant="elevated" style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trophy" size={24} color={colors.orange} />
            <Text style={styles.sectionTitle}>Victorias del Día</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Celebra tus logros, por pequeños que sean
          </Text>
          {(entry.wins || ['', '', '']).map((item, index) => (
            <Input
              key={index}
              placeholder={`${index + 1}. Hoy logré...`}
              value={item}
              onChangeText={(value) => updateWins(index, value)}
            />
          ))}
        </Card>

        {/* Tips */}
        <Card style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb" size={20} color={colors.orange} />
            <Text style={styles.tipsTitle}>Tips de Autocuidado para TDAH</Text>
          </View>
          <Text style={styles.tipsText}>
            • No tienes que ser perfecto/a{'\n'}
            • Pequeñas acciones suman grandes resultados{'\n'}
            • El movimiento ayuda a regular emociones{'\n'}
            • El sueño es medicina para tu cerebro{'\n'}
            • Celebra cada vez que recuerdas cuidarte
          </Text>
        </Card>

        {/* Save Button */}
        <View style={styles.saveButtonContainer}>
          <Button
            title="Guardar día"
            onPress={handleSave}
            variant="primary"
            color={colors.autocuidado}
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
    borderBottomColor: colors.autocuidado,
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
  saveButton: {
    padding: spacing.xs,
  },
  scoreCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  scoreTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textDark,
  },
  scoreCircle: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreNumber: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.autocuidado,
  },
  scoreMax: {
    fontSize: fontSize.md,
    color: colors.textLight,
  },
  scoreMessage: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.md,
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
    flex: 1,
  },
  sectionValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textLight,
  },
  sectionDescription: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    marginBottom: spacing.md,
  },
  waterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  waterGlass: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waterGlassFilled: {
    backgroundColor: colors.priorizacion,
  },
  sleepContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sleepButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundDark,
  },
  sleepButtonSelected: {
    backgroundColor: colors.proyectos,
  },
  sleepButtonText: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  sleepButtonTextSelected: {
    color: colors.white,
    fontWeight: fontWeight.semibold,
  },
  exerciseScroll: {
    marginBottom: spacing.sm,
  },
  exerciseChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    marginRight: spacing.sm,
    backgroundColor: colors.backgroundDark,
  },
  exerciseChipText: {
    fontSize: fontSize.sm,
    marginLeft: spacing.xs,
    color: colors.text,
  },
  snacksRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  addSnackButton: {
    backgroundColor: colors.orange,
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  snacksList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  snackChip: {
    backgroundColor: colors.orangeLight + '40',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
  },
  snackText: {
    fontSize: fontSize.sm,
    color: colors.orange,
  },
  meditationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  meditationButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundDark,
  },
  meditationButtonText: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  tipsCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
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
  saveButtonContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
});
