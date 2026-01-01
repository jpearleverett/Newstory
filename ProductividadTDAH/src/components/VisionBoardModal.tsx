import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import { useLanguage } from '../i18n/LanguageContext';
import haptic from '../utils/haptics';

// Optional import for expo-image-picker
let ImagePicker: any = null;
try {
  ImagePicker = require('expo-image-picker');
} catch (e) {
  // expo-image-picker not installed, will use text-only mode
}

interface VisionItem {
  id: string;
  imageUri?: string;
  text: string;
  feeling?: string;
}

interface VisionBoardModalProps {
  visible: boolean;
  onClose: () => void;
  timeframe: '10year' | '1year';
  items: VisionItem[];
  onSave: (items: VisionItem[]) => void;
}

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.lg * 3) / 2;

export const VisionBoardModal: React.FC<VisionBoardModalProps> = ({
  visible,
  onClose,
  timeframe,
  items,
  onSave,
}) => {
  const { t } = useLanguage();
  const [visionItems, setVisionItems] = useState<VisionItem[]>(items);
  const [showWhyPrompt, setShowWhyPrompt] = useState(false);
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);
  const [feelingText, setFeelingText] = useState('');

  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setVisionItems(items);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();

      // Start shimmer animation loop
      startShimmerAnimation();
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible]);

  const startShimmerAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

  const pickImage = async () => {
    if (!ImagePicker) {
      // If ImagePicker is not available, just add a text-only vision item
      haptic.light();
      const newItem: VisionItem = {
        id: generateId(),
        text: '',
      };
      const updated = [...visionItems, newItem];
      setVisionItems(updated);
      setCurrentItemId(newItem.id);
      setShowWhyPrompt(true);
      return;
    }

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(t('vision_permission_title'), t('vision_permission_message'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      haptic.success();
      const newItem: VisionItem = {
        id: generateId(),
        imageUri: result.assets[0].uri,
        text: '',
      };
      const updated = [...visionItems, newItem];
      setVisionItems(updated);

      // Show "Why" prompt after adding image
      setCurrentItemId(newItem.id);
      setShowWhyPrompt(true);
    }
  };

  const handleSaveFeeling = () => {
    if (currentItemId && feelingText.trim()) {
      haptic.light();
      const updated = visionItems.map(item =>
        item.id === currentItemId
          ? { ...item, feeling: feelingText.trim() }
          : item
      );
      setVisionItems(updated);
    }
    setShowWhyPrompt(false);
    setFeelingText('');
    setCurrentItemId(null);
  };

  const handleUpdateText = (id: string, text: string) => {
    const updated = visionItems.map(item =>
      item.id === id ? { ...item, text } : item
    );
    setVisionItems(updated);
  };

  const handleRemoveItem = (id: string) => {
    haptic.light();
    const updated = visionItems.filter(item => item.id !== id);
    setVisionItems(updated);
  };

  const handleSave = () => {
    haptic.success();
    onSave(visionItems);
    onClose();
  };

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.7, 0.3],
  });

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 50],
  });

  const renderVisionCard = (item: VisionItem) => (
    <View key={item.id} style={styles.visionCard}>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveItem(item.id)}
      >
        <Ionicons name="close-circle" size={24} color={colors.error} />
      </TouchableOpacity>

      {item.imageUri ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.imageUri }} style={styles.visionImage} />
          {/* Shimmer overlay for "gyroscope" effect */}
          <Animated.View
            style={[
              styles.shimmerOverlay,
              {
                opacity: shimmerOpacity,
                transform: [{ translateX: shimmerTranslate }],
              },
            ]}
          />
        </View>
      ) : (
        <View style={styles.placeholderImage}>
          <Ionicons name="image-outline" size={40} color={colors.textMuted} />
        </View>
      )}

      <TextInput
        style={styles.visionText}
        placeholder={t('vision_describe_placeholder')}
        placeholderTextColor={colors.textMuted}
        value={item.text}
        onChangeText={(text) => handleUpdateText(item.id, text)}
        multiline
      />

      {item.feeling && (
        <View style={styles.feelingBadge}>
          <Ionicons name="heart" size={12} color={colors.pink} />
          <Text style={styles.feelingText} numberOfLines={2}>{item.feeling}</Text>
        </View>
      )}

      {!item.feeling && (
        <TouchableOpacity
          style={styles.addFeelingButton}
          onPress={() => {
            setCurrentItemId(item.id);
            setShowWhyPrompt(true);
          }}
        >
          <Text style={styles.addFeelingText}>{t('vision_add_feeling')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={timeframe === '10year' ? ['#667eea', '#764ba2'] : ['#f093fb', '#f5576c']}
          style={styles.header}
        >
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>
              {timeframe === '10year' ? t('vision_10year_title') : t('vision_1year_title')}
            </Text>
            <Text style={styles.headerSubtitle}>{t('vision_subtitle')}</Text>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>{t('vision_save')}</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Vision Board Grid */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.grid}>
            {visionItems.map(renderVisionCard)}

            {/* Add New Card */}
            <TouchableOpacity style={styles.addCard} onPress={pickImage}>
              <Ionicons name="add-circle-outline" size={48} color={colors.primary} />
              <Text style={styles.addCardText}>{t('vision_add_image')}</Text>
            </TouchableOpacity>
          </View>

          {/* Inspiration Quote */}
          <View style={styles.quoteCard}>
            <Text style={styles.quoteEmoji}>✨</Text>
            <Text style={styles.quoteText}>
              {timeframe === '10year'
                ? t('vision_quote_10year')
                : t('vision_quote_1year')}
            </Text>
          </View>
        </ScrollView>

        {/* Why Prompt Modal */}
        <Modal visible={showWhyPrompt} animationType="fade" transparent>
          <View style={styles.promptOverlay}>
            <Animated.View style={[styles.promptContainer, { opacity: fadeAnim }]}>
              <View style={styles.promptIconCircle}>
                <Ionicons name="heart-outline" size={40} color={colors.pink} />
              </View>

              <Text style={styles.promptTitle}>{t('vision_why_title')}</Text>
              <Text style={styles.promptSubtitle}>{t('vision_why_subtitle')}</Text>

              <TextInput
                style={styles.promptInput}
                placeholder={t('vision_why_placeholder')}
                placeholderTextColor={colors.textMuted}
                value={feelingText}
                onChangeText={setFeelingText}
                multiline
                autoFocus
              />

              <View style={styles.promptButtons}>
                <TouchableOpacity
                  style={styles.promptSkipButton}
                  onPress={() => {
                    setShowWhyPrompt(false);
                    setFeelingText('');
                    setCurrentItemId(null);
                  }}
                >
                  <Text style={styles.promptSkipText}>{t('vision_skip')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.promptSaveButton, !feelingText.trim() && styles.promptSaveDisabled]}
                  onPress={handleSaveFeeling}
                  disabled={!feelingText.trim()}
                >
                  <Text style={styles.promptSaveText}>{t('vision_save_feeling')}</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: spacing.xxl + spacing.lg,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  headerSubtitle: {
    fontSize: fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  saveButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  visionCard: {
    width: CARD_WIDTH,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  removeButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    zIndex: 10,
    backgroundColor: colors.white,
    borderRadius: 12,
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH,
    overflow: 'hidden',
  },
  visionImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  shimmerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    width: '150%',
  },
  placeholderImage: {
    width: '100%',
    height: CARD_WIDTH,
    backgroundColor: colors.backgroundDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visionText: {
    padding: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.text,
    minHeight: 60,
  },
  feelingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.pinkLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    margin: spacing.sm,
    marginTop: 0,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  feelingText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.pinkDark,
    fontStyle: 'italic',
  },
  addFeelingButton: {
    padding: spacing.sm,
    paddingTop: 0,
  },
  addFeelingText: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  addCard: {
    width: CARD_WIDTH,
    height: CARD_WIDTH + 80,
    backgroundColor: colors.primaryMuted,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  addCardText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    marginTop: spacing.sm,
    fontWeight: fontWeight.medium,
  },
  quoteCard: {
    backgroundColor: colors.highlightLight,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginTop: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  quoteEmoji: {
    fontSize: 32,
  },
  quoteText: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.textDark,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  // Why Prompt Modal
  promptOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  promptContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    alignItems: 'center',
  },
  promptIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.pinkLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  promptTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textDark,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  promptSubtitle: {
    fontSize: fontSize.md,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  promptInput: {
    width: '100%',
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.backgroundDark,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: spacing.lg,
  },
  promptButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  promptSkipButton: {
    flex: 1,
    padding: spacing.md,
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    backgroundColor: colors.backgroundDark,
  },
  promptSkipText: {
    color: colors.textLight,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  promptSaveButton: {
    flex: 2,
    padding: spacing.md,
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    backgroundColor: colors.pink,
  },
  promptSaveDisabled: {
    backgroundColor: colors.textMuted,
  },
  promptSaveText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
});
