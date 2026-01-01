import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';

interface SectionItem {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  screen: string;
}

const sections: SectionItem[] = [
  {
    id: 'tuano',
    title: 'Tu Año',
    subtitle: 'Calendarios e intenciones anuales',
    icon: 'calendar-outline',
    color: colors.tuAno,
    screen: 'TuAno',
  },
  {
    id: 'metas',
    title: 'Metas',
    subtitle: 'Objetivos y seguimiento de hábitos',
    icon: 'flag-outline',
    color: colors.metas,
    screen: 'Metas',
  },
  {
    id: 'autoconocimiento',
    title: 'Autoconocimiento',
    subtitle: 'Reflexión y crecimiento personal',
    icon: 'heart-outline',
    color: colors.autoconocimiento,
    screen: 'Autoconocimiento',
  },
  {
    id: 'priorizacion',
    title: 'Priorización',
    subtitle: 'Matriz Eisenhower y brain dump',
    icon: 'grid-outline',
    color: colors.priorizacion,
    screen: 'Priorizacion',
  },
  {
    id: 'proyectos',
    title: 'Planificador de Proyectos',
    subtitle: 'Gestión de proyectos y tiempo',
    icon: 'folder-outline',
    color: colors.proyectos,
    screen: 'Proyectos',
  },
  {
    id: 'diario',
    title: 'Planificador Diario',
    subtitle: 'Método DOPA y tareas diarias',
    icon: 'today-outline',
    color: colors.diario,
    screen: 'Diario',
  },
  {
    id: 'casa',
    title: 'Planificador de Casa',
    subtitle: 'Organización y limpieza del hogar',
    icon: 'home-outline',
    color: colors.casa,
    screen: 'Casa',
  },
  {
    id: 'dinero',
    title: 'TDAH y el Dinero',
    subtitle: 'Gastos, ahorros y finanzas',
    icon: 'wallet-outline',
    color: colors.dinero,
    screen: 'Dinero',
  },
  {
    id: 'autocuidado',
    title: 'Autocuidado',
    subtitle: 'Bienestar, comidas y ejercicio',
    icon: 'leaf-outline',
    color: colors.autocuidado,
    screen: 'Autocuidado',
  },
];

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const today = new Date();
  const dayName = today.toLocaleDateString('es-ES', { weekday: 'long' });
  const dateString = today.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const renderSectionCard = (section: SectionItem) => (
    <TouchableOpacity
      key={section.id}
      style={[styles.sectionCard, { borderLeftColor: section.color }]}
      onPress={() => navigation.navigate(section.screen)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: section.color + '20' }]}>
        <Ionicons name={section.icon} size={28} color={section.color} />
      </View>
      <View style={styles.sectionContent}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>Productividad</Text>
            <Text style={styles.logoAccent}>TDAH</Text>
          </View>
          <Text style={styles.tagline}>Tu agenda digital para una vida más organizada</Text>
        </View>

        {/* Date Card */}
        <View style={styles.dateCard}>
          <Text style={styles.dayName}>{dayName.charAt(0).toUpperCase() + dayName.slice(1)}</Text>
          <Text style={styles.dateString}>{dateString}</Text>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('Diario')}
          >
            <Ionicons name="add-circle" size={20} color={colors.white} />
            <Text style={styles.quickActionText}>Planificar mi día</Text>
          </TouchableOpacity>
        </View>

        {/* ADHD Friendly Reminder */}
        <View style={styles.reminderCard}>
          <Ionicons name="sparkles" size={24} color={colors.orange} />
          <Text style={styles.reminderText}>
            Recuerda: No tienes que hacerlo todo hoy. Elige 1-3 tareas importantes y celebra cada pequeño logro.
          </Text>
        </View>

        {/* Sections */}
        <Text style={styles.sectionsTitle}>Secciones</Text>
        <View style={styles.sectionsContainer}>
          {sections.map(renderSectionCard)}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>TotallyTDAH.com</Text>
          <Text style={styles.footerSubtext}>Reduciendo Estigmas LLC</Text>
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
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logo: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.olive,
  },
  logoAccent: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.pink,
    marginLeft: spacing.xs,
  },
  tagline: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  dateCard: {
    backgroundColor: colors.olive,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.md,
  },
  dayName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.white,
    opacity: 0.9,
  },
  dateString: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginTop: spacing.xs,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    marginTop: spacing.md,
  },
  quickActionText: {
    color: colors.white,
    fontWeight: fontWeight.semibold,
    marginLeft: spacing.xs,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.orangeLight + '40',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  reminderText: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
  sectionsTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textDark,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionsContainer: {
    paddingHorizontal: spacing.lg,
  },
  sectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
    ...shadows.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionContent: {
    flex: 1,
    marginLeft: spacing.md,
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
  footer: {
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.lg,
  },
  footerText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.olive,
  },
  footerSubtext: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    marginTop: 2,
  },
});
