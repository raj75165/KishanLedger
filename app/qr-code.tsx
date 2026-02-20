import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Share,
  ScrollView,
} from 'react-native';
import { Stack } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { Copy, Share2, Smartphone } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

function getAppUrl(): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.location.href;
  }
  return 'https://rork.com/app/kishan-diary-app-pweswo4';
}

export default function QRCodeScreen() {
  const [appUrl, setAppUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setAppUrl(getAppUrl());
  }, []);

  const handleCopy = async () => {
    if (appUrl) {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(appUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const handleShare = async () => {
    if (appUrl) {
      await Share.share({
        message: `Open Kishan Diary app: ${appUrl}`,
        url: appUrl,
      });
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Scan to Open on Mobile',
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.white,
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.iconRow}>
            <Smartphone size={28} color={Colors.primary} />
            <Text style={styles.title}>Open on Mobile</Text>
          </View>
          <Text style={styles.subtitle}>
            Scan this QR code with your phone's camera to open the app in your mobile browser
          </Text>

          {appUrl ? (
            <View style={styles.qrContainer}>
              <QRCode
                value={appUrl}
                size={220}
                color={Colors.text}
                backgroundColor={Colors.white}
              />
            </View>
          ) : (
            <View style={styles.qrPlaceholder}>
              <Text style={styles.loadingText}>Loading QR code...</Text>
            </View>
          )}

          <View style={styles.urlBox}>
            <Text style={styles.urlLabel}>App URL</Text>
            <Text style={styles.urlText} numberOfLines={3} selectable>
              {appUrl || 'Loading...'}
            </Text>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.copyButton]}
              onPress={handleCopy}
            >
              <Copy size={18} color={Colors.primary} />
              <Text style={styles.copyText}>{copied ? 'Copied!' : 'Copy URL'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.shareButton]}
              onPress={handleShare}
            >
              <Share2 size={18} color={Colors.white} />
              <Text style={styles.shareText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>How to use:</Text>
          <Text style={styles.instructionStep}>1. Open your phone's camera app</Text>
          <Text style={styles.instructionStep}>2. Point it at the QR code above</Text>
          <Text style={styles.instructionStep}>3. Tap the notification that appears</Text>
          <Text style={styles.instructionStep}>4. The app will open in your mobile browser</Text>
        </View>
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
    paddingBottom: 40,
    alignItems: 'center',
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  qrContainer: {
    padding: 16,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  qrPlaceholder: {
    width: 252,
    height: 252,
    backgroundColor: Colors.background,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingText: {
    color: Colors.textLight,
    fontSize: 14,
  },
  urlBox: {
    width: '100%',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  urlLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
    fontWeight: '500' as const,
  },
  urlText: {
    fontSize: 13,
    color: Colors.text,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  copyButton: {
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  copyText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  shareButton: {
    backgroundColor: Colors.primary,
  },
  shareText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  instructions: {
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  instructionStep: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
});
