import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import { Button } from './Button'; // Assuming Button component exists
import haptic from '../utils/haptics';

interface MorningRitualModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete: (plannedTasks: string[], dump: string[]) => void;
}

type Step = 'dump' | 'organize' | 'plan' | 'ready';

export const MorningRitualModal: React.FC<MorningRitualModalProps> = ({ visible, onClose, onComplete }) => {
  const [step, setStep] = useState<Step>('dump');
  const [dumpInput, setDumpInput] = useState('');
  const [dumpItems, setDumpItems] = useState<string[]>([]);
  const [selectedForToday, setSelectedForToday] = useState<string[]>([]);
  const [finalTasks, setFinalTasks] = useState<string[]>([]);

  // Reset state when opening
  React.useEffect(() => {
    if (visible) {
      setStep('dump');
      setDumpItems([]);
      setSelectedForToday([]);
      setFinalTasks([]);
    }
  }, [visible]);

  const handleDumpAdd = () => {
    if (dumpInput.trim()) {
      setDumpItems([...dumpItems, dumpInput.trim()]);
      setDumpInput('');
      haptic.light();
    }
  };

  const toggleSelection = (item: string) => {
    haptic.selection();
    if (selectedForToday.includes(item)) {
      setSelectedForToday(selectedForToday.filter(i => i !== item));
    } else {
      setSelectedForToday([...selectedForToday, item]);
    }
  };

  const toggleFinalTask = (item: string) => {
    haptic.selection();
    if (finalTasks.includes(item)) {
      setFinalTasks(finalTasks.filter(i => i !== item));
    } else {
      if (finalTasks.length >= 3) {
        haptic.error(); // Haptic feedback for limit
        return; // Max 3
      }
      setFinalTasks([...finalTasks, item]);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 'dump':
        return (
          <View style={styles.stepContainer}>
            <View style={styles.headerIcon}>
              <Ionicons name="cloud-outline" size={48} color={colors.primary} />
            </View>
            <Text style={styles.stepTitle}>Paso 1: Vaciar (Dump)</Text>
            <Text style={styles.stepDesc}>
              Saca todo de tu cabeza. Tareas, preocupaciones, ideas. No lo juzgues, solo escríbelo.
            </Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Escribe algo y presiona enter..."
                value={dumpInput}
                onChangeText={setDumpInput}
                onSubmitEditing={handleDumpAdd}
                returnKeyType="go"
                autoFocus
              />
              <TouchableOpacity onPress={handleDumpAdd} style={styles.addBtn}>
                <Ionicons name="arrow-up" size={24} color={colors.white} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.listContainer}>
              {dumpItems.map((item, idx) => (
                <View key={idx} style={styles.listItem}>
                  <Text style={styles.listItemText}>{item}</Text>
                </View>
              ))}
            </ScrollView>
            
            <Button 
              title={dumpItems.length > 0 ? "Listo, a organizar" : "Saltar si está vacío"} 
              onPress={() => setStep('organize')} 
              variant="primary"
              style={styles.actionButton}
            />
          </View>
        );

      case 'organize':
        return (
          <View style={styles.stepContainer}>
            <View style={styles.headerIcon}>
              <Ionicons name="list-outline" size={48} color={colors.orange} />
            </View>
            <Text style={styles.stepTitle}>Paso 2: Organizar</Text>
            <Text style={styles.stepDesc}>
              De tu lista, ¿qué es REALMENTE para hoy? Selecciona solo lo que quieras considerar.
            </Text>

            <ScrollView style={styles.listContainer}>
              {dumpItems.map((item, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  style={[styles.selectableItem, selectedForToday.includes(item) && styles.selectedItem]}
                  onPress={() => toggleSelection(item)}
                >
                  <Ionicons 
                    name={selectedForToday.includes(item) ? "checkbox" : "square-outline"} 
                    size={24} 
                    color={selectedForToday.includes(item) ? colors.primary : colors.textMuted} 
                  />
                  <Text style={[styles.selectableText, selectedForToday.includes(item) && styles.selectedText]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
              {dumpItems.length === 0 && (
                <Text style={styles.emptyText}>No agregaste nada en el paso anterior.</Text>
              )}
            </ScrollView>

            <Button 
              title="Siguiente: Planificar" 
              onPress={() => setStep('plan')} 
              variant="primary"
              style={styles.actionButton}
            />
          </View>
        );

      case 'plan':
        return (
          <View style={styles.stepContainer}>
            <View style={styles.headerIcon}>
              <Ionicons name="sunny-outline" size={48} color={colors.highlight} />
            </View>
            <Text style={styles.stepTitle}>Paso 3: Planificar (Top 3)</Text>
            <Text style={styles.stepDesc}>
              Elige MÁXIMO 3 tareas para hoy. Si haces estas 3, tu día es un éxito.
            </Text>
             <Text style={styles.counterText}>{finalTasks.length}/3 seleccionadas</Text>

            <ScrollView style={styles.listContainer}>
              {selectedForToday.map((item, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  style={[styles.selectableItem, finalTasks.includes(item) && styles.finalItem]}
                  onPress={() => toggleFinalTask(item)}
                >
                  <View style={[styles.circle, finalTasks.includes(item) && styles.checkedCircle]}>
                     {finalTasks.includes(item) && <Ionicons name="checkmark" size={16} color="white" />}
                  </View>
                  <Text style={[styles.selectableText, finalTasks.includes(item) && styles.finalText]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
               {selectedForToday.length === 0 && (
                <Text style={styles.emptyText}>No seleccionaste nada para hoy. ¡Día libre!</Text>
              )}
            </ScrollView>

            <Button 
              title="¡A Actuar!" 
              onPress={() => {
                onComplete(finalTasks, dumpItems);
                onClose();
              }} 
              variant="primary"
              style={styles.actionButton}
            />
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.navBar}>
           <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
             <Ionicons name="close" size={24} color={colors.textMuted} />
           </TouchableOpacity>
        </View>
        {renderStepContent()}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  navBar: {
    padding: spacing.md,
    alignItems: 'flex-end',
  },
  closeBtn: {
    padding: spacing.sm,
  },
  stepContainer: {
    flex: 1,
    padding: spacing.lg,
    alignItems: 'center',
  },
  headerIcon: {
    marginBottom: spacing.md,
  },
  stepTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textDark,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  stepDesc: {
    fontSize: fontSize.md,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    fontSize: fontSize.md,
    borderWidth: 1,
    borderColor: colors.backgroundDark,
    ...shadows.sm,
  },
  addBtn: {
    backgroundColor: colors.primary,
    width: 48,
    height: 48,
    borderRadius: borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
    ...shadows.sm,
  },
  listContainer: {
    width: '100%',
    flex: 1,
    marginBottom: spacing.lg,
  },
  listItem: {
    backgroundColor: colors.backgroundLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.backgroundDark,
  },
  listItemText: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  actionButton: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  selectableItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.backgroundDark,
    gap: spacing.md,
  },
  selectedItem: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10', // Light primary
  },
  selectableText: {
    fontSize: fontSize.md,
    color: colors.text,
    flex: 1,
  },
  selectedText: {
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: spacing.xl,
  },
  counterText: {
      color: colors.textMuted,
      marginBottom: spacing.sm,
      fontWeight: fontWeight.medium,
  },
  finalItem: {
      borderColor: colors.highlight,
      backgroundColor: colors.highlight + '15',
  },
  finalText: {
      fontWeight: fontWeight.bold,
      color: colors.textDark,
  },
  circle: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.textMuted,
      alignItems: 'center',
      justifyContent: 'center',
  },
  checkedCircle: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
  }
});
