export type Farmer = {
  id: string;
  name: string;
  village: string;
  phone: string;
  createdAt: string;
};

export type User = {
  phone: string;
  name: string;
  businessName?: string;
  isLoggedIn: boolean;
  pin: string;
};

export type Implement = {
  id: string;
  name: string;
  nameHindi?: string;
  ratePerUnit: number;
  unit: string;
  icon?: string;
};

export type WorkEntry = {
  id: string;
  farmerId: string;
  farmerName: string;
  implementId: string;
  implementName: string;
  date: string;
  area: number;
  unit: string;
  rate: number;
  totalAmount: number;
  isPaid: boolean;
  paymentMethod?: 'cash' | 'upi' | 'bank';
  paymentDate?: string;
  upiTransactionId?: string;
};

export type Payment = {
  id: string;
  farmerId: string;
  workEntryIds: string[];
  amount: number;
  date: string;
  method: 'cash' | 'upi' | 'bank';
  upiTransactionId?: string;
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
  farmerId: string;
  farmerName: string;
  workEntries: WorkEntry[];
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  generatedAt: string;
  fromDate: string;
  toDate: string;
};

export const EXPENSE_CATEGORIES = [
  'Diesel',
  'Tractor Service',
  'Implement Maintenance',
  'Driver Salary',
  'Miscellaneous',
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];

export type Expense = {
  id: string;
  date: string;
  category: ExpenseCategory;
  amount: number;
  description?: string;
};
