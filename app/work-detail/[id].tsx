import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import {
  Tractor,
  User,
  Calendar,
  IndianRupee,
  Trash2,
  CheckCircle,
  X,
  CreditCard,
  Banknote,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAppData } from '@/contexts/AppDataContext';
import * as Haptics from 'expo-haptics';

export default function WorkDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { workEntries, deleteWorkEntry, addPayment } = useAppData();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi'>('cash');
  const [upiId, setUpiId] = useState('');

  const entry = useMemo(() => workEntries.find((e) => e.id === id), [workEntries, id]);

  const formatCurrency = (amount: number) => {
    return '₹' + amount.toLocaleString('en-IN');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this work entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (entry) {
              deleteWorkEntry(entry.id);
              router.back();
            }
          },
        },
      ]
    );
  };

  const handleMarkPaid = () => {
    if (paymentMethod === 'upi' && !upiId.trim()) {
      Alert.alert('Error', 'Please enter UPI transaction ID');
      return;
    }

    if (entry) {
      addPayment({
        farmerId: entry.farmerId,
        farmerName: entry.farmerName,
        amount: entry.totalAmount,
        method: paymentMethod,
        date: new Date().toISOString(),
        upiTransactionId: paymentMethod === 'upi' ? upiId.trim() : undefined,
        workEntryIds: [entry.id],
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowPaymentModal(false);
    }
  };

  if (!entry) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Work entry not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Work Details',
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.white,
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.implementIcon}>
            <Tractor size={32} color={Colors.white} />
          </View>
          <Text style={styles.implementName}>{entry.implementName}</Text>
          <View
            style={[
              styles.statusBadge,
              entry.isPaid ? styles.paidBadge : styles.pendingBadge,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                entry.isPaid ? styles.paidText : styles.pendingText,
              ]}
            >
              {entry.isPaid ? 'Paid' : 'Pending'}
            </Text>
          </View>
        </View>

        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Total Amount</Text>
          <Text style={styles.amountValue}>{formatCurrency(entry.totalAmount)}</Text>
          <Text style={styles.rateInfo}>
            {entry.quantity} {entry.unit} × {formatCurrency(entry.rate)}/{entry.unit}
          </Text>
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <User size={20} color={Colors.textSecondary} />
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Farmer</Text>
              <Text style={styles.detailValue}>{entry.farmerName}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Calendar size={20} color={Colors.textSecondary} />
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{formatDate(entry.date)}</Text>
            </View>
          </View>

          {entry.notes && (
            <View style={styles.detailRow}>
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Notes</Text>
                <Text style={styles.detailValue}>{entry.notes}</Text>
              </View>
            </View>
          )}

          {entry.isPaid && entry.paymentMethod && (
            <>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <IndianRupee size={20} color={Colors.textSecondary} />
                <View style={styles.detailInfo}>
                  <Text style={styles.detailLabel}>Payment Method</Text>
                  <Text style={styles.detailValue}>
                    {entry.paymentMethod === 'upi' ? 'UPI' : 'Cash'}
                  </Text>
                </View>
              </View>
              {entry.upiTransactionId && (
                <View style={styles.detailRow}>
                  <View style={styles.detailInfo}>
                    <Text style={styles.detailLabel}>UPI Transaction ID</Text>
                    <Text style={styles.detailValue}>{entry.upiTransactionId}</Text>
                  </View>
                </View>
              )}
              {entry.paymentDate && (
                <View style={styles.detailRow}>
                  <View style={styles.detailInfo}>
                    <Text style={styles.detailLabel}>Payment Date</Text>
                    <Text style={styles.detailValue}>
                      {formatDate(entry.paymentDate)}
                    </Text>
                  </View>
                </View>
              )}
            </>
          )}
        </View>

        {!entry.isPaid && (
          <TouchableOpacity
            style={styles.payButton}
            onPress={() => setShowPaymentModal(true)}
          >
            <CheckCircle size={22} color={Colors.white} />
            <Text style={styles.payButtonText}>Mark as Paid</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Trash2 size={20} color={Colors.error} />
          <Text style={styles.deleteButtonText}>Delete Entry</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={showPaymentModal}
        animationType="slide"
        transparent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Record Payment</Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalAmount}>{formatCurrency(entry.totalAmount)}</Text>

            <Text style={styles.methodLabel}>Payment Method</Text>
            <View style={styles.methodButtons}>
              <TouchableOpacity
                style={[
                  styles.methodBtn,
                  paymentMethod === 'cash' && styles.methodBtnActive,
                ]}
                onPress={() => setPaymentMethod('cash')}
              >
                <Banknote
                  size={24}
                  color={paymentMethod === 'cash' ? Colors.white : Colors.text}
                />
                <Text
                  style={[
                    styles.methodBtnText,
                    paymentMethod === 'cash' && styles.methodBtnTextActive,
                  ]}
                >
                  Cash
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.methodBtn,
                  paymentMethod === 'upi' && styles.methodBtnActive,
                  paymentMethod === 'upi' && { backgroundColor: Colors.upi },
                ]}
                onPress={() => setPaymentMethod('upi')}
              >
                <CreditCard
                  size={24}
                  color={paymentMethod === 'upi' ? Colors.white : Colors.text}
                />
                <Text
                  style={[
                    styles.methodBtnText,
                    paymentMethod === 'upi' && styles.methodBtnTextActive,
                  ]}
                >
                  UPI
                </Text>
              </TouchableOpacity>
            </View>

            {paymentMethod === 'upi' && (
              <View style={styles.upiInput}>
                <Text style={styles.upiLabel}>UPI Transaction ID</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter transaction ID"
                  placeholderTextColor={Colors.textLight}
                  value={upiId}
                  onChangeText={setUpiId}
                />
              </View>
            )}

            <TouchableOpacity style={styles.confirmButton} onPress={handleMarkPaid}>
              <Text style={styles.confirmButtonText}>Confirm Payment</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
    marginTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  implementIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  implementName: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  paidBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  pendingBadge: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  paidText: {
    color: Colors.paid,
  },
  pendingText: {
    color: Colors.pending,
  },
  amountCard: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  amountLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  amountValue: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: Colors.white,
    marginVertical: 4,
  },
  rateInfo: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  detailsCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  detailInfo: {
    flex: 1,
    marginLeft: 16,
  },
  detailLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500' as const,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.success,
    borderRadius: 12,
    padding: 16,
    gap: 8,
    marginBottom: 12,
  },
  payButtonText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.error,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  modalAmount: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 24,
  },
  methodLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  methodButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  methodBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  methodBtnActive: {
    backgroundColor: Colors.success,
  },
  methodBtnText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  methodBtnTextActive: {
    color: Colors.white,
  },
  upiInput: {
    marginBottom: 20,
  },
  upiLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.white,
  },
});
