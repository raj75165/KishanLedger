import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search, Plus, User, Phone, MapPin, ChevronRight } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAppData } from '@/contexts/AppDataContext';
import { Farmer } from '@/types';

export default function FarmersScreen() {
  const router = useRouter();
  const { farmers, getFarmerStats } = useAppData();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const filteredFarmers = useMemo(() => {
    if (!searchQuery.trim()) return farmers;
    const query = searchQuery.toLowerCase();
    return farmers.filter(
      (f) =>
        f.name.toLowerCase().includes(query) ||
        f.village.toLowerCase().includes(query) ||
        f.phone.includes(query)
    );
  }, [farmers, searchQuery]);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return '₹' + amount.toLocaleString('en-IN');
  };

  const renderFarmer = ({ item }: { item: Farmer }) => {
    const stats = getFarmerStats(item.id);
    return (
      <TouchableOpacity
        style={styles.farmerCard}
        onPress={() => router.push(`/(tabs)/farmers/${item.id}` as any)}
      >
        <View style={styles.avatar}>
          <User size={24} color={Colors.white} />
        </View>
        <View style={styles.farmerInfo}>
          <Text style={styles.farmerName}>{item.name}</Text>
          <View style={styles.infoRow}>
            <Phone size={12} color={Colors.textLight} />
            <Text style={styles.infoText}>{item.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <MapPin size={12} color={Colors.textLight} />
            <Text style={styles.infoText}>{item.village}</Text>
          </View>
        </View>
        <View style={styles.farmerStats}>
          {stats.pendingAmount > 0 ? (
            <Text style={styles.pendingAmount}>
              {formatCurrency(stats.pendingAmount)}
            </Text>
          ) : (
            <Text style={styles.clearedText}>All Clear</Text>
          )}
          <Text style={styles.workCount}>{stats.totalWork} works</Text>
        </View>
        <ChevronRight size={20} color={Colors.textLight} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={20} color={Colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, village, phone..."
            placeholderTextColor={Colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={filteredFarmers}
        renderItem={renderFarmer}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <User size={64} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>No Farmers Found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? 'Try a different search term'
                : 'Add your first farmer to get started'}
            </Text>
            {!searchQuery && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push('/add-farmer' as any)}
              >
                <Plus size={20} color={Colors.white} />
                <Text style={styles.addButtonText}>Add Farmer</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/add-farmer' as any)}
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
  searchContainer: {
    padding: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: Colors.text,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  farmerCard: {
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
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  farmerInfo: {
    flex: 1,
  },
  farmerName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  infoText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  farmerStats: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  pendingAmount: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.pending,
  },
  clearedText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.success,
  },
  workCount: {
    fontSize: 12,
    color: Colors.textLight,
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
    bottom: 90,
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
