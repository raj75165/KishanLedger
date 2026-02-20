import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
import { Download, Upload, Database, CloudUpload, CloudDownload, LogIn, LogOut, Info } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAppData } from '@/contexts/AppDataContext';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import * as Google from 'expo-auth-session/providers/google';
import { BackupData } from '@/types';
import { GOOGLE_CONFIG } from '@/constants/googleConfig';
import {
  saveGoogleSession,
  getGoogleSession,
  clearGoogleSession,
  getUserEmail,
  backupToDrive,
  restoreFromDrive,
} from '@/services/googleDrive';

export default function BackupScreen() {
  const { exportData, importData, farmers, workEntries, payments, invoices } = useAppData();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [googleEmail, setGoogleEmail] = useState<string | null>(null);
  const [isDriveBackingUp, setIsDriveBackingUp] = useState(false);
  const [isDriveRestoring, setIsDriveRestoring] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: GOOGLE_CONFIG.androidClientId,
    iosClientId: GOOGLE_CONFIG.iosClientId,
    webClientId: GOOGLE_CONFIG.webClientId,
    scopes: GOOGLE_CONFIG.scopes,
  });

  useEffect(() => {
    getGoogleSession().then((session) => {
      if (session) setGoogleEmail(session.email);
    });
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      const accessToken = response.authentication?.accessToken;
      if (accessToken) {
        handleGoogleAuthSuccess(accessToken);
      }
    } else if (response?.type === 'error') {
      setIsGoogleSigningIn(false);
      Alert.alert('Sign In Failed', 'Google sign-in failed. Please try again.');
    }
  }, [response]);

  const handleGoogleAuthSuccess = async (accessToken: string) => {
    try {
      const email = await getUserEmail(accessToken);
      await saveGoogleSession(accessToken, email);
      setGoogleEmail(email);
    } catch (error) {
      console.error('Google auth success handler error:', error);
      Alert.alert('Sign In Failed', 'Could not retrieve Google account info. Please try again.');
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleSigningIn(true);
    try {
      await promptAsync();
    } catch (error) {
      console.error('Google sign-in prompt error:', error);
      setIsGoogleSigningIn(false);
      Alert.alert('Sign In Failed', 'Could not open the Google sign-in page. Please try again.');
    }
  };

  const handleGoogleSignOut = async () => {
    await clearGoogleSession();
    setGoogleEmail(null);
  };

  const handleDriveBackup = async () => {
    const session = await getGoogleSession();
    if (!session) {
      Alert.alert('Not Connected', 'Please sign in with Google first.');
      return;
    }
    setIsDriveBackingUp(true);
    try {
      const data = exportData();
      await backupToDrive(session.accessToken, data);
      Alert.alert('Backup Successful', 'Your data has been backed up to Google Drive successfully.');
    } catch (error) {
      console.error('Drive backup error:', error);
      if (error instanceof Error && error.message === 'UNAUTHORIZED') {
        await clearGoogleSession();
        setGoogleEmail(null);
        Alert.alert('Session Expired', 'Your Google session has expired. Please sign in again.');
      } else {
        Alert.alert('Backup Failed', 'Failed to backup to Google Drive. Please try again.');
      }
    } finally {
      setIsDriveBackingUp(false);
    }
  };

  const handleDriveRestore = async () => {
    const session = await getGoogleSession();
    if (!session) {
      Alert.alert('Not Connected', 'Please sign in with Google first.');
      return;
    }
    setIsDriveRestoring(true);
    try {
      const data = await restoreFromDrive(session.accessToken);
      if (!data) {
        Alert.alert('No Backup Found', 'No backup was found in your Google Drive. Please create a backup first.');
        return;
      }
      Alert.alert(
        'Restore from Google Drive',
        `Found a backup from ${(() => { try { return new Date(data.exportedAt).toLocaleDateString('en-IN'); } catch { return 'an earlier date'; } })()} with ${data.farmers.length} farmers and ${data.workEntries.length} work entries. This will replace all current data. Continue?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Restore',
            style: 'destructive',
            onPress: async () => {
              try {
                await importData(data);
                Alert.alert('Restore Successful', 'Your data has been restored from Google Drive.');
              } catch (err) {
                console.error('Drive restore import error:', err);
                Alert.alert('Restore Failed', 'Failed to restore data. Please try again.');
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Drive restore error:', error);
      if (error instanceof Error && error.message === 'UNAUTHORIZED') {
        await clearGoogleSession();
        setGoogleEmail(null);
        Alert.alert('Session Expired', 'Your Google session has expired. Please sign in again.');
      } else if (error instanceof Error && error.message === 'INVALID_BACKUP') {
        Alert.alert('Invalid Backup', 'The backup file in Google Drive appears to be corrupted.');
      } else {
        Alert.alert('Restore Failed', 'Failed to restore from Google Drive. Please try again.');
      }
    } finally {
      setIsDriveRestoring(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = exportData();
      const json = JSON.stringify(data, null, 2);
      const filename = `kishan-ledger-backup-${new Date().toISOString().split('T')[0]}.json`;
      const fileUri = FileSystem.cacheDirectory + filename;

      await FileSystem.writeAsStringAsync(fileUri, json, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Export Backup',
        });
      } else {
        Alert.alert('Export Complete', `Backup saved to: ${fileUri}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Failed', 'Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      setIsImporting(true);
      const fileUri = result.assets[0].uri;
      const json = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      let data: BackupData;
      try {
        data = JSON.parse(json);
      } catch (error) {
        console.error('JSON parse error:', error);
        Alert.alert('Import Failed', 'The selected file is not a valid backup file.');
        return;
      }

      if (!data.farmers || !data.workEntries || !data.payments || !data.invoices) {
        Alert.alert('Import Failed', 'The backup file is missing required data.');
        return;
      }

      Alert.alert(
        'Confirm Import',
        'This will replace all existing data with the backup. This action cannot be undone. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Import',
            style: 'destructive',
            onPress: async () => {
              try {
                await importData(data);
                Alert.alert('Import Successful', 'Your data has been restored from backup.');
              } catch (error) {
                console.error('Import data error:', error);
                Alert.alert('Import Failed', 'Failed to restore data. Please try again.');
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('File read error:', error);
      Alert.alert('Import Failed', 'Failed to read the backup file. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Backup & Restore',
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.white,
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        {/* Info: switching phones */}
        <View style={styles.infoCard}>
          <Info size={22} color={Colors.accent} />
          <Text style={styles.infoCardTitle}>Switching to a New Phone?</Text>
          <Text style={styles.infoCardText}>
            Your data is stored locally on this device. If you lose your phone or buy a new one:
          </Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>❌</Text>
            <Text style={styles.infoRowText}>Without Google Drive Backup — all data will be lost</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>✅</Text>
            <Text style={styles.infoRowText}>With Google Drive Backup — sign in with the same Google account on the new phone and restore instantly</Text>
          </View>
        </View>

        {/* Data Summary */}
        <View style={styles.summaryCard}>
          <Database size={28} color={Colors.primary} />
          <Text style={styles.summaryTitle}>Data Summary</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{farmers.length}</Text>
              <Text style={styles.statLabel}>Farmers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{workEntries.length}</Text>
              <Text style={styles.statLabel}>Work Entries</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{payments.length}</Text>
              <Text style={styles.statLabel}>Payments</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{invoices.length}</Text>
              <Text style={styles.statLabel}>Invoices</Text>
            </View>
          </View>
        </View>

        {/* Google Drive Backup */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>☁️ Google Drive Backup</Text>
          <Text style={styles.sectionDescription}>
            Back up your data to Google Drive so it is always safe and can be restored on any device using your Google account.
          </Text>

          {googleEmail ? (
            <>
              <View style={styles.connectedRow}>
                <View style={styles.connectedDot} />
                <Text style={styles.connectedText}>Connected as {googleEmail}</Text>
              </View>

              <TouchableOpacity
                style={[styles.actionButton, styles.driveBackupButton]}
                onPress={handleDriveBackup}
                disabled={isDriveBackingUp}
              >
                {isDriveBackingUp ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <CloudUpload size={20} color={Colors.white} />
                )}
                <Text style={styles.actionButtonText}>
                  {isDriveBackingUp ? 'Backing up...' : 'Backup to Google Drive'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.driveRestoreButton]}
                onPress={handleDriveRestore}
                disabled={isDriveRestoring}
              >
                {isDriveRestoring ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <CloudDownload size={20} color={Colors.white} />
                )}
                <Text style={styles.actionButtonText}>
                  {isDriveRestoring ? 'Restoring...' : 'Restore from Google Drive'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.signOutButton} onPress={handleGoogleSignOut}>
                <LogOut size={16} color={Colors.textSecondary} />
                <Text style={styles.signOutText}>Disconnect Google Account</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, styles.googleSignInButton]}
              onPress={handleGoogleSignIn}
              disabled={!request || isGoogleSigningIn}
            >
              {isGoogleSigningIn ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <LogIn size={20} color={Colors.white} />
              )}
              <Text style={styles.actionButtonText}>
                {isGoogleSigningIn ? 'Signing in...' : 'Sign in with Google'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Local Backup */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📁 Local Backup</Text>
          <Text style={styles.sectionDescription}>
            Save data to a file you can store on your computer, WhatsApp, or email as an extra safety net.
          </Text>

          <TouchableOpacity
            style={[styles.actionButton, styles.exportButton]}
            onPress={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Download size={20} color={Colors.white} />
            )}
            <Text style={styles.actionButtonText}>
              {isExporting ? 'Exporting...' : 'Export Backup to File'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.importButton]}
            onPress={handleImport}
            disabled={isImporting}
          >
            {isImporting ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Upload size={20} color={Colors.white} />
            )}
            <Text style={styles.actionButtonText}>
              {isImporting ? 'Importing...' : 'Import Backup from File'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.warningText}>
          ⚠️ Importing or restoring will permanently replace all existing data.
        </Text>
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
  infoCard: {
    backgroundColor: '#FFF8E1',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginTop: 8,
    marginBottom: 8,
  },
  infoCardText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 10,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    gap: 8,
  },
  infoIcon: {
    fontSize: 14,
    marginTop: 1,
  },
  infoRowText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  summaryCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginTop: 10,
    marginBottom: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    width: '100%',
  },
  statItem: {
    flex: 1,
    minWidth: '40%',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  section: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  connectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  connectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  connectedText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500' as const,
    flex: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    marginBottom: 10,
  },
  googleSignInButton: {
    backgroundColor: '#4285F4',
  },
  driveBackupButton: {
    backgroundColor: Colors.primary,
  },
  driveRestoreButton: {
    backgroundColor: Colors.secondary,
  },
  exportButton: {
    backgroundColor: Colors.primary,
  },
  importButton: {
    backgroundColor: Colors.accent,
    marginBottom: 0,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    gap: 6,
    paddingVertical: 8,
  },
  signOutText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  warningText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 20,
  },
});
