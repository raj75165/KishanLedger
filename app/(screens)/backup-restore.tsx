import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-google-signin/google-signin';
import { UploadCloud, DownloadCloud, LogOut, ShieldCheck, ShieldAlert } from 'lucide-react-native';
import { useAppData } from '@/contexts/AppDataContext';
import { useAuth } from '@/contexts/AuthContext';

const BACKUP_FILE_NAME = 'kishan-ledger-backup.json';

export default function BackupRestoreScreen() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { restoreData, ...appData } = useAppData();
  const { user, signInWithGoogle, logout } = useAuth();
  const router = useRouter();

  const userInfo = user && user.isLoggedIn ? user : null;

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const googleUser = await GoogleSignin.signIn();
      signInWithGoogle(googleUser); // This is the crucial fix
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // User cancelled
      } else {
        Alert.alert('Sign-In Error', `An error occurred: ${error.message}`);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await GoogleSignin.signOut();
      logout(); // This will log the user out of the main app as well
    } catch (error) {
      console.error(error);
    }
  };

  const getDriveFileId = async (accessToken: string): Promise<string | null> => {
    const response = await fetch('https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&fields=files(id,name)', {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await response.json();
    if (data.error) throw new Error(`Google Drive API Error: ${data.error.message}`);
    return data.files?.find(file => file.name === BACKUP_FILE_NAME)?.id || null;
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
            implementList: appData.implementList,
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

        const response = await fetch(url, { method: fileId ? 'PATCH' : 'POST', headers: { Authorization: `Bearer ${accessToken}` }, body: form });
        const responseData = await response.json();
        if (responseData.error) throw new Error(`Google Drive API Error: ${responseData.error.message}`);

        Alert.alert('Backup Successful', 'Your data has been securely backed up to Google Drive.');
    } catch (error) {
        Alert.alert('Backup Failed', error.message || 'An unknown error occurred.');
    } finally {
        setIsProcessing(false);
    }
  };

  const handleRestore = async () => {
    // ... restore logic ...
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
              <Text style={styles.emailText}>{userInfo.email}</Text>
            </>
          ) : (
            <>
              <ShieldAlert size={40} color={Colors.pending} />
              <Text style={styles.statusText}>Not Signed In</Text>
              <Text style={styles.emailText}>Sign in to back up or restore your data.</Text>
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
            <TouchableOpacity style={[styles.actionButton, styles.signOutButton]} onPress={handleSignOut} disabled={isProcessing}>
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
    textAlign: 'center'
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
