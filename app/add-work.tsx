import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import {
  User,
  Tractor,
  Calendar,
  IndianRupee,
  Check,
  ChevronDown,
  X,
  Search,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAppData } from '@/contexts/AppDataContext';
import { IMPLEMENTS } from '@/constants/implements';
import { Farmer, Implement } from '@/types';
import * as Haptics from 'expo-haptics';

export default function AddWorkScreen() {
  const router = useRouter();
  const { farmers, addWorkEntry } = useAppData();

  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [selectedImplement, setSelectedImplement] = useState<Implement | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [quantity, setQuantity] = useState('');
  const [rate, setRate] = useState('');
  const [notes, setNotes] = useState('');

  const [showFarmerModal, setShowFarmerModal] = useState(false);
  const [showImplementModal, setShowImplementModal] = useState(false);
  const [farmerSearch, setFarmerSearch] = useState('');

  const filteredFarmers = useMemo(() => {
    if (!farmerSearch.trim()) return farmers;
    const query = farmerSearch.toLowerCase();
    return farmers.filter(
      (f) =>
        f.name.toLowerCase().includes(query) ||
        f.village.toLowerCase().includes(query)
    );
  }, [farmers, farmerSearch]);

  const totalAmount = useMemo(() => {
    const q = parseFloat(quantity) || 0;
    const r = parseFloat(rate) || 0;
    return q * r;
  }, [quantity, rate]);

  const handleSelectImplement = (implement: Implement) => {
    setSelectedImplement(implement);
    setRate(implement.ratePerUnit.toString());
    setShowImplementModal(false);
  };

  const handleSubmit = () => {
    if (!selectedFarmer) {
      Alert.alert('Error', 'Please select a farmer');
      return;
    }
    if (!selectedImplement) {
      Alert.alert('Error', 'Please select an implement');
      return;
    }
    if (!quantity || parseFloat(quantity) <= 0) {
      Alert.alert('Error', 'Please enter quantity');
      return;
    }
    if (!rate || parseFloat(rate) <= 0) {
      Alert.alert('Error', 'Please enter rate');
      return;
    }

    addWorkEntry({
      farmerId: selectedFarmer.id,
      farmerName: selectedFarmer.name,
      implementId: selectedImplement.id,
      implementName: selectedImplement.name,
      date,
      quantity: parseFloat(quantity),
      unit: selectedImplement.unit,
      rate: parseFloat(rate),
      totalAmount,
      notes: notes.trim(),
      isPaid: false,
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Add Work Entry',
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.white,
        }}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Select Farmer *</Text>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => setShowFarmerModal(true)}
            >
              <User size={20} color={Colors.textSecondary} />
              <Text
                style={[
                  styles.selectorText,
                  !selectedFarmer && styles.placeholder,
                ]}
              >
                {selectedFarmer ? selectedFarmer.name : 'Choose a farmer'}
              </Text>
              <ChevronDown size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Select Implement *</Text>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => setShowImplementModal(true)}
            >
              <Tractor size={20} color={Colors.textSecondary} />
              <Text
                style={[
                  styles.selectorText,
                  !selectedImplement && styles.placeholder,
                ]}
              >
                {selectedImplement
                  ? `${selectedImplement.name} (${selectedImplement.nameHindi})`
                  : 'Choose an implement'}
              </Text>
              <ChevronDown size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date *</Text>
            <View style={styles.inputContainer}>
              <Calendar size={20} color={Colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.textLight}
                value={date}
                onChangeText={setDate}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>
                Quantity ({selectedImplement?.unit || 'unit'}) *
              </Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, styles.centerText]}
                  placeholder="0"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="decimal-pad"
                  value={quantity}
                  onChangeText={setQuantity}
                />
              </View>
            </View>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Rate (₹/{selectedImplement?.unit || 'unit'}) *</Text>
              <View style={styles.inputContainer}>
                <IndianRupee size={18} color={Colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="decimal-pad"
                  value={rate}
                  onChangeText={setRate}
                />
              </View>
            </View>
          </View>

          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹{totalAmount.toLocaleString('en-IN')}</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes (optional)</Text>
            <View style={[styles.inputContainer, styles.textArea]}>
              <TextInput
                style={[styles.input, styles.textAreaInput]}
                placeholder="Add any notes..."
                placeholderTextColor={Colors.textLight}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Check size={22} color={Colors.white} />
            <Text style={styles.submitText}>Add Work Entry</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={showFarmerModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Farmer</Text>
            <TouchableOpacity onPress={() => setShowFarmerModal(false)}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.searchBox}>
            <Search size={20} color={Colors.textLight} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search farmer..."
              placeholderTextColor={Colors.textLight}
              value={farmerSearch}
              onChangeText={setFarmerSearch}
            />
          </View>
          <FlatList
            data={filteredFarmers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setSelectedFarmer(item);
                  setShowFarmerModal(false);
                  setFarmerSearch('');
                }}
              >
                <View style={styles.modalItemIcon}>
                  <User size={20} color={Colors.white} />
                </View>
                <View>
                  <Text style={styles.modalItemTitle}>{item.name}</Text>
                  <Text style={styles.modalItemSubtitle}>{item.village}</Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyList}>
                <Text style={styles.emptyText}>No farmers found</Text>
                <TouchableOpacity
                  style={styles.addFarmerBtn}
                  onPress={() => {
                    setShowFarmerModal(false);
                    router.push('/add-farmer' as any);
                  }}
                >
                  <Text style={styles.addFarmerText}>Add New Farmer</Text>
                </TouchableOpacity>
              </View>
            }
          />
        </View>
      </Modal>

      <Modal
        visible={showImplementModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Implement</Text>
            <TouchableOpacity onPress={() => setShowImplementModal(false)}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={IMPLEMENTS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => handleSelectImplement(item)}
              >
                <View style={[styles.modalItemIcon, { backgroundColor: Colors.secondary }]}>
                  <Tractor size={20} color={Colors.white} />
                </View>
                <View style={styles.flex1}>
                  <Text style={styles.modalItemTitle}>{item.name}</Text>
                  <Text style={styles.modalItemSubtitle}>{item.nameHindi}</Text>
                </View>
                <Text style={styles.rateText}>
                  ₹{item.ratePerUnit}/{item.unit}
                </Text>
              </TouchableOpacity>
            )}
          />
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectorText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
  placeholder: {
    color: Colors.textLight,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 52,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
    paddingVertical: 14,
  },
  centerText: {
    textAlign: 'center',
    marginLeft: 0,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  totalContainer: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  totalValue: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.white,
    marginTop: 4,
  },
  textArea: {
    alignItems: 'flex-start',
  },
  textAreaInput: {
    height: 80,
    textAlignVertical: 'top',
    marginLeft: 0,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
    gap: 8,
  },
  submitText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    margin: 16,
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
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  modalItemIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalItemTitle: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  modalItemSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  rateText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  emptyList: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  addFarmerBtn: {
    marginTop: 16,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addFarmerText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.white,
  },
});
