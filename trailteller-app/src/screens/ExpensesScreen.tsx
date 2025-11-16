import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import {
  ChevronLeft,
  Plus,
  Wallet,
  TrendingUp,
  PieChart,
  Calendar,
  X,
  Check,
} from 'lucide-react-native';
import {
  getExpensesByTrip,
  getTotalExpenses,
  getExpensesSummary,
  createExpense,
  deleteExpense,
  Expense,
  CreateExpenseData,
} from '../api/expenses';
import DatePickerInput from '../components/DatePickerInput';

type CategoryColorTuple = [string, string];

const CATEGORY_COLORS: Record<string, CategoryColorTuple> = {
  accommodation: ['#3B82F6', '#2563EB'],
  food: ['#F59E0B', '#D97706'],
  transport: ['#8B5CF6', '#7C3AED'],
  activities: ['#10B981', '#059669'],
  shopping: ['#EC4899', '#DB2777'],
  others: ['#6B7280', '#4B5563'],
};

const CATEGORY_LABELS: Record<string, string> = {
  accommodation: '🏨 ที่พัก',
  food: '🍜 อาหาร',
  transport: '🚗 เดินทาง',
  activities: '🎯 กิจกรรม',
  shopping: '🛍️ ช้อปปิ้ง',
  others: '📦 อื่นๆ',
};

const CATEGORY_OPTIONS = [
  { value: 'accommodation', label: '🏨 ที่พัก' },
  { value: 'food', label: '🍜 อาหาร' },
  { value: 'transport', label: '🚗 เดินทาง' },
  { value: 'activities', label: '🎯 กิจกรรม' },
  { value: 'shopping', label: '🛍️ ช้อปปิ้ง' },
  { value: 'others', label: '📦 อื่นๆ' },
];

export default function ExpensesScreen({ route, navigation }: any) {
  const { tripId, tripBudget, tripDestination } = route.params;

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [summary, setSummary] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>('food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadExpenses();
    }, [tripId])
  );

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const [expensesRes, totalRes, summaryRes] = await Promise.all([
        getExpensesByTrip(tripId),
        getTotalExpenses(tripId),
        getExpensesSummary(tripId),
      ]);

      setExpenses(expensesRes.data);
      setTotalExpenses(totalRes.data.total);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error('Load expenses error:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async () => {
    if (!title || !amount) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    setSaving(true);
    try {
      const data: CreateExpenseData = {
        tripId,
        title,
        amount: parseFloat(amount),
        category: category as any,
        date,
        notes,
      };

      await createExpense(data);
      
      // Reset form
      setTitle('');
      setAmount('');
      setCategory('food');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setShowAddModal(false);

      Alert.alert('สำเร็จ', 'บันทึกค่าใช้จ่ายเรียบร้อยแล้ว');
      loadExpenses();
    } catch (error: any) {
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถบันทึกได้');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExpense = (expense: Expense) => {
    Alert.alert(
      'ลบรายการ',
      `คุณต้องการลบ "${expense.title}" หรือไม่?`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ลบ',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteExpense(expense.id);
              Alert.alert('สำเร็จ', 'ลบรายการเรียบร้อยแล้ว');
              loadExpenses();
            } catch (error) {
              Alert.alert('ข้อผิดพลาด', 'ไม่สามารถลบได้');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const remainingBudget = tripBudget - totalExpenses;
  const budgetPercentage = (totalExpenses / tripBudget) * 100;

  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <TouchableOpacity
      style={styles.expenseCard}
      onLongPress={() => handleDeleteExpense(item)}
      activeOpacity={0.8}
    >
      <View style={styles.expenseCardContent}>
        <View style={styles.expenseIconContainer}>
          <Text style={styles.expenseIcon}>
            {CATEGORY_LABELS[item.category].split(' ')[0]}
          </Text>
        </View>
        <View style={styles.expenseInfo}>
          <Text style={styles.expenseTitle}>{item.title}</Text>
          <View style={styles.expenseMetaRow}>
            <Text style={styles.expenseCategory}>
              {CATEGORY_LABELS[item.category].split(' ')[1]}
            </Text>
            <Text style={styles.expenseDivider}>•</Text>
            <Text style={styles.expenseDate}>{formatDate(item.date)}</Text>
          </View>
          {item.notes && (
            <Text style={styles.expenseNotes} numberOfLines={1}>
              {item.notes}
            </Text>
          )}
        </View>
        <Text style={styles.expenseAmount}>
          ฿{item.amount.toLocaleString('th-TH')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient
          colors={['#0066FF', '#0047B3'] as const}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <ChevronLeft size={28} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>จัดการค่าใช้จ่าย</Text>
            <View style={styles.headerRight} />
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066FF" />
          <Text style={styles.loadingText}>กำลังโหลด...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <LinearGradient
        colors={['#0066FF', '#0047B3'] as const}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={28} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>จัดการค่าใช้จ่าย</Text>
            <Text style={styles.headerSubtitle}>{tripDestination}</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Plus size={24} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Budget Overview */}
        <View style={styles.budgetCard}>
          <View style={styles.budgetHeader}>
            <View style={styles.budgetIconContainer}>
              <Wallet size={24} color="#FFFFFF" strokeWidth={2.5} />
            </View>
            <Text style={styles.budgetTitle}>สรุปงบประมาณ</Text>
          </View>

          <View style={styles.budgetProgressContainer}>
            <View style={styles.budgetProgressBar}>
              <View
                style={[
                  styles.budgetProgressFill,
                  {
                    width: `${Math.min(budgetPercentage, 100)}%`,
                    backgroundColor:
                      budgetPercentage > 100
                        ? '#EF4444'
                        : budgetPercentage > 80
                        ? '#F59E0B'
                        : '#10B981',
                  },
                ]}
              />
            </View>
            <Text style={styles.budgetProgressText}>
              {budgetPercentage.toFixed(1)}%
            </Text>
          </View>

          <View style={styles.budgetStats}>
            <View style={styles.budgetStatItem}>
              <Text style={styles.budgetStatLabel}>ใช้ไปแล้ว</Text>
              <Text style={styles.budgetStatValue}>
                ฿{totalExpenses.toLocaleString('th-TH')}
              </Text>
            </View>
            <View style={styles.budgetStatDivider} />
            <View style={styles.budgetStatItem}>
              <Text style={styles.budgetStatLabel}>งบประมาณ</Text>
              <Text style={styles.budgetStatValue}>
                ฿{tripBudget.toLocaleString('th-TH')}
              </Text>
            </View>
            <View style={styles.budgetStatDivider} />
            <View style={styles.budgetStatItem}>
              <Text style={styles.budgetStatLabel}>เหลือ</Text>
              <Text
                style={[
                  styles.budgetStatValue,
                  remainingBudget < 0 && styles.budgetStatValueNegative,
                ]}
              >
                ฿{remainingBudget.toLocaleString('th-TH')}
              </Text>
            </View>
          </View>
        </View>

        {/* Category Summary */}
        {summary.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <PieChart size={20} color="#0066FF" strokeWidth={2.5} />
              <Text style={styles.sectionTitle}>แยกตามประเภท</Text>
            </View>
            <View style={styles.summaryContainer}>
              {summary.map((item, index) => (
                <View key={index} style={styles.summaryItem}>
                  <View style={styles.summaryItemLeft}>
                    <View
                      style={[
                        styles.summaryDot,
                        {
                          backgroundColor:
                            CATEGORY_COLORS[item.category]?.[0] || '#6B7280',
                        },
                      ]}
                    />
                    <Text style={styles.summaryLabel}>
                      {CATEGORY_LABELS[item.category]}
                    </Text>
                  </View>
                  <Text style={styles.summaryAmount}>
                    ฿{parseFloat(item.total).toLocaleString('th-TH')}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Expenses List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={20} color="#0066FF" strokeWidth={2.5} />
            <Text style={styles.sectionTitle}>รายการค่าใช้จ่าย</Text>
            <Text style={styles.expenseCount}>({expenses.length})</Text>
          </View>

          {expenses.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💰</Text>
              <Text style={styles.emptyTitle}>ยังไม่มีรายการ</Text>
              <Text style={styles.emptySubtitle}>
                เริ่มบันทึกค่าใช้จ่ายของคุณ
              </Text>
            </View>
          ) : (
            <FlatList
              data={expenses}
              renderItem={renderExpenseItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add Expense Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>เพิ่มรายการใหม่</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X size={24} color="#64748B" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <Text style={styles.inputLabel}>รายการ *</Text>
              <TextInput
                style={styles.input}
                placeholder="เช่น ค่าโรงแรม, ค่าอาหาร"
                value={title}
                onChangeText={setTitle}
                editable={!saving}
              />

              <Text style={styles.inputLabel}>จำนวนเงิน (บาท) *</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                editable={!saving}
              />

              <Text style={styles.inputLabel}>ประเภท *</Text>
              <View style={styles.categoryGrid}>
                {CATEGORY_OPTIONS.map((cat) => (
                  <TouchableOpacity
                    key={cat.value}
                    style={[
                      styles.categoryButton,
                      category === cat.value && styles.categoryButtonSelected,
                    ]}
                    onPress={() => setCategory(cat.value)}
                    disabled={saving}
                  >
                    <Text
                      style={[
                        styles.categoryButtonText,
                        category === cat.value &&
                          styles.categoryButtonTextSelected,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

             {/*<DatePickerInput
                label="วันที่ *"
                value={date}
                onChange={setDate}
                disabled={saving}
              />*/}

              <Text style={styles.inputLabel}>หมายเหตุ</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="เพิ่มรายละเอียด (ไม่บังคับ)"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                editable={!saving}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAddModal(false)}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={handleAddExpense}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Check size={20} color="#FFFFFF" strokeWidth={2.5} />
                    <Text style={styles.saveButtonText}>บันทึก</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerGradient: {
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 2,
    fontWeight: '500',
  },
  headerRight: {
    width: 40,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  budgetCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  budgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  budgetIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0066FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  budgetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  budgetProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  budgetProgressBar: {
    flex: 1,
    height: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    overflow: 'hidden',
  },
  budgetProgressFill: {
    height: '100%',
    borderRadius: 6,
  },
  budgetProgressText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    minWidth: 50,
    textAlign: 'right',
  },
  budgetStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  budgetStatLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 6,
    fontWeight: '600',
  },
  budgetStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  budgetStatValueNegative: {
    color: '#EF4444',
  },
  budgetStatDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#E2E8F0',
    marginHorizontal: 12,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  expenseCount: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
    marginLeft: 4,
  },
  summaryContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  summaryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
  },
  summaryAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  expenseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  expenseCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expenseIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  expenseIcon: {
    fontSize: 24,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  expenseMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  expenseCategory: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  expenseDivider: {
    fontSize: 12,
    color: '#CBD5E1',
  },
  expenseDate: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  expenseNotes: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    fontStyle: 'italic',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0066FF',
    letterSpacing: -0.3,
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  modalForm: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    marginTop: 16,
    letterSpacing: -0.2,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '500',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  categoryButton: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: '47%',
  },
  categoryButtonSelected: {
    backgroundColor: '#0066FF',
    borderColor: '#0066FF',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
    textAlign: 'center',
  },
  categoryButtonTextSelected: {
    color: '#FFFFFF',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});