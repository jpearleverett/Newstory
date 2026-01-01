import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import { useLanguage } from '../i18n/LanguageContext';
import haptic from '../utils/haptics';

// Category types for AI parsing
export type ParsedCategory = 'task' | 'shopping' | 'journal' | 'project' | 'self_care' | 'home';

export interface ParsedItem {
  text: string;
  category: ParsedCategory;
  confidence: number;
}

interface VoiceBrainDumpModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete: (parsedItems: ParsedItem[]) => void;
}

const { width, height } = Dimensions.get('window');

// AI Parsing keywords for categorization
const CATEGORY_KEYWORDS: Record<ParsedCategory, string[]> = {
  shopping: [
    'buy', 'comprar', 'get', 'pick up', 'recoger', 'grocery', 'groceries',
    'supermercado', 'tienda', 'store', 'milk', 'leche', 'bread', 'pan',
    'shopping', 'compras', 'need to get', 'necesito comprar'
  ],
  task: [
    'call', 'llamar', 'email', 'send', 'enviar', 'schedule', 'agendar',
    'appointment', 'cita', 'meeting', 'reunión', 'finish', 'terminar',
    'complete', 'completar', 'do', 'hacer', 'submit', 'entregar',
    'deadline', 'fecha límite', 'due', 'vence'
  ],
  journal: [
    'feel', 'siento', 'feeling', 'sintiendo', 'worried', 'preocupado',
    'anxious', 'ansioso', 'happy', 'feliz', 'sad', 'triste', 'stressed',
    'estresado', 'think', 'pienso', 'thinking', 'pensando', 'grateful',
    'agradecido', 'angry', 'enojado', 'frustrated', 'frustrado',
    'emotion', 'emoción', 'scared', 'asustado', 'excited', 'emocionado'
  ],
  project: [
    'project', 'proyecto', 'work on', 'trabajar en', 'presentation',
    'presentación', 'report', 'informe', 'research', 'investigar',
    'design', 'diseñar', 'build', 'construir', 'create', 'crear',
    'develop', 'desarrollar', 'launch', 'lanzar'
  ],
  self_care: [
    'exercise', 'ejercicio', 'workout', 'entrenar', 'meditate', 'meditar',
    'sleep', 'dormir', 'rest', 'descansar', 'relax', 'relajar',
    'walk', 'caminar', 'yoga', 'breathe', 'respirar', 'water', 'agua',
    'hydrate', 'hidratar', 'stretch', 'estirar', 'nap', 'siesta'
  ],
  home: [
    'clean', 'limpiar', 'wash', 'lavar', 'dishes', 'platos', 'laundry',
    'ropa', 'vacuum', 'aspirar', 'organize', 'organizar', 'tidy',
    'ordenar', 'cook', 'cocinar', 'trash', 'basura', 'fix', 'arreglar',
    'repair', 'reparar', 'mop', 'trapear', 'dust', 'quitar polvo'
  ],
};

const CATEGORY_ICONS: Record<ParsedCategory, string> = {
  task: 'checkmark-circle-outline',
  shopping: 'cart-outline',
  journal: 'heart-outline',
  project: 'rocket-outline',
  self_care: 'leaf-outline',
  home: 'home-outline',
};

const CATEGORY_COLORS: Record<ParsedCategory, string> = {
  task: colors.primary,
  shopping: colors.orange,
  journal: colors.pink,
  project: '#6c5ce7',
  self_care: '#00b894',
  home: '#e17055',
};

export const VoiceBrainDumpModal: React.FC<VoiceBrainDumpModalProps> = ({
  visible,
  onClose,
  onComplete,
}) => {
  const { t } = useLanguage();
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([]);
  const [showResults, setShowResults] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setInputText('');
      setParsedItems([]);
      setShowResults(false);
      setIsRecording(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible]);

  useEffect(() => {
    if (isRecording) {
      // Pulsing animation for recording indicator
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  // AI Parsing function - categorizes text into appropriate categories
  const parseText = (text: string): ParsedItem[] => {
    // Split by common delimiters: periods, commas, newlines, "and", "y"
    const delimiters = /[.,\n]|\band\b|\by\b/gi;
    const segments = text
      .split(delimiters)
      .map(s => s.trim())
      .filter(s => s.length > 2);

    return segments.map(segment => {
      const lowerSegment = segment.toLowerCase();
      let bestCategory: ParsedCategory = 'task'; // default
      let highestScore = 0;

      // Score each category based on keyword matches
      (Object.entries(CATEGORY_KEYWORDS) as [ParsedCategory, string[]][]).forEach(
        ([category, keywords]) => {
          let score = 0;
          keywords.forEach(keyword => {
            if (lowerSegment.includes(keyword.toLowerCase())) {
              score += keyword.split(' ').length; // Multi-word matches score higher
            }
          });

          if (score > highestScore) {
            highestScore = score;
            bestCategory = category;
          }
        }
      );

      // Calculate confidence based on score
      const confidence = highestScore > 0 ? Math.min(0.95, 0.5 + highestScore * 0.15) : 0.3;

      return {
        text: segment,
        category: bestCategory,
        confidence,
      };
    });
  };

  const handleMicPress = () => {
    haptic.medium();
    if (isRecording) {
      // Stop recording - in a real implementation, this would stop voice capture
      setIsRecording(false);
      // Simulate processing delay
      if (inputText.trim()) {
        processInput();
      }
    } else {
      // Start recording
      setIsRecording(true);
      // In a real implementation, this would start voice capture
      // For now, focus on the text input
    }
  };

  const processInput = () => {
    if (!inputText.trim()) return;

    setIsProcessing(true);
    haptic.light();

    // Simulate AI processing delay for UX
    setTimeout(() => {
      const items = parseText(inputText);
      setParsedItems(items);
      setShowResults(true);
      setIsProcessing(false);
      haptic.success();
    }, 800);
  };

  const handleCategoryChange = (index: number, newCategory: ParsedCategory) => {
    haptic.selection();
    const updated = [...parsedItems];
    updated[index] = { ...updated[index], category: newCategory };
    setParsedItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    haptic.light();
    setParsedItems(items => items.filter((_, i) => i !== index));
  };

  const handleComplete = () => {
    haptic.success();
    onComplete(parsedItems);
    onClose();
  };

  const getCategoryLabel = (category: ParsedCategory): string => {
    return t(`voice_category_${category}`);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          {/* Header */}
          <LinearGradient
            colors={[colors.pink, colors.orange]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.white} />
            </TouchableOpacity>
            <Ionicons name="mic" size={32} color={colors.white} />
            <Text style={styles.title}>{t('voice_dump_title')}</Text>
            <Text style={styles.subtitle}>{t('voice_dump_subtitle')}</Text>
          </LinearGradient>

          <ScrollView
            style={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {!showResults ? (
              <>
                {/* Voice Recording Button */}
                <View style={styles.micContainer}>
                  <TouchableOpacity
                    style={styles.micButton}
                    onPress={handleMicPress}
                    activeOpacity={0.8}
                  >
                    <Animated.View
                      style={[
                        styles.micButtonInner,
                        isRecording && styles.micButtonRecording,
                        { transform: [{ scale: pulseAnim }] },
                      ]}
                    >
                      <Ionicons
                        name={isRecording ? 'stop' : 'mic'}
                        size={40}
                        color={isRecording ? colors.white : colors.pink}
                      />
                    </Animated.View>
                  </TouchableOpacity>
                  <Text style={styles.micHint}>
                    {isRecording ? t('voice_recording') : t('voice_tap_to_record')}
                  </Text>
                </View>

                {/* Text Input (fallback/alternative) */}
                <View style={styles.inputSection}>
                  <Text style={styles.inputLabel}>{t('voice_or_type')}</Text>
                  <TextInput
                    style={styles.textInput}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder={t('voice_placeholder')}
                    placeholderTextColor={colors.textMuted}
                    multiline
                    textAlignVertical="top"
                  />
                  <Text style={styles.inputHint}>{t('voice_input_hint')}</Text>
                </View>

                {/* Process Button */}
                {inputText.trim().length > 0 && (
                  <TouchableOpacity
                    style={styles.processButton}
                    onPress={processInput}
                    disabled={isProcessing}
                  >
                    <LinearGradient
                      colors={[colors.primary, colors.primaryDark]}
                      style={styles.processGradient}
                    >
                      {isProcessing ? (
                        <ActivityIndicator color={colors.white} />
                      ) : (
                        <>
                          <Ionicons name="sparkles" size={20} color={colors.white} />
                          <Text style={styles.processText}>{t('voice_process')}</Text>
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <>
                {/* Results Section */}
                <Text style={styles.resultsTitle}>{t('voice_sorted_items')}</Text>
                <Text style={styles.resultsSubtitle}>{t('voice_tap_to_change')}</Text>

                {parsedItems.map((item, index) => (
                  <View key={index} style={styles.parsedItem}>
                    <TouchableOpacity
                      style={[
                        styles.categoryBadge,
                        { backgroundColor: CATEGORY_COLORS[item.category] },
                      ]}
                      onPress={() => {
                        // Cycle through categories
                        const categories: ParsedCategory[] = [
                          'task', 'shopping', 'journal', 'project', 'self_care', 'home'
                        ];
                        const currentIndex = categories.indexOf(item.category);
                        const nextCategory = categories[(currentIndex + 1) % categories.length];
                        handleCategoryChange(index, nextCategory);
                      }}
                    >
                      <Ionicons
                        name={CATEGORY_ICONS[item.category] as any}
                        size={16}
                        color={colors.white}
                      />
                      <Text style={styles.categoryText}>
                        {getCategoryLabel(item.category)}
                      </Text>
                    </TouchableOpacity>

                    <Text style={styles.itemText}>{item.text}</Text>

                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveItem(index)}
                    >
                      <Ionicons name="close-circle" size={24} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                ))}

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => setShowResults(false)}
                  >
                    <Ionicons name="arrow-back" size={20} color={colors.textLight} />
                    <Text style={styles.backText}>{t('voice_edit')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleComplete}
                    disabled={parsedItems.length === 0}
                  >
                    <LinearGradient
                      colors={[colors.primary, colors.primaryDark]}
                      style={styles.saveGradient}
                    >
                      <Ionicons name="checkmark" size={20} color={colors.white} />
                      <Text style={styles.saveText}>{t('voice_save_all')}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    flex: 1,
    marginTop: height * 0.1,
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    overflow: 'hidden',
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    padding: spacing.xs,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginTop: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  micContainer: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  micButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  micButtonInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.pink,
  },
  micButtonRecording: {
    backgroundColor: colors.pink,
    borderColor: colors.pink,
  },
  micHint: {
    marginTop: spacing.md,
    fontSize: fontSize.sm,
    color: colors.textLight,
  },
  inputSection: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textLight,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  textInput: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    minHeight: 120,
    ...shadows.xs,
  },
  inputHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  processButton: {
    marginTop: spacing.md,
  },
  processGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  processText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  resultsTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textDark,
    marginBottom: spacing.xs,
  },
  resultsSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  parsedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.xs,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
    gap: spacing.xs,
    marginRight: spacing.sm,
  },
  categoryText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  itemText: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
  },
  removeButton: {
    padding: spacing.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.textMuted,
    gap: spacing.xs,
  },
  backText: {
    fontSize: fontSize.md,
    color: colors.textLight,
  },
  saveButton: {
    flex: 1,
  },
  saveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  saveText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
});
