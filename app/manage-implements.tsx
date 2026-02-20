import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppData } from '@/contexts/AppDataContext';
import { Stack, useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Tractor, Plus } from 'lucide-react-native';

export default function ManageImplementsScreen() {
  const { implements } = useAppData();
  const router = useRouter();

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Tractor size={24} color={Colors.primary} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemRate}>
          {`₹${item.ratePerUnit} / ${item.unit}`}
        </Text>
      </View>
      {/* Edit and Delete buttons will go here in the next step */}
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Manage Implements',
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push('/implement-form')}>
              <Plus size={24} color={Colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      <FlatList
        data={implements}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No implements found.</Text>
            <Text style={styles.emptySubText}>Add one to get started.</Text>
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
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  itemDetails: {
    marginLeft: 16,
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  itemRate: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
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
    emptySubText: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 8,
  }
});
