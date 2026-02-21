import React, { useState } from 'react';
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
import { UploadCloud, DownloadCloud } from 'lucide-react-native';
import { useAppData } from '@/contexts/AppDataContext';

export default function BackupRestoreScreen() {
  const [importText, setImportText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { restoreData, farmers, workEntries, payments, invoices, implements: implementsList, expenses } = useAppData();

  const handleExport = async () => {
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

  const handleImport = () => {
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
              Alert.alert('Invalid Data', 'The pasted text is not valid backup data. Please copy the full exported JSON.');
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Backup & Restore' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Export Backup</Text>
          <Text style={styles.sectionDesc}>
            Share your app data as a JSON backup. You can save it to files, email it, or store it anywhere for safekeeping.
          </Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleExport}
            disabled={isProcessing}
          >
            <UploadCloud size={24} color={Colors.white} />
            <Text style={styles.buttonText}>Export & Share Backup</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Import Backup</Text>
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
            onPress={handleImport}
            disabled={isProcessing}
          >
            <DownloadCloud size={24} color={Colors.white} />
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
    marginBottom: 8,
  },
  sectionDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
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
  importButton: {
    backgroundColor: Colors.secondary,
    marginTop: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
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
