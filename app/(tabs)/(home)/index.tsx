import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Users,
  Tractor,
  IndianRupee,
  Clock,
  Plus,
  FileText,
  TrendingUp,
  ChevronRight,
  Wrench,
  Wallet,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useAppData } from '@/contexts/AppDataContext';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { stats, workEntries } = useAppData();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const recentWork = workEntries.slice(-5).reverse();

  const formatCurrency = (amount: number) => {
    return '₹' + amount.toLocaleString('en-IN');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.businessName}>{user?.businessName}</Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => router.push('/profile' as any)}
        >
          <Text style={styles.profileInitial}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.statsGrid}>
          <TouchableOpacity
            style={[styles.statCard, styles.statCardPrimary]}
            onPress={() => router.push('/(tabs)/farmers' as any)}
          >
            <View style={styles.statIcon}>
              <Users size={24} color={Colors.white} />
            </View>
            <Text style={styles.statValue}>{stats.totalFarmers}</Text>
            <Text style={styles.statLabel}>Farmers</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, styles.statCardSecondary]}
            onPress={() => router.push('/(tabs)/work' as any)}
          >
            <View style={styles.statIcon}>
              <Tractor size={24} color={Colors.white} />
            </View>
            <Text style={styles.statValue}>{stats.totalWork}</Text>
            <Text style={styles.statLabel}>Work Done</Text>
          </TouchableOpacity>

          <View style={[styles.statCard, styles.statCardSuccess]}>
            <View style={styles.statIcon}>
              <IndianRupee size={24} color={Colors.white} />
            </View>
            <Text style={styles.statValue}>
              {formatCurrency(stats.paidAmount)}
            </Text>
            <Text style={styles.statLabel}>Received</Text>
          </View>

          <View style={[styles.statCard, styles.statCardWarning]}>
            <View style={styles.statIcon}>
              <Clock size={24} color={Colors.white} />
            </View>
            <Text style={styles.statValue}>
              {formatCurrency(stats.pendingAmount)}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/add-work' as any)}
            >
              <View style={[styles.actionIcon, { backgroundColor: Colors.primary }]}>
                <Plus size={22} color={Colors.white} />
              </View>
              <Text style={styles.actionText}>Add Work</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/add-farmer' as any)}
            >
              <View style={[styles.actionIcon, { backgroundColor: Colors.secondary }]}>
                <Users size={22} color={Colors.white} />
              </View>
              <Text style={styles.actionText}>Add Farmer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/add-expense' as any)}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#E91E63' }]}>
                <Wallet size={22} color={Colors.white} />
              </View>
              <Text style={styles.actionText}>Add Expense</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/manage-implements' as any)}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#6c757d' }]}>
                <Wrench size={22} color={Colors.white} />
              </View>
              <Text style={styles.actionText}>Implements</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.actionsRow, { marginTop: 16 }]}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/farmers' as any)}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#0288D1' }]}>
                <Users size={22} color={Colors.white} />
              </View>
              <Text style={styles.actionText}>Farmers</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/work' as any)}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#00897B' }]}>
                <Tractor size={22} color={Colors.white} />
              </View>
              <Text style={styles.actionText}>Work</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/invoices' as any)}
            >
              <View style={[styles.actionIcon, { backgroundColor: Colors.accent }]}>
                <FileText size={22} color={Colors.white} />
              </View>
              <Text style={styles.actionText}>Invoices</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/reports' as any)}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#7B1FA2' }]}>
                <TrendingUp size={22} color={Colors.white} />
              </View>
              <Text style={styles.actionText}>Reports</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Work</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/work' as any)}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {recentWork.length === 0 ? (
            <View style={styles.emptyState}>
              <Tractor size={48} color={Colors.textLight} />
              <Text style={styles.emptyText}>No work entries yet</Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push('/add-work' as any)}
              >
                <Text style={styles.emptyButtonText}>Add First Entry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            recentWork.map((entry) => (
              <TouchableOpacity
                key={entry.id}
                style={styles.workCard}
                onPress={() => router.push(`/work-detail/${entry.id}` as any)}
              >
                <View style={styles.workInfo}>
                  <Text style={styles.workImplement}>{entry.implementName}</Text>
                  <Text style={styles.workFarmer}>{entry.farmerName}</Text>
                  <Text style={styles.workDate}>{formatDate(entry.date)}</Text>
                </View>
                <View style={styles.workAmount}>
                  <Text style={styles.workPrice}>
                    {formatCurrency(entry.totalAmount)}
                  </Text>
                  <View
                    style={[
                      styles.paymentBadge,
                      entry.isPaid ? styles.paidBadge : styles.pendingBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.paymentBadgeText,
                        entry.isPaid ? styles.paidText : styles.pendingText,
                      ]}
                    >
                      {entry.isPaid ? 'Paid' : 'Pending'}
                    </Text>
                  </View>
                </View>
                <ChevronRight size={20} color={Colors.textLight} />
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  businessName: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  scrollView: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 112,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    minHeight: 110,
  },
  statCardPrimary: {
    backgroundColor: Colors.primary,
  },
  statCardSecondary: {
    backgroundColor: Colors.secondary,
  },
  statCardSuccess: {
    backgroundColor: Colors.success,
  },
  statCardWarning: {
    backgroundColor: Colors.accent,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  quickActions: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
    width: '22%',
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  recentSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500' as const,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: Colors.card,
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 12,
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: Colors.white,
    fontWeight: '600' as const,
  },
  workCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  workInfo: {
    flex: 1,
  },
  workImplement: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  workFarmer: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  workDate: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
  },
  workAmount: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  workPrice: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  paymentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
  },
  paidBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  pendingBadge: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
  },
  paymentBadgeText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  paidText: {
    color: Colors.paid,
  },
  pendingText: {
    color: Colors.pending,
  },
});
