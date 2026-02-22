import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { User, Save, Settings, ChevronRight, DatabaseBackup } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import * as Haptics from 'expo-haptics';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [businessName, setBusinessName] = useState(user?.businessName || '');
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }
    updateProfile({ name: name.trim(), businessName: businessName.trim() });
    setIsEditing(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Profile',
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.white,
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <User size={48} color={Colors.white} />
          </View>
          <Text style={styles.phoneNumber}>+91 {user?.phone}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.field}>
            <Text style={styles.label}>Name</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={Colors.textLight}
              />
            ) : (
              <Text style={styles.value}>{user?.name}</Text>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.field}>
            <Text style={styles.label}>Business Name</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={businessName}
                onChangeText={setBusinessName}
                placeholder="Enter business name"
                placeholderTextColor={Colors.textLight}
              />
            ) : (
              <Text style={styles.value}>{user?.businessName || 'Not set'}</Text>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.field}>
            <Text style={styles.label}>Phone</Text>
            <Text style={styles.value}>+91 {user?.phone}</Text>
          </View>
        </View>

        {isEditing ? (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => {
                setIsEditing(false);
                setName(user?.name || '');
                setBusinessName(user?.businessName || '');
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
            >
              <Save size={18} color={Colors.white} />
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.editButton]}
            onPress={() => setIsEditing(true)}
          >
            <Settings size={18} color={Colors.primary} />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}

        <View style={styles.dataSection}>
            <Text style={styles.sectionTitle}>Data Management</Text>
            <TouchableOpacity style={styles.dataButton} onPress={() => router.push('/backup-restore')}>
                <DatabaseBackup size={22} color={Colors.primary} />
                <Text style={styles.dataButtonText}>Backup & Restore</Text>
                <ChevronRight size={22} color={Colors.textLight} />
            </TouchableOpacity>
        </View>

        <Text style={styles.version}>Farm Work Tracker v1.0.0</Text>
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  phoneNumber: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  field: {
    paddingVertical: 12,
  },
  label: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  value: {
    fontSize: 17,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  input: {
    fontSize: 17,
    color: Colors.text,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
    paddingVertical: 4,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  editButton: {
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  saveButton: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  dataSection: {
      marginTop: 24,
  },
  sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: Colors.text,
      marginBottom: 12,
      paddingHorizontal: 4
  },
  dataButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors.card,
      borderRadius: 12,
      padding: 16,
      gap: 16,
  },
  dataButtonText: {
      flex: 1,
      fontSize: 16,
      fontWeight: '500',
      color: Colors.text
  },
  version: {
    textAlign: 'center',
    color: Colors.textLight,
    fontSize: 13,
    marginTop: 32,
  },
});
