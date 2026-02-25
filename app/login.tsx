import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Tractor } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { register, login, isRegistered } = useAuth();

  // Registration state
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPin, setRegPin] = useState('');
  const [regConfirmPin, setRegConfirmPin] = useState('');
  const [regBusiness, setRegBusiness] = useState('');

  // Login state
  const [loginPin, setLoginPin] = useState('');

  const handleRegister = () => {
    if (!regName.trim()) {
      Alert.alert('Error', 'Please enter your name.');
      return;
    }
    if (!/^\d{10}$/.test(regPhone)) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number.');
      return;
    }
    if (regPin.length < 4) {
      Alert.alert('Error', 'PIN must be at least 4 digits.');
      return;
    }
    if (regPin !== regConfirmPin) {
      Alert.alert('Error', 'PINs do not match.');
      return;
    }
    register(regName.trim(), regPhone.trim(), regPin, regBusiness.trim());
    router.replace('/(tabs)' as any);
  };

  const handleLogin = () => {
    if (!loginPin) {
      Alert.alert('Error', 'Please enter your PIN.');
      return;
    }
    const success = login(loginPin);
    if (success) {
      router.replace('/(tabs)' as any);
    } else {
      Alert.alert('Incorrect PIN', 'The PIN you entered is incorrect. Please try again.');
      setLoginPin('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Tractor size={48} color={Colors.white} />
            </View>
            <Text style={styles.title}>Kishan Diary</Text>
            <Text style={styles.subtitle}>Your Farming Companion</Text>
          </View>

          <View style={styles.card}>
            {isRegistered ? (
              /* ── RETURNING USER: PIN login ── */
              <>
                <Text style={styles.cardTitle}>Welcome Back!</Text>
                <Text style={styles.cardSubtitle}>Enter your PIN to continue</Text>

                <Text style={styles.label}>PIN</Text>
                <TextInput
                  style={styles.input}
                  value={loginPin}
                  onChangeText={setLoginPin}
                  placeholder="Enter your PIN"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="numeric"
                  secureTextEntry
                  maxLength={8}
                />

                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                  <Text style={styles.buttonText}>Sign In</Text>
                </TouchableOpacity>
              </>
            ) : (
              /* ── FIRST-TIME USER: Registration ── */
              <>
                <Text style={styles.cardTitle}>Create Account</Text>
                <Text style={styles.cardSubtitle}>Set up your profile to get started</Text>

                <Text style={styles.label}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  value={regName}
                  onChangeText={setRegName}
                  placeholder="Enter your name"
                  placeholderTextColor={Colors.textLight}
                />

                <Text style={styles.label}>Phone Number *</Text>
                <TextInput
                  style={styles.input}
                  value={regPhone}
                  onChangeText={setRegPhone}
                  placeholder="10-digit mobile number"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="phone-pad"
                  maxLength={10}
                />

                <Text style={styles.label}>Business / Farm Name</Text>
                <TextInput
                  style={styles.input}
                  value={regBusiness}
                  onChangeText={setRegBusiness}
                  placeholder="Optional"
                  placeholderTextColor={Colors.textLight}
                />

                <Text style={styles.label}>Set PIN *</Text>
                <TextInput
                  style={styles.input}
                  value={regPin}
                  onChangeText={setRegPin}
                  placeholder="Create a 4-digit PIN"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="numeric"
                  secureTextEntry
                  maxLength={8}
                />

                <Text style={styles.label}>Confirm PIN *</Text>
                <TextInput
                  style={styles.input}
                  value={regConfirmPin}
                  onChangeText={setRegConfirmPin}
                  placeholder="Re-enter PIN"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="numeric"
                  secureTextEntry
                  maxLength={8}
                />

                <TouchableOpacity style={styles.button} onPress={handleRegister}>
                  <Text style={styles.buttonText}>Create Account</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          <Text style={styles.footer}>
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.background,
  },
  button: {
    marginTop: 24,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  footer: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
});

