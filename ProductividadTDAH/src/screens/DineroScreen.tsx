import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import { Card, Button, Input, CheckBox } from '../components';
import { useData, Expense } from '../context/DataContext';

const expenseCategories = [
  { id: 'vivienda', name: 'Vivienda', icon: 'home-outline', color: colors.casa },
  { id: 'alimentacion', name: 'Alimentación', icon: 'restaurant-outline', color: colors.olive },
  { id: 'transporte', name: 'Transporte', icon: 'car-outline', color: colors.priorizacion },
  { id: 'salud', name: 'Salud', icon: 'medkit-outline', color: colors.error },
  { id: 'entretenimiento', name: 'Entretenimiento', icon: 'game-controller-outline', color: colors.proyectos },
  { id: 'ropa', name: 'Ropa', icon: 'shirt-outline', color: colors.pink },
  { id: 'educacion', name: 'Educación', icon: 'book-outline', color: colors.orange },
  { id: 'otro', name: 'Otro', icon: 'ellipsis-horizontal-outline', color: colors.textLight },
];

const impulseQuestions = [
  '¿Realmente lo necesito o solo lo quiero?',
  '¿Puedo esperar 24-48 horas antes de comprarlo?',
  '¿Tengo algo similar en casa?',
  '¿Cómo me sentiré después de comprarlo?',
  '¿Afectará mis metas financieras?',
  '¿Lo compraría si tuviera que pagar en efectivo?',
  '¿Seguiré queriéndolo en una semana?',
];

interface DineroScreenProps {
  navigation: any;
}

export const DineroScreen: React.FC<DineroScreenProps> = ({ navigation }) => {
  const { data, addExpense, deleteExpense } = useData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImpulseModal, setShowImpulseModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(expenseCategories[0]);
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [isNeed, setIsNeed] = useState(true);
  const [impulseAnswers, setImpulseAnswers] = useState<boolean[]>(new Array(impulseQuestions.length).fill(false));

  const currentMonth = format(new Date(), 'yyyy-MM');
  const monthlyExpenses = data.expenses.filter(e => e.date.startsWith(currentMonth));

  const totalSpent = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
  const needsSpent = monthlyExpenses.filter(e => e.isNeed).reduce((sum, e) => sum + e.amount, 0);
  const wantsSpent = monthlyExpenses.filter(e => !e.isNeed).reduce((sum, e) => sum + e.amount, 0);
  const impulseSpent = monthlyExpenses.filter(e => e.isImpulse).reduce((sum, e) => sum + e.amount, 0);

  const handleAddExpense = async () => {
    if (!expenseDescription.trim() || !expenseAmount) return;

    await addExpense({
      date: new Date().toISOString(),
      category: selectedCategory.id,
      description: expenseDescription,
      amount: parseFloat(expenseAmount),
      isNeed,
      isImpulse: false,
    });

    setExpenseDescription('');
    setExpenseAmount('');
    setShowAddModal(false);
  };

  const getCategoryInfo = (categoryId: string) => {
    return expenseCategories.find(c => c.id === categoryId) || expenseCategories[7];
  };

  const getImpulseScore = () => {
    const yesCount = impulseAnswers.filter(a => a).length;
    if (yesCount <= 2) return { text: 'Probablemente NO deberías comprarlo', color: colors.error };
    if (yesCount <= 4) return { text: 'Piénsalo un poco más', color: colors.warning };
    return { text: 'Parece una compra razonable', color: colors.olive };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
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
            <Text style={styles.title}>TDAH y el Dinero</Text>
            <Text style={styles.subtitle}>Gestión financiera consciente</Text>
          </View>
          <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton}>
            <Ionicons name="add-circle" size={32} color={colors.dinero} />
          </TouchableOpacity>
        </View>

        {/* Monthly Summary */}
        <Card variant="elevated" style={styles.summaryCard}>
          <Text style={styles.summaryMonth}>
            {format(new Date(), 'MMMM yyyy', { locale: es })}
          </Text>
          <Text style={styles.totalSpent}>{formatCurrency(totalSpent)}</Text>
          <Text style={styles.totalLabel}>Total gastado</Text>

          <View style={styles.spendingBreakdown}>
            <View style={styles.spendingItem}>
              <View style={[styles.spendingDot, { backgroundColor: colors.olive }]} />
              <Text style={styles.spendingLabel}>Necesidades</Text>
              <Text style={styles.spendingAmount}>{formatCurrency(needsSpent)}</Text>
            </View>
            <View style={styles.spendingItem}>
              <View style={[styles.spendingDot, { backgroundColor: colors.pink }]} />
              <Text style={styles.spendingLabel}>Deseos</Text>
              <Text style={styles.spendingAmount}>{formatCurrency(wantsSpent)}</Text>
            </View>
            <View style={styles.spendingItem}>
              <View style={[styles.spendingDot, { backgroundColor: colors.warning }]} />
              <Text style={styles.spendingLabel}>Impulsos</Text>
              <Text style={styles.spendingAmount}>{formatCurrency(impulseSpent)}</Text>
            </View>
          </View>
        </Card>

        {/* Impulse Buying Checker */}
        <TouchableOpacity
          style={styles.impulseButton}
          onPress={() => {
            setImpulseAnswers(new Array(impulseQuestions.length).fill(false));
            setShowImpulseModal(true);
          }}
        >
          <Ionicons name="warning-outline" size={24} color={colors.white} />
          <View style={styles.impulseButtonContent}>
            <Text style={styles.impulseButtonTitle}>¿Compra Impulsiva?</Text>
            <Text style={styles.impulseButtonSubtitle}>Responde antes de comprar</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.white} />
        </TouchableOpacity>

        {/* 50/30/20 Rule */}
        <Card style={styles.ruleCard}>
          <View style={styles.ruleHeader}>
            <Ionicons name="pie-chart-outline" size={24} color={colors.dinero} />
            <Text style={styles.ruleTitle}>Regla 50/30/20</Text>
          </View>
          <Text style={styles.ruleDescription}>
            Una guía simple para distribuir tus ingresos:
          </Text>
          <View style={styles.ruleItems}>
            <View style={styles.ruleItem}>
              <Text style={[styles.rulePercent, { color: colors.olive }]}>50%</Text>
              <Text style={styles.ruleLabel}>Necesidades</Text>
              <Text style={styles.ruleExample}>Vivienda, comida, transporte</Text>
            </View>
            <View style={styles.ruleItem}>
              <Text style={[styles.rulePercent, { color: colors.pink }]}>30%</Text>
              <Text style={styles.ruleLabel}>Deseos</Text>
              <Text style={styles.ruleExample}>Entretenimiento, hobbies</Text>
            </View>
            <View style={styles.ruleItem}>
              <Text style={[styles.rulePercent, { color: colors.dinero }]}>20%</Text>
              <Text style={styles.ruleLabel}>Ahorro</Text>
              <Text style={styles.ruleExample}>Emergencias, metas</Text>
            </View>
          </View>
        </Card>

        {/* Recent Expenses */}
        <Text style={styles.sectionTitle}>Gastos Recientes</Text>
        {monthlyExpenses.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="wallet-outline" size={48} color={colors.textLight} />
            <Text style={styles.emptyTitle}>Sin gastos registrados</Text>
            <Text style={styles.emptyText}>
              Registra tus gastos para tener un mejor control de tus finanzas.
            </Text>
          </Card>
        ) : (
          <View style={styles.expensesContainer}>
            {monthlyExpenses.slice(-10).reverse().map((expense) => {
              const category = getCategoryInfo(expense.category);
              return (
                <Card key={expense.id} style={styles.expenseCard}>
                  <View style={styles.expenseRow}>
                    <View style={[styles.expenseIcon, { backgroundColor: category.color + '20' }]}>
                      <Ionicons name={category.icon as any} size={20} color={category.color} />
                    </View>
                    <View style={styles.expenseInfo}>
                      <Text style={styles.expenseDescription}>{expense.description}</Text>
                      <View style={styles.expenseMeta}>
                        <Text style={styles.expenseCategory}>{category.name}</Text>
                        {!expense.isNeed && (
                          <View style={styles.wantBadge}>
                            <Text style={styles.wantBadgeText}>Deseo</Text>
                          </View>
                        )}
                        {expense.isImpulse && (
                          <View style={styles.impulseBadge}>
                            <Text style={styles.impulseBadgeText}>Impulso</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <Text style={styles.expenseAmount}>
                      {formatCurrency(expense.amount)}
                    </Text>
                  </View>
                </Card>
              );
            })}
          </View>
        )}

        {/* Tips */}
        <Card style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb" size={20} color={colors.orange} />
            <Text style={styles.tipsTitle}>Tips para TDAH y Finanzas</Text>
          </View>
          <Text style={styles.tipsText}>
            • Automatiza pagos y ahorros{'\n'}
            • Usa la regla de las 24-48 horas para compras grandes{'\n'}
            • Mantén un "fondo de impulsos" pequeño{'\n'}
            • Revisa tus gastos semanalmente{'\n'}
            • Celebra cuando evitas una compra impulsiva
          </Text>
        </Card>
      </ScrollView>

      {/* Add Expense Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nuevo Gasto</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Categoría</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
                {expenseCategories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryChip,
                      selectedCategory.id === cat.id && { backgroundColor: cat.color },
                    ]}
                    onPress={() => setSelectedCategory(cat)}
                  >
                    <Ionicons
                      name={cat.icon as any}
                      size={16}
                      color={selectedCategory.id === cat.id ? colors.white : cat.color}
                    />
                    <Text style={[
                      styles.categoryChipText,
                      selectedCategory.id === cat.id && { color: colors.white },
                    ]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Input
                label="Descripción"
                placeholder="¿En qué gastaste?"
                value={expenseDescription}
                onChangeText={setExpenseDescription}
              />

              <Input
                label="Monto"
                placeholder="0.00"
                value={expenseAmount}
                onChangeText={setExpenseAmount}
                keyboardType="decimal-pad"
              />

              <Text style={styles.inputLabel}>Tipo de gasto</Text>
              <View style={styles.typeOptions}>
                <TouchableOpacity
                  style={[styles.typeOption, isNeed && { backgroundColor: colors.olive }]}
                  onPress={() => setIsNeed(true)}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={isNeed ? colors.white : colors.olive}
                  />
                  <Text style={[styles.typeOptionText, isNeed && { color: colors.white }]}>
                    Necesidad
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeOption, !isNeed && { backgroundColor: colors.pink }]}
                  onPress={() => setIsNeed(false)}
                >
                  <Ionicons
                    name="heart"
                    size={20}
                    color={!isNeed ? colors.white : colors.pink}
                  />
                  <Text style={[styles.typeOptionText, !isNeed && { color: colors.white }]}>
                    Deseo
                  </Text>
                </TouchableOpacity>
              </View>

              <Button
                title="Registrar Gasto"
                onPress={handleAddExpense}
                variant="primary"
                color={colors.dinero}
                style={styles.submitButton}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Impulse Check Modal */}
      <Modal visible={showImpulseModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Checklist Anti-Impulso</Text>
                <Text style={styles.modalSubtitle}>Responde honestamente</Text>
              </View>
              <TouchableOpacity onPress={() => setShowImpulseModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.impulseQuestions}>
              {impulseQuestions.map((question, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.impulseQuestion}
                  onPress={() => {
                    const newAnswers = [...impulseAnswers];
                    newAnswers[index] = !newAnswers[index];
                    setImpulseAnswers(newAnswers);
                  }}
                >
                  <View style={[
                    styles.impulseCheckbox,
                    impulseAnswers[index] && { backgroundColor: colors.olive, borderColor: colors.olive },
                  ]}>
                    {impulseAnswers[index] && (
                      <Ionicons name="checkmark" size={16} color={colors.white} />
                    )}
                  </View>
                  <Text style={styles.impulseQuestionText}>{question}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={[styles.impulseResult, { backgroundColor: getImpulseScore().color + '20' }]}>
              <Text style={[styles.impulseResultText, { color: getImpulseScore().color }]}>
                {getImpulseScore().text}
              </Text>
            </View>

            <Button
              title="Entendido"
              onPress={() => setShowImpulseModal(false)}
              variant="primary"
              color={colors.dinero}
              style={styles.submitButton}
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
    borderBottomColor: colors.dinero,
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
  addButton: {
    padding: spacing.xs,
  },
  summaryCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  summaryMonth: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    textTransform: 'capitalize',
  },
  totalSpent: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.bold,
    color: colors.dinero,
    marginTop: spacing.xs,
  },
  totalLabel: {
    fontSize: fontSize.sm,
    color: colors.textLight,
  },
  spendingBreakdown: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    width: '100%',
    justifyContent: 'space-around',
  },
  spendingItem: {
    alignItems: 'center',
  },
  spendingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: spacing.xs,
  },
  spendingLabel: {
    fontSize: fontSize.xs,
    color: colors.textLight,
  },
  spendingAmount: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textDark,
  },
  impulseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  impulseButtonContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  impulseButtonTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  impulseButtonSubtitle: {
    fontSize: fontSize.sm,
    color: colors.white,
    opacity: 0.8,
  },
  ruleCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  ruleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  ruleTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.dinero,
    marginLeft: spacing.sm,
  },
  ruleDescription: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    marginBottom: spacing.md,
  },
  ruleItems: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ruleItem: {
    alignItems: 'center',
    flex: 1,
  },
  rulePercent: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  ruleLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textDark,
    marginTop: spacing.xs,
  },
  ruleExample: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textDark,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  emptyCard: {
    marginHorizontal: spacing.lg,
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textDark,
    marginTop: spacing.md,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  expensesContainer: {
    paddingHorizontal: spacing.lg,
  },
  expenseCard: {
    marginBottom: spacing.sm,
    padding: spacing.sm,
  },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expenseIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expenseInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  expenseDescription: {
    fontSize: fontSize.md,
    color: colors.textDark,
  },
  expenseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  expenseCategory: {
    fontSize: fontSize.xs,
    color: colors.textLight,
  },
  wantBadge: {
    backgroundColor: colors.pinkLight,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.xs,
  },
  wantBadgeText: {
    fontSize: 10,
    color: colors.pink,
  },
  impulseBadge: {
    backgroundColor: colors.orangeLight,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.xs,
  },
  impulseBadgeText: {
    fontSize: 10,
    color: colors.orange,
  },
  expenseAmount: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textDark,
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
    lineHeight: 22,
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
  inputLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  categoriesScroll: {
    marginBottom: spacing.md,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    marginRight: spacing.sm,
    backgroundColor: colors.backgroundDark,
  },
  categoryChipText: {
    fontSize: fontSize.sm,
    marginLeft: spacing.xs,
    color: colors.text,
  },
  typeOptions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.backgroundDark,
    gap: spacing.xs,
  },
  typeOptionText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  submitButton: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  impulseQuestions: {
    maxHeight: 350,
  },
  impulseQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundDark,
  },
  impulseCheckbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.textLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  impulseQuestionText: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
  },
  impulseResult: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  impulseResultText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
});
