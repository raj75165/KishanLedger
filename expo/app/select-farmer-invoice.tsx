import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Search, User, ChevronRight, FileText } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAppData } from '@/contexts/AppDataContext';
import { Farmer } from '@/types';

export default function SelectFarmerInvoiceScreen() {
  const router = useRouter();
  const { farmers, getFarmerStats } = useAppData();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFarmers = useMemo(() => {
    if (!searchQuery.trim()) return farmers;
    const query = searchQuery.toLowerCase();
    return farmers.filter(
      (f) =>
        f.name.toLowerCase().includes(query) ||
        f.village.toLowerCase().includes(query)
    );
  }, [farmers, searchQuery]);

  const formatCurrency = (amount: number) => {
    return '₹' + amount.toLocaleString('en-IN');
  };

  const renderFarmer = ({ item }: { item: Farmer }) => {
    const stats = getFarmerStats(item.id);
    return (
      <TouchableOpacity
        style={styles.farmerCard}
        onPress={() => router.push(`/generate-invoice/${item.id}` as any)}
      >
        <View style={styles.avatar}>
          <User size={24} color={Colors.white} />
        </View>
        <View style={styles.farmerInfo}>
          <Text style={styles.farmerName}>{item.name}</Text>
          <Text style={styles.farmerVillage}>{item.village}</Text>
          <Text style={styles.workCount}>{stats.totalWork} work entries</Text>
        </View>
        <View style={styles.farmerStats}>
          {stats.pendingAmount > 0 && (
            <Text style={styles.pendingAmount}>
              {formatCurrency(stats.pendingAmount)} due
            </Text>
          )}
        </View>
        <ChevronRight size={20} color={Colors.textLight} />
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Select Farmer',
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.white,
        }}
      />
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Search size={20} color={Colors.textLight} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search farmer..."
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
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <FileText size={64} color={Colors.textLight} />
              <Text style={styles.emptyTitle}>No Farmers Found</Text>
              <Text style={styles.emptySubtitle}>
                Add farmers first to generate invoices
              </Text>
            </View>
          }
        />
      </View>
    </>
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
  },
  farmerVillage: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  workCount: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
  farmerStats: {
    marginRight: 8,
  },
  pendingAmount: {
    fontSize: 14,
    fontWeight: '600' as const,
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
});
