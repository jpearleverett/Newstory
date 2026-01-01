import React, { useRef, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows, animation } from '../styles/theme';
import haptic from '../utils/haptics';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - spacing.lg * 2 - spacing.md) / 2;

interface SectionItem {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  screen: string;
  gradient?: [string, string];
}

// Removed Diario, Metas, Priorizacion as they are in tabs
const sections: SectionItem[] = [
  {
    id: 'tuano',
    title: 'Tu Año',
    subtitle: 'Visión anual',
    icon: 'calendar',
    color: colors.tuAno,
    screen: 'TuAno',
    gradient: colors.gradients.primary
  },
  {
    id: 'proyectos',
    title: 'Proyectos',
    subtitle: 'Gestión',
    icon: 'folder-open',
    color: colors.proyectos,
    screen: 'Proyectos',
    gradient: ['#9B59B6', '#8E44AD']
  },
  {
    id: 'autoconocimiento',
    title: 'Explorar',
    subtitle: 'Reflexión',
    icon: 'heart',
    color: colors.autoconocimiento,
    screen: 'Autoconocimiento',
    gradient: colors.gradients.accent
  },
  {
    id: 'casa',
    title: 'Mi Casa',
    subtitle: 'Hogar',
    icon: 'home',
    color: colors.casa,
    screen: 'Casa',
    gradient: ['#D35400', '#E67E22']
  },
  {
    id: 'dinero',
    title: 'Finanzas',
    subtitle: 'Control',
    icon: 'wallet',
    color: colors.dinero,
    screen: 'Dinero',
    gradient: ['#1ABC9C', '#16A085']
  },
  {
    id: 'autocuidado',
    title: 'Salud',
    subtitle: 'Bienestar',
    icon: 'leaf',
    color: colors.autocuidado,
    screen: 'Autocuidado',
    gradient: colors.gradients.rose
  },
];

interface HomeScreenProps {
  navigation: any;
}

const StreakBadge = () => (
  <View style={styles.streakBadge}>
    <Ionicons name="flame" size={16} color={colors.orange} />
    <Text style={styles.streakText}>3 días</Text>
  </View>
);

const SectionCard: React.FC<{
  section: SectionItem;
  index: number;
  onPress: () => void;
}> = ({ section, index, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      delay: index * 50 + 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    haptic.selection();
    onPress();
  };

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [
          { scale: scaleAnim },
          {
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }),
          },
        ],
        width: COLUMN_WIDTH,
        marginBottom: spacing.md,
      }}
    >
      <Pressable
        style={[styles.sectionCard, { backgroundColor: colors.white }]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={[styles.iconContainer, { backgroundColor: section.color + '20' }]}>
          <Ionicons name={section.icon} size={28} color={section.color} />
        </View>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>
      </Pressable>
    </Animated.View>
  );
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const today = new Date();
  const dayName = today.toLocaleDateString('es-ES', { weekday: 'long' });
  const dateString = today.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
  });

  const heroScaleAnim = useRef(new Animated.Value(1)).current;
  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const heroFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(100, [
      Animated.timing(headerFadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(heroFadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleHeroPressIn = () => {
    Animated.spring(heroScaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handleHeroPressOut = () => {
    Animated.spring(heroScaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleHeroPress = () => {
    haptic.medium();
    navigation.navigate('Diario');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerFadeAnim,
              transform: [
                {
                  translateY: headerFadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.headerTop}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoTotally}>Totally</Text>
              <Text style={styles.logoTDAH}>TDAH</Text>
            </View>
            <StreakBadge />
          </View>
          <Text style={styles.greeting}>¡Hola! ¿Qué tal tu energía hoy?</Text>
        </Animated.View>

        {/* Hero Card - Today's Plan */}
        <Animated.View
          style={{
            opacity: heroFadeAnim,
            transform: [
              { scale: heroScaleAnim },
              {
                translateY: heroFadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              },
            ],
          }}
        >
          <Pressable
            onPress={handleHeroPress}
            onPressIn={handleHeroPressIn}
            onPressOut={handleHeroPressOut}
          >
            <LinearGradient
              colors={colors.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <View style={styles.heroContent}>
                <View style={styles.heroDateContainer}>
                  <Text style={styles.heroDayName}>
                    {dayName.charAt(0).toUpperCase() + dayName.slice(1)}
                  </Text>
                  <Text style={styles.heroDate}>{dateString}</Text>
                </View>

                <View style={styles.heroActionContainer}>
                  <View style={styles.heroIconCircle}>
                    <Ionicons name="add" size={32} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.heroActionTitle}>Planificar mi día</Text>
                    <Text style={styles.heroActionSubtitle}>Comenzar con DOPA</Text>
                  </View>
                </View>
              </View>

              {/* Decorative elements */}
              <View style={styles.heroDecor1} />
              <View style={styles.heroDecor2} />
              <Ionicons name="leaf" size={120} color="rgba(255,255,255,0.1)" style={styles.heroDecorIcon} />
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* Sections Grid */}
        <View style={styles.sectionHeaderContainer}>
            <Text style={styles.sectionsTitle}>Áreas de Vida</Text>
        </View>
        
        <View style={styles.sectionsGrid}>
          {sections.map((section, index) => (
            <SectionCard
              key={section.id}
              section={section}
              index={index}
              onPress={() => navigation.navigate(section.screen)}
            />
          ))}
        </View>

        {/* Dopamine Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Recuerda: Un paso a la vez</Text>
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
    paddingBottom: spacing.xxl + 20,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logoTotally: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.heavy,
    color: colors.primary,
    letterSpacing: -0.5,
  },
  logoTDAH: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.pink,
    marginLeft: spacing.xs,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.highlightLight + '80',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.round,
    gap: 4,
  },
  streakText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textDark,
  },
  greeting: {
    fontSize: fontSize.md,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  heroCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    minHeight: 160,
    justifyContent: 'space-between',
    overflow: 'hidden',
    ...shadows.lg,
  },
  heroContent: {
    zIndex: 1,
  },
  heroDateContainer: {
    marginBottom: spacing.lg,
  },
  heroDayName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.white,
    opacity: 0.9,
  },
  heroDate: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    letterSpacing: -1,
  },
  heroActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    ...shadows.md,
  },
  heroActionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  heroActionSubtitle: {
    fontSize: fontSize.sm,
    color: colors.white,
    opacity: 0.9,
  },
  heroDecor1: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  heroDecor2: {
    position: 'absolute',
    bottom: -30,
    right: 50,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroDecorIcon: {
    position: 'absolute',
    bottom: -20,
    right: -20,
  },
  sectionHeaderContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionsTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textDark,
  },
  sectionsGrid: {
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sectionCard: {
    width: '100%',
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    height: 140,
    ...shadows.sm,
  },
  iconContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textDark,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    textAlign: 'center',
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
