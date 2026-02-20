import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useAppData } from '@/contexts/AppDataContext';
import { Stack, useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Plus } from 'lucide-react-native';

export default function ExpensesScreen() {
  const { expenses } = useAppData();
  const router = useRouter();

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemDetails}>
        <Text style={styles.itemCategory}>{item.category}</Text>
        <Text style={styles.itemDescription}>{item.description || 'No description'}</Text>
        <Text style={styles.itemDate}>{item.date}</Text>
      </View>
      <Text style={styles.itemAmount}>- ₹{item.amount.toLocaleString('en-IN')}</Text>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Expenses',
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push('/add-expense')}>
              <Plus size={24} color={Colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      <FlatList
        data={expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No expenses recorded yet.</Text>
          </View>
        )}
      />
    </>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
    itemDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  itemDate: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 6,
  },
  itemAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.error,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '50%',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});
