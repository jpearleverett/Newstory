import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import { Card, Button, Input } from '../components';
import { useData } from '../context/DataContext';

interface TuAnoScreenProps {
  navigation: any;
}

export const TuAnoScreen: React.FC<TuAnoScreenProps> = ({ navigation }) => {
  const { data, setYearlyIntention } = useData();
  const currentYear = new Date().getFullYear();

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [wordOfYear, setWordOfYear] = useState('');
  const [intentions, setIntentions] = useState<string[]>(['', '', '']);
  const [celebrations, setCelebrations] = useState<string[]>(['', '', '']);
  const [selectedDate, setSelectedDate] = useState('');

  const yearIntention = data.yearlyIntentions.find(y => y.year === selectedYear);

  React.useEffect(() => {
    if (yearIntention) {
      setWordOfYear(yearIntention.word);
      setIntentions(yearIntention.intentions.length >= 3
        ? yearIntention.intentions
        : [...yearIntention.intentions, '', '', ''].slice(0, 3));
      setCelebrations(yearIntention.celebrations.length >= 3
        ? yearIntention.celebrations
        : [...yearIntention.celebrations, '', '', ''].slice(0, 3));
    }
  }, [yearIntention]);

  const handleSave = async () => {
    await setYearlyIntention({
      year: selectedYear,
      word: wordOfYear,
      intentions: intentions.filter(i => i.trim() !== ''),
      celebrations: celebrations.filter(c => c.trim() !== ''),
    });
  };

  const updateIntention = (index: number, value: string) => {
    const newIntentions = [...intentions];
    newIntentions[index] = value;
    setIntentions(newIntentions);
  };

  const updateCelebration = (index: number, value: string) => {
    const newCelebrations = [...celebrations];
    newCelebrations[index] = value;
    setCelebrations(newCelebrations);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>Tu Año</Text>
            <Text style={styles.subtitle}>Planifica y celebra tu año</Text>
          </View>
        </View>

        {/* Year Selector */}
        <View style={styles.yearSelector}>
          <TouchableOpacity onPress={() => setSelectedYear(selectedYear - 1)}>
            <Ionicons name="chevron-back-circle" size={32} color={colors.olive} />
          </TouchableOpacity>
          <Text style={styles.yearText}>{selectedYear}</Text>
          <TouchableOpacity onPress={() => setSelectedYear(selectedYear + 1)}>
            <Ionicons name="chevron-forward-circle" size={32} color={colors.olive} />
          </TouchableOpacity>
        </View>

        {/* Calendar */}
        <Card variant="elevated" style={styles.calendarCard}>
          <Text style={styles.sectionTitle}>Calendario</Text>
          <Calendar
            current={`${selectedYear}-01-01`}
            markedDates={{
              [selectedDate]: { selected: true, selectedColor: colors.olive }
            }}
            onDayPress={(day: { dateString: string }) => setSelectedDate(day.dateString)}
            theme={{
              backgroundColor: colors.white,
              calendarBackground: colors.white,
              textSectionTitleColor: colors.textLight,
              selectedDayBackgroundColor: colors.olive,
              selectedDayTextColor: colors.white,
              todayTextColor: colors.pink,
              dayTextColor: colors.text,
              textDisabledColor: colors.textLight,
              arrowColor: colors.olive,
              monthTextColor: colors.textDark,
              textMonthFontWeight: 'bold',
            }}
          />
        </Card>

        {/* Word of the Year */}
        <Card variant="elevated" style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="sparkles" size={24} color={colors.pink} />
            <Text style={styles.sectionTitle}>Mi Palabra del Año</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Elige una palabra que represente tu intención para este año
          </Text>
          <TextInput
            style={styles.wordInput}
            value={wordOfYear}
            onChangeText={setWordOfYear}
            placeholder="Tu palabra..."
            placeholderTextColor={colors.textLight}
          />
        </Card>

        {/* Yearly Intentions */}
        <Card variant="elevated" style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flag" size={24} color={colors.olive} />
            <Text style={styles.sectionTitle}>Intenciones del Año</Text>
          </View>
          <Text style={styles.sectionDescription}>
            ¿Qué quieres lograr, sentir o experimentar este año?
          </Text>
          {intentions.map((intention, index) => (
            <Input
              key={index}
              placeholder={`Intención ${index + 1}`}
              value={intention}
              onChangeText={(value) => updateIntention(index, value)}
            />
          ))}
        </Card>

        {/* Celebrations */}
        <Card variant="elevated" style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trophy" size={24} color={colors.orange} />
            <Text style={styles.sectionTitle}>Celebraciones</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Logros y momentos que quieres celebrar
          </Text>
          {celebrations.map((celebration, index) => (
            <Input
              key={index}
              placeholder={`Celebración ${index + 1}`}
              value={celebration}
              onChangeText={(value) => updateCelebration(index, value)}
            />
          ))}
        </Card>

        {/* Save Button */}
        <View style={styles.saveButtonContainer}>
          <Button
            title="Guardar"
            onPress={handleSave}
            variant="primary"
            color={colors.olive}
          />
        </View>

        {/* ADHD Tips */}
        <Card style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb" size={20} color={colors.orange} />
            <Text style={styles.tipsTitle}>Tip para TDAH</Text>
          </View>
          <Text style={styles.tipsText}>
            No te presiones por tener todo planificado. Esta es tu guía, no una lista de obligaciones.
            Puedes modificar tus intenciones en cualquier momento del año.
          </Text>
        </Card>
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
    borderBottomColor: colors.tuAno,
  },
  backButton: {
    marginRight: spacing.md,
    padding: spacing.xs,
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
  yearSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  yearText: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.bold,
    color: colors.olive,
    marginHorizontal: spacing.xl,
  },
  calendarCard: {
    marginHorizontal: spacing.lg,
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
  wordInput: {
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.pink,
    textAlign: 'center',
  },
  saveButtonContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
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
});
