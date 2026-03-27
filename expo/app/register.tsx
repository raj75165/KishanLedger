
import React, { useState } from \'react\';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
} from \'react-native\';
import { Ionicons } from \'@expo/vector-icons\';
import { useAuth } from \'@/contexts/AuthContext\';
import { useRouter } from \'expo-router\';
import { Colors } from \'@/constants/colors\';

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    fullName: \'\',
    email: \'\',
    phone: \'\',
    farmName: \'\',
    farmSize: \'\',
    location: \'\',
    password: \'\',
    confirmPassword: \'\',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\D/g, \'\'));
  };

  const handleRegister = async () => {
    // Validation
    if (
      !formData.fullName.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.password.trim() ||
      !formData.confirmPassword.trim()
    ) {
      Alert.alert(\'Error\', \'Please fill in all required fields\');
      return;
    }

    if (!validateEmail(formData.email)) {
      Alert.alert(\'Error\', \'Please enter a valid email address\');
      return;
    }

    if (!validatePhone(formData.phone)) {
      Alert.alert(\'Error\', \'Please enter a valid 10-digit phone number\');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert(\'Error\', \'Password must be at least 6 characters long\');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert(\'Error\', \'Passwords do not match\');
      return;
    }

    setLoading(true);
    const userData = {
      name: formData.fullName.trim(),
      email: formData.email.toLowerCase().trim(),
      phone: formData.phone.trim(),
      businessName: formData.farmName.trim() || \'My Farm\',
      farmSize: formData.farmSize.trim(),
      location: formData.location.trim(),
      password: formData.password,
    };

    const result = await register(userData);
    setLoading(false);

    if (result.success) {
      Alert.alert(
        \'Success!\',
        \'Your account has been created successfully\',
        [{ text: \'OK\', onPress: () => router.replace(\'/(tabs)\' as any) }]
      );
    } else {
      Alert.alert(\'Registration Failed\', result.error || \'An error occurred\');
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === \'ios\' ? \'padding\' : \'height\'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.logoIcon}>🌾</Text>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Kishan Diary today</Text>
        </View>

        <View style={styles.formContainer}>
          {/* Full Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                value={formData.fullName}
                onChangeText={(value) => updateField(\'fullName\', value)}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={formData.email}
                onChangeText={(value) => updateField(\'email\', value)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Phone */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                value={formData.phone}
                onChangeText={(value) => updateField(\'phone\', value)}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>
          </View>

          {/* Farm Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Farm Name (Optional)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="home-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your farm name"
                value={formData.farmName}
                onChangeText={(value) => updateField(\'farmName\', value)}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Farm Size */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Farm Size (Optional)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="resize-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g., 10 acres"
                value={formData.farmSize}
                onChangeText={(value) => updateField(\'farmSize\', value)}
              />
            </View>
          </View>

          {/* Location */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Location (Optional)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="location-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="City, State"
                value={formData.location}
                onChangeText={(value) => updateField(\'location\', value)}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Create a password (min 6 characters)"
                value={formData.password}
                onChangeText={(value) => updateField(\'password\', value)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? \'eye-outline\' : \'eye-off-outline\'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChangeText={(value) => updateField(\'confirmPassword\', value)}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showConfirmPassword ? \'eye-outline\' : \'eye-off-outline\'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.registerButton, loading && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.registerButtonText}>
              {loading ? \'Creating Account...\' : \'Register\'}
            </Text>
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push(\'/login\' as any)}>
              <Text style={styles.loginLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 40,
  },
  header: {
    alignItems: \'center\',
    marginBottom: 30,
  },
  logoIcon: {
    fontSize: 50,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: \'bold\',
    color: Colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  formContainer: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 24,
    shadowColor: \'#000\',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: \'600\',
    color: Colors.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: \'row\',
    alignItems: \'center\',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    backgroundColor: Colors.background,
  },
  inputIcon: {
    marginLeft: 12,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
  },
  eyeIcon: {
    padding: 12,
  },
  registerButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    padding: 16,
    alignItems: \'center\',
    marginTop: 8,
    shadowColor: \'#000\',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  registerButtonDisabled: {
    backgroundColor: Colors.primary + \'80\',
  },
  registerButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: \'bold\',
  },
  loginContainer: {
    flexDirection: \'row\',
    justifyContent: \'center\',
    marginTop: 20,
  },
  loginText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: \'600\',
  },
});
