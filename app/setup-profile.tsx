import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Tractor, ArrowRight } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

export default function SetupProfileScreen() {
  const { saveProfile } = useAuth();
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!businessName.trim()) {
      setError('Please enter your business name');
      return;
    }
    setError('');
    saveProfile(name.trim(), businessName.trim(), phone.trim());
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Tractor size={48} color={Colors.white} />
            </View>
            <Text style={styles.title}>Farm Work Tracker</Text>
            <Text style={styles.subtitle}>कृषि कार्य प्रबंधन</Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Create Your Profile</Text>
            <Text style={styles.formSubtitle}>
              Enter your details to get started
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, styles.fullInput]}
                placeholder="Your Name *"
                placeholderTextColor={Colors.textLight}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  setError('');
                }}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, styles.fullInput]}
                placeholder="Business Name (e.g., Sharma Farm Services) *"
                placeholderTextColor={Colors.textLight}
                value={businessName}
                onChangeText={(text) => {
                  setBusinessName(text);
                  setError('');
                }}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.countryCode}>+91</Text>
              <TextInput
                style={styles.input}
                placeholder="Mobile Number (optional)"
                placeholderTextColor={Colors.textLight}
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ''))}
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={styles.button}
              onPress={handleSave}
            >
              <Text style={styles.buttonText}>Get Started</Text>
              <ArrowRight size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>
            You can update these details anytime from your profile.
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
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
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.white,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  formCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  countryCode: {
    fontSize: 16,
    color: Colors.text,
    paddingHorizontal: 12,
    fontWeight: '500' as const,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: Colors.text,
    paddingRight: 16,
  },
  fullInput: {
    paddingLeft: 16,
  },
  errorText: {
    fontSize: 14,
    color: Colors.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  footer: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 24,
  },
});
