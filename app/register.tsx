import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { UserPlus } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterScreen() {
  const router = useRouter();
  const { createUser } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const handleRegister = () => {
    if (!name || !phone || !pin || !confirmPin) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }
    if (phone.length !== 10) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid 10-digit phone number.');
      return;
    }
    if (pin.length !== 4) {
      Alert.alert('Invalid PIN', 'Please enter a 4-digit PIN.');
      return;
    }
    if (pin !== confirmPin) {
      Alert.alert('PIN Mismatch', 'The PINs you entered do not match.');
      return;
    }

    createUser(name, phone, pin, businessName);
    router.replace('/(tabs)' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Start managing your farm with ease</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor={Colors.textLight}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="10-digit Phone Number"
          placeholderTextColor={Colors.textLight}
          keyboardType="numeric"
          maxLength={10}
          value={phone}
          onChangeText={setPhone}
        />
        <TextInput
          style={styles.input}
          placeholder="Business Name (Optional)"
          placeholderTextColor={Colors.textLight}
          value={businessName}
          onChangeText={setBusinessName}
        />
        <TextInput
          style={styles.input}
          placeholder="Set 4-digit PIN"
          placeholderTextColor={Colors.textLight}
          keyboardType="numeric"
          secureTextEntry
          maxLength={4}
          value={pin}
          onChangeText={setPin}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm PIN"
          placeholderTextColor={Colors.textLight}
          keyboardType="numeric"
          secureTextEntry
          maxLength={4}
          value={confirmPin}
          onChangeText={setConfirmPin}
        />

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <UserPlus size={20} color={Colors.white} />
          <Text style={styles.buttonText}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
  },
  content: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: Colors.white,
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600' as const,
    marginLeft: 12,
  },
});
