import React, { useState } from 'react';
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
import { Download, Upload, Database } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAppData } from '@/contexts/AppDataContext';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { BackupData } from '@/types';

export default function BackupScreen() {
  const { exportData, importData, farmers, workEntries, payments, invoices } = useAppData();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

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
        <View style={styles.infoCard}>
          <Database size={32} color={Colors.primary} />
          <Text style={styles.infoTitle}>Data Summary</Text>
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Export Data</Text>
          <Text style={styles.sectionDescription}>
            Save all your data to a JSON file that you can share or store safely.
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
              {isExporting ? 'Exporting...' : 'Export Backup'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Import Data</Text>
          <Text style={styles.sectionDescription}>
            Restore your data from a previously exported backup file. This will replace all current data.
          </Text>
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
              {isImporting ? 'Importing...' : 'Import Backup'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.warningText}>
          ⚠️ Importing will permanently replace all existing data with the backup.
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
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    marginTop: 12,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
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
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  exportButton: {
    backgroundColor: Colors.primary,
  },
  importButton: {
    backgroundColor: Colors.accent,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  warningText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 20,
  },
});
