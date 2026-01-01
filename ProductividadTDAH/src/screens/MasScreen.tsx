import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';

interface MasScreenProps {
  navigation: any;
}

// ADHD-Friendly: Simple list, not a grid. Each item has ONE clear purpose.
// Research says: "The best apps aren't the ones with most features, but the ones you'll actually use"
const menuItems = [
  {
    id: 'metas',
    title: 'Mis Metas',
    description: 'Objetivos a largo plazo',
    icon: 'flag-outline' as const,
    color: colors.pink,
    screen: 'Metas',
  },
  {
    id: 'autocuidado',
    title: 'Bienestar',
    description: 'Agua, sueño y movimiento',
    icon: 'heart-outline' as const,
    color: colors.autocuidado,
    screen: 'Autocuidado',
  },
  {
    id: 'proyectos',
    title: 'Proyectos',
    description: 'Tareas grandes divididas',
    icon: 'folder-outline' as const,
    color: colors.proyectos,
    screen: 'Proyectos',
  },
  {
    id: 'casa',
    title: 'Mi Casa',
    description: 'Tareas del hogar',
    icon: 'home-outline' as const,
    color: colors.casa,
    screen: 'Casa',
  },
  {
    id: 'dinero',
    title: 'Finanzas',
    description: 'Control de gastos',
    icon: 'wallet-outline' as const,
    color: colors.dinero,
    screen: 'Dinero',
  },
  {
    id: 'tuano',
    title: 'Mi Año',
    description: 'Visión anual',
    icon: 'calendar-outline' as const,
    color: colors.tuAno,
    screen: 'TuAno',
  },
  {
    id: 'autoconocimiento',
    title: 'Reflexiones',
    description: 'Conocerte mejor',
    icon: 'sparkles-outline' as const,
    color: colors.orange,
    screen: 'Autoconocimiento',
  },
];

export const MasScreen: React.FC<MasScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header - Simple, no overwhelm */}
        <View style={styles.header}>
          <Text style={styles.title}>Más Herramientas</Text>
          <Text style={styles.subtitle}>
            Explora cuando lo necesites
          </Text>
        </View>

        {/* Tip Card - Gentle reminder */}
        <View style={styles.tipCard}>
          <Ionicons name="leaf" size={20} color={colors.primary} />
          <Text style={styles.tipText}>
            No necesitas usar todo. Elige solo lo que te ayude hoy.
          </Text>
        </View>

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
            Un paso a la vez
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
});
