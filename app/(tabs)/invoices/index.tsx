import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  FileText,
  Calendar,
  User,
  Plus,
  ChevronRight,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAppData } from '@/contexts/AppDataContext';
import { Invoice } from '@/types';

export default function InvoicesScreen() {
  const router = useRouter();
  const { invoices, farmers } = useAppData();
  const [refreshing, setRefreshing] = React.useState(false);

  const sortedInvoices = useMemo(() => {
    return [...invoices].sort(
      (a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
    );
  }, [invoices]);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return '₹' + amount.toLocaleString('en-IN');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderInvoice = ({ item }: { item: Invoice }) => (
    <TouchableOpacity
      style={styles.invoiceCard}
      onPress={() => router.push(`/invoice-detail/${item.id}` as any)}
    >
      <View style={styles.invoiceIcon}>
        <FileText size={22} color={Colors.white} />
      </View>
      <View style={styles.invoiceInfo}>
        <Text style={styles.invoiceNumber}>{item.invoiceNumber}</Text>
        <View style={styles.farmerRow}>
          <User size={12} color={Colors.textLight} />
          <Text style={styles.farmerName}>{item.farmerName}</Text>
        </View>
        <View style={styles.dateRow}>
          <Calendar size={12} color={Colors.textLight} />
          <Text style={styles.dateText}>
            {formatDate(item.fromDate)} - {formatDate(item.toDate)}
          </Text>
        </View>
        <Text style={styles.entriesCount}>
          {item.workEntries.length} work entries
        </Text>
      </View>
      <View style={styles.invoiceRight}>
        <Text style={styles.totalAmount}>{formatCurrency(item.totalAmount)}</Text>
        {item.pendingAmount > 0 ? (
          <Text style={styles.pendingAmount}>
            {formatCurrency(item.pendingAmount)} due
          </Text>
        ) : (
          <Text style={styles.paidStatus}>Fully Paid</Text>
        )}
      </View>
      <ChevronRight size={18} color={Colors.textLight} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={sortedInvoices}
        renderItem={renderInvoice}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <FileText size={64} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>No Invoices Yet</Text>
            <Text style={styles.emptySubtitle}>
              Generate invoices from farmer profiles
            </Text>
            {farmers.length > 0 && (
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => router.push('/select-farmer-invoice' as any)}
              >
                <Plus size={20} color={Colors.white} />
                <Text style={styles.selectButtonText}>Generate Invoice</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {farmers.length > 0 && invoices.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/select-farmer-invoice' as any)}
        >
          <Plus size={28} color={Colors.white} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  invoiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  invoiceIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  invoiceInfo: {
    flex: 1,
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  farmerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  farmerName: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  dateText: {
    fontSize: 12,
    color: Colors.textLight,
  },
  entriesCount: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
  invoiceRight: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  pendingAmount: {
    fontSize: 12,
    color: Colors.pending,
    marginTop: 2,
  },
  paidStatus: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '500' as const,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    gap: 8,
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});
