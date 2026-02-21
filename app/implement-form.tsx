import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useAppData } from '@/contexts/AppDataContext';
import { Colors } from '@/constants/colors';
import { Implement } from '@/types';
import { Save } from 'lucide-react-native';

export default function ImplementFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { implements: implementsList, addImplement, updateImplement } = useAppData();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [nameHindi, setNameHindi] = useState('');
  const [ratePerUnit, setRatePerUnit] = useState('');
  const [unit, setUnit] = useState('acre');
  const [icon, setIcon] = useState('');

  useEffect(() => {
    if (id) {
      const existingImplement = implementsList.find((i) => i.id === id);
      if (existingImplement) {
        setIsEditing(true);
        setName(existingImplement.name);
        setNameHindi(existingImplement.nameHindi || '');
        setRatePerUnit(existingImplement.ratePerUnit.toString());
        setUnit(existingImplement.unit);
        setIcon(existingImplement.icon || '');
      }
    }
  }, [id, implementsList]);

  const handleSubmit = () => {
    const rate = parseFloat(ratePerUnit);
    if (!name || !ratePerUnit || isNaN(rate)) {
        Alert.alert('Invalid Input', 'Please fill all fields correctly.');
        return;
    }

    const implementData = { name, nameHindi, ratePerUnit: rate, unit, icon };

    if (isEditing && id) {
      updateImplement(id, implementData);
    } else {
      addImplement(implementData);
    }

    router.back();
  };

  return (
    <>
        <Stack.Screen options={{ title: isEditing ? 'Edit Implement' : 'Add Implement' }} />
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.formGroup}>
                <Text style={styles.label}>Implement Name (English)</Text>
                <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g., Harrow" />
            </View>
            <View style={styles.formGroup}>
                <Text style={styles.label}>Implement Name (Hindi)</Text>
                <TextInput style={styles.input} value={nameHindi} onChangeText={setNameHindi} placeholder="e.g., हैरो" />
            </View>
            <View style={styles.formGroup}>
                <Text style={styles.label}>Rate per Unit (₹)</Text>
                <TextInput style={styles.input} value={ratePerUnit} onChangeText={setRatePerUnit} placeholder="e.g., 800" keyboardType="numeric" />
            </View>
            <View style={styles.formGroup}>
                <Text style={styles.label}>Unit</Text>
                <TextInput style={styles.input} value={unit} onChangeText={setUnit} placeholder="e.g., acre, hour" />
            </View>
             <View style={styles.formGroup}>
                <Text style={styles.label}>Icon Name</Text>
                <TextInput style={styles.input} value={icon} onChangeText={setIcon} placeholder="e.g., grid-3x3" />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
                <Save size={22} color={Colors.white} />
                <Text style={styles.saveButtonText}>{isEditing ? 'Update Implement' : 'Save Implement'}</Text>
            </TouchableOpacity>
        </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    gap: 10,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
  },
});
