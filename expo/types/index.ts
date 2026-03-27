export interface Farmer {
  id: string;
  name: string;
  phone: string;
  village: string;
  address: string;
  landArea: number;
  landUnit: 'acre' | 'bigha' | 'hectare';
  createdAt: string;
}

export interface Implement {
  id: string;
  name: string;
  nameHindi: string;
  ratePerUnit: number;
  unit: 'hour' | 'acre' | 'bigha';
  icon: string;
}

export interface WorkEntry {
  id: string;
  farmerId: string;
  farmerName: string;
  implementId: string;
  implementName: string;
  date: string;
  quantity: number;
  unit: string;
  rate: number;
  totalAmount: number;
  notes: string;
  isPaid: boolean;
  paymentMethod?: 'cash' | 'upi' | 'pending';
  paymentDate?: string;
  upiTransactionId?: string;
}

export interface Payment {
  id: string;
  farmerId: string;
  farmerName: string;
  amount: number;
  method: 'cash' | 'upi';
  date: string;
  upiTransactionId?: string;
  workEntryIds: string[];
}

export interface Invoice {
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
}

export interface User {
  phone: string;
  name: string;
  businessName: string;
  isLoggedIn: boolean;
}