import React, { useState } from 'react';
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
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { User, Phone, MapPin, Landmark, Check } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAppData } from '@/contexts/AppDataContext';
import { LAND_UNITS } from '@/constants/implements';
import * as Haptics from 'expo-haptics';

export default function AddFarmerScreen() {
  const router = useRouter();
  const { addFarmer } = useAppData();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [village, setVillage] = useState('');
  const [address, setAddress] = useState('');
  const [landArea, setLandArea] = useState('');
  const [landUnit, setLandUnit] = useState<'acre' | 'bigha' | 'hectare'>('acre');

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter farmer name');
      return;
    }
    if (!phone.trim() || phone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }
    if (!village.trim()) {
      Alert.alert('Error', 'Please enter village name');
      return;
    }

    addFarmer({
      name: name.trim(),
      phone: phone.trim(),
      village: village.trim(),
      address: address.trim(),
      landArea: parseFloat(landArea) || 0,
      landUnit,
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Add Farmer',
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
            <Text style={styles.label}>Farmer Name *</Text>
            <View style={styles.inputContainer}>
              <User size={20} color={Colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Enter full name"
                placeholderTextColor={Colors.textLight}
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number *</Text>
            <View style={styles.inputContainer}>
              <Phone size={20} color={Colors.textSecondary} />
              <Text style={styles.prefix}>+91</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter phone number"
                placeholderTextColor={Colors.textLight}
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ''))}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Village *</Text>
            <View style={styles.inputContainer}>
              <MapPin size={20} color={Colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Enter village name"
                placeholderTextColor={Colors.textLight}
                value={village}
                onChangeText={setVillage}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Address</Text>
            <View style={styles.inputContainer}>
              <MapPin size={20} color={Colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Enter full address (optional)"
                placeholderTextColor={Colors.textLight}
                value={address}
                onChangeText={setAddress}
                multiline
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Land Area</Text>
            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.flex1]}>
                <Landmark size={20} color={Colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Area"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="decimal-pad"
                  value={landArea}
                  onChangeText={setLandArea}
                />
              </View>
              <View style={styles.unitSelector}>
                {LAND_UNITS.map((unit) => (
                  <TouchableOpacity
                    key={unit.value}
                    style={[
                      styles.unitBtn,
                      landUnit === unit.value && styles.unitBtnActive,
                    ]}
                    onPress={() => setLandUnit(unit.value as 'acre' | 'bigha' | 'hectare')}
                  >
                    <Text
                      style={[
                        styles.unitText,
                        landUnit === unit.value && styles.unitTextActive,
                      ]}
                    >
                      {unit.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Check size={22} color={Colors.white} />
            <Text style={styles.submitText}>Add Farmer</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  prefix: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 8,
    fontWeight: '500' as const,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
    paddingVertical: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  unitSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  unitBtn: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
  },
  unitBtnActive: {
    backgroundColor: Colors.primary,
  },
  unitText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  unitTextActive: {
    color: Colors.white,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    gap: 8,
  },
  submitText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.white,
  },
});
