import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
import { Colors } from '@/constants/colors';
import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-google-signin/google-signin';
import { UploadCloud, DownloadCloud, LogOut, ShieldCheck, ShieldAlert } from 'lucide-react-native';
import { useAppData } from '@/contexts/AppDataContext';

const BACKUP_FILE_NAME = 'kishan-ledger-backup.json';

export default function BackupRestoreScreen() {
  const [userInfo, setUserInfo] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { restoreData, ...appData } = useAppData();

  useEffect(() => {
    const checkSignInStatus = async () => {
      const isSignedIn = await GoogleSignin.isSignedIn();
      if (isSignedIn) {
        const currentUser = await GoogleSignin.getCurrentUser();
        setUserInfo(currentUser);
      }
    };
    checkSignInStatus();
  }, []);

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const user = await GoogleSignin.signIn();
      setUserInfo(user);
    } catch (error) {
      if (error.code !== statusCodes.SIGN_IN_CANCELLED) {
          Alert.alert('Sign-In Error', 'An unexpected error occurred during sign-in.');
      }
    }
  };

  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
      setUserInfo(null);
    } catch (error) {
      console.error(error);
    }
  };

  const getDriveFileId = async (accessToken: string): Promise<string | null> => {
    const response = await fetch('https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&fields=files(id,name)', {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await response.json();
    const backupFile = data.files.find(file => file.name === BACKUP_FILE_NAME);
    return backupFile ? backupFile.id : null;
  }

  const handleBackup = async () => {
    if (!userInfo) {
        Alert.alert('Not Signed In', 'Please sign in with Google first.');
        return;
    }

    setIsProcessing(true);
    try {
        const { accessToken } = await GoogleSignin.getTokens();
        const fileId = await getDriveFileId(accessToken);

        const backupData = {
            farmers: appData.farmers,
            workEntries: appData.workEntries,
            payments: appData.payments,
            invoices: appData.invoices,
            implements: appData.implements,
            expenses: appData.expenses,
        };

        const metadata = {
            name: BACKUP_FILE_NAME,
            mimeType: 'application/json',
            ...(fileId ? {} : { parents: ['appDataFolder'] }),
        };

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json; charset=UTF-8' }));
        form.append('file', new Blob([JSON.stringify(backupData)], { type: 'application/json; charset=UTF-8' }));

        const url = fileId
            ? `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`
            : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

        await fetch(url, {
            method: fileId ? 'PATCH' : 'POST',
            headers: { Authorization: `Bearer ${accessToken}` },
            body: form,
        });

        Alert.alert('Backup Successful', 'Your data has been securely backed up to Google Drive.');
    } catch (error) {
        console.error(error);
        Alert.alert('Backup Failed', 'An error occurred while backing up your data.');
    } finally {
        setIsProcessing(false);
    }
  };

  const handleRestore = async () => {
    if (!userInfo) {
        Alert.alert('Not Signed In', 'Please sign in with Google first.');
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
                        const { accessToken } = await GoogleSignin.getTokens();
                        const fileId = await getDriveFileId(accessToken);

                        if (!fileId) {
                            Alert.alert('No Backup Found', 'Could not find a backup file in your Google Drive.');
                            setIsProcessing(false);
                            return;
                        }

                        const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
                            headers: { Authorization: `Bearer ${accessToken}` },
                        });

                        const backupData = await response.json();
                        await restoreData(backupData);

                        Alert.alert('Restore Successful', 'Your data has been restored. Please restart the app to see the changes.');
                    } catch (error) {
                        console.error(error);
                        Alert.alert('Restore Failed', 'An error occurred while restoring your data.');
                    } finally {
                        setIsProcessing(false);
                    }
                }
            }
        ]
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Backup & Restore' }} />
      <View style={styles.container}>
        <View style={styles.statusCard}>
          {userInfo ? (
            <>
              <ShieldCheck size={40} color={Colors.success} />
              <Text style={styles.statusText}>Signed in as:</Text>
              <Text style={styles.emailText}>{userInfo.user.email}</Text>
            </>
          ) : (
            <>
              <ShieldAlert size={40} color={Colors.pending} />
              <Text style={styles.statusText}>Not Signed In</Text>
              <Text style={styles.emailText}>Sign in to back up your data securely.</Text>
            </>
          )}
        </View>

        {userInfo ? (
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={handleBackup} disabled={isProcessing}>
                <UploadCloud size={24} color={Colors.white} />
                <Text style={styles.buttonText}>Backup Data</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleRestore} disabled={isProcessing}>
                <DownloadCloud size={24} color={Colors.white} />
                <Text style={styles.buttonText}>Restore Data</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.signOutButton]} onPress={signOut} disabled={isProcessing}>
                <LogOut size={24} color={Colors.primary} />
                <Text style={[styles.buttonText, {color: Colors.primary}]}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.buttonContainer}>
            <GoogleSigninButton
              style={{ width: '100%', height: 60 }}
              size={GoogleSigninButton.Size.Wide}
              color={GoogleSigninButton.Color.Dark}
              onPress={signIn}
              disabled={isProcessing}
            />
          </View>
        )}
         {isProcessing && <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },
  statusCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 30,
  },
  statusText: {
    fontSize: 16,
    color: Colors.text,
    marginTop: 12,
    fontWeight: '500'
  },
  emailText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  buttonContainer: {
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  signOutButton: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
  },
});
