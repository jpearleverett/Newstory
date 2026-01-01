import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import { Card, Button, Input } from '../components';
import { useData } from '../context/DataContext';
import { useLanguage } from '../i18n/LanguageContext';

interface TuAnoScreenProps {
  navigation: any;
}

export const TuAnoScreen: React.FC<TuAnoScreenProps> = ({ navigation }) => {
  const { data, setYearlyIntention } = useData();
  const { t } = useLanguage();
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
            <Text style={styles.title}>{t('tuano_title')}</Text>
            <Text style={styles.subtitle}>{t('tuano_subtitle')}</Text>
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
          <Text style={styles.sectionTitle}>{t('tuano_calendar')}</Text>
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
            <Text style={styles.sectionTitle}>{t('tuano_word_title')}</Text>
          </View>
          <Text style={styles.sectionDescription}>
            {t('tuano_word_desc')}
          </Text>
          <TextInput
            style={styles.wordInput}
            value={wordOfYear}
            onChangeText={setWordOfYear}
            placeholder={t('tuano_word_placeholder')}
            placeholderTextColor={colors.textLight}
          />
        </Card>

        {/* Yearly Intentions */}
        <Card variant="elevated" style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flag" size={24} color={colors.olive} />
            <Text style={styles.sectionTitle}>{t('tuano_intentions_title')}</Text>
          </View>
          <Text style={styles.sectionDescription}>
            {t('tuano_intentions_desc')}
          </Text>
          {intentions.map((intention, index) => (
            <Input
              key={index}
              placeholder={t('tuano_intention_placeholder', { number: index + 1 })}
              value={intention}
              onChangeText={(value) => updateIntention(index, value)}
            />
          ))}
        </Card>

        {/* Celebrations */}
        <Card variant="elevated" style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trophy" size={24} color={colors.orange} />
            <Text style={styles.sectionTitle}>{t('tuano_celebrations_title')}</Text>
          </View>
          <Text style={styles.sectionDescription}>
            {t('tuano_celebrations_desc')}
          </Text>
          {celebrations.map((celebration, index) => (
            <Input
              key={index}
              placeholder={t('tuano_celebration_placeholder', { number: index + 1 })}
              value={celebration}
              onChangeText={(value) => updateCelebration(index, value)}
            />
          ))}
        </Card>

        {/* Save Button */}
        <View style={styles.saveButtonContainer}>
          <Button
            title={t('tuano_save')}
            onPress={handleSave}
            variant="primary"
            color={colors.olive}
          />
        </View>

        {/* ADHD Tips */}
        <Card style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb" size={20} color={colors.orange} />
            <Text style={styles.tipsTitle}>{t('tuano_adhd_tip')}</Text>
          </View>
          <Text style={styles.tipsText}>
            {t('tuano_adhd_tip_content')}
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
