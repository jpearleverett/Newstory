import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import { Input } from './Input';
import { Button } from './Button';
import { useLanguage } from '../i18n/LanguageContext';

interface BrainDumpModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (items: string[]) => void;
}

export const BrainDumpModal: React.FC<BrainDumpModalProps> = ({ visible, onClose, onSubmit }) => {
  const { t } = useLanguage();
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (!text.trim()) return;
    const items = text.split('\n').filter(item => item.trim() !== '');
    onSubmit(items);
    setText('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>{t('brain_dump_modal_title')}</Text>
              <Text style={styles.modalSubtitle}>{t('brain_dump_modal_subtitle')}</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalDescription}>
            {t('brain_dump_modal_desc')}
          </Text>

          <Input
            placeholder={t('brain_dump_placeholder')}
            value={text}
            onChangeText={setText}
            multiline
            numberOfLines={6}
            containerStyle={{ flex: 1, maxHeight: 200 }}
            style={{ textAlignVertical: 'top' }}
          />

          <Button
            title={t('save_inbox')}
            onPress={handleSubmit}
            variant="primary"
            color={colors.pink}
            style={styles.modalButton}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    paddingBottom: spacing.xxl, // Extra padding for safe area
    maxHeight: '80%',
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
  modalDescription: {
    fontSize: fontSize.sm,
    color: colors.text,
    marginBottom: spacing.md,
  },
  modalButton: {
    marginTop: spacing.lg,
  },
});
