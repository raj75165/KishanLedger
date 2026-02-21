import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Share,
  TextInput,
  ScrollView,
} from 'react-native';
import { Stack } from 'expo-router';
import { Colors } from '@/constants/colors';
import {
  UploadCloud,
  DownloadCloud,
  LogOut,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react-native';
import { useAppData } from '@/contexts/AppDataContext';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

const BACKUP_FILE_NAME = 'kishan-ledger-backup.json';

type GoogleUser = {
  email: string;
  name: string | null;
};

export default function BackupRestoreScreen() {
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);
  const [importText, setImportText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const {
    restoreData,
    farmers,
    workEntries,
    payments,
    invoices,
    implements: implementsList,
    expenses,
  } = useAppData();

  useEffect(() => {
    const checkSignIn = async () => {
      try {
        const isSignedIn = await GoogleSignin.isSignedIn();
        if (isSignedIn) {
          const currentUser = await GoogleSignin.getCurrentUser();
          if (currentUser) {
            setGoogleUser({ email: currentUser.user.email, name: currentUser.user.name });
          }
        }
      } catch (error) {
        console.warn('Google Sign-In status check failed:', error);
      }
    };
    checkSignIn();
  }, []);

  // ─── Google Sign-In ─────────────────────────────────────────────────────────

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      setGoogleUser({ email: userInfo.user.email, name: userInfo.user.name });
    } catch (error: any) {
      if (error.code !== statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert('Sign-In Failed', 'Could not sign in with Google. Please try again.');
      }
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await GoogleSignin.signOut();
      setGoogleUser(null);
    } catch (error) {
      console.error('Sign-out error:', error);
    }
  };

  // ─── Google Drive helpers ────────────────────────────────────────────────────

  const getDriveFileId = async (accessToken: string): Promise<string | null> => {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name%3D'${BACKUP_FILE_NAME}'&fields=files(id%2Cname)`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!response.ok) {
      console.warn(`getDriveFileId: Drive API error ${response.status}`);
      return null;
    }
    const data = await response.json();
    return data.files && data.files.length > 0 ? data.files[0].id : null;
  };

  // ─── Google Drive Backup ─────────────────────────────────────────────────────

  const handleGoogleBackup = async () => {
    setIsProcessing(true);
    try {
      const { accessToken } = await GoogleSignin.getTokens();
      if (!accessToken) throw new Error('No access token available');

      const fileId = await getDriveFileId(accessToken);

      const backupData = {
        farmers,
        workEntries,
        payments,
        invoices,
        implements: implementsList,
        expenses,
        exportedAt: new Date().toISOString(),
      };

      // Build a multipart/related body manually (more reliable than FormData/Blob in RN)
      const boundary = 'kishan_backup_boundary';
      const metadataJson = JSON.stringify({
        name: BACKUP_FILE_NAME,
        mimeType: 'application/json',
        ...(fileId ? {} : { parents: ['appDataFolder'] }),
      });
      const fileJson = JSON.stringify(backupData);
      const body =
        `--${boundary}\r\n` +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        `${metadataJson}\r\n` +
        `--${boundary}\r\n` +
        'Content-Type: application/json\r\n\r\n' +
        `${fileJson}\r\n` +
        `--${boundary}--`;

      const url = fileId
        ? `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`
        : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

      const uploadResp = await fetch(url, {
        method: fileId ? 'PATCH' : 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body,
      });

      if (!uploadResp.ok) {
        throw new Error(`Drive upload failed with status ${uploadResp.status}`);
      }

      Alert.alert('Backup Successful', 'Your data has been backed up to Google Drive.');
    } catch (error) {
      console.error('Google Drive backup error:', error);
      Alert.alert('Backup Failed', 'Could not back up to Google Drive. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ─── Google Drive Restore ────────────────────────────────────────────────────

  const handleGoogleRestore = () => {
    Alert.alert(
      'Confirm Restore',
      'This will OVERWRITE all current data with the backup from Google Drive. This cannot be undone. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: async () => {
            setIsProcessing(true);
            try {
              const { accessToken } = await GoogleSignin.getTokens();
              if (!accessToken) throw new Error('No access token available');

              const fileId = await getDriveFileId(accessToken);

              if (!fileId) {
                Alert.alert('No Backup Found', 'No backup file found in your Google Drive.');
                return;
              }

              const resp = await fetch(
                `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
              );
              if (!resp.ok) {
                throw new Error(`Drive download failed with status ${resp.status}`);
              }

              const data = await resp.json();
              await restoreData(data);
              Alert.alert(
                'Restore Successful',
                'Your data has been restored from Google Drive.'
              );
            } catch (error) {
              console.error('Google Drive restore error:', error);
              Alert.alert('Restore Failed', 'Could not restore from Google Drive. Please try again.');
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  // ─── Local Export / Import ───────────────────────────────────────────────────

  const handleLocalExport = async () => {
    setIsProcessing(true);
    try {
      const backupData = {
        farmers,
        workEntries,
        payments,
        invoices,
        implements: implementsList,
        expenses,
        exportedAt: new Date().toISOString(),
      };
      await Share.share({
        message: JSON.stringify(backupData),
        title: 'Kishan Ledger Backup',
      });
    } catch (error) {
      Alert.alert('Export Failed', 'Could not export backup data.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLocalImport = () => {
    if (!importText.trim()) {
      Alert.alert('Empty', 'Please paste your backup data in the text area.');
      return;
    }
    Alert.alert(
      'Confirm Restore',
      'Restoring from backup will OVERWRITE all current data on this device. This action cannot be undone. Are you sure you want to continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: async () => {
            setIsProcessing(true);
            try {
              const data = JSON.parse(importText.trim());
              await restoreData(data);
              setImportText('');
              Alert.alert('Restore Successful', 'Your data has been restored successfully.');
            } catch (error) {
              console.error('Restore failed:', error);
              Alert.alert(
                'Invalid Data',
                'The pasted text is not valid backup data. Please copy the full exported JSON.'
              );
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <Stack.Screen options={{ title: 'Backup & Restore' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        {/* ── Google Drive Section ─────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Google Drive Backup</Text>

          {googleUser ? (
            <>
              <View style={styles.signedInCard}>
                <ShieldCheck size={32} color={Colors.success} />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{googleUser.name ?? 'Google User'}</Text>
                  <Text style={styles.userEmail}>{googleUser.email}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleGoogleBackup}
                disabled={isProcessing}
              >
                <UploadCloud size={20} color={Colors.white} />
                <Text style={styles.buttonText}>Backup to Google Drive</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.driveRestoreButton]}
                onPress={handleGoogleRestore}
                disabled={isProcessing}
              >
                <DownloadCloud size={20} color={Colors.white} />
                <Text style={styles.buttonText}>Restore from Google Drive</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.signOutButton}
                onPress={handleGoogleSignOut}
                disabled={isProcessing}
              >
                <LogOut size={16} color={Colors.textSecondary} />
                <Text style={styles.signOutText}>Sign out from Google</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.notSignedInCard}>
                <ShieldAlert size={32} color={Colors.pending} />
                <Text style={styles.notSignedInText}>
                  Sign in with Google to securely back up and restore your data via Google Drive.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.googleButton}
                onPress={handleGoogleSignIn}
                disabled={isProcessing}
              >
                <Text style={styles.googleButtonText}>Sign in with Google</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* ── Local Backup Section ─────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Local Backup</Text>
          <Text style={styles.sectionDesc}>
            Share your app data as a JSON backup. You can save it to files, email it, or store it anywhere for safekeeping.
          </Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleLocalExport}
            disabled={isProcessing}
          >
            <UploadCloud size={20} color={Colors.white} />
            <Text style={styles.buttonText}>Export & Share Backup</Text>
          </TouchableOpacity>
        </View>

        {/* ── Local Import Section ─────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Restore from Local Backup</Text>
          <Text style={styles.sectionDesc}>
            Paste the JSON text from a previous backup below, then tap Restore to recover your data.
          </Text>
          <TextInput
            style={styles.textArea}
            placeholder="Paste backup JSON here..."
            placeholderTextColor={Colors.textLight}
            value={importText}
            onChangeText={setImportText}
            multiline
            numberOfLines={6}
          />
          <TouchableOpacity
            style={[styles.actionButton, styles.importButton]}
            onPress={handleLocalImport}
            disabled={isProcessing}
          >
            <DownloadCloud size={20} color={Colors.white} />
            <Text style={styles.buttonText}>Restore from Backup</Text>
          </TouchableOpacity>
        </View>

        {isProcessing && (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
        )}
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
  },
  section: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  sectionDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  // Google signed-in card
  signedInCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.08)',
    borderRadius: 12,
    padding: 16,
    gap: 14,
    marginBottom: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  userEmail: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  // Not signed-in card
  notSignedInCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 152, 0, 0.08)',
    borderRadius: 12,
    padding: 16,
    gap: 14,
    marginBottom: 16,
  },
  notSignedInText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4285F4',
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    gap: 10,
    marginBottom: 10,
  },
  driveRestoreButton: {
    backgroundColor: Colors.secondary,
  },
  importButton: {
    backgroundColor: Colors.secondary,
    marginTop: 12,
    marginBottom: 0,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
    marginTop: 4,
  },
  signOutText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  textArea: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 13,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 120,
    textAlignVertical: 'top',
  },
});
