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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Tractor, Phone, Shield, ArrowRight } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import * as Haptics from 'expo-haptics';
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';

export default function LoginScreen() {
  const router = useRouter();
  const { sendOtp, verifyOtp, completeLogin, resetOtpState, googleSignIn } = useAuth();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [step, setStep] = useState<'phone' | 'otp' | 'profile'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = () => {
    if (phone.length < 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    setIsLoading(true);
    setError('');

    const success = sendOtp(phone);
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setStep('otp');
    }
    setIsLoading(false);
  };

  const handleVerifyOtp = () => {
    if (otp.length < 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }
    setIsLoading(true);
    setError('');

    const success = verifyOtp(otp);
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setStep('profile');
    } else {
      setError('Invalid OTP. Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    setIsLoading(false);
  };

  const handleCompleteProfile = () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!businessName.trim()) {
      setError('Please enter your business name');
      return;
    }
    setIsLoading(true);

    completeLogin(name.trim(), businessName.trim());
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace('/(tabs)' as any);
  };

  const handleBack = () => {
    if (step === 'otp') {
      setStep('phone');
      setOtp('');
      resetOtpState();
    } else if (step === 'profile') {
      setStep('otp');
    }
    setError('');
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    const signedInUser = await googleSignIn();
    if (signedInUser) {
      setName(signedInUser.user.name || '');
      setStep('profile');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setError('Google Sign-In failed. Please try again.');
    }
    setIsLoading(false);
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
            <Text style={styles.subtitle}>
              कृषि कार्य प्रबंधन
            </Text>
          </View>

          <View style={styles.formCard}>
            {step === 'phone' && (
              <>
                <Text style={styles.formTitle}>Enter Phone Number</Text>
                <Text style={styles.formSubtitle}>
                  We will send you an OTP to verify
                </Text>

                <View style={styles.inputContainer}>
                  <View style={styles.inputIcon}>
                    <Phone size={20} color={Colors.textSecondary} />
                  </View>
                  <Text style={styles.countryCode}>+91</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter mobile number"
                    placeholderTextColor={Colors.textLight}
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={phone}
                    onChangeText={(text) => {
                      setPhone(text.replace(/[^0-9]/g, ''));
                      setError('');
                    }}
                  />
                </View>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <TouchableOpacity
                  style={[styles.button, isLoading && styles.buttonDisabled]}
                  onPress={handleSendOtp}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color={Colors.white} />
                  ) : (
                    <>
                      <Text style={styles.buttonText}>Send OTP</Text>
                      <ArrowRight size={20} color={Colors.white} />
                    </>
                  )}
                </TouchableOpacity>

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>

                <GoogleSigninButton
                  style={styles.googleButton}
                  size={GoogleSigninButton.Size.Wide}
                  color={GoogleSigninButton.Color.Dark}
                  onPress={handleGoogleSignIn}
                  disabled={isLoading}
                />
              </>
            )}

            {step === 'otp' && (
              <>
                <Text style={styles.formTitle}>Verify OTP</Text>
                <Text style={styles.formSubtitle}>
                  Enter the 6-digit code sent to +91 {phone}
                </Text>

                <View style={styles.inputContainer}>
                  <View style={styles.inputIcon}>
                    <Shield size={20} color={Colors.textSecondary} />
                  </View>
                  <TextInput
                    style={[styles.input, styles.otpInput]}
                    placeholder="Enter OTP"
                    placeholderTextColor={Colors.textLight}
                    keyboardType="number-pad"
                    maxLength={6}
                    value={otp}
                    onChangeText={(text) => {
                      setOtp(text.replace(/[^0-9]/g, ''));
                      setError('');
                    }}
                  />
                </View>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <TouchableOpacity
                  style={[styles.button, isLoading && styles.buttonDisabled]}
                  onPress={handleVerifyOtp}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color={Colors.white} />
                  ) : (
                    <>
                      <Text style={styles.buttonText}>Verify</Text>
                      <ArrowRight size={20} color={Colors.white} />
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                  <Text style={styles.backButtonText}>Change Number</Text>
                </TouchableOpacity>
              </>
            )}

            {step === 'profile' && (
              <>
                <Text style={styles.formTitle}>Complete Profile</Text>
                <Text style={styles.formSubtitle}>
                  Enter your details to get started
                </Text>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.input, styles.fullInput]}
                    placeholder="Your Name"
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
                    placeholder="Business Name (e.g., Sharma Farm Services)"
                    placeholderTextColor={Colors.textLight}
                    value={businessName}
                    onChangeText={(text) => {
                      setBusinessName(text);
                      setError('');
                    }}
                  />
                </View>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <TouchableOpacity
                  style={[styles.button, isLoading && styles.buttonDisabled]}
                  onPress={handleCompleteProfile}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color={Colors.white} />
                  ) : (
                    <>
                      <Text style={styles.buttonText}>Get Started</Text>
                      <ArrowRight size={20} color={Colors.white} />
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>

          <Text style={styles.footer}>
            By continuing, you agree to our Terms of Service
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
  inputIcon: {
    paddingLeft: 16,
  },
  countryCode: {
    fontSize: 16,
    color: Colors.text,
    paddingHorizontal: 8,
    fontWeight: '500' as const,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: Colors.text,
    paddingRight: 16,
  },
  otpInput: {
    letterSpacing: 8,
    fontSize: 20,
    fontWeight: '600' as const,
    textAlign: 'center',
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
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  backButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500' as const,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  googleButton: {
    width: '100%',
    height: 56,
  } as const,
  footer: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 24,
  },
});
