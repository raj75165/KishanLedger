import React, { useState, useMemo } from 'react';
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
  Plus,
  Tractor,
  Calendar,
  ChevronRight,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAppData } from '@/contexts/AppDataContext';
import { WorkEntry } from '@/types';

type FilterType = 'all' | 'paid' | 'pending';

export default function WorkScreen() {
  const router = useRouter();
  const { workEntries } = useAppData();
  const [filter, setFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);

  const filteredEntries = useMemo(() => {
    const sorted = [...workEntries].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    if (filter === 'all') return sorted;
    if (filter === 'paid') return sorted.filter((e) => e.isPaid);
    return sorted.filter((e) => !e.isPaid);
  }, [workEntries, filter]);

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

  const renderEntry = ({ item }: { item: WorkEntry }) => (
    <TouchableOpacity
      style={styles.workCard}
      onPress={() => router.push(`/work-detail/${item.id}` as any)}
    >
      <View style={styles.workIcon}>
        <Tractor size={22} color={Colors.white} />
      </View>
      <View style={styles.workInfo}>
        <Text style={styles.implementName}>{item.implementName}</Text>
        <Text style={styles.farmerName}>{item.farmerName}</Text>
        <View style={styles.detailRow}>
          <Calendar size={12} color={Colors.textLight} />
          <Text style={styles.dateText}>{formatDate(item.date)}</Text>
        </View>
        <Text style={styles.quantity}>
          {item.quantity} {item.unit}
        </Text>
      </View>
      <View style={styles.workRight}>
        <Text style={styles.amount}>{formatCurrency(item.totalAmount)}</Text>
        <View
          style={[
            styles.statusBadge,
            item.isPaid ? styles.paidBadge : styles.pendingBadge,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              item.isPaid ? styles.paidText : styles.pendingText,
            ]}
          >
            {item.isPaid ? 'Paid' : 'Pending'}
          </Text>
        </View>
      </View>
      <ChevronRight size={18} color={Colors.textLight} />
    </TouchableOpacity>
  );

  const totalPending = useMemo(() => {
    return workEntries
      .filter((e) => !e.isPaid)
      .reduce((sum, e) => sum + e.totalAmount, 0);
  }, [workEntries]);

  return (
    <View style={styles.container}>
      <View style={styles.summaryBar}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Entries</Text>
          <Text style={styles.summaryValue}>{workEntries.length}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Pending Amount</Text>
          <Text style={[styles.summaryValue, styles.pendingValue]}>
            {formatCurrency(totalPending)}
          </Text>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'all' && styles.filterActive]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'all' && styles.filterTextActive,
            ]}
          >
            All ({workEntries.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'pending' && styles.filterActive]}
          onPress={() => setFilter('pending')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'pending' && styles.filterTextActive,
            ]}
          >
            Pending ({workEntries.filter((e) => !e.isPaid).length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'paid' && styles.filterActive]}
          onPress={() => setFilter('paid')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'paid' && styles.filterTextActive,
            ]}
          >
            Paid ({workEntries.filter((e) => e.isPaid).length})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredEntries}
        renderItem={renderEntry}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Tractor size={64} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>No Work Entries</Text>
            <Text style={styles.emptySubtitle}>
              Add your first work entry to get started
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/add-work' as any)}
            >
              <Plus size={20} color={Colors.white} />
              <Text style={styles.addButtonText}>Add Work Entry</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/add-work' as any)}
      >
        <Plus size={28} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  summaryBar: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  summaryLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginTop: 4,
  },
  pendingValue: {
    color: Colors.pending,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: Colors.card,
    gap: 8,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.background,
    alignItems: 'center',
  },
  filterActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.white,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  workCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  workIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  workInfo: {
    flex: 1,
  },
  implementName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  farmerName: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  dateText: {
    fontSize: 12,
    color: Colors.textLight,
  },
  quantity: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
  workRight: {
    alignItems: 'flex-end',
    marginRight: 6,
  },
  amount: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: 4,
  },
  paidBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  pendingBadge: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  paidText: {
    color: Colors.paid,
  },
  pendingText: {
    color: Colors.pending,
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    gap: 8,
  },
  addButtonText: {
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
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});
