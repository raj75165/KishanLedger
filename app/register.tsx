import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { User, Mail, Phone, Lock, Eye, EyeOff, Home } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [farmName, setFarmName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const validatePhone = (value: string) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(value.replace(/\D/g, ''));
  };

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    if (phone.trim() && !validatePhone(phone)) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    const result = await register({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim() || undefined,
      farmName: farmName.trim() || 'My Farm',
      password,
    });
    setIsLoading(false);

    if (result.success) {
      // Navigation handled by _layout.tsx once isLoggedIn becomes true
    } else {
      Alert.alert('Registration Failed', result.error || 'An error occurred');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.logoIcon}>🌾</Text>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Start managing your farm with ease</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name *</Text>
              <View style={styles.inputWrapper}>
                <User size={20} color={Colors.textLight} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor={Colors.textLight}
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address *</Text>
              <View style={styles.inputWrapper}>
                <Mail size={20} color={Colors.textLight} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number (Optional)</Text>
              <View style={styles.inputWrapper}>
                <Phone size={20} color={Colors.textLight} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="10-digit phone number"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="numeric"
                  maxLength={10}
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Farm Name (Optional)</Text>
              <View style={styles.inputWrapper}>
                <Home size={20} color={Colors.textLight} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your farm name"
                  placeholderTextColor={Colors.textLight}
                  value={farmName}
                  onChangeText={setFarmName}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password *</Text>
              <View style={styles.inputWrapper}>
                <Lock size={20} color={Colors.textLight} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Minimum 6 characters"
                  placeholderTextColor={Colors.textLight}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={Colors.textLight} />
                  ) : (
                    <Eye size={20} color={Colors.textLight} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password *</Text>
              <View style={styles.inputWrapper}>
                <Lock size={20} color={Colors.textLight} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Re-enter your password"
                  placeholderTextColor={Colors.textLight}
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color={Colors.textLight} />
                  ) : (
                    <Eye size={20} color={Colors.textLight} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {isLoading ? (
              <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 16 }} />
            ) : (
              <TouchableOpacity style={styles.button} onPress={handleRegister}>
                <Text style={styles.buttonText}>Create Account</Text>
              </TouchableOpacity>
            )}

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/login' as any)}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoIcon: {
    fontSize: 50,
    marginBottom: 12,
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
  formContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#333',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
  },
  inputIcon: {
    marginLeft: 12,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 12,
  },
  button: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 10,
    marginTop: 8,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600' as const,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#666',
    fontSize: 14,
  },
  loginLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600' as const,
  },
});
