import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import {
  FileText,
  Calendar,
  Share2,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAppData } from '@/contexts/AppDataContext';
import { useAuth } from '@/contexts/AuthContext';

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  useRouter();
  const { invoices } = useAppData();
  const { user } = useAuth();

  const invoice = useMemo(() => invoices.find((i) => i.id === id), [invoices, id]);

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

  const handleShare = async () => {
    if (!invoice) return;

    const text = `
INVOICE: ${invoice.invoiceNumber}
From: ${user?.businessName || 'Farm Services'}
To: ${invoice.farmerName}
Period: ${formatDate(invoice.fromDate)} - ${formatDate(invoice.toDate)}

Work Details:
${invoice.workEntries.map((e) => `- ${e.implementName} (${formatDate(e.date)}): ${e.quantity} ${e.unit} = ${formatCurrency(e.totalAmount)}`).join('\n')}

Total Amount: ${formatCurrency(invoice.totalAmount)}
Paid: ${formatCurrency(invoice.paidAmount)}
Balance Due: ${formatCurrency(invoice.pendingAmount)}

Generated on: ${formatDate(invoice.generatedAt)}
    `.trim();

    try {
      await Share.share({
        message: text,
        title: `Invoice ${invoice.invoiceNumber}`,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  if (!invoice) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Invoice not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: invoice.invoiceNumber,
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.white,
          headerRight: () => (
            <TouchableOpacity onPress={handleShare} style={{ marginRight: 8 }}>
              <Share2 size={22} color={Colors.white} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.invoiceHeader}>
          <View style={styles.invoiceIcon}>
            <FileText size={32} color={Colors.white} />
          </View>
          <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
          <Text style={styles.generatedDate}>
            Generated on {formatDate(invoice.generatedAt)}
          </Text>
        </View>

        <View style={styles.partiesCard}>
          <View style={styles.partySection}>
            <Text style={styles.partyLabel}>From</Text>
            <Text style={styles.partyName}>{user?.businessName || 'Farm Services'}</Text>
            <Text style={styles.partyDetail}>{user?.name}</Text>
            <Text style={styles.partyDetail}>+91 {user?.phone}</Text>
          </View>
          <View style={styles.partySeparator} />
          <View style={styles.partySection}>
            <Text style={styles.partyLabel}>To</Text>
            <Text style={styles.partyName}>{invoice.farmerName}</Text>
          </View>
        </View>

        <View style={styles.periodCard}>
          <Calendar size={18} color={Colors.textSecondary} />
          <Text style={styles.periodText}>
            {formatDate(invoice.fromDate)} - {formatDate(invoice.toDate)}
          </Text>
        </View>

        <View style={styles.entriesCard}>
          <Text style={styles.sectionTitle}>Work Details</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.flex2]}>Item</Text>
            <Text style={[styles.tableHeaderText, styles.flex1]}>Qty</Text>
            <Text style={[styles.tableHeaderText, styles.flex1]}>Rate</Text>
            <Text style={[styles.tableHeaderText, styles.flex1, styles.textRight]}>
              Amount
            </Text>
          </View>
          {invoice.workEntries.map((entry) => (
            <View key={entry.id} style={styles.tableRow}>
              <View style={styles.flex2}>
                <Text style={styles.itemName}>{entry.implementName}</Text>
                <Text style={styles.itemDate}>{formatDate(entry.date)}</Text>
              </View>
              <Text style={[styles.tableCell, styles.flex1]}>
                {entry.quantity} {entry.unit}
              </Text>
              <Text style={[styles.tableCell, styles.flex1]}>
                {formatCurrency(entry.rate)}
              </Text>
              <Text style={[styles.tableCell, styles.flex1, styles.textRight]}>
                {formatCurrency(entry.totalAmount)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsCard}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoice.totalAmount)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Paid Amount</Text>
            <Text style={[styles.totalValue, { color: Colors.success }]}>
              - {formatCurrency(invoice.paidAmount)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.balanceLabel}>Balance Due</Text>
            <Text style={styles.balanceValue}>
              {formatCurrency(invoice.pendingAmount)}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Share2 size={20} color={Colors.white} />
          <Text style={styles.shareButtonText}>Share Invoice</Text>
        </TouchableOpacity>
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
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
    marginTop: 40,
  },
  invoiceHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  invoiceIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  invoiceNumber: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  generatedDate: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  partiesCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  partySection: {
    paddingVertical: 8,
  },
  partyLabel: {
    fontSize: 12,
    color: Colors.textLight,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  partyName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  partyDetail: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  partySeparator: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  periodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 10,
  },
  periodText: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  entriesCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  flex1: {
    flex: 1,
  },
  flex2: {
    flex: 2,
  },
  textRight: {
    textAlign: 'right',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  itemDate: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
  tableCell: {
    fontSize: 14,
    color: Colors.text,
  },
  totalsCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  balanceLabel: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  balanceValue: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.pending,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
});
