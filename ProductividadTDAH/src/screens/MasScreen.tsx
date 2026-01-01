import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import { useLanguage } from '../i18n/LanguageContext';

interface MasScreenProps {
  navigation: any;
}

export const MasScreen: React.FC<MasScreenProps> = ({ navigation }) => {
  const { t, language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'es' ? 'en' : 'es');
  };

  const menuItems = [
    {
      id: 'metas',
      title: t('goals'),
      description: t('goals_desc'),
      icon: 'flag-outline' as const,
      color: colors.pink,
      screen: 'Metas',
    },
    {
      id: 'autocuidado',
      title: t('wellness'),
      description: t('wellness_desc'),
      icon: 'heart-outline' as const,
      color: colors.autocuidado,
      screen: 'Autocuidado',
    },
    {
      id: 'proyectos',
      title: t('projects'),
      description: t('projects_desc'),
      icon: 'folder-outline' as const,
      color: colors.proyectos,
      screen: 'Proyectos',
    },
    {
      id: 'casa',
      title: t('home_tasks'),
      description: t('home_desc'),
      icon: 'home-outline' as const,
      color: colors.casa,
      screen: 'Casa',
    },
    {
      id: 'dinero',
      title: t('finance'),
      description: t('finance_desc'),
      icon: 'wallet-outline' as const,
      color: colors.dinero,
      screen: 'Dinero',
    },
    {
      id: 'tuano',
      title: t('year'),
      description: t('year_desc'),
      icon: 'calendar-outline' as const,
      color: colors.tuAno,
      screen: 'TuAno',
    },
    {
      id: 'autoconocimiento',
      title: t('reflections'),
      description: t('reflections_desc'),
      icon: 'sparkles-outline' as const,
      color: colors.orange,
      screen: 'Autoconocimiento',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header - Simple, no overwhelm */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('more_tools')}</Text>
          <Text style={styles.subtitle}>
            {t('explore_needed')}
          </Text>
        </View>

        {/* Tip Card - Gentle reminder */}
        <View style={styles.tipCard}>
          <Ionicons name="leaf" size={20} color={colors.primary} />
          <Text style={styles.tipText}>
            {t('tip_usage')}
          </Text>
        </View>

        {/* Language Toggle */}
        <TouchableOpacity
          style={styles.languageToggle}
          onPress={toggleLanguage}
          activeOpacity={0.7}
        >
          <View style={[styles.iconContainer, { backgroundColor: colors.info + '15' }]}>
            <Ionicons name="language-outline" size={24} color={colors.info} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>{t('language')}</Text>
            <Text style={styles.menuDescription}>{language === 'es' ? 'Español' : 'English'}</Text>
          </View>
          <View style={styles.toggleButton}>
             <Text style={styles.toggleText}>{language.toUpperCase()}</Text>
          </View>
        </TouchableOpacity>

        {/* Menu Items - Simple list, not grid */}
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon} size={24} color={item.color} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer message */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {t('step_by_step')}
          </Text>
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
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textDark,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryMuted,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
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
  menuContainer: {
    paddingHorizontal: spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  languageToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.info + '30',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  menuTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textDark,
  },
  menuDescription: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  footerText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  toggleButton: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      backgroundColor: colors.backgroundDark,
      borderRadius: borderRadius.md,
  },
  toggleText: {
      fontWeight: fontWeight.bold,
      color: colors.textDark,
  }
});
