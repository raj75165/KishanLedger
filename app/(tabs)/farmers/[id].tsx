import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import {
  User,
  Phone,
  MapPin,
  Landmark,
  Trash2,
  FileText,
  IndianRupee,
  Calendar,
  Pencil,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAppData } from '@/contexts/AppDataContext';

export default function FarmerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { farmers, getFarmerStats, getFarmerWorkEntries, deleteFarmer } = useAppData();

  const farmer = useMemo(() => farmers.find((f) => f.id === id), [farmers, id]);
  const stats = useMemo(() => (farmer ? getFarmerStats(farmer.id) : null), [farmer, getFarmerStats]);
  const workEntries = useMemo(
    () => (farmer ? getFarmerWorkEntries(farmer.id) : []),
    [farmer, getFarmerWorkEntries]
  );

  const formatCurrency = (amount: number) => {
    return '₹' + amount.toLocaleString('en-IN');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Farmer',
      `Are you sure you want to delete ${farmer?.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (farmer) {
              deleteFarmer(farmer.id);
              router.back();
            }
          },
        },
      ]
    );
  };

  if (!farmer || !stats) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Farmer not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: farmer.name }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <User size={40} color={Colors.white} />
          </View>
          <Text style={styles.name}>{farmer.name}</Text>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Phone size={18} color={Colors.textSecondary} />
              <Text style={styles.detailText}>{farmer.phone}</Text>
            </View>
            <View style={styles.detailItem}>
              <MapPin size={18} color={Colors.textSecondary} />
              <Text style={styles.detailText}>{farmer.village}</Text>
            </View>
            <View style={styles.detailItem}>
              <Landmark size={18} color={Colors.textSecondary} />
              <Text style={styles.detailText}>
                {farmer.landArea} {farmer.landUnit}
              </Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.editBtn]}
              onPress={() => router.push(`/add-farmer?farmerId=${farmer.id}` as any)}
            >
              <Pencil size={18} color={Colors.primary} />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.deleteBtn]}
              onPress={handleDelete}
            >
              <Trash2 size={18} color={Colors.error} />
              <Text style={styles.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Work</Text>
            <Text style={styles.statValue}>{stats.totalWork}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Amount</Text>
            <Text style={styles.statValue}>{formatCurrency(stats.totalAmount)}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Paid</Text>
            <Text style={[styles.statValue, styles.paidValue]}>
              {formatCurrency(stats.paidAmount)}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Pending</Text>
            <Text style={[styles.statValue, styles.pendingValue]}>
              {formatCurrency(stats.pendingAmount)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.invoiceButton}
          onPress={() => router.push(`/generate-invoice/${farmer.id}` as any)}
        >
          <FileText size={20} color={Colors.white} />
          <Text style={styles.invoiceButtonText}>Generate Invoice</Text>
        </TouchableOpacity>

        <View style={styles.workSection}>
          <Text style={styles.sectionTitle}>Work History</Text>
          {workEntries.length === 0 ? (
            <View style={styles.emptyWork}>
              <Text style={styles.emptyWorkText}>No work entries yet</Text>
            </View>
          ) : (
            workEntries.map((entry) => (
              <TouchableOpacity
                key={entry.id}
                style={styles.workCard}
                onPress={() => router.push(`/work-detail/${entry.id}` as any)}
              >
                <View style={styles.workHeader}>
                  <Text style={styles.workImplement}>{entry.implementName}</Text>
                  <View
                    style={[
                      styles.paymentBadge,
                      entry.isPaid ? styles.paidBadge : styles.pendingBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        entry.isPaid ? styles.paidText : styles.pendingText,
                      ]}
                    >
                      {entry.isPaid ? 'Paid' : 'Pending'}
                    </Text>
                  </View>
                </View>
                <View style={styles.workDetails}>
                  <View style={styles.workDetail}>
                    <Calendar size={14} color={Colors.textLight} />
                    <Text style={styles.workDetailText}>{formatDate(entry.date)}</Text>
                  </View>
                  <View style={styles.workDetail}>
                    <IndianRupee size={14} color={Colors.textLight} />
                    <Text style={styles.workDetailText}>
                      {formatCurrency(entry.totalAmount)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.workQuantity}>
                  {entry.quantity} {entry.unit} @ {formatCurrency(entry.rate)}/{entry.unit}
                </Text>
              </TouchableOpacity>
            ))
          )}
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
    padding: 16,
    paddingBottom: 40,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
    marginTop: 40,
  },
  profileSection: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  detailsGrid: {
    width: '100%',
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  editBtn: {
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
  },
  editBtnText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  deleteBtn: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  deleteBtnText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.error,
  },
  statsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  paidValue: {
    color: Colors.success,
  },
  pendingValue: {
    color: Colors.pending,
  },
  invoiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 8,
  },
  invoiceButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  workSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  emptyWork: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyWorkText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  workCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  workHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  workImplement: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  paymentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  paidBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  pendingBadge: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  paidText: {
    color: Colors.paid,
  },
  pendingText: {
    color: Colors.pending,
  },
  workDetails: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 6,
  },
  workDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  workDetailText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  workQuantity: {
    fontSize: 13,
    color: Colors.textLight,
  },
});
