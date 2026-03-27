import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useMemo } from 'react';
import { Farmer, WorkEntry, Payment, Invoice, Implement, Expense } from '@/types';
import { IMPLEMENTS as DEFAULT_IMPLEMENTS } from '@/constants/implements';

const FARMERS_KEY = '@farm_app_farmers';
const WORK_ENTRIES_KEY = '@farm_app_work_entries';
const PAYMENTS_KEY = '@farm_app_payments';
const INVOICES_KEY = '@farm_app_invoices';
const IMPLEMENTS_KEY = '@farm_app_implements';
const EXPENSES_KEY = '@farm_app_expenses';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function generateInvoiceNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INV${year}${month}${random}`;
}

export const [AppDataProvider, useAppData] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [workEntries, setWorkEntries] = useState<WorkEntry[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [implementList, setImplementList] = useState<Implement[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const farmersQuery = useQuery({
    queryKey: ['farmers'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(FARMERS_KEY);
      return stored ? JSON.parse(stored) : [];
    },
  });

  const workEntriesQuery = useQuery({
    queryKey: ['workEntries'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(WORK_ENTRIES_KEY);
      return stored ? JSON.parse(stored) : [];
    },
  });

  const paymentsQuery = useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(PAYMENTS_KEY);
      return stored ? JSON.parse(stored) : [];
    },
  });

  const invoicesQuery = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(INVOICES_KEY);
      return stored ? JSON.parse(stored) : [];
    },
  });

  const implementsQuery = useQuery({
    queryKey: ['implements'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(IMPLEMENTS_KEY);
      if (stored) {
        return JSON.parse(stored);
      } else {
        await AsyncStorage.setItem(IMPLEMENTS_KEY, JSON.stringify(DEFAULT_IMPLEMENTS));
        return DEFAULT_IMPLEMENTS;
      }
    },
  });

  const expensesQuery = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(EXPENSES_KEY);
      return stored ? JSON.parse(stored) : [];
    },
  });

  useEffect(() => {
    if (farmersQuery.data) setFarmers(farmersQuery.data);
  }, [farmersQuery.data]);

  useEffect(() => {
    if (workEntriesQuery.data) setWorkEntries(workEntriesQuery.data);
  }, [workEntriesQuery.data]);

  useEffect(() => {
    if (paymentsQuery.data) setPayments(paymentsQuery.data);
  }, [paymentsQuery.data]);

  useEffect(() => {
    if (invoicesQuery.data) setInvoices(invoicesQuery.data);
  }, [invoicesQuery.data]);

  useEffect(() => {
    if (implementsQuery.data) setImplementList(implementsQuery.data);
  }, [implementsQuery.data]);

  useEffect(() => {
    if (expensesQuery.data) setExpenses(expensesQuery.data);
  }, [expensesQuery.data]);

  const saveFarmersMutation = useMutation({
    mutationFn: async (data: Farmer[]) => {
      await AsyncStorage.setItem(FARMERS_KEY, JSON.stringify(data));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmers'] });
    },
  });

  const saveWorkEntriesMutation = useMutation({
    mutationFn: async (data: WorkEntry[]) => {
      await AsyncStorage.setItem(WORK_ENTRIES_KEY, JSON.stringify(data));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workEntries'] });
    },
  });

  const savePaymentsMutation = useMutation({
    mutationFn: async (data: Payment[]) => {
      await AsyncStorage.setItem(PAYMENTS_KEY, JSON.stringify(data));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });

  const saveInvoicesMutation = useMutation({
    mutationFn: async (data: Invoice[]) => {
      await AsyncStorage.setItem(INVOICES_KEY, JSON.stringify(data));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });

  const saveImplementsMutation = useMutation({
    mutationFn: async (data: Implement[]) => {
      await AsyncStorage.setItem(IMPLEMENTS_KEY, JSON.stringify(data));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['implements'] });
    },
  });

  const saveExpensesMutation = useMutation({
    mutationFn: async (data: Expense[]) => {
      await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(data));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });

  const addFarmer = (farmer: Omit<Farmer, 'id' | 'createdAt'>) => {
    const newFarmer: Farmer = {
      ...farmer,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...farmers, newFarmer];
    setFarmers(updated);
    saveFarmersMutation.mutate(updated);
    return newFarmer;
  };

  const updateFarmer = (id: string, updates: Partial<Farmer>) => {
    const updated = farmers.map((f) => (f.id === id ? { ...f, ...updates } : f));
    setFarmers(updated);
    saveFarmersMutation.mutate(updated);
  };

  const deleteFarmer = (id: string) => {
    const updated = farmers.filter((f) => f.id !== id);
    setFarmers(updated);
    saveFarmersMutation.mutate(updated);
  };

  const addWorkEntry = (entry: Omit<WorkEntry, 'id'>) => {
    const newEntry: WorkEntry = {
      ...entry,
      id: generateId(),
    };
    const updated = [...workEntries, newEntry];
    setWorkEntries(updated);
    saveWorkEntriesMutation.mutate(updated);
    return newEntry;
  };

  const updateWorkEntry = (id: string, updates: Partial<WorkEntry>) => {
    const updated = workEntries.map((e) => (e.id === id ? { ...e, ...updates } : e));
    setWorkEntries(updated);
    saveWorkEntriesMutation.mutate(updated);
  };

  const deleteWorkEntry = (id: string) => {
    const updated = workEntries.filter((e) => e.id !== id);
    setWorkEntries(updated);
    saveWorkEntriesMutation.mutate(updated);
  };

  const addPayment = (payment: Omit<Payment, 'id'>) => {
    const newPayment: Payment = {
      ...payment,
      id: generateId(),
    };
    const updated = [...payments, newPayment];
    setPayments(updated);
    savePaymentsMutation.mutate(updated);

    payment.workEntryIds.forEach((entryId) => {
      updateWorkEntry(entryId, {
        isPaid: true,
        paymentMethod: payment.method,
        paymentDate: payment.date,
        upiTransactionId: payment.upiTransactionId,
      });
    });

    return newPayment;
  };

  const generateInvoice = (
    farmerId: string,
    fromDate: string,
    toDate: string
  ): Invoice | null => {
    const farmer = farmers.find((f) => f.id === farmerId);
    if (!farmer) return null;

    const farmerEntries = workEntries.filter(
      (e) =>
        e.farmerId === farmerId &&
        e.date >= fromDate &&
        e.date <= toDate
    );

    if (farmerEntries.length === 0) return null;

    const totalAmount = farmerEntries.reduce((sum, e) => sum + e.totalAmount, 0);
    const paidAmount = farmerEntries
      .filter((e) => e.isPaid)
      .reduce((sum, e) => sum + e.totalAmount, 0);

    const invoice: Invoice = {
      id: generateId(),
      invoiceNumber: generateInvoiceNumber(),
      farmerId,
      farmerName: farmer.name,
      workEntries: farmerEntries,
      totalAmount,
      paidAmount,
      pendingAmount: totalAmount - paidAmount,
      generatedAt: new Date().toISOString(),
      fromDate,
      toDate,
    };

    const updated = [...invoices, invoice];
    setInvoices(updated);
    saveInvoicesMutation.mutate(updated);
    return invoice;
  };

    const addImplement = (implement: Omit<Implement, 'id'>) => {
    const newImplement: Implement = {
      ...implement,
      id: generateId(),
    };
    const updated = [...implementList, newImplement];
    setImplementList(updated);
    saveImplementsMutation.mutate(updated);
    return newImplement;
  };

  const updateImplement = (id: string, updates: Partial<Implement>) => {
    const updated = implementList.map((i) => (i.id === id ? { ...i, ...updates } : i));
    setImplementList(updated);
    saveImplementsMutation.mutate(updated);
  };

  const deleteImplement = (id: string) => {
    const updated = implementList.filter((i) => i.id !== id);
    setImplementList(updated);
    saveImplementsMutation.mutate(updated);
  };

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expense,
      id: generateId(),
    };
    const updated = [...expenses, newExpense];
    setExpenses(updated);
    saveExpensesMutation.mutate(updated);
    return newExpense;
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    const updated = expenses.map((e) => (e.id === id ? { ...e, ...updates } : e));
    setExpenses(updated);
    saveExpensesMutation.mutate(updated);
  };

  const deleteExpense = (id: string) => {
    const updated = expenses.filter((e) => e.id !== id);
    setExpenses(updated);
    saveExpensesMutation.mutate(updated);
  };

  const restoreData = async (backup: any) => {
    const { farmers, workEntries, payments, invoices, implements: implementBackup, expenses } = backup;
    await saveFarmersMutation.mutateAsync(farmers || []);
    await saveWorkEntriesMutation.mutateAsync(workEntries || []);
    await savePaymentsMutation.mutateAsync(payments || []);
    await saveInvoicesMutation.mutateAsync(invoices || []);
    await saveImplementsMutation.mutateAsync(implementBackup || []);
    await saveExpensesMutation.mutateAsync(expenses || []);

    // Invalidate all queries to force a refetch
    await queryClient.invalidateQueries();
  };


  const stats = useMemo(() => {
    const totalWork = workEntries.length;
    const totalAmount = workEntries.reduce((sum, e) => sum + e.totalAmount, 0);
    const paidAmount = workEntries
      .filter((e) => e.isPaid)
      .reduce((sum, e) => sum + e.totalAmount, 0);
    const pendingAmount = totalAmount - paidAmount;
    const totalFarmers = farmers.length;
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    return {
      totalWork,
      totalAmount,
      paidAmount,
      pendingAmount,
      totalFarmers,
      totalExpenses,
    };
  }, [workEntries, farmers, expenses]);

  const getFarmerStats = (farmerId: string) => {
    const farmerEntries = workEntries.filter((e) => e.farmerId === farmerId);
    const totalAmount = farmerEntries.reduce((sum, e) => sum + e.totalAmount, 0);
    const paidAmount = farmerEntries
      .filter((e) => e.isPaid)
      .reduce((sum, e) => sum + e.totalAmount, 0);

    return {
      totalWork: farmerEntries.length,
      totalAmount,
      paidAmount,
      pendingAmount: totalAmount - paidAmount,
    };
  };

  const getFarmerWorkEntries = (farmerId: string) => {
    return workEntries.filter((e) => e.farmerId === farmerId);
  };

  return {
    farmers,
    workEntries,
    payments,
    invoices,
    implementList,
    expenses,
    stats,
    isLoading:
      farmersQuery.isLoading ||
      workEntriesQuery.isLoading ||
      paymentsQuery.isLoading ||
      invoicesQuery.isLoading ||
      implementsQuery.isLoading ||
      expensesQuery.isLoading,
    addFarmer,
    updateFarmer,
    deleteFarmer,
    addWorkEntry,
    updateWorkEntry,
    deleteWorkEntry,
    addPayment,
    generateInvoice,
    addImplement,
    updateImplement,
    deleteImplement,
    addExpense,
    updateExpense,
    deleteExpense,
    restoreData,
    getFarmerStats,
    getFarmerWorkEntries,
  };
});
