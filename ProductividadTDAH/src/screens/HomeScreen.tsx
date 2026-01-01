import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, SafeAreaView } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows, animation } from '../styles/theme';
import haptic from '../utils/haptics';
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
    id: 'diario',
    title: 'Planificador Diario',
    subtitle: 'Método DOPA y tareas diarias',
    icon: 'today-outline',
    color: colors.diario,
    screen: 'Diario',
  },
  {
    id: 'metas',
    title: 'Metas',
    subtitle: 'Objetivos y hábitos',
    icon: 'flag-outline',
    color: colors.metas,
    screen: 'Metas',
  },
  {
    id: 'priorizacion',
    title: 'Priorización',
    subtitle: 'Matriz Eisenhower',
    icon: 'grid-outline',
    color: colors.priorizacion,
    screen: 'Priorizacion',
  },
  {
    id: 'tuano',
    title: 'Tu Año',
    subtitle: 'Calendarios e intenciones',
    icon: 'calendar-outline',
    color: colors.tuAno,
    screen: 'TuAno',
  },
  {
    id: 'proyectos',
    title: 'Proyectos',
    subtitle: 'Gestión de proyectos',
    icon: 'folder-outline',
    color: colors.proyectos,
    screen: 'Proyectos',
  },
  {
    id: 'autoconocimiento',
    title: 'Autoconocimiento',
    subtitle: 'Reflexión personal',
    icon: 'heart-outline',
    color: colors.autoconocimiento,
    screen: 'Autoconocimiento',
  },
  {
    id: 'casa',
    title: 'Mi Casa',
    subtitle: 'Organización del hogar',
    icon: 'home-outline',
    color: colors.casa,
    screen: 'Casa',
  },
  {
    id: 'dinero',
    title: 'Finanzas',
    subtitle: 'Gastos y ahorros',
    icon: 'wallet-outline',
    color: colors.dinero,
    screen: 'Dinero',
  },
  {
    id: 'autocuidado',
    title: 'Autocuidado',
    subtitle: 'Bienestar y salud',
    icon: 'leaf-outline',
    color: colors.autocuidado,
    screen: 'Autocuidado',
  },
];

interface HomeScreenProps {
  navigation: any;
}

const SectionCard: React.FC<{
  section: SectionItem;
  index: number;
  onPress: () => void;
}> = ({ section, index, onPress }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, animation.springBouncy);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, animation.spring);
  };

  const handlePress = () => {
    haptic.light();
    onPress();
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(100 + index * 50).springify()}
    >
      <AnimatedPressable
        style={[styles.sectionCard, animatedStyle]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={[styles.iconContainer, { backgroundColor: section.color + '18' }]}>
          <Ionicons name={section.icon} size={26} color={section.color} />
        </View>
        <View style={styles.sectionContent}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>
        </View>
        <View style={[styles.chevronContainer, { backgroundColor: section.color + '12' }]}>
          <Ionicons name="chevron-forward" size={18} color={section.color} />
        </View>
      </AnimatedPressable>
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

  const heroScale = useSharedValue(1);

  const heroAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heroScale.value }],
  }));

  const handleHeroPressIn = () => {
    heroScale.value = withSpring(0.98, animation.spring);
  };

  const handleHeroPressOut = () => {
    heroScale.value = withSpring(1, animation.spring);
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
          style={styles.header}
          entering={FadeInUp.delay(50).springify()}
        >
          <View style={styles.logoContainer}>
            <Text style={styles.logoTotally}>Totally</Text>
            <Text style={styles.logoTDAH}>TDAH</Text>
          </View>
          <Text style={styles.tagline}>Tu vida, a tu ritmo</Text>
        </Animated.View>

        {/* Hero Card - Today's Plan */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <AnimatedPressable
            onPress={handleHeroPress}
            onPressIn={handleHeroPressIn}
            onPressOut={handleHeroPressOut}
            style={heroAnimatedStyle}
          >
            <LinearGradient
              colors={colors.gradients.hero}
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
                    <Ionicons name="add" size={28} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.heroActionTitle}>Planificar mi día</Text>
                    <Text style={styles.heroActionSubtitle}>Método DOPA</Text>
                  </View>
                </View>
              </View>

              {/* Decorative elements */}
              <View style={styles.heroDecor1} />
              <View style={styles.heroDecor2} />
            </LinearGradient>
          </AnimatedPressable>
        </Animated.View>

        {/* Motivational Quote */}
        <Animated.View
          style={styles.quoteContainer}
          entering={FadeInDown.delay(150).springify()}
        >
          <View style={styles.quoteIcon}>
            <Ionicons name="sparkles" size={18} color={colors.accent} />
          </View>
          <Text style={styles.quoteText}>
            No tienes que hacerlo todo. Elige 1-3 cosas importantes y celebra cada pequeño paso.
          </Text>
        </Animated.View>

        {/* Sections Grid */}
        <Text style={styles.sectionsTitle}>Explora</Text>
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

        {/* Footer */}
        <Animated.View
          style={styles.footer}
          entering={FadeInUp.delay(600).springify()}
        >
          <View style={styles.footerDivider} />
          <Text style={styles.footerText}>TotallyTDAH.com</Text>
          <Text style={styles.footerSubtext}>Reduciendo Estigmas LLC</Text>
        </Animated.View>
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
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logoTotally: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.heavy,
    color: colors.primary,
    letterSpacing: -1,
  },
  logoTDAH: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.pink,
    marginLeft: spacing.xs,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: fontSize.md,
    color: colors.textLight,
    marginTop: spacing.xs,
    letterSpacing: 0.5,
  },
  heroCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
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
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    color: colors.white,
    opacity: 0.9,
  },
  heroDate: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginTop: 2,
  },
  heroActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    ...shadows.sm,
  },
  heroActionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  heroActionSubtitle: {
    fontSize: fontSize.sm,
    color: colors.white,
    opacity: 0.8,
  },
  heroDecor1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroDecor2: {
    position: 'absolute',
    bottom: -40,
    right: 40,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  quoteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.accentLight + '30',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
  },
  quoteIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accentLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  quoteText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: fontSize.sm * 1.6,
  },
  sectionsTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textDark,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionsGrid: {
    paddingHorizontal: spacing.lg,
  },
  sectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.lg,
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
    letterSpacing: 0.2,
  },
  sectionSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    marginTop: 2,
  },
  chevronContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  footerDivider: {
    width: 40,
    height: 3,
    backgroundColor: colors.backgroundDark,
    borderRadius: 2,
    marginBottom: spacing.lg,
  },
  footerText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  footerSubtext: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
});
