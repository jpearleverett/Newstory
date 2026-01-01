import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import { Input } from './Input';
import { Button } from './Button';

interface BrainDumpModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (items: string[]) => void;
}

export const BrainDumpModal: React.FC<BrainDumpModalProps> = ({ visible, onClose, onSubmit }) => {
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
              <Text style={styles.modalTitle}>Brain Dump 🧠</Text>
              <Text style={styles.modalSubtitle}>Libera tu mente. Escribe todo.</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalDescription}>
            Escribe una idea por línea. No juzgues, solo captura.
          </Text>

          <Input
            placeholder="Comprar leche&#10;Llamar al médico&#10;Idea para el proyecto..."
            value={text}
            onChangeText={setText}
            multiline
            numberOfLines={6}
            containerStyle={{ flex: 1, maxHeight: 200 }}
            style={{ textAlignVertical: 'top' }}
          />

          <Button
            title="Guardar en Inbox"
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
