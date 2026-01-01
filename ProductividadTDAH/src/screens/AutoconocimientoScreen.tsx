import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import { Card, Button, Input } from '../components';
import { useData } from '../context/DataContext';

const reflectionPrompts = {
  strength: [
    '¿Cuáles son mis 3 mayores fortalezas?',
    '¿Qué habilidades me hacen único/a?',
    '¿Qué logro me hace sentir más orgulloso/a?',
    '¿Qué dicen otros que hago bien?',
  ],
  weakness: [
    '¿Qué áreas me gustaría mejorar?',
    '¿Qué me cuesta más trabajo?',
    '¿Qué situaciones me generan más estrés?',
    '¿Qué feedback he recibido que debería considerar?',
  ],
  growth: [
    '¿Qué aprendí esta semana?',
    '¿Cómo he crecido en el último año?',
    '¿Qué desafío me hizo más fuerte?',
    '¿Qué creencia limitante he superado?',
  ],
  values: [
    '¿Qué es lo más importante para mí?',
    '¿Qué no estoy dispuesto/a a sacrificar?',
    '¿Qué me hace sentir realizado/a?',
    '¿Cómo quiero ser recordado/a?',
  ],
};

const growthMindsetExercises = [
  {
    id: 'reframe',
    title: 'Reencuadrar pensamientos',
    description: 'Transforma "No puedo" en "Todavía no puedo"',
    icon: 'refresh-outline',
  },
  {
    id: 'celebrate',
    title: 'Celebrar errores',
    description: 'Los errores son oportunidades de aprendizaje',
    icon: 'trophy-outline',
  },
  {
    id: 'process',
    title: 'Valorar el proceso',
    description: 'El esfuerzo importa más que el resultado',
    icon: 'trending-up-outline',
  },
  {
    id: 'feedback',
    title: 'Buscar feedback',
    description: 'Las críticas constructivas nos hacen crecer',
    icon: 'chatbubbles-outline',
  },
];

interface AutoconocimientoScreenProps {
  navigation: any;
}

export const AutoconocimientoScreen: React.FC<AutoconocimientoScreenProps> = ({ navigation }) => {
  const { data, addReflection } = useData();
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [selectedType, setSelectedType] = useState<keyof typeof reflectionPrompts>('strength');
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [reflectionText, setReflectionText] = useState('');

  const handleSaveReflection = async () => {
    if (!reflectionText.trim() || !selectedPrompt) return;

    await addReflection({
      date: new Date().toISOString(),
      type: selectedType,
      prompt: selectedPrompt,
      response: reflectionText,
    });

    setReflectionText('');
    setSelectedPrompt('');
    setShowReflectionModal(false);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'strength': return colors.olive;
      case 'weakness': return colors.pink;
      case 'growth': return colors.orange;
      case 'values': return colors.priorizacion;
      default: return colors.textLight;
    }
  };

  const getTypeIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'strength': return 'flash-outline';
      case 'weakness': return 'construct-outline';
      case 'growth': return 'leaf-outline';
      case 'values': return 'heart-outline';
      default: return 'document-text-outline';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'strength': return 'Fortalezas';
      case 'weakness': return 'Áreas de mejora';
      case 'growth': return 'Crecimiento';
      case 'values': return 'Valores';
      default: return 'General';
    }
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
            <Text style={styles.title}>Autoconocimiento</Text>
            <Text style={styles.subtitle}>Conócete, acéptate, crece</Text>
          </View>
        </View>

        {/* Intro Card */}
        <Card style={styles.introCard}>
          <Ionicons name="heart" size={32} color={colors.pink} />
          <Text style={styles.introTitle}>Tu viaje hacia ti mismo/a</Text>
          <Text style={styles.introText}>
            El autoconocimiento es la base del crecimiento personal. Con TDAH, es especialmente
            importante entender cómo funciona tu mente para trabajar con ella, no contra ella.
          </Text>
        </Card>

        {/* Reflection Types */}
        <Text style={styles.sectionTitle}>Áreas de Reflexión</Text>
        <View style={styles.typesContainer}>
          {(Object.keys(reflectionPrompts) as Array<keyof typeof reflectionPrompts>).map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.typeCard, { borderColor: getTypeColor(type) }]}
              onPress={() => {
                setSelectedType(type);
                setShowReflectionModal(true);
              }}
            >
              <View style={[styles.typeIcon, { backgroundColor: getTypeColor(type) + '20' }]}>
                <Ionicons name={getTypeIcon(type)} size={24} color={getTypeColor(type)} />
              </View>
              <Text style={styles.typeName}>{getTypeName(type)}</Text>
              <Text style={styles.typeCount}>
                {data.reflections.filter(r => r.type === type).length} reflexiones
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Growth Mindset Section */}
        <Card variant="elevated" style={styles.growthCard}>
          <View style={styles.growthHeader}>
            <Ionicons name="rocket-outline" size={24} color={colors.orange} />
            <Text style={styles.growthTitle}>Mentalidad de Crecimiento</Text>
          </View>
          <Text style={styles.growthDescription}>
            Adopta una mentalidad que ve los desafíos como oportunidades
          </Text>

          {growthMindsetExercises.map((exercise) => (
            <View key={exercise.id} style={styles.exerciseItem}>
              <View style={styles.exerciseIcon}>
                <Ionicons name={exercise.icon as any} size={20} color={colors.orange} />
              </View>
              <View style={styles.exerciseContent}>
                <Text style={styles.exerciseTitle}>{exercise.title}</Text>
                <Text style={styles.exerciseDescription}>{exercise.description}</Text>
              </View>
            </View>
          ))}
        </Card>

        {/* Recent Reflections */}
        {data.reflections.length > 0 && (
          <Card variant="elevated" style={styles.recentCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="time-outline" size={20} color={colors.textLight} />
              <Text style={styles.recentTitle}>Reflexiones Recientes</Text>
            </View>

            {data.reflections.slice(-3).reverse().map((reflection) => (
              <View key={reflection.id} style={styles.reflectionItem}>
                <View style={styles.reflectionHeader}>
                  <View style={[styles.reflectionBadge, { backgroundColor: getTypeColor(reflection.type) + '20' }]}>
                    <Ionicons
                      name={getTypeIcon(reflection.type)}
                      size={14}
                      color={getTypeColor(reflection.type)}
                    />
                    <Text style={[styles.reflectionBadgeText, { color: getTypeColor(reflection.type) }]}>
                      {getTypeName(reflection.type)}
                    </Text>
                  </View>
                  <Text style={styles.reflectionDate}>
                    {new Date(reflection.date).toLocaleDateString('es-ES')}
                  </Text>
                </View>
                <Text style={styles.reflectionPrompt}>{reflection.prompt}</Text>
                <Text style={styles.reflectionResponse} numberOfLines={3}>
                  {reflection.response}
                </Text>
              </View>
            ))}
          </Card>
        )}

        {/* Affirmations Card */}
        <Card style={styles.affirmationsCard}>
          <View style={styles.affirmationsHeader}>
            <Ionicons name="sparkles" size={24} color={colors.white} />
            <Text style={styles.affirmationsTitle}>Afirmación del Día</Text>
          </View>
          <Text style={styles.affirmationText}>
            "Mi cerebro TDAH me da creatividad, hiperfocus y una perspectiva única.
            Soy capaz de lograr grandes cosas a mi propio ritmo."
          </Text>
        </Card>

        {/* Tips */}
        <Card style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb" size={20} color={colors.orange} />
            <Text style={styles.tipsTitle}>Tip para TDAH</Text>
          </View>
          <Text style={styles.tipsText}>
            La introspección puede ser difícil con TDAH. No te presiones por tener todas
            las respuestas de inmediato. Regresa a estas reflexiones cuando te sientas
            con claridad mental.
          </Text>
        </Card>
      </ScrollView>

      {/* Reflection Modal */}
      <Modal visible={showReflectionModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{getTypeName(selectedType)}</Text>
                <Text style={styles.modalSubtitle}>Reflexión personal</Text>
              </View>
              <TouchableOpacity onPress={() => setShowReflectionModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.promptsLabel}>Elige una pregunta para reflexionar:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.promptsScroll}>
              {reflectionPrompts[selectedType].map((prompt, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.promptChip,
                    selectedPrompt === prompt && { backgroundColor: getTypeColor(selectedType) },
                  ]}
                  onPress={() => setSelectedPrompt(prompt)}
                >
                  <Text style={[
                    styles.promptChipText,
                    selectedPrompt === prompt && { color: colors.white },
                  ]}>
                    {prompt}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {selectedPrompt && (
              <>
                <Text style={styles.selectedPrompt}>{selectedPrompt}</Text>
                <Input
                  placeholder="Escribe tu reflexión aquí..."
                  value={reflectionText}
                  onChangeText={setReflectionText}
                  multiline
                  containerStyle={{ flex: 1 }}
                />
              </>
            )}

            <Button
              title="Guardar Reflexión"
              onPress={handleSaveReflection}
              variant="primary"
              color={getTypeColor(selectedType)}
              style={styles.modalButton}
              disabled={!selectedPrompt || !reflectionText.trim()}
            />
          </View>
        </View>
      </Modal>
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
    borderBottomColor: colors.autoconocimiento,
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
  introCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    alignItems: 'center',
    backgroundColor: colors.pinkLight + '30',
  },
  introTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.pink,
    marginTop: spacing.sm,
  },
  introText: {
    fontSize: fontSize.sm,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textDark,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  typeCard: {
    width: '47%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 2,
    alignItems: 'center',
    ...shadows.sm,
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  typeName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textDark,
  },
  typeCount: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    marginTop: 2,
  },
  growthCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  growthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  growthTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.orange,
    marginLeft: spacing.sm,
  },
  growthDescription: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    marginBottom: spacing.md,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundDark,
  },
  exerciseIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.orangeLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  exerciseTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.textDark,
  },
  exerciseDescription: {
    fontSize: fontSize.sm,
    color: colors.textLight,
  },
  recentCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  recentTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textDark,
    marginLeft: spacing.xs,
  },
  reflectionItem: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundDark,
  },
  reflectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  reflectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.round,
  },
  reflectionBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    marginLeft: 4,
  },
  reflectionDate: {
    fontSize: fontSize.xs,
    color: colors.textLight,
  },
  reflectionPrompt: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  reflectionResponse: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    lineHeight: 18,
  },
  affirmationsCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    backgroundColor: colors.autoconocimiento,
  },
  affirmationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  affirmationsTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.white,
    marginLeft: spacing.xs,
  },
  affirmationText: {
    fontSize: fontSize.md,
    color: colors.white,
    fontStyle: 'italic',
    lineHeight: 24,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textDark,
  },
  modalSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textLight,
  },
  promptsLabel: {
    fontSize: fontSize.sm,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  promptsScroll: {
    marginBottom: spacing.md,
  },
  promptChip: {
    backgroundColor: colors.backgroundDark,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    marginRight: spacing.sm,
    maxWidth: 200,
  },
  promptChipText: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  selectedPrompt: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.textDark,
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.md,
  },
  modalButton: {
    marginTop: spacing.lg,
  },
});
