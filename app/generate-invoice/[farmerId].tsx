import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import {
  ArrowLeft,
  FileText,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAppData } from '@/contexts/AppDataContext';
import * as Haptics from 'expo-haptics';
import DatePickerInput from '@/components/DatePickerInput';

export default function GenerateInvoiceScreen() {
  const { farmerId } = useLocalSearchParams<{ farmerId: string }>();
  const router = useRouter();
  const { farmers, workEntries, generateInvoice } = useAppData();

  const farmer = useMemo(() => farmers.find((f) => f.id === farmerId), [farmers, farmerId]);

  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const [fromDate, setFromDate] = useState(firstOfMonth.toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(today.toISOString().split('T')[0]);

  const previewEntries = useMemo(() => {
    if (!farmer) return [];
    return workEntries.filter(
      (e) =>
        e.farmerId === farmer.id &&
        e.date >= fromDate &&
        e.date <= toDate
    );
  }, [farmer, workEntries, fromDate, toDate]);

  const totals = useMemo(() => {
    const total = previewEntries.reduce((sum, e) => sum + e.totalAmount, 0);
    const paid = previewEntries.filter((e) => e.isPaid).reduce((sum, e) => sum + e.totalAmount, 0);
    return { total, paid, pending: total - paid };
  }, [previewEntries]);

  const formatCurrency = (amount: number) => {
    return '₹' + amount.toLocaleString('en-IN');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
  };

  const handleGenerate = () => {
    if (previewEntries.length === 0) {
      Alert.alert('No Entries', 'No work entries found for the selected date range.');
      return;
    }

    const invoice = generateInvoice(farmerId, fromDate, toDate);
    if (invoice) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace(`/invoice-detail/${invoice.id}` as any);
    }
  };

  if (!farmer) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Farmer not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Generate Invoice',
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.white,
          headerLeft: () => (
            <TouchableOpacity onPress={router.back} style={{ paddingHorizontal: 15 }}>
              <ArrowLeft size={24} color={Colors.white} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.farmerCard}>
          <Text style={styles.farmerLabel}>Invoice For</Text>
          <Text style={styles.farmerName}>{farmer.name}</Text>
          <Text style={styles.farmerVillage}>{farmer.village}</Text>
        </View>

        <View style={styles.dateSection}>
          <Text style={styles.sectionTitle}>Date Range</Text>
          <View style={styles.dateRow}>
            <View style={styles.dateInput}>
              <Text style={styles.dateLabel}>From</Text>
              <DatePickerInput value={fromDate} onChange={setFromDate} />
            </View>
            <View style={styles.dateInput}>
              <Text style={styles.dateLabel}>To</Text>
              <DatePickerInput value={toDate} onChange={setToDate} />
            </View>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Invoice Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Work Entries</Text>
            <Text style={styles.summaryValue}>{previewEntries.length}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Amount</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totals.total)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Already Paid</Text>
            <Text style={[styles.summaryValue, { color: Colors.success }]}>
              {formatCurrency(totals.paid)}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.pendingRow]}>
            <Text style={styles.pendingLabel}>Pending Amount</Text>
            <Text style={styles.pendingValue}>{formatCurrency(totals.pending)}</Text>
          </View>
        </View>

        {previewEntries.length > 0 && (
          <View style={styles.entriesSection}>
            <Text style={styles.sectionTitle}>Work Entries Preview</Text>
            {previewEntries.slice(0, 5).map((entry) => (
              <View key={entry.id} style={styles.entryRow}>
                <View style={styles.entryInfo}>
                  <Text style={styles.entryImplement}>{entry.implementName}</Text>
                  <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
                </View>
                <Text style={styles.entryAmount}>{formatCurrency(entry.totalAmount)}</Text>
              </View>
            ))}
            {previewEntries.length > 5 && (
              <Text style={styles.moreText}>
                +{previewEntries.length - 5} more entries
              </Text>
            )}
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.generateButton,
            previewEntries.length === 0 && styles.buttonDisabled,
          ]}
          onPress={handleGenerate}
          disabled={previewEntries.length === 0}
        >
          <FileText size={22} color={Colors.white} />
          <Text style={styles.generateButtonText}>Generate Invoice</Text>
        </TouchableOpacity>
      </ScrollView>
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
  farmerCard: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  farmerLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  farmerName: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.white,
    marginTop: 4,
  },
  farmerVillage: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  dateSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInput: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    marginLeft: 8,
  },
  summaryCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  summaryLabel: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  pendingRow: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginTop: 12,
    borderBottomWidth: 0,
  },
  pendingLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.pending,
  },
  pendingValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.pending,
  },
  entriesSection: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  entryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  entryInfo: {
    flex: 1,
  },
  entryImplement: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  entryDate: {
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 2,
  },
  entryAmount: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  moreText: {
    fontSize: 13,
    color: Colors.primary,
    textAlign: 'center',
    marginTop: 12,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  generateButtonText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.white,
  },
});
