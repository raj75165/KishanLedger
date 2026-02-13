import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  TrendingUp,
  Users,
  Tractor,
  IndianRupee,
  Calendar,
  PieChart,
  ChevronRight,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAppData } from '@/contexts/AppDataContext';

type Period = 'week' | 'month' | 'year' | 'all';

export default function ReportsScreen() {
  const router = useRouter();
  const { workEntries, stats } = useAppData();
  const [period, setPeriod] = useState<Period>('month');

  const filteredStats = useMemo(() => {
    const now = new Date();
    let startDate = new Date(0);

    if (period === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    const filtered = workEntries.filter(
      (e) => new Date(e.date) >= startDate
    );

    const totalAmount = filtered.reduce((sum, e) => sum + e.totalAmount, 0);
    const paidAmount = filtered
      .filter((e) => e.isPaid)
      .reduce((sum, e) => sum + e.totalAmount, 0);

    return {
      entries: filtered.length,
      totalAmount,
      paidAmount,
      pendingAmount: totalAmount - paidAmount,
    };
  }, [workEntries, period]);

  const implementStats = useMemo(() => {
    const implementMap = new Map<string, { count: number; amount: number }>();

    workEntries.forEach((entry) => {
      const existing = implementMap.get(entry.implementName) || {
        count: 0,
        amount: 0,
      };
      implementMap.set(entry.implementName, {
        count: existing.count + 1,
        amount: existing.amount + entry.totalAmount,
      });
    });

    return Array.from(implementMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [workEntries]);

  const topFarmers = useMemo(() => {
    const farmerMap = new Map<string, { name: string; amount: number; pending: number }>();

    workEntries.forEach((entry) => {
      const existing = farmerMap.get(entry.farmerId) || {
        name: entry.farmerName,
        amount: 0,
        pending: 0,
      };
      farmerMap.set(entry.farmerId, {
        name: entry.farmerName,
        amount: existing.amount + entry.totalAmount,
        pending: existing.pending + (entry.isPaid ? 0 : entry.totalAmount),
      });
    });

    return Array.from(farmerMap.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [workEntries]);

  const formatCurrency = (amount: number) => {
    return '₹' + amount.toLocaleString('en-IN');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.periodSelector}>
        {(['week', 'month', 'year', 'all'] as Period[]).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.periodBtn, period === p && styles.periodActive]}
            onPress={() => setPeriod(p)}
          >
            <Text
              style={[
                styles.periodText,
                period === p && styles.periodTextActive,
              ]}
            >
              {p === 'week' ? 'Week' : p === 'month' ? 'Month' : p === 'year' ? 'Year' : 'All'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.summaryGrid}>
        <View style={[styles.summaryCard, styles.cardBlue]}>
          <Tractor size={24} color={Colors.white} />
          <Text style={styles.summaryValue}>{filteredStats.entries}</Text>
          <Text style={styles.summaryLabel}>Work Done</Text>
        </View>
        <View style={[styles.summaryCard, styles.cardGreen]}>
          <IndianRupee size={24} color={Colors.white} />
          <Text style={styles.summaryValue}>
            {formatCurrency(filteredStats.totalAmount)}
          </Text>
          <Text style={styles.summaryLabel}>Total Earned</Text>
        </View>
        <View style={[styles.summaryCard, styles.cardOrange]}>
          <TrendingUp size={24} color={Colors.white} />
          <Text style={styles.summaryValue}>
            {formatCurrency(filteredStats.paidAmount)}
          </Text>
          <Text style={styles.summaryLabel}>Received</Text>
        </View>
        <View style={[styles.summaryCard, styles.cardRed]}>
          <Calendar size={24} color={Colors.white} />
          <Text style={styles.summaryValue}>
            {formatCurrency(filteredStats.pendingAmount)}
          </Text>
          <Text style={styles.summaryLabel}>Pending</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Implements</Text>
        {implementStats.length === 0 ? (
          <View style={styles.emptySection}>
            <Text style={styles.emptyText}>No data available</Text>
          </View>
        ) : (
          implementStats.map((item, index) => (
            <View key={item.name} style={styles.listItem}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemCount}>{item.count} times used</Text>
              </View>
              <Text style={styles.itemAmount}>{formatCurrency(item.amount)}</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Farmers</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/farmers' as any)}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>
        {topFarmers.length === 0 ? (
          <View style={styles.emptySection}>
            <Text style={styles.emptyText}>No data available</Text>
          </View>
        ) : (
          topFarmers.map((farmer, index) => (
            <TouchableOpacity
              key={farmer.id}
              style={styles.listItem}
              onPress={() => router.push(`/(tabs)/farmers/${farmer.id}` as any)}
            >
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{farmer.name}</Text>
                {farmer.pending > 0 && (
                  <Text style={styles.pendingText}>
                    {formatCurrency(farmer.pending)} pending
                  </Text>
                )}
              </View>
              <Text style={styles.itemAmount}>{formatCurrency(farmer.amount)}</Text>
              <ChevronRight size={18} color={Colors.textLight} />
            </TouchableOpacity>
          ))
        )}
      </View>

      <View style={styles.overallStats}>
        <Text style={styles.sectionTitle}>Overall Statistics</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Users size={20} color={Colors.primary} />
            <Text style={styles.statValue}>{stats.totalFarmers}</Text>
            <Text style={styles.statLabel}>Total Farmers</Text>
          </View>
          <View style={styles.statItem}>
            <Tractor size={20} color={Colors.secondary} />
            <Text style={styles.statValue}>{stats.totalWork}</Text>
            <Text style={styles.statLabel}>Total Work</Text>
          </View>
          <View style={styles.statItem}>
            <PieChart size={20} color={Colors.accent} />
            <Text style={styles.statValue}>
              {stats.totalWork > 0
                ? Math.round((stats.paidAmount / stats.totalAmount) * 100)
                : 0}
              %
            </Text>
            <Text style={styles.statLabel}>Collection</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodActive: {
    backgroundColor: Colors.primary,
  },
  periodText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  periodTextActive: {
    color: Colors.white,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'flex-start',
  },
  cardBlue: {
    backgroundColor: '#3B82F6',
  },
  cardGreen: {
    backgroundColor: Colors.success,
  },
  cardOrange: {
    backgroundColor: Colors.accent,
  },
  cardRed: {
    backgroundColor: '#EF4444',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.white,
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  section: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  viewAll: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500' as const,
  },
  emptySection: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  itemCount: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
  pendingText: {
    fontSize: 12,
    color: Colors.pending,
    marginTop: 2,
  },
  itemAmount: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    marginRight: 8,
  },
  overallStats: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});
